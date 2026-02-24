'use client';

import { useState, useMemo } from 'react';
import { HandCoins, TrendingDown, ShieldCheck } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { offersService } from '@/services/offers.service';
import { PLATFORM } from '@/lib/constants';

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: number;
    title: string;
    askingPrice: number;
    originalPrice: number;
    sellerId: string;
    sellerName: string;
  };
  onOfferCreated?: () => void;
}

export function OfferDialog({
  open,
  onOpenChange,
  listing,
  onOfferCreated,
}: OfferDialogProps) {
  const [amount, setAmount] = useState<string>(listing.askingPrice.toFixed(2));
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  // Fee calculations
  const buyerFeeRate = PLATFORM.fees.buyerPercent / 100;
  const sellerFeeRate = PLATFORM.fees.sellerPercent / 100;

  const buyerFee = useMemo(
    () => Math.round(numericAmount * buyerFeeRate * 100) / 100,
    [numericAmount, buyerFeeRate]
  );

  const buyerTotal = useMemo(
    () => Math.round((numericAmount + buyerFee) * 100) / 100,
    [numericAmount, buyerFee]
  );

  const sellerFee = useMemo(
    () => Math.max(PLATFORM.fees.minimumFeeReais, Math.round(numericAmount * sellerFeeRate * 100) / 100),
    [numericAmount, sellerFeeRate]
  );

  const sellerNet = useMemo(
    () => Math.round((numericAmount - sellerFee) * 100) / 100,
    [numericAmount, sellerFee]
  );

  // Discount from original/asking price
  const discountFromAsking = useMemo(() => {
    if (numericAmount <= 0 || listing.askingPrice <= 0) return 0;
    return Math.round(((listing.askingPrice - numericAmount) / listing.askingPrice) * 100);
  }, [numericAmount, listing.askingPrice]);

  const isValidAmount = numericAmount > 0 && numericAmount <= listing.askingPrice * 1.5;

  const handleSubmit = async () => {
    if (!isValidAmount) return;

    setIsSubmitting(true);

    try {
      await offersService.createOffer({
        listing_id: listing.id,
        amount: numericAmount,
        message: message.trim() || undefined,
      });

      toast.success('Oferta enviada!', {
        description: `Sua oferta de ${formatCurrency(numericAmount)} foi enviada ao vendedor.`,
      });

      onOpenChange(false);
      onOfferCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Tente novamente em alguns instantes.';
      toast.error('Erro ao enviar oferta', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-[#2563EB]" />
            Fazer Oferta
          </DialogTitle>
          <DialogDescription>
            Proponha um valor para &quot;{listing.title}&quot;
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
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Preco pedido:
              </span>
              <span className="text-sm font-bold text-[#2563EB]">
                {formatCurrency(listing.askingPrice)}
              </span>
            </div>
          </div>

          {/* Offer Amount Input */}
          <div className="space-y-2">
            <label
              htmlFor="offer-amount"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Valor da sua oferta (R$)
            </label>
            <Input
              id="offer-amount"
              type="number"
              step="0.01"
              min="1"
              max={listing.askingPrice * 1.5}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="text-lg font-semibold"
            />
            {discountFromAsking > 0 && numericAmount > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {discountFromAsking}% abaixo do preco pedido
                </span>
              </div>
            )}
            {discountFromAsking < 0 && numericAmount > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingDown className="h-3.5 w-3.5 text-amber-500 rotate-180" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {Math.abs(discountFromAsking)}% acima do preco pedido
                </span>
              </div>
            )}
            {numericAmount > listing.askingPrice * 1.5 && (
              <p className="text-xs text-red-500">
                O valor nao pode exceder 150% do preco pedido ({formatCurrency(listing.askingPrice * 1.5)})
              </p>
            )}
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <label
              htmlFor="offer-message"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Mensagem (opcional)
            </label>
            <textarea
              id="offer-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Tenho interesse nessa reserva. Podemos negociar?"
              rows={3}
              maxLength={500}
              className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 resize-none"
            />
            <p className="text-xs text-zinc-400 text-right">{message.length}/500</p>
          </div>

          {/* Fee Breakdown */}
          {numericAmount > 0 && (
            <div className="space-y-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Resumo de valores
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Valor da oferta
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(numericAmount)}
                  </span>
                </div>
                {buyerFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Taxa do comprador ({PLATFORM.fees.buyerPercent}%)
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      + {formatCurrency(buyerFee)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Voce pagara
                  </span>
                  <span className="text-lg font-bold text-[#2563EB]">
                    {formatCurrency(buyerTotal)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Taxa do vendedor ({PLATFORM.fees.sellerPercent}%)
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    - {formatCurrency(sellerFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Vendedor recebera
                  </span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(sellerNet)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Protection Notice */}
          <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Negociacao Protegida
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                O vendedor tem 48h para responder. Se aceitar, a transacao sera
                criada automaticamente com o valor acordado.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !isValidAmount}
          >
            {isSubmitting
              ? 'Enviando...'
              : `Enviar Oferta - ${formatCurrency(numericAmount)}`}
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
