'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  RotateCcw,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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



type TimelineStep = {
  id: number;
  event: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
};

type TransactionData = {
  id: string;
  code: string;
  listing: {
    id: number;
    title: string;
    category: string;
    eventDate: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    verified: boolean;
  };
  amount: number;
  buyerFee: number;
  sellerFee: number;
  platformFee: number;
  netToSeller: number;
  paymentMethod: string;
  paymentGateway: string;
  installments: number;
  status: string;
  protection: string;
  createdAt: string;
  paidAt: string;
  escrowAt: string;
  releasedAt: string;
  completedAt: string;
  timeline: TimelineStep[];
};

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'destructive' | 'secondary' }> = {
  COMPLETED: { label: 'Concluido', variant: 'success' },
  INITIATED: { label: 'Iniciado', variant: 'secondary' },
  AWAITING_PAYMENT: { label: 'Aguardando Pgto', variant: 'warning' },
  PAYMENT_CONFIRMED: { label: 'Pago', variant: 'default' },
  ESCROW_HELD: { label: 'Em Garantia', variant: 'default' },
  TRANSFER_PENDING: { label: 'Transferindo', variant: 'warning' },
  DISPUTE_OPENED: { label: 'Em Disputa', variant: 'destructive' },
  DISPUTE_RESOLVED: { label: 'Disputa Resolvida', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  REFUNDED: { label: 'Reembolsado', variant: 'secondary' },
};

const timelineStatusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    line: 'bg-emerald-300 dark:bg-emerald-700',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
    line: 'bg-zinc-200 dark:bg-zinc-700',
  },
  failed: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    line: 'bg-red-300 dark:bg-red-700',
  },
};

