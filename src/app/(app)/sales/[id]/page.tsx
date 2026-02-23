'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Shield,
  MessageSquare,
  MapPin,
  Calendar,
  CreditCard,
  TrendingUp,
  Banknote,
  FileText,
  Star,
  ScrollText,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { transactionsService } from '@/services/transactions.service';
import { ReviewDialog, getDemoReviews } from '@/components/shared/review-dialog';
import { DisputeDialog } from '@/components/transactions/dispute-dialog';
import { isDemoMode } from '@/lib/demo-auth';
import { toast } from 'sonner';

interface SaleDetail {
  id: number;
  code: string;
  status: string;
  listing: {
    title: string;
    category: string;
    eventDate: string;
    venueName: string;
    venueCity: string;
    venueState: string;
  };
  buyer: {
    id: string;
    name: string;
    initials: string;
    rating: number;
  };
  agreedPrice: number;
  platformFee: number;
  platformFeeRate: number;
  sellerNetAmount: number;
  completedAt: string;
  createdAt: string;
}

const mockSale: SaleDetail = {
  id: 1,
  code: 'TXN-2026-0002',
  status: 'COMPLETED',
  listing: {
    title: 'Fotógrafo Profissional - Ensaio + Evento Completo',
    category: 'Fotografia',
    eventDate: '2026-04-10',
    venueName: 'Local do Cliente',
    venueCity: 'Rio de Janeiro',
    venueState: 'RJ',
  },
  buyer: {
    id: 'demo-buyer',
    name: 'Pedro Oliveira',
    initials: 'PO',
    rating: 4.7,
  },
  agreedPrice: 8500,
  platformFee: 850,
  platformFeeRate: 0.10,
  sellerNetAmount: 7650,
  completedAt: '2026-01-28',
  createdAt: '2026-01-25',
};

const statusLabels: Record<string, string> = {
  INITIATED: 'Iniciada',
  AWAITING_PAYMENT: 'Aguardando Pagamento',
  PAYMENT_CONFIRMED: 'Pagamento Confirmado',
  ESCROW_HELD: 'Em Garantia',
  TRANSFER_PENDING: 'Transferência Pendente',
  COMPLETED: 'Concluída',
  DISPUTE_OPENED: 'Disputa Aberta',
  DISPUTE_RESOLVED: 'Disputa Resolvida',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
};

const CONTRACT_ELIGIBLE_STATUSES = [
  'ESCROW_HELD',
  'TRANSFER_PENDING',
  'COMPLETED',
  'DISPUTE_OPENED',
  'DISPUTE_RESOLVED',
];

function isContractEligible(status: string): boolean {
  return CONTRACT_ELIGIBLE_STATUSES.includes(status);
}

interface TimelineStep {
  label: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  icon: typeof CheckCircle2;
}

