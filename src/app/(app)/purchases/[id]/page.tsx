'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  MessageSquare,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  Star,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { toast } from 'sonner';
import { transactionsService } from '@/services/transactions.service';
import { chatService } from '@/services/chat.service';
import { ReviewDialog, getDemoReviews } from '@/components/shared/review-dialog';
import { DisputeDialog } from '@/components/transactions/dispute-dialog';
import { VendorApprovalStatus } from '@/components/transactions/vendor-approval-status';
import { useAuth } from '@/hooks/use-auth';

import { isDemoMode } from '@/lib/demo-auth';

interface TransactionDetail {
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
  seller: {
    id: string;
    name: string;
    initials: string;
    rating: number;
    isVerified: boolean;
  };
  agreedPrice: number;
  platformFee: number;
  platformFeeRate: number;
  createdAt: string;
  paymentDeadline: string;
}

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

function getStatusBadgeVariant(status: string) {
  if (status === 'COMPLETED') return 'success' as const;
  if (status === 'CANCELLED' || status === 'DISPUTE_OPENED') return 'destructive' as const;
  if (status === 'ESCROW_HELD' || status === 'TRANSFER_PENDING') return 'default' as const;
  return 'warning' as const;
}

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
  description: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  icon: typeof CheckCircle2;
}

