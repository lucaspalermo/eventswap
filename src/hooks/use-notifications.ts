"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationsService } from "@/services/notifications.service";
import { useRealtime } from "./use-realtime";
import type { Notification } from "@/types/database.types";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial notifications
  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        setLoading(true);
        const [data, count] = await Promise.all([
          notificationsService.getAll(userId!),
          notificationsService.getUnreadCount(userId!),
        ]);
        setNotifications(data);
        setUnreadCount(count);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  // Listen for new notifications in real-time
  useRealtime({
    table: "notifications",
    filter: `user_id=eq.${userId}`,
    enabled: !!userId,
    onInsert: (payload) => {
      const notification = payload as unknown as Notification;
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (!notification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    onUpdate: (payload) => {
      const updated = payload as unknown as Notification;
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
      // Recalculate unread count on update
      setNotifications((prev) => {
        const newUnread = prev.filter((n) => !n.is_read).length;
        setUnreadCount(newUnread);
        return prev;
      });
    },
  });

  const markAsRead = useCallback(async (notificationId: number) => {
    await notificationsService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await notificationsService.markAllAsRead(userId);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
