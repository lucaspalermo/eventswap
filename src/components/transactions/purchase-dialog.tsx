'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, QrCode, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { isDemoMode } from '@/lib/demo-auth';
import { PLATFORM } from '@/lib/constants';
import type { PaymentMethod } from '@/types/database.types';

const PLATFORM_FEE_RATE = PLATFORM.fees.buyerPercent / 100; // buyer fee (0% = no fee)

const DEMO_TRANSACTIONS_KEY = 'eventswap_demo_transactions';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: number;
    title: string;
    askingPrice: number;
    sellerId: string;
    sellerName: string;
  };
  buyerId: string;
}

interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}

const paymentOptions: PaymentOption[] = [
  {
    value: 'PIX',
    label: 'PIX',
    description: 'Aprovacao instantanea',
    icon: QrCode,
  },
  {
    value: 'BOLETO',
    label: 'Boleto Bancario',
    description: 'Aprovacao em ate 3 dias uteis',
    icon: FileText,
  },
  {
    value: 'CARD',
    label: 'Cartao de Credito',
    description: 'Parcele em ate 12x',
    icon: CreditCard,
  },
];

export function PurchaseDialog({
  open,
  onOpenChange,
  listing,
  buyerId,
}: PurchaseDialogProps) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('PIX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platformFee = listing.askingPrice * PLATFORM_FEE_RATE;
  const totalPrice = listing.askingPrice + platformFee;

  const handleConfirmPurchase = async () => {
    setIsSubmitting(true);

    try {
      if (isDemoMode()) {
        // Simulate a small delay for demo mode
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const demoTransactionId = Date.now();
        const demoTransaction = {
          id: demoTransactionId,
          code: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          buyer_id: buyerId,
          seller_id: listing.sellerId,
          listing_id: listing.id,
          agreed_price: listing.askingPrice,
          platform_fee: platformFee,
          platform_fee_rate: PLATFORM_FEE_RATE,
          seller_net_amount: listing.askingPrice - platformFee,
          status: 'INITIATED',
          payment_method: selectedPayment,
          payment_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
          cancelled_at: null,
          cancel_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          listing_title: listing.title,
          seller_name: listing.sellerName,
        };

        // Store in localStorage for the purchases page
        const existing = JSON.parse(
          localStorage.getItem(DEMO_TRANSACTIONS_KEY) || '[]'
        );
        existing.unshift(demoTransaction);
        localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(existing));

        toast.success('Compra iniciada! Acompanhe em Minhas Compras', {
          description: `Transacao ${demoTransaction.code} criada com sucesso.`,
        });

        onOpenChange(false);
        router.push(`/purchases/${demoTransactionId}`);
      } else {
        // Real mode: call the API (creates Asaas payment + transaction)
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            listing_id: listing.id,
            payment_method: selectedPayment,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Falha ao iniciar compra' }));

          // Handle specific error codes
          if (err.code === 'CPF_REQUIRED') {
            toast.error('CPF obrigatorio', {
              description: 'Acesse seu perfil e cadastre seu CPF antes de comprar.',
              action: {
                label: 'Ir para Perfil',
                onClick: () => router.push('/profile'),
              },
            });
            onOpenChange(false);
            return;
          }

          if (err.code === 'EXISTING_TRANSACTION' && err.existing_transaction_id) {
            toast.info('Transacao ja existe', {
              description: 'Voce ja tem uma compra ativa para este anuncio.',
              action: {
                label: 'Ver compra',
                onClick: () => router.push(`/purchases/${err.existing_transaction_id}`),
              },
            });
            onOpenChange(false);
            return;
          }

          throw new Error(err.error || 'Falha ao iniciar compra');
        }

        const json = await res.json();
        const transaction = json.data;

        toast.success('Compra iniciada! Acompanhe em Minhas Compras', {
          description: `Transacao ${transaction.code} criada com sucesso.`,
        });

        onOpenChange(false);
        router.push(`/purchases/${transaction.id}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Erro ao iniciar compra', {
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Compra</DialogTitle>
          <DialogDescription>
            Revise os detalhes antes de confirmar sua compra.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Listing Summary */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {listing.title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Vendedor: {listing.sellerName}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Valor da reserva
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatCurrency(listing.askingPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Taxa da plataforma ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%)
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {formatCurrency(platformFee)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Total
              </span>
              <span className="text-lg font-bold text-[#2563EB]">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Forma de pagamento
            </p>
            <div className="space-y-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedPayment === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedPayment(option.value)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                      isSelected
                        ? 'border-[#2563EB] bg-[#2563EB]/5 ring-1 ring-[#2563EB]/20'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        isSelected
                          ? 'bg-[#2563EB]/10'
                          : 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected
                            ? 'text-[#2563EB]'
                            : 'text-zinc-500 dark:text-zinc-400'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isSelected
                            ? 'text-[#2563EB]'
                            : 'text-zinc-900 dark:text-zinc-100'
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        isSelected
                          ? 'border-[#2563EB]'
                          : 'border-zinc-300 dark:border-zinc-600'
                      )}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Protection Notice */}
          <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Compra Protegida
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Seu pagamento fica em garantia (escrow) ate a confirmacao da transferencia da reserva.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            size="xl"
            className="w-full"
            onClick={handleConfirmPurchase}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processando...' : `Confirmar Compra - ${formatCurrency(totalPrice)}`}
          </Button>
          <Button
            variant="ghost"
            size="default"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
