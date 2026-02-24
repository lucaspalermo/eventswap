'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Check,
  X,
  ArrowLeftRight,
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Separator available if needed
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils';
import { offersService } from '@/services/offers.service';
import type { Offer, OfferStatus } from '@/types/database.types';

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Clock }
> = {
  PENDING: {
    label: 'Pendente',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Aceita',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    icon: Check,
  },
  REJECTED: {
    label: 'Recusada',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800/50',
    icon: X,
  },
  COUNTERED: {
    label: 'Contra-oferta',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    icon: ArrowLeftRight,
  },
  EXPIRED: {
    label: 'Expirada',
    color: 'text-zinc-500 dark:text-zinc-400',
    bgColor: 'bg-zinc-50 dark:bg-zinc-800/50',
    borderColor: 'border-zinc-200 dark:border-zinc-700',
    icon: Clock,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'text-zinc-500 dark:text-zinc-400',
    bgColor: 'bg-zinc-50 dark:bg-zinc-800/50',
    borderColor: 'border-zinc-200 dark:border-zinc-700',
    icon: X,
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface OffersListProps {
  listingId?: number;
  role?: 'buyer' | 'seller';
  currentUserId?: string;
  compact?: boolean;
  onOfferAccepted?: () => void;
}

export function OffersList({
  listingId,
  role,
  currentUserId,
  compact = false,
  onOfferAccepted,
}: OffersListProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [counterInputId, setCounterInputId] = useState<number | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [confirmAcceptId, setConfirmAcceptId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(!compact);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offersService.getOffers({
        listing_id: listingId,
        role,
      });
      setOffers(response.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar ofertas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [listingId, role]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Calculate time remaining for pending offers
  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expirada';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}min restantes`;
    return `${minutes}min restantes`;
  };

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleAccept = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      await offersService.respondToOffer(offerId, 'accept');
      toast.success('Oferta aceita!', {
        description: 'A transacao foi criada automaticamente.',
      });
      setConfirmAcceptId(null);
      await fetchOffers();
      onOfferAccepted?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aceitar oferta';
      toast.error('Erro', { description: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      await offersService.respondToOffer(offerId, 'reject');
      toast.success('Oferta recusada.');
      await fetchOffers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao recusar oferta';
      toast.error('Erro', { description: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounter = async (offerId: number) => {
    const numericAmount = parseFloat(counterAmount.replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Informe um valor valido para a contra-oferta');
      return;
    }

    setActionLoading(offerId);
    try {
      await offersService.respondToOffer(
        offerId,
        'counter',
        numericAmount,
        counterMessage.trim() || undefined
      );
      toast.success('Contra-oferta enviada!');
      setCounterInputId(null);
      setCounterAmount('');
      setCounterMessage('');
      await fetchOffers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar contra-oferta';
      toast.error('Erro', { description: msg });
    } finally {
      setActionLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const isSeller = (offer: Offer) => currentUserId === offer.seller_id;

  const pendingCount = offers.filter((o) => o.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 text-[#2563EB] animate-spin" />
        <span className="ml-2 text-sm text-zinc-500">Carregando ofertas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 px-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma oferta recebida ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with toggle for compact mode */}
      {compact && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Ofertas ({offers.length})
            </span>
            {pendingCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1.5 py-0">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      )}

      {/* Offers list */}
      {expanded && (
        <div className="space-y-2">
          {offers.map((offer) => {
            const statusConfig = STATUS_CONFIG[offer.status];
            const StatusIcon = statusConfig.icon;
            const buyerProfile = offer.buyer;
            const canRespond = isSeller(offer) && offer.status === 'PENDING';
            const isExpiredPending =
              offer.status === 'PENDING' && new Date(offer.expires_at) < new Date();

            return (
              <div
                key={offer.id}
                className={cn(
                  'rounded-lg border p-3 transition-all',
                  statusConfig.borderColor,
                  offer.status === 'PENDING' && !isExpiredPending
                    ? 'bg-white dark:bg-zinc-900'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/30'
                )}
              >
                {/* Offer header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800">
                        {getInitials(buyerProfile?.name || 'C')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {buyerProfile?.name || 'Comprador'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {formatRelativeTime(offer.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-[#2563EB]">
                      {formatCurrency(Number(offer.amount))}
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px] px-1.5 py-0 border',
                        statusConfig.color,
                        statusConfig.bgColor,
                        statusConfig.borderColor
                      )}
                    >
                      <StatusIcon className="h-3 w-3 mr-0.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                {/* Message */}
                {offer.message && (
                  <div className="mt-2 ml-10 p-2 rounded bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                      &quot;{offer.message}&quot;
                    </p>
                  </div>
                )}

                {/* Counter-offer info */}
                {offer.status === 'COUNTERED' && offer.counter_amount && (
                  <div className="mt-2 ml-10 p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowLeftRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Contra-oferta:
                      </span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(Number(offer.counter_amount))}
                      </span>
                    </div>
                    {offer.counter_message && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                        &quot;{offer.counter_message}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Time remaining for pending offers */}
                {offer.status === 'PENDING' && !isExpiredPending && (
                  <div className="mt-2 ml-10">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(offer.expires_at)}
                    </span>
                  </div>
                )}

                {/* Action buttons for seller on PENDING offers */}
                {canRespond && !isExpiredPending && (
                  <div className="mt-3 ml-10">
                    {/* Accept confirmation */}
                    {confirmAcceptId === offer.id ? (
                      <div className="space-y-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                          Confirmar aceitacao da oferta de{' '}
                          <strong>{formatCurrency(Number(offer.amount))}</strong>?
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Uma transacao sera criada automaticamente e as demais ofertas pendentes serao expiradas.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                            onClick={() => handleAccept(offer.id)}
                            loading={actionLoading === offer.id}
                            disabled={actionLoading === offer.id}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => setConfirmAcceptId(null)}
                            disabled={actionLoading === offer.id}
                          >
                            Voltar
                          </Button>
                        </div>
                      </div>
                    ) : counterInputId === offer.id ? (
                      /* Counter-offer input */
                      <div className="space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                          Enviar contra-oferta
                        </p>
                        <Input
                          type="number"
                          step="0.01"
                          min="1"
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                          placeholder="Valor da contra-oferta (R$)"
                          className="h-8 text-sm"
                        />
                        <textarea
                          value={counterMessage}
                          onChange={(e) => setCounterMessage(e.target.value)}
                          placeholder="Mensagem (opcional)"
                          rows={2}
                          maxLength={500}
                          className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50 focus-visible:ring-offset-1 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                            onClick={() => handleCounter(offer.id)}
                            loading={actionLoading === offer.id}
                            disabled={actionLoading === offer.id}
                          >
                            <ArrowLeftRight className="h-3 w-3 mr-1" />
                            Enviar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => {
                              setCounterInputId(null);
                              setCounterAmount('');
                              setCounterMessage('');
                            }}
                            disabled={actionLoading === offer.id}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Default action buttons */
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                          onClick={() => setConfirmAcceptId(offer.id)}
                          disabled={actionLoading !== null}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20"
                          onClick={() => setCounterInputId(offer.id)}
                          disabled={actionLoading !== null}
                        >
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Contra-oferta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                          onClick={() => handleReject(offer.id)}
                          loading={actionLoading === offer.id}
                          disabled={actionLoading !== null}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Expired pending badge */}
                {isExpiredPending && (
                  <div className="mt-2 ml-10">
                    <Badge className="text-[10px] px-1.5 py-0 bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                      Expirada
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
