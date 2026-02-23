'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Shield,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
// Utilities

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApprovalData {
  id: number;
  status: string;
  vendor_name: string;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  expires_at: string;
  transaction: {
    code: string;
    agreed_price: number;
    status: string;
  } | null;
  listing: {
    title: string;
    category: string;
    event_date: string;
    venue_name: string;
    venue_city: string;
    venue_state: string;
  } | null;
  buyer_name: string;
  seller_name: string;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function VendorApprovalPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/vendor-approval/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 410) {
            setError('Esta solicitacao de aprovacao expirou.');
          } else {
            setError(json.error || 'Erro ao carregar solicitacao');
          }
          return;
        }
        setData(json.data);
      })
      .catch(() => {
        setError('Erro de conexao. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAction(action: 'approve' | 'reject') {
    if (action === 'reject' && !rejectionReason.trim()) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/vendor-approval/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejected_reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Erro ao processar resposta');
        return;
      }

      setActionResult(action === 'approve' ? 'approved' : 'rejected');
    } catch {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#6C3CE1] animate-spin mx-auto" />
          <p className="text-sm text-neutral-500">Carregando solicitacao...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Solicitacao Invalida
            </h2>
            <p className="text-sm text-neutral-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already processed
  if (data && data.status !== 'pending' && !actionResult) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            {data.status === 'approved' ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  Transferencia Aprovada
                </h2>
                <p className="text-sm text-neutral-500">
                  Voce ja aprovou esta transferencia{data.approved_at
                    ? ` em ${new Date(data.approved_at).toLocaleDateString('pt-BR')}`
                    : ''}.
                </p>
              </>
            ) : data.status === 'rejected' ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Transferencia Rejeitada
                </h2>
                <p className="text-sm text-neutral-500">
                  Voce rejeitou esta transferencia.
                </p>
                {data.rejected_reason && (
                  <p className="text-xs text-neutral-400 italic">
                    Motivo: {data.rejected_reason}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mx-auto">
                  <Clock className="h-8 w-8 text-neutral-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                  Solicitacao Expirada
                </h2>
                <p className="text-sm text-neutral-500">
                  Esta solicitacao de aprovacao expirou.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Action completed
  if (actionResult) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              {actionResult === 'approved' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                    Transferencia Aprovada!
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Obrigado, {data?.vendor_name}! A transferencia da reserva foi aprovada com sucesso.
                    Ambas as partes serao notificadas.
                  </p>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto"
                  >
                    <XCircle className="h-10 w-10 text-red-600" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                    Transferencia Rejeitada
                  </h2>
                  <p className="text-sm text-neutral-500">
                    A transferencia foi rejeitada. Ambas as partes serao notificadas sobre sua decisao.
                  </p>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Processado com seguranca pela EventSwap</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main approval form
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header / Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C3CE1] text-white">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              EventSwap
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Aprovacao de Transferencia de Reserva
          </p>
        </div>

        {/* Greeting */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Ola, {data?.vendor_name}!
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                O comprador <strong className="text-neutral-900 dark:text-white">{data?.buyer_name}</strong> deseja
                assumir a reserva de <strong className="text-neutral-900 dark:text-white">{data?.listing?.title || 'evento'}</strong>,
                atualmente sob responsabilidade de <strong className="text-neutral-900 dark:text-white">{data?.seller_name}</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        {data?.listing && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Detalhes da Reserva
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {data.listing.title}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {data.listing.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {data.listing.event_date
                      ? new Date(data.listing.event_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {data.listing.venue_name} - {data.listing.venue_city}
                    {data.listing.venue_state ? `, ${data.listing.venue_state}` : ''}
                  </p>
                </div>
              </div>

              {data.transaction && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Codigo da transacao</span>
                    <span className="text-sm font-mono font-medium text-neutral-900 dark:text-white">
                      {data.transaction.code}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transfer explanation */}
        <Card className="border-[#6C3CE1]/20 bg-[#6C3CE1]/5">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#6C3CE1] flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  O que significa aprovar?
                </p>
                <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                  <li>
                    &bull; Voce confirma que aceita a transferencia da reserva do vendedor original para o novo comprador.
                  </li>
                  <li>
                    &bull; O novo comprador assumira todos os direitos e responsabilidades da reserva.
                  </li>
                  <li>
                    &bull; Esta acao e registrada com seguranca pela plataforma EventSwap.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiration notice */}
        {data?.expires_at && (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Esta solicitacao expira em{' '}
              {new Date(data.expires_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <AnimatePresence mode="wait">
          {!showRejectForm ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <Button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/25"
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Aprovar Transferencia
              </Button>

              <Button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
                variant="outline"
                className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeitar Transferencia
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="reject-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Motivo da rejeicao
                  </h4>
                  <Textarea
                    placeholder="Explique o motivo da rejeicao..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                      disabled={actionLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Confirmar Rejeicao
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center pt-4 space-y-2">
          <Separator />
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Plataforma segura EventSwap</span>
          </div>
          <p className="text-xs text-neutral-400">
            eventswap.com.br &bull; Marketplace de reservas de eventos
          </p>
        </div>
      </div>
    </div>
  );
}
