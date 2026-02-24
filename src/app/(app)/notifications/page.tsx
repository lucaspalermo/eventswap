'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Tag,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  Star,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { notificationsService } from '@/services/notifications.service';
import type { Notification as DBNotification } from '@/types/database.types';

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'offer' | 'payment' | 'message' | 'listing' | 'review';
}

const notificationIcons: Record<string, typeof Bell> = {
  offer: Tag,
  payment: CreditCard,
  message: MessageSquare,
  listing: CheckCircle2,
  review: Star,
};

const notificationColors: Record<string, string> = {
  offer: 'bg-[#2563EB]/10 text-[#2563EB]',
  payment: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30',
  message: 'bg-sky-50 text-sky-500 dark:bg-sky-950/30',
  listing: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30',
  review: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30',
};

function channelToType(channel: string): NotificationItem['type'] {
  switch (channel) {
    case 'TRANSACTION': return 'offer';
    case 'PAYMENT': return 'payment';
    case 'MESSAGE': return 'message';
    case 'LISTING': return 'listing';
    case 'REVIEW': return 'review';
    default: return 'listing';
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin} min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atras`;
  return date.toLocaleDateString('pt-BR');
}

const ITEMS_PER_PAGE = 20;

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationsService.getAll(user.id, 20);
        const mapped: NotificationItem[] = (data || []).map((n: DBNotification) => ({
            id: n.id,
            title: n.title,
            description: n.body,
            time: formatRelativeTime(n.created_at),
            isRead: n.is_read,
            type: channelToType(n.channel),
          }));
          setNotifications(mapped);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, authLoading]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (user) {
      try {
        await notificationsService.markAllAsRead(user.id);
      } catch {
        // UI already updated optimistically
      }
    }
  };

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    if (user) {
      try {
        await notificationsService.markAsRead(id);
      } catch {
        // UI already updated optimistically
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Notificacoes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Carregando...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Notificacoes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notificac${unreadCount > 1 ? 'oes' : 'ao'} nao lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificacoes lidas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </motion.div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificacao"
          description="Voce nao possui notificacoes no momento. Elas aparecerao aqui quando houver atualizacoes."
        />
      ) : (
        <>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {visibleNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            const colorClass = notificationColors[notification.type];

            return (
              <motion.div key={notification.id} variants={staggerChild}>
                <Card
                  className={cn(
                    'hover:shadow-md transition-all cursor-pointer',
                    !notification.isRead &&
                      'border-l-2 border-l-[#2563EB] bg-[#2563EB]/[0.02] dark:bg-[#2563EB]/[0.05]'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          colorClass
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3
                            className={cn(
                              'text-sm truncate',
                              !notification.isRead
                                ? 'font-semibold text-neutral-950 dark:text-white'
                                : 'font-medium text-neutral-700 dark:text-neutral-300'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-xs text-neutral-400">
                              {notification.time}
                            </span>
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                            )}
                          </div>
                        </div>
                        <p
                          className={cn(
                            'text-sm leading-relaxed',
                            !notification.isRead
                              ? 'text-neutral-600 dark:text-neutral-400'
                              : 'text-neutral-500'
                          )}
                        >
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Load More */}
        {hasMore && (
          <div className="flex flex-col items-center gap-2 mt-6">
            <p className="text-xs text-neutral-400">
              Mostrando {visibleCount} de {notifications.length} notificacoes
            </p>
            <Button variant="outline" size="sm" onClick={handleLoadMore} className="gap-2">
              <ChevronDown className="h-4 w-4" />
              Carregar mais
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