const paymentMethodLabels: Record<string, string> = {
  CARD: 'Cartao de Credito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
};

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const [tx, setTx] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const data = await adminService.getTransactionById(transactionId);
        if (data) {
          const buyer = data.buyer as Record<string, unknown> | null;
          const seller = data.seller as Record<string, unknown> | null;
          const listing = data.listing as Record<string, unknown> | null;
          const payment = data.payment as Record<string, unknown> | null;
          const amount = Number(data.agreed_price) || 0;
          const platformFee = Number(data.platform_fee) || 0;
          const feeRate = Number(data.platform_fee_rate) || 0.08;
          const sellerFee = Math.round(amount * feeRate);
          const buyerFee = platformFee - sellerFee > 0 ? platformFee - sellerFee : Math.round(amount * 0.05);

          setTx({
            id: String(data.id),
            code: (data.code as string) || `TXN-${data.id}`,
            listing: {
              id: (listing?.id as number) || 0,
              title: (listing?.title as string) || 'Anuncio',
              category: (listing?.category as string) || '',
              eventDate: (listing?.event_date as string) || '',
            },
            buyer: {
              id: String(buyer?.id || ''),
              name: (buyer?.name as string) || 'Comprador',
              email: (buyer?.email as string) || '',
              avatar: ((buyer?.name as string) || 'C')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
              verified: (buyer?.is_verified as boolean) || false,
            },
            seller: {
              id: String(seller?.id || ''),
              name: (seller?.name as string) || 'Vendedor',
              email: (seller?.email as string) || '',
              avatar: ((seller?.name as string) || 'V')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
              verified: (seller?.is_verified as boolean) || false,
            },
            amount,
            buyerFee,
            sellerFee,
            platformFee,
            netToSeller: Number(data.seller_net_amount) || amount - sellerFee,
            paymentMethod: payment
              ? paymentMethodLabels[(payment.method as string)] || (payment.method as string)
              : 'N/A',
            paymentGateway: 'Asaas',
            installments: 1,
            status: (data.status as string) || 'INITIATED',
            protection: 'standard',
            createdAt: data.created_at as string,
            paidAt: (payment?.paid_at as string) || '',
            escrowAt: '',
            releasedAt: '',
            completedAt: (data.completed_at as string) || '',
            timeline: buildTimeline(data),
          });
        } else {
          setTx(null);
        }
      } catch {
        setTx(null);
      } finally {
        setLoading(false);
      }
    }
    loadTransaction();
  }, [transactionId]);

  if (!loading && !tx) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Transacao nao encontrada
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          A transacao solicitada nao existe ou nao pode ser carregada.
        </p>
        <Link href="/admin/transactions">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Transacoes
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
        <Link href="/admin/transactions">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Transacoes
          </Button>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 w-60 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ) : tx && (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {tx.code}
                </h1>
                <Badge variant={statusLabels[tx.status]?.variant || 'secondary'}>
                  {statusLabels[tx.status]?.label || tx.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {tx.listing.title}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Forcar Conclusao
          </Button>
          <Button variant="destructive" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Forcar Reembolso
          </Button>
          <Button variant="outline" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950">
            <AlertTriangle className="h-4 w-4" />
            Abrir Disputa
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Timeline */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Timeline da Transacao</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tx && (
                <div className="relative space-y-0">
                  {tx.timeline.map((step, index) => {
                    const config = timelineStatusConfig[step.status];
                    const StepIcon = config.icon;
                    const isLast = index === tx.timeline.length - 1;

                    return (
                      <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                        {/* Line */}
                        {!isLast && (
                          <div
                            className={cn(
                              'absolute left-[17px] top-[36px] w-0.5 h-[calc(100%-28px)]',
                              config.line
                            )}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                            config.bg
                          )}
                        >
                          <StepIcon className={cn('h-4.5 w-4.5', config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {step.event}
                          </p>
                          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                            {step.description}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {new Date(step.date).toLocaleString('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Details Sidebar */}
        <div className="space-y-6">
          {/* Payment Details */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    ))}
                  </div>
                ) : tx && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Valor do Anuncio</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Taxa do Comprador (5%)</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                          {formatCurrency(tx.buyerFee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Taxa do Vendedor (10%)</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                          {formatCurrency(tx.sellerFee)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total pago pelo comprador</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.amount + tx.buyerFee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Receita da plataforma</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(tx.platformFee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Liquido para vendedor</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.netToSeller)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Metodo</span>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {tx.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Gateway</span>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {tx.paymentGateway}
                        </span>
                      </div>
                      {tx.installments > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Parcelas</span>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {tx.installments}x de {formatCurrency((tx.amount + tx.buyerFee) / tx.installments)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Protecao</span>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-[#6C3CE1]" />
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                            {tx.protection}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Buyer Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comprador</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                ) : tx && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {tx.buyer.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {tx.buyer.name}
                          </h4>
                          {tx.buyer.verified && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {tx.buyer.email}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/users/${tx.buyer.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                        <User className="h-4 w-4" />
                        Ver Perfil
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Seller Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                ) : tx && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6C3CE1]/10 text-sm font-bold text-[#6C3CE1]">
                        {tx.seller.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {tx.seller.name}
                          </h4>
                          {tx.seller.verified && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {tx.seller.email}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/users/${tx.seller.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                        <User className="h-4 w-4" />
                        Ver Perfil
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper to build timeline from transaction data
function buildTimeline(data: Record<string, unknown>) {
  const timeline: Array<{
    id: number;
    event: string;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }> = [];

  let stepId = 1;

  if (data.created_at) {
    timeline.push({
      id: stepId++,
      event: 'Transacao criada',
      description: 'Comprador iniciou o processo de compra.',
      date: data.created_at as string,
      status: 'completed',
    });
  }

  const payment = data.payment as Record<string, unknown> | null;
  if (payment?.paid_at) {
    timeline.push({
      id: stepId++,
      event: 'Pagamento confirmado',
      description: `Pagamento confirmado via ${payment.method || 'N/A'}.`,
      date: payment.paid_at as string,
      status: 'completed',
    });
  } else if (
    ['AWAITING_PAYMENT', 'INITIATED'].includes(data.status as string)
  ) {
    timeline.push({
      id: stepId++,
      event: 'Aguardando pagamento',
      description: 'Pagamento ainda nao confirmado.',
      date: data.created_at as string,
      status: 'pending',
    });
  }

  if (
    ['ESCROW_HELD', 'TRANSFER_PENDING', 'COMPLETED'].includes(
      data.status as string
    )
  ) {
    timeline.push({
      id: stepId++,
      event: 'Valor em garantia',
      description: 'Valor retido em escrow ate confirmacao.',
      date: payment?.paid_at as string || data.created_at as string,
      status: 'completed',
    });
  }

  if (data.completed_at) {
    timeline.push({
      id: stepId++,
      event: 'Transacao concluida',
      description: `Valor de ${formatCurrency(Number(data.seller_net_amount) || 0)} liberado ao vendedor.`,
      date: data.completed_at as string,
      status: 'completed',
    });
  }

  if (data.cancelled_at) {
    timeline.push({
      id: stepId++,
      event: 'Transacao cancelada',
      description: (data.cancel_reason as string) || 'Transacao foi cancelada.',
      date: data.cancelled_at as string,
      status: 'failed',
    });
  }

  if ((data.status as string) === 'DISPUTE_OPENED') {
    timeline.push({
      id: stepId++,
      event: 'Disputa aberta',
      description: 'Uma disputa foi aberta nesta transacao.',
      date: data.updated_at as string || data.created_at as string,
      status: 'failed',
    });
  }

  // If empty timeline, add at least the creation
  if (timeline.length === 0) {
    timeline.push({
      id: 1,
      event: 'Transacao iniciada',
      description: 'Transacao registrada no sistema.',
      date: (data.created_at as string) || new Date().toISOString(),
      status: 'completed',
    });
  }

  return timeline;
}