function buildTimeline(status: string, createdAt: string): TimelineStep[] {
  const createdDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusOrder = ['INITIATED', 'PAYMENT_CONFIRMED', 'ESCROW_HELD', 'TRANSFER_PENDING', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(status);

  const steps: TimelineStep[] = [
    {
      label: 'Transação Iniciada',
      description: 'Oferta aceita pelo vendedor',
      date: createdDate,
      status: currentIndex >= 0 ? 'completed' : 'pending',
      icon: CheckCircle2,
    },
    {
      label: 'Pagamento Confirmado',
      description: 'PIX recebido e confirmado',
      date: currentIndex >= 1 ? createdDate : '',
      status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'pending',
      icon: CreditCard,
    },
    {
      label: 'Valor em Garantia',
      description: 'Pagamento retido em escrow pela EventSwap',
      date: currentIndex >= 2 ? createdDate : '',
      status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'current' : 'pending',
      icon: Shield,
    },
    {
      label: 'Transferência Pendente',
      description: 'Aguardando confirmação de transferência pelo fornecedor',
      date: currentIndex >= 3 ? createdDate : '',
      status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'current' : 'pending',
      icon: Clock,
    },
    {
      label: 'Concluída',
      description: 'Transferência confirmada, valor liberado ao vendedor',
      date: currentIndex >= 4 ? createdDate : '',
      status: currentIndex >= 4 ? 'completed' : 'pending',
      icon: CheckCircle2,
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
                    <Skeleton className="h-3 w-56" />
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

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!user || !transaction) return;
    setIsSendingMessage(true);
    try {
      if (isDemoMode()) {
        const demoConvId = Date.now();
        router.push(`/chat/${demoConvId}`);
      } else {
        const conversation = await chatService.getOrCreateConversation(
          user.id,
          transaction.seller.id,
          transaction.id
        );
        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Erro ao iniciar conversa', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSendingMessage(false);
    }
  }, [user, transaction, router]);

  // Check if already reviewed (demo mode)
  useEffect(() => {
    if (!transaction) return;
    if (isDemoMode()) {
      const demoReviews = getDemoReviews();
      const alreadyReviewed = demoReviews.some(
        (r) => String(r.transaction_id) === String(transaction.id) && r.target_id === transaction.seller.id
      );
      setHasReviewed(alreadyReviewed);
    }
  }, [transaction?.id, transaction?.seller?.id]);

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
          const mapped: TransactionDetail = {
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
            seller: {
              id: data.seller_id || data.seller?.id || '',
              name: data.seller?.name || 'Vendedor',
              initials: getInitials(data.seller?.name || 'V'),
              rating: data.seller?.rating_avg || 0,
              isVerified: true,
            },
            agreedPrice: data.agreed_price,
            platformFee: data.platform_fee,
            platformFeeRate: data.platform_fee_rate,
            createdAt: data.created_at?.split('T')[0] || '',
            paymentDeadline: data.payment_deadline?.split('T')[0] || '',
          };
          setTransaction(mapped);
          setTimelineSteps(buildTimeline(data.status, data.created_at));
        }
      })
      .catch(() => {
        // API error - transaction stays null
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Link
          href="/purchases"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Compras
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Transacao nao encontrada
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Nao foi possivel encontrar os detalhes desta compra.
          </p>
          <Button asChild variant="outline">
            <Link href="/purchases">Ver minhas compras</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          href="/purchases"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Compras
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={staggerChild} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
              Detalhes da Compra
            </h1>
            <Badge variant={getStatusBadgeVariant(transaction.status)} className={transaction.status === 'ESCROW_HELD' ? 'bg-[#6C3CE1]/10 text-[#6C3CE1] border-[#6C3CE1]/20' : ''}>
              {statusLabels[transaction.status] || transaction.status}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">
            Código: {transaction.code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {transaction.status === 'COMPLETED' && !hasReviewed && (
            <Button
              size="sm"
              className="bg-[#6C3CE1] hover:bg-[#5B32C1] text-white"
              onClick={() => setReviewDialogOpen(true)}
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Vendedor
            </Button>
          )}
          {isContractEligible(transaction.status) && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/transactions/${transaction.id}/contract`}>
                <ScrollText className="h-4 w-4 mr-2" />
                Ver Contrato de Cessao
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleSendMessage} disabled={isSendingMessage}>
            <MessageSquare className="h-4 w-4 mr-2" />
            {isSendingMessage ? 'Abrindo chat...' : 'Falar com Vendedor'}
          </Button>
          {(transaction.status === 'ESCROW_HELD' || transaction.status === 'TRANSFER_PENDING') && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              onClick={() => setDisputeDialogOpen(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Abrir Disputa
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Info */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                  {transaction.listing.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.listing.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    {transaction.listing.eventDate
                      ? new Date(transaction.listing.eventDate).toLocaleDateString('pt-BR')
                      : '-'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    {transaction.listing.venueCity}{transaction.listing.venueState ? `, ${transaction.listing.venueState}` : ''}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <FileText className="h-4 w-4 text-neutral-400" />
                    {transaction.listing.venueName}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline da Transação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === timelineSteps.length - 1;
                    return (
                      <div key={step.label} className="flex gap-4 pb-6 last:pb-0">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                              step.status === 'completed' && 'bg-emerald-100 dark:bg-emerald-900/30',
                              step.status === 'current' && 'bg-[#6C3CE1]/10 ring-2 ring-[#6C3CE1]',
                              step.status === 'pending' && 'bg-neutral-100 dark:bg-neutral-800'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4',
                                step.status === 'completed' && 'text-emerald-600 dark:text-emerald-400',
                                step.status === 'current' && 'text-[#6C3CE1]',
                                step.status === 'pending' && 'text-neutral-400'
                              )}
                            />
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                'w-0.5 flex-1 mt-1',
                                step.status === 'completed'
                                  ? 'bg-emerald-200 dark:bg-emerald-800'
                                  : 'bg-neutral-200 dark:bg-neutral-700'
                              )}
                            />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-2">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              step.status === 'pending'
                                ? 'text-neutral-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {step.description}
                          </p>
                          {step.date && (
                            <p className="text-xs text-neutral-400 mt-1">
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

        {/* Right - Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Valor acordado</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    R$ {transaction.agreedPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Taxa da plataforma ({(transaction.platformFeeRate * 100).toFixed(0)}%)</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    R$ {transaction.platformFee.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Total pago
                  </span>
                  <span className="text-lg font-bold text-[#6C3CE1]">
                    R$ {(transaction.agreedPrice + transaction.platformFee).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-[#6C3CE1]/5 border border-[#6C3CE1]/10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#6C3CE1]" />
                    <span className="text-xs font-medium text-[#6C3CE1]">
                      Proteção EventSwap Ativa
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Seu pagamento está protegido até a confirmação da transferência.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seller */}
          <motion.div variants={staggerChild}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#6C3CE1]/10 text-[#6C3CE1] font-medium">
                      {transaction.seller.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {transaction.seller.name}
                      </p>
                      {transaction.seller.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-[#6C3CE1]" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {transaction.seller.rating > 0 ? `★ ${transaction.seller.rating} • ` : ''}Verificado
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={handleSendMessage} disabled={isSendingMessage}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isSendingMessage ? 'Abrindo chat...' : 'Enviar Mensagem'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vendor Approval Status (buyer sees read-only) */}
          <motion.div variants={staggerChild}>
            <VendorApprovalStatus
              transactionId={transaction.id}
              vendorApprovesTransfer={true}
              canRequest={false}
            />
          </motion.div>

          {/* Review Status */}
          {transaction.status === 'COMPLETED' && (
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
                        Avaliar Vendedor
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
        transactionId={transaction.id}
        targetUserId={transaction.seller.id}
        targetUserName={transaction.seller.name}
        onReviewSubmitted={() => setHasReviewed(true)}
      />

      {/* Dispute Dialog */}
      <DisputeDialog
        transactionId={transaction.id}
        transactionCode={transaction.code}
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
                  setTransaction((prev) => prev ? { ...prev, status: data.status } : prev);
                  setTimelineSteps(buildTimeline(data.status, data.created_at));
                }
              })
              .catch(() => {});
          }
        }}
      />
    </motion.div>
  );
}
