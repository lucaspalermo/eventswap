import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Chat API
// GET  - Fetch user's conversations with last message
// POST - Send a message / create conversation
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Autenticacao necessaria' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
  const offset = (page - 1) * perPage;

  // If a specific conversation is requested, return its messages
  if (conversationId) {
    const convId = parseInt(conversationId, 10);

    // Verify user is a participant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa nao encontrada' },
        { status: 404 }
      );
    }

    // Fetch messages for this conversation
    const { data: messages, error: msgError, count } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*)', { count: 'exact' })
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (msgError) {
      console.error('[Chat API] GET messages error:', msgError);
      return NextResponse.json(
        { error: 'Falha ao buscar mensagens', details: msgError.message },
        { status: 500 }
      );
    }

    // Mark messages as read
    const otherParticipantMessages = (messages || [])
      .filter((msg) => msg.sender_id !== user.id && !msg.is_read)
      .map((msg) => msg.id);

    if (otherParticipantMessages.length > 0) {
      await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in('id', otherParticipantMessages);

      // Reset unread count for current user
      const isParticipant1 = conversation.participant_1 === user.id;
      const unreadField = isParticipant1 ? 'unread_count_1' : 'unread_count_2';

      await supabase
        .from('conversations')
        .update({ [unreadField]: 0 })
        .eq('id', convId);
    }

    const totalPages = count ? Math.ceil(count / perPage) : 0;

    return NextResponse.json({
      data: {
        conversation,
        messages: (messages || []).reverse(), // Return chronological order
      },
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  }

  // Fetch all conversations for the user
  const { data: conversations, error: convError, count } = await supabase
    .from('conversations')
    .select(
      '*, participant_1_profile:profiles!participant_1(*), participant_2_profile:profiles!participant_2(*)',
      { count: 'exact' }
    )
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + perPage - 1);

  if (convError) {
    console.error('[Chat API] GET conversations error:', convError);
    return NextResponse.json(
      { error: 'Falha ao buscar conversas', details: convError.message },
      { status: 500 }
    );
  }

  // Calculate total unread count
  let totalUnread = 0;
  (conversations || []).forEach((conv) => {
    if (conv.participant_1 === user.id) {
      totalUnread += conv.unread_count_1 || 0;
    } else {
      totalUnread += conv.unread_count_2 || 0;
    }
  });

  const totalPages = count ? Math.ceil(count / perPage) : 0;

  return NextResponse.json({
    data: conversations || [],
    total_unread: totalUnread,
    pagination: {
      page,
      per_page: perPage,
      total: count || 0,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Autenticacao necessaria' },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido' },
      { status: 400 }
    );
  }

  const recipientId = body.recipient_id ? String(body.recipient_id) : null;
  const content = body.content ? String(body.content).trim() : null;
  const messageType = body.type ? String(body.type) : 'TEXT';
  const fileUrl = body.file_url ? String(body.file_url) : null;
  const transactionId = body.transaction_id ? Number(body.transaction_id) : null;
  let conversationId = body.conversation_id ? Number(body.conversation_id) : null;

  // Validate content
  if (!content && messageType === 'TEXT') {
    return NextResponse.json(
      { error: 'Conteudo da mensagem e obrigatorio' },
      { status: 400 }
    );
  }

  if (messageType === 'IMAGE' && !fileUrl) {
    return NextResponse.json(
      { error: 'URL do arquivo e obrigatoria para mensagens de imagem' },
      { status: 400 }
    );
  }

  // Prevent messaging yourself
  if (recipientId === user.id) {
    return NextResponse.json(
      { error: 'Voce nao pode enviar mensagem para si mesmo' },
      { status: 400 }
    );
  }

  // If no conversation_id, find or create a conversation
  if (!conversationId) {
    if (!recipientId) {
      return NextResponse.json(
        { error: 'conversation_id ou recipient_id e obrigatorio' },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .single();

    if (!recipientProfile) {
      return NextResponse.json(
        { error: 'Destinatario nao encontrado' },
        { status: 404 }
      );
    }

    // Look for existing conversation between these two users
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`
      )
      .maybeSingle();

    if (existingConv) {
      conversationId = existingConv.id;

      // Reactivate if it was deactivated
      await supabase
        .from('conversations')
        .update({ is_active: true })
        .eq('id', conversationId);
    } else {
      // Create new conversation
      const conversationData = {
        participant_1: user.id,
        participant_2: recipientId,
        transaction_id: transactionId,
        is_active: true,
        unread_count_1: 0,
        unread_count_2: 0,
        created_at: new Date().toISOString(),
      };

      const { data: newConv, error: createConvError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select('*')
        .single();

      if (createConvError || !newConv) {
        console.error('[Chat API] Create conversation error:', createConvError);
        return NextResponse.json(
          { error: 'Falha ao criar conversa', details: createConvError?.message },
          { status: 500 }
        );
      }

      conversationId = newConv.id;
    }
  } else {
    // Verify user is a participant of the existing conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: 'Conversa nao encontrada ou voce nao e participante' },
        { status: 403 }
      );
    }
  }

  // Create the message
  const messageData = {
    conversation_id: conversationId,
    sender_id: user.id,
    type: messageType,
    content: content || '',
    file_url: fileUrl,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert(messageData)
    .select('*, sender:profiles!sender_id(*)')
    .single();

  if (msgError) {
    console.error('[Chat API] POST message error:', msgError);
    return NextResponse.json(
      { error: 'Falha ao enviar mensagem', details: msgError.message },
      { status: 500 }
    );
  }

  // Update conversation with last message info and increment unread count
  const { data: conversation } = await supabase
    .from('conversations')
    .select('participant_1, participant_2, unread_count_1, unread_count_2')
    .eq('id', conversationId)
    .single();

  if (conversation) {
    const isParticipant1 = conversation.participant_1 === user.id;
    // Increment unread count for the OTHER participant
    const unreadField = isParticipant1 ? 'unread_count_2' : 'unread_count_1';
    const currentUnread = isParticipant1
      ? (conversation.unread_count_2 || 0)
      : (conversation.unread_count_1 || 0);

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_text: content ? content.slice(0, 200) : `[${messageType}]`,
        [unreadField]: currentUnread + 1,
      })
      .eq('id', conversationId);
  }

  return NextResponse.json(
    {
      data: {
        message,
        conversation_id: conversationId,
      },
      message: 'Mensagem enviada com sucesso',
    },
    { status: 201 }
  );
}
