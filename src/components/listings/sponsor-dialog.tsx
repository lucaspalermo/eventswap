'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Star,
  TrendingUp,
  Eye,
  Award,
  Loader2,
  Check,
  Copy,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn, formatCurrency } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  listingTitle: string;
}

type PlanId = 'weekly' | 'monthly';

interface Plan {
  id: PlanId;
  label: string;
  price: number;
  duration: string;
  savings?: string;
}

interface PaymentData {
  pix?: {
    qr_code_image: string;
    copy_paste: string;
    expiration_date: string;
  } | null;
  invoice_url?: string | null;
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

const PLANS: Plan[] = [
  {
    id: 'weekly',
    label: 'Semanal',
    price: 29.90,
    duration: '7 dias',
  },
  {
    id: 'monthly',
    label: 'Mensal',
    price: 79.90,
    duration: '30 dias',
    savings: 'Economia de 33%',
  },
];

const BENEFITS = [
  { icon: TrendingUp, text: 'Aparece primeiro no marketplace' },
  { icon: Award, text: 'Badge de destaque exclusivo' },
  { icon: Eye, text: '3x mais visualizacoes em media' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SponsorDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
}: SponsorDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSponsor = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/listings/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          plan: selectedPlan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar patrocinio');
      }

      setPaymentData(result.payment);
      toast.success('Pagamento criado! Escaneie o QR code para pagar.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao patrocinar anuncio';
      toast.error(message);
    } finally {
      setLoading(false);
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
      toast.error('Falha ao copiar codigo PIX');
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            Promover Anuncio
          </DialogTitle>
          <DialogDescription>
            Destaque &quot;{listingTitle}&quot; no marketplace para mais visibilidade.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!paymentData ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-left transition-all duration-200',
                      selectedPlan === plan.id
                        ? 'border-[#2563EB] bg-[#2563EB]/5 ring-2 ring-[#2563EB]/20'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    )}
                  >
                    {plan.savings && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">
                        {plan.savings}
                      </span>
                    )}
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {plan.label}
                    </div>
                    <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      por {plan.duration}
                    </div>

                    {/* Selection indicator */}
                    {selectedPlan === plan.id && (
                      <motion.div
                        layoutId="plan-check"
                        className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white"
                      >
                        <Check className="h-3 w-3" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* Benefits */}
              <div className="space-y-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-4">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Beneficios inclusos
                </p>
                {BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                      <benefit.icon className="h-3.5 w-3.5 text-[#2563EB]" />
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleSponsor}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-amber-500/25"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Star className="h-4 w-4 mr-2 fill-white" />
                )}
                {loading ? 'Processando...' : `Patrocinar por ${formatCurrency(PLANS.find((p) => p.id === selectedPlan)!.price)}`}
              </Button>

              <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
                Pagamento via PIX. O destaque sera ativado apos a confirmacao do pagamento.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* PIX QR Code */}
              {paymentData.pix ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-900">
                      {paymentData.pix.qr_code_image ? (
                        <img
                          src={`data:image/png;base64,${paymentData.pix.qr_code_image}`}
                          alt="QR Code PIX"
                          className="h-48 w-48"
                        />
                      ) : (
                        <div className="h-48 w-48 flex items-center justify-center text-zinc-400">
                          <QrCode className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Escaneie o QR Code com o app do seu banco
                    </p>
                  </div>

                  {/* Copy PIX */}
                  {paymentData.pix.copy_paste && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Ou copie o codigo PIX:
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate">
                          {paymentData.pix.copy_paste}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyPix}
                          className="shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    QR Code nao disponivel.{' '}
                    {paymentData.invoice_url && (
                      <a
                        href={paymentData.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] underline"
                      >
                        Clique aqui para pagar
                      </a>
                    )}
                  </p>
                </div>
              )}

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Apos a confirmacao do pagamento, seu anuncio aparecera em destaque no marketplace automaticamente.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
