import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/types/database.types";

const supabase = createClient();

export const chatService = {
  /**
   * Lista todas as conversas de um usuario (via API to bypass RLS)
   */
  async getConversations(userId: string) {
    const res = await fetch("/api/chat", { credentials: "include" });
    if (!res.ok) {
      // Fallback to direct query for SELECT (RLS allows SELECT)
      const { data, error } = await supabase
        .from("conversations")
        .select(
          "*, participant_1_profile:profiles!participant_1(id, name, avatar_url), participant_2_profile:profiles!participant_2(id, name, avatar_url)"
        )
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .eq("is_active", true)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data;
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Busca mensagens de uma conversa com paginacao
   */
  async getMessages(conversationId: number, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(id, name, avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []).reverse();
  },

  /**
   * Envia uma mensagem em uma conversa (via API to bypass RLS)
   */
  async sendMessage(
    conversationId: number,
    senderId: string,
    content: string,
    type: "TEXT" | "IMAGE" | "FILE" = "TEXT",
    fileUrl?: string
  ) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        conversation_id: conversationId,
        content,
        type,
        file_url: fileUrl,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Falha ao enviar mensagem" }));
      throw new Error(err.error || "Falha ao enviar mensagem");
    }

    const json = await res.json();
    return json.data.message as Message;
  },

  /**
   * Marca todas as mensagens de uma conversa como lidas para o usuario
   */
  async markAsRead(conversationId: number, userId: string) {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (error) {
      // Fallback: try via API
      await fetch(`/api/chat?conversation_id=${conversationId}`, {
        credentials: "include",
      });
    }
  },

  /**
   * Busca ou cria uma conversa entre dois usuarios (via API to bypass RLS)
   */
  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    transactionId?: number
  ) {
    // Try to find existing conversation via direct query (SELECT allowed by RLS)
    const { data: existing } = await supabase
      .from("conversations")
      .select(
        "*, participant_1_profile:profiles!participant_1(id, name, avatar_url), participant_2_profile:profiles!participant_2(id, name, avatar_url)"
      )
      .or(
        `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
      )
      .maybeSingle();

    if (existing) return existing as Conversation;

    // Create via API (bypasses RLS)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        recipient_id: otherUserId,
        content: "Conversa iniciada",
        type: "SYSTEM",
        transaction_id: transactionId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Falha ao criar conversa" }));
      throw new Error(err.error || "Falha ao criar conversa");
    }

    const json = await res.json();
    const conversationId = json.data.conversation_id;

    // Fetch the full conversation object
    const { data: conv } = await supabase
      .from("conversations")
      .select(
        "*, participant_1_profile:profiles!participant_1(id, name, avatar_url), participant_2_profile:profiles!participant_2(id, name, avatar_url)"
      )
      .eq("id", conversationId)
      .single();

    if (conv) return conv as Conversation;

    // Return minimal conversation object if direct query fails
    return { id: conversationId } as Conversation;
  },
};
