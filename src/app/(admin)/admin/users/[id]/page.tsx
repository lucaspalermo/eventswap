'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Store,
  ShoppingBag,
  Star,
  Calendar,
  Ban,
  UserCog,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { adminService } from '@/services/admin.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};



type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  kycStatus: string;
  verified: boolean;
  phone: string;
  cpf: string;
  createdAt: string;
  lastLogin: string;
  stats: {
    listings: number;
    purchases: number;
    sales: number;
    reviews: number;
  };
  recentTransactions: TransactionRow[];
};

type TransactionRow = {
  id: string;
  type: string;
  listing: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  date: string;
};

const statusConfig = {
  completed: {
    label: 'Concluido',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  },
  refunded: {
    label: 'Reembolsado',
    icon: XCircle,
    className: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  },
};

const kycBadge: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary' }> = {
  PENDING: { label: 'KYC Pendente', variant: 'warning' as const },
  SUBMITTED: { label: 'KYC Enviado', variant: 'secondary' as const },
  APPROVED: { label: 'KYC Aprovado', variant: 'success' as const },
  REJECTED: { label: 'KYC Rejeitado', variant: 'destructive' as const },
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await adminService.getUserById(userId);
        if (data) {
          const mappedUser: UserData = {
            id: data.id,
            name: data.name || 'Sem nome',
            email: data.email || '',
            avatar: (data.name || 'U')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            role: data.role || 'USER',
            kycStatus: data.kyc_status || 'PENDING',
            verified: data.is_verified || false,
            phone: data.phone || 'Nao informado',
            cpf: data.cpf ? `***.***.${data.cpf.slice(-5)}` : 'Nao informado',
            createdAt: data.created_at,
            lastLogin: data.updated_at || data.created_at,
            stats: data.stats || { listings: 0, purchases: 0, sales: 0, reviews: 0 },
            recentTransactions: [],
          };
          setUser(mappedUser);

          // Map real transactions
          if (data.recentTransactions && data.recentTransactions.length > 0) {
            const mapped: TransactionRow[] = data.recentTransactions.map(
              (tx: Record<string, unknown>) => {
                const statusMap: Record<string, 'completed' | 'pending' | 'refunded'> = {
                  COMPLETED: 'completed',
                  REFUNDED: 'refunded',
                };
                return {
                  id: (tx.code as string) || `TXN-${tx.id}`,
                  type: tx.buyer_id === userId ? 'Compra' : 'Venda',
                  listing: (tx.listing as { title: string })?.title || 'Anuncio',
                  amount: Number(tx.agreed_price) || 0,
                  status: statusMap[tx.status as string] || 'pending',
                  date: tx.created_at as string,
                };
              }
            );
            setTransactions(mapped);
          } else {
            setTransactions([]);
          }
        }
      } catch {
        setUser(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [userId]);

  if (!loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Usuario nao encontrado
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          O usuario solicitado nao existe ou nao pode ser carregado.
        </p>
        <Link href="/admin/users">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Usuarios
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back button */}
      <motion.div variants={itemVariants}>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Usuarios
          </Button>
        </Link>
      </motion.div>

      {/* User Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-start gap-5">
                <div className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-1/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            ) : user && (
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#6C3CE1]/10 text-2xl font-bold text-[#6C3CE1]">
                    {user.avatar}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </h1>
                      {user.verified && (
                        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verificado
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Admin' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Usuario'}
                      </Badge>
                      <Badge variant={kycBadge[user.kycStatus]?.variant || 'secondary'}>
                        {kycBadge[user.kycStatus]?.label || user.kycStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 pt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span>Telefone: {user.phone}</span>
                      <span>CPF: {user.cpf}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Cadastro: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span>Ultimo login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserCog className="h-4 w-4" />
                    Alterar Papel
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Suspender Usuario
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Stats */}
      {user && (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Anuncios', value: user.stats.listings, icon: Store, color: 'text-[#6C3CE1]', bg: 'bg-[#6C3CE1]/10' },
          { label: 'Compras', value: user.stats.purchases, icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Vendas', value: user.stats.sales, icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          { label: 'Avaliacoes', value: user.stats.reviews, icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  {loading ? (
                    <div className="h-7 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  ) : (
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  )}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Transacoes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Nenhuma transacao encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Codigo
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Tipo
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Anuncio
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Valor
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Status
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {transactions.map((tx) => {
                      const config = statusConfig[tx.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      return (
                        <tr key={tx.id} className="group">
                          <td className="py-3 pr-4">
                            <Link
                              href={`/admin/transactions/${tx.id}`}
                              className="text-sm font-medium text-[#6C3CE1] hover:underline"
                            >
                              {tx.id}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={tx.type === 'Venda' ? 'success' : 'secondary'}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm text-zinc-600 dark:text-zinc-300">
                              {tx.listing}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                config.className
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                              {new Date(tx.date).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