function buildTimeline(status: string, createdAt: string, completedAt: string): TimelineStep[] {
  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const completedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const statusOrder = ['INITIATED', 'PAYMENT_CONFIRMED', 'ESCROW_HELD', 'TRANSFER_PENDING', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(status);

  const steps: TimelineStep[] = [
    {
      label: 'Transação Iniciada',
      date: currentIndex >= 0 ? createdDate : '',
      status: currentIndex >= 0 ? 'completed' : 'pending',
      icon: CheckCircle2,
    },
    {
      label: 'Pagamento Confirmado',
      date: currentIndex >= 1 ? createdDate : '',
      status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'pending',
      icon: CreditCard,
    },
    {
      label: 'Valor em Garantia',
      date: currentIndex >= 2 ? createdDate : '',
      status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'current' : 'pending',
      icon: Shield,
    },
    {
      label: 'Transferência Confirmada',
      date: currentIndex >= 3 ? (completedDate || createdDate) : '',
      status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'current' : 'pending',
      icon: FileText,
    },
    {
      label: 'Valor Liberado',
      date: currentIndex >= 4 ? completedDate : '',
      status: currentIndex >= 4 ? 'completed' : 'pending',
      icon: Banknote,
    },
  ];

  return steps;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SaleDetailPage() {
  const params = useParams();
  const [sale, setSale] = useState<SaleDetail>(mockSale);
  const [loading, setLoading] = useState(true);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>(
    buildTimeline(mockSale.status, mockSale.createdAt, mockSale.completedAt)
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

  // Check if already reviewed (demo mode)
  useEffect(() => {
    if (isDemoMode()) {
      const demoReviews = getDemoReviews();
      const alreadyReviewed = demoReviews.some(
        (r) => String(r.transaction_id) === String(sale.id) && r.target_id === sale.buyer.id
      );
      setHasReviewed(alreadyReviewed);
    }
  }, [sale.id, sale.buyer.id]);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) {
      setLoading(false);
      return;
    }

    transactionsService
      .getById(id)
      .then((data) => {
        if (data) {
          const mapped: SaleDetail = {
            id: data.id,
            code: data.code,
            status: data.status,
            listing: {
              title: data.listing?.title || 'Reserva',
              category: data.listing?.category || '',
              eventDate: data.listing?.event_date || '',
              venueName: data.listing?.venue_name || '',
              venueCity: data.listing?.venue_city || '',
              venueState: data.listing?.venue_state || '',
            },
            buyer: {
              id: data.buyer_id || data.buyer?.id || '',
              name: data.buyer?.name || 'Comprador',
              initials: getInitials(data.buyer?.name || 'C'),
              rating: data.buyer?.rating_avg || 0,
            },
            agreedPrice: data.agreed_price,
            platformFee: data.platform_fee,
            platformFeeRate: data.platform_fee_rate,
            sellerNetAmount: data.seller_net_amount,
            completedAt: data.completed_at?.split('T')[0] || '',
            createdAt: data.created_at?.split('T')[0] || '',
          };
          setSale(mapped);
          setTimelineSteps(buildTimeline(data.status, data.created_at, data.completed_at || ''));
        }
      })
      .catch(() => {
        // Mantém dados mock como fallback
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handlePayout() {
    if (payoutLoading) return;

    setPayoutLoading(true);

    // Demo mode: simulate success without calling the API
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSale((prev) => ({ ...prev, status: 'TRANSFER_PENDING' }));
      setTimelineSteps(buildTimeline('TRANSFER_PENDING', sale.createdAt, sale.completedAt));
      toast.success('Transferencia iniciada com sucesso', {
        description: `R$ ${sale.sellerNetAmount.toLocaleString('pt-BR')} sera creditado em sua conta em breve (modo demo).`,
      });
      setPayoutLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: sale.id }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error('Erro ao liberar pagamento', {
          description: json.error || 'Tente novamente mais tarde.',
        });
        return;
      }

      setSale((prev) => ({ ...prev, status: 'TRANSFER_PENDING' }));
      setTimelineSteps(buildTimeline('TRANSFER_PENDING', sale.createdAt, sale.completedAt));

      toast.success('Transferencia iniciada com sucesso', {
        description: `R$ ${sale.sellerNetAmount.toLocaleString('pt-BR')} sera creditado em sua conta em breve.`,
      });
    } catch {
      toast.error('Erro ao liberar pagamento', {
        description: 'Nao foi possivel conectar ao servidor. Tente novamente.',
      });
    } finally {
      setPayoutLoading(false);
    }
  }

  if (loading) {
    return <DetailSkeleton />;
  }

  const isCompleted = sale.status === 'COMPLETED';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back */}
      <motion.div variants={staggerChild}>
        <Link
          href="/sales"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Vendas
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={staggerChild} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
              Detalhes da Venda
            </h1>
            <Badge variant={isCompleted ? 'success' : 'default'}>
              {statusLabels[sale.status] || sale.status}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">
            Código: {sale.code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isContractEligible(sale.status) && (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={`/transactions/${sale.id}/contract`}>
                <ScrollText className="h-4 w-4 mr-2" />
                Ver Contrato de Cessao
              </Link>
            </Button>
          )}
          {sale.status === 'ESCROW_HELD' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              onClick={handlePayout}
              disabled={payoutLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {payoutLoading ? 'Processando...' : 'Liberar Pagamento'}
            </Button>
          )}
          {isCompleted && !hasReviewed && (
            <Button
              size="sm"
              className="bg-[#6C3CE1] hover:bg-[#5B32C1] text-white shrink-0"
              onClick={() => setReviewDialogOpen(true)}
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Comprador
            </Button>
          )}
          {(sale.status === 'ESCROW_HELD' || sale.status === 'TRANSFER_PENDING') && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 shrink-0"
              onClick={() => setDisputeDialogOpen(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Abrir Disputa
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Info */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reserva Vendida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                  {sale.listing.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Badge variant="secondary" className="text-xs">
                      {sale.listing.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    {sale.listing.eventDate
                      ? new Date(sale.listing.eventDate).toLocaleDateString('pt-BR')
                      : '-'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    {sale.listing.venueCity}{sale.listing.venueState ? `, ${sale.listing.venueState}` : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === timelineSteps.length - 1;
                    return (
                      <div key={step.label} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={
                              step.status === 'completed'
                                ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'
                                : step.status === 'current'
                                  ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 ring-2 ring-[#6C3CE1]'
                                  : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800'
                            }
                          >
                            <Icon
                              className={
                                step.status === 'completed'
                                  ? 'h-4 w-4 text-emerald-600 dark:text-emerald-400'
                                  : step.status === 'current'
                                    ? 'h-4 w-4 text-[#6C3CE1]'
                                    : 'h-4 w-4 text-neutral-400'
                              }
                            />
                          </div>
                          {!isLast && (
                            <div
                              className={
                                step.status === 'completed'
                                  ? 'w-0.5 flex-1 mt-1 bg-emerald-200 dark:bg-emerald-800'
                                  : 'w-0.5 flex-1 mt-1 bg-neutral-200 dark:bg-neutral-700'
                              }
                            />
                          )}
                        </div>
                        <div className="pb-2">
                          <p
                            className={
                              step.status === 'pending'
                                ? 'text-sm font-medium text-neutral-400'
                                : 'text-sm font-medium text-neutral-900 dark:text-neutral-100'
                            }
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {step.date}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Earnings */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seus Ganhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Valor da venda</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    R$ {sale.agreedPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Comissão EventSwap ({(sale.platformFeeRate * 100).toFixed(0)}%)</span>
                  <span className="text-red-500">
                    -R$ {sale.platformFee.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Valor líquido
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    R$ {sale.sellerNetAmount.toLocaleString('pt-BR')}
                  </span>
                </div>
                {isCompleted && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Valor já creditado na sua carteira
                      </span>
                    </div>
                  </div>
                )}
                {!isCompleted && sale.status !== 'TRANSFER_PENDING' && (
                  <div className="mt-4 p-3 rounded-lg bg-[#6C3CE1]/5 border border-[#6C3CE1]/10">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#6C3CE1]" />
                      <span className="text-xs font-medium text-[#6C3CE1]">
                        Valor retido em garantia
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      O valor será liberado após a confirmação da transferência.
                    </p>
                    {sale.status === 'ESCROW_HELD' && (
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handlePayout}
                        disabled={payoutLoading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {payoutLoading ? 'Processando...' : 'Confirmar Transferencia'}
                      </Button>
                    )}
                  </div>
                )}
                {sale.status === 'TRANSFER_PENDING' && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        Transferencia em andamento
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      O pagamento foi solicitado e esta sendo processado pelo banco.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Buyer */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comprador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 font-medium">
                      {sale.buyer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {sale.buyer.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {sale.buyer.rating > 0 ? `★ ${sale.buyer.rating}` : ''}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Review Status */}
          {isCompleted && (
            <motion.div variants={staggerChild}>
              <Card>
                <CardContent className="p-6">
                  {hasReviewed ? (
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Avaliacao enviada</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Obrigado por avaliar esta transacao!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <Star className="h-8 w-8 mx-auto text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Avalie esta transacao
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Sua avaliacao ajuda outros usuarios da plataforma.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-[#6C3CE1] hover:bg-[#5B32C1] text-white"
                        onClick={() => setReviewDialogOpen(true)}
                      >
                        Avaliar Comprador
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        transactionId={sale.id}
        targetUserId={sale.buyer.id}
        targetUserName={sale.buyer.name}
        onReviewSubmitted={() => setHasReviewed(true)}
      />

      {/* Dispute Dialog */}
      <DisputeDialog
        transactionId={sale.id}
        transactionCode={sale.code}
        isOpen={disputeDialogOpen}
        onClose={() => setDisputeDialogOpen(false)}
        onSuccess={() => {
          setDisputeDialogOpen(false);
          // Reload transaction data to reflect updated status
          const id = Number(params.id);
          if (id) {
            transactionsService
              .getById(id)
              .then((data) => {
                if (data) {
                  setSale((prev) => ({ ...prev, status: data.status }));
                  setTimelineSteps(buildTimeline(data.status, data.created_at, data.completed_at || ''));
                }
              })
              .catch(() => {});
          }
        }}
      />
    </motion.div>
  );
}
