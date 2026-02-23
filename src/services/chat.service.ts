import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/types/database.types";

const supabase = createClient();

export const chatService = {
  /**
   * Lista todas as conversas de um usuario
   */
  async getConversations(userId: string) {
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
   * Envia uma mensagem em uma conversa
   */
  async sendMessage(
    conversationId: number,
    senderId: string,
    content: string,
    type: "TEXT" | "IMAGE" | "FILE" = "TEXT",
    fileUrl?: string
  ) {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type,
        file_url: fileUrl,
      })
      .select("*, sender:profiles!sender_id(id, name, avatar_url)")
      .single();

    if (error) throw error;

    // Atualizar ultima mensagem da conversa
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_text: content,
      })
      .eq("id", conversationId);

    return data as Message;
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

    if (error) throw error;
  },

  /**
   * Cria uma nova conversa entre dois usuarios
   */
  async createConversation(
    userId1: string,
    userId2: string,
    transactionId?: number
  ) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        participant_1: userId1,
        participant_2: userId2,
        transaction_id: transactionId,
      })
      .select(
        "*, participant_1_profile:profiles!participant_1(id, name, avatar_url), participant_2_profile:profiles!participant_2(id, name, avatar_url)"
      )
      .single();

    if (error) throw error;
    return data as Conversation;
  },

  /**
   * Busca ou cria uma conversa entre dois usuarios
   */
  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    transactionId?: number
  ) {
    // Verificar se a conversa ja existe
    const { data: existing } = await supabase
      .from("conversations")
      .select(
        "*, participant_1_profile:profiles!participant_1(id, name, avatar_url), participant_2_profile:profiles!participant_2(id, name, avatar_url)"
      )
      .or(
        `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
      )
      .single();

    if (existing) return existing as Conversation;

    // Criar nova conversa
    return this.createConversation(userId, otherUserId, transactionId);
  },
};
