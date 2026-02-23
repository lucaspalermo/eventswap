"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  CheckCircle,
  MessageSquare,
  Heart,
  Bell,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { notificationsService } from "@/services/notifications.service";
import { transactionsService } from "@/services/transactions.service";
import type { Notification } from "@/types/database.types";

interface Activity {
  id: number;
  text: string;
  time: string;
  icon: React.ElementType;
  dotColor: string;
  iconColor: string;
}

const fallbackActivities: Activity[] = [
  {
    id: 1,
    text: "Nova oferta recebida para Buffet Premium SP",
    time: "2 min atras",
    icon: ShoppingBag,
    dotColor: "bg-[#6C3CE1]",
    iconColor: "text-[#6C3CE1]",
  },
  {
    id: 2,
    text: "Pagamento confirmado - Casamento Villa Rosa",
    time: "1h atras",
    icon: CheckCircle,
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-500",
  },
  {
    id: 3,
    text: "Mensagem de Joao Silva sobre Espaco Garden",
    time: "3h atras",
    icon: MessageSquare,
    dotColor: "bg-blue-500",
    iconColor: "text-blue-500",
  },
  {
    id: 4,
    text: "Anuncio 'Fotografo Premium RJ' aprovado",
    time: "5h atras",
    icon: CheckCircle,
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-500",
  },
  {
    id: 5,
    text: "Novo favorito no seu anuncio 'DJ Set Completo'",
    time: "1 dia",
    icon: Heart,
    dotColor: "bg-pink-500",
    iconColor: "text-pink-500",
  },
];

function getIconForChannel(channel: string): {
  icon: React.ElementType;
  dotColor: string;
  iconColor: string;
} {
  switch (channel) {
    case "TRANSACTION":
      return { icon: ShoppingBag, dotColor: "bg-[#6C3CE1]", iconColor: "text-[#6C3CE1]" };
    case "PAYMENT":
      return { icon: CheckCircle, dotColor: "bg-emerald-500", iconColor: "text-emerald-500" };
    case "MESSAGE":
      return { icon: MessageSquare, dotColor: "bg-blue-500", iconColor: "text-blue-500" };
    case "LISTING":
      return { icon: CheckCircle, dotColor: "bg-emerald-500", iconColor: "text-emerald-500" };
    default:
      return { icon: Bell, dotColor: "bg-neutral-500", iconColor: "text-neutral-500" };
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? "s" : ""} atras`;
  return date.toLocaleDateString("pt-BR");
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function RecentActivity() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(fallbackActivities);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchActivity = async () => {
      try {
        // Try fetching notifications first, then recent transactions as fallback
        const [notifications, sales, purchases] = await Promise.all([
          notificationsService.getAll(user.id, 5).catch(() => [] as Notification[]),
          transactionsService.getMySales(user.id).catch(() => []),
          transactionsService.getMyPurchases(user.id).catch(() => []),
        ]);

        const items: Activity[] = [];

        // Add notifications
        notifications.forEach((n) => {
          const style = getIconForChannel(n.channel);
          items.push({
            id: n.id,
            text: n.title + (n.body ? ` - ${n.body}` : ""),
            time: formatRelativeTime(n.created_at),
            ...style,
          });
        });

        // If we have few notifications, supplement with recent transactions
        if (items.length < 5) {
          const recentTxns = [...sales, ...purchases]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5 - items.length);

          recentTxns.forEach((txn) => {
            const listing = txn.listing as { title?: string } | undefined;
            const listingTitle = listing?.title || "Transacao";
            const isSale = txn.seller_id === user.id;
            items.push({
              id: txn.id + 100000,
              text: isSale
                ? `Venda: ${listingTitle} - ${txn.status}`
                : `Compra: ${listingTitle} - ${txn.status}`,
              time: formatRelativeTime(txn.created_at),
              icon: isSale ? CheckCircle : ShoppingBag,
              dotColor: isSale ? "bg-emerald-500" : "bg-[#6C3CE1]",
              iconColor: isSale ? "text-emerald-500" : "text-[#6C3CE1]",
            });
          });
        }

        if (items.length > 0) {
          setActivities(items.slice(0, 5));
        }
        // If no items, keep fallback
      } catch {
        // Keep fallback activities on error
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, authLoading]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && authLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <motion.ul
            className="space-y-0"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.li key={activity.id} variants={itemVariants}>
                  <div
                    className={cn(
                      "flex items-start gap-3 py-3.5",
                      index !== activities.length - 1 &&
                        "border-b border-zinc-100 dark:border-zinc-800"
                    )}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <Icon
                          className={cn("h-4 w-4", activity.iconColor)}
                        />
                      </div>
                      <span
                        className={cn(
                          "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900",
                          activity.dotColor
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                        {activity.text}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/history"
          className="text-sm font-medium text-[#6C3CE1] hover:text-[#5B32C1] transition-colors dark:text-[#8B5CF6] dark:hover:text-[#A78BFA]"
        >
          Ver todo historico
        </Link>
      </CardFooter>
    </Card>
  );
}
