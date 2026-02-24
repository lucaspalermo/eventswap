'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CreditCard, QrCode, Copy, CheckCircle2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

interface PaymentData {
  method: string;
  status: string;
  asaas_status?: string;
  gross_amount: number;
  invoice_url?: string | null;
  bank_slip_url?: string | null;
  pix?: {
    qr_code_image: string;
    copy_paste: string;
    expiration_date: string;
  } | null;
}

interface PaymentCardProps {
  transactionId: number;
  transactionStatus: string;
  totalAmount: number;
}

export function PaymentCard({ transactionId, transactionStatus, totalAmount }: PaymentCardProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showPaymentCard = transactionStatus === 'INITIATED' || transactionStatus === 'AWAITING_PAYMENT';

  // Fetch existing payment info
  const fetchPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/payment`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setPaymentData(json.data);
      }
    } catch (err) {
      console.error('Fetch payment error:', err);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (showPaymentCard) {
      fetchPayment();
    }
  }, [showPaymentCard, fetchPayment]);

  // Create new payment (for INITIATED transactions without payment)
  const handleCreatePayment = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_method: 'PIX' }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === 'CPF_REQUIRED') {
          setError('Cadastre seu CPF nas Configuracoes antes de pagar.');
          return;
        }
        throw new Error(json.error || 'Erro ao criar pagamento');
      }

      setPaymentData(json.data);
      toast.success('Pagamento PIX gerado!', {
        description: 'Escaneie o QR code ou copie o codigo para pagar.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar pagamento';
      setError(msg);
      toast.error('Erro ao gerar pagamento', { description: msg });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyPix = async () => {
    if (!paymentData?.pix?.copy_paste) return;
    try {
      await navigator.clipboard.writeText(paymentData.pix.copy_paste);
      setCopied(true);
      toast.success('Codigo PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar codigo');
    }
  };

  if (!showPaymentCard) return null;

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-500">Carregando pagamento...</span>
        </CardContent>
      </Card>
    );
  }

  // No payment yet - show "Generate Payment" button
  if (!paymentData) {
    return (
      <Card className="border-amber-200 dark:border-amber-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Pagamento Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            O pagamento ainda nao foi gerado para esta compra. Clique abaixo para gerar o PIX.
          </p>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Total: {formatCurrency(totalAmount)}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleCreatePayment}
            loading={creating}
            disabled={creating}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {creating ? 'Gerando PIX...' : 'Gerar Pagamento PIX'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Payment exists - show PIX QR code or invoice
  return (
    <Card className="border-[#6C3CE1]/20 dark:border-[#6C3CE1]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#6C3CE1]" />
          Pagamento via {paymentData.method}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="text-center p-3 rounded-lg bg-[#6C3CE1]/5 border border-[#6C3CE1]/10">
          <p className="text-xs text-neutral-500 mb-1">Valor a pagar</p>
          <p className="text-2xl font-bold text-[#6C3CE1]">
            {formatCurrency(paymentData.gross_amount)}
          </p>
        </div>

        {/* PIX QR Code */}
        {paymentData.pix && (
          <div className="space-y-3">
            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-xl border border-neutral-200 dark:border-neutral-700">
                <Image
                  src={`data:image/png;base64,${paymentData.pix.qr_code_image}`}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Copy-paste code */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 text-center">
                Ou copie o codigo PIX abaixo:
              </p>
              <div className="relative">
                <div className="p-3 pr-12 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 break-all max-h-20 overflow-y-auto font-mono">
                  {paymentData.pix.copy_paste}
                </div>
                <button
                  onClick={handleCopyPix}
                  className={cn(
                    'absolute right-2 top-2 p-1.5 rounded-md transition-colors',
                    copied
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600'
                  )}
                  aria-label="Copiar codigo PIX"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expiration */}
            {paymentData.pix.expiration_date && (
              <p className="text-xs text-center text-neutral-400">
                Expira em: {new Date(paymentData.pix.expiration_date).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {/* Invoice URL (for boleto) */}
        {paymentData.invoice_url && (
          <Button asChild variant="outline" className="w-full">
            <a href={paymentData.invoice_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Fatura / Boleto
            </a>
          </Button>
        )}

        {/* Payment status */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Aguardando confirmacao do pagamento
        </div>
      </CardContent>
    </Card>
  );
}
