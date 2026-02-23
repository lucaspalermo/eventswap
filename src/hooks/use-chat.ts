"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { chatService } from "@/services/chat.service";
import type { Message } from "@/types/database.types";

interface PresenceState {
  user_id: string;
  user_name: string;
  typing: boolean;
}

interface UseChatOptions {
  conversationId: number;
  userId: string;
  enabled?: boolean;
}

export function useChat({
  conversationId,
  userId,
  enabled = true,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load initial messages
  useEffect(() => {
    if (!enabled || !conversationId) return;

    async function load() {
      try {
        setLoading(true);
        const data = await chatService.getMessages(conversationId);
        setMessages(data as Message[]);
        await chatService.markAsRead(conversationId, userId);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [conversationId, userId, enabled]);

  // Subscribe to new messages and presence (typing indicators)
  useEffect(() => {
    if (!enabled || !conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch sender profile to include in the message
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender: Message = {
            ...newMessage,
            sender: sender ? (sender as Message['sender']) : undefined,
          };

          setMessages((prev) => {
            // Avoid duplicates (optimistic update may have already added it)
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, messageWithSender];
          });

          // Mark as read if it's not our message
          if (newMessage.sender_id !== userId) {
            chatService.markAsRead(conversationId, userId).catch(() => {});
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id ? { ...m, is_read: updated.is_read, read_at: updated.read_at } : m
            )
          );
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const typing: string[] = [];
        for (const key of Object.keys(state)) {
          const presences = state[key] as unknown as PresenceState[];
          for (const p of presences) {
            if (p.typing && p.user_id !== userId) {
              typing.push(p.user_name);
            }
          }
        }
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, user_name: '', typing: false });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, enabled]);

  // Send message with optimistic update
  const sendMessage = useCallback(
    async (content: string, type: "TEXT" | "IMAGE" | "FILE" = "TEXT", fileUrl?: string) => {
      const optimisticId = Date.now();
      try {
        setSending(true);

        // Optimistic update
        const optimisticMessage: Message = {
          id: optimisticId,
          conversation_id: conversationId,
          sender_id: userId,
          type,
          content,
          file_url: fileUrl || null,
          is_read: false,
          read_at: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        // Insert via service
        const message = await chatService.sendMessage(
          conversationId,
          userId,
          content,
          type,
          fileUrl
        );

        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...message, sender: m.sender } : m))
        );

        return message;
      } catch (error) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        throw error;
      } finally {
        setSending(false);
      }
    },
    [conversationId, userId]
  );

  // Set typing indicator via presence
  const setTyping = useCallback(
    async (isTyping: boolean, userName: string) => {
      if (channelRef.current) {
        await channelRef.current.track({
          user_id: userId,
          user_name: userName,
          typing: isTyping,
        });
      }
    },
    [userId]
  );

  return { messages, loading, sending, typingUsers, sendMessage, setTyping };
}
