'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { PLATFORM } from '@/lib/constants';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  ImageIcon,
  MapPin,
  Calendar,
  Tag,
  Lock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListingData {
  id: number;
  title: string;
  category: string;
  event_date: string;
  venue_name: string;
  venue_city: string;
  original_price: number;
  asking_price: number;
  images: string[];
  seller?: {
    id: string;
    name: string;
    display_name: string | null;
    avatar_url: string | null;
    rating_avg: number;
    rating_count: number;
  };
}

interface PurchaseFlowProps {
  listing: ListingData;
  onComplete: (data: { paymentMethod: string; transactionId?: number }) => void;
  onCancel?: () => void;
  className?: string;
}

type PaymentMethodOption = 'PIX' | 'CARD' | 'BOLETO';

interface StepConfig {
  id: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS: StepConfig[] = [
  { id: 0, label: 'Revisao' },
  { id: 1, label: 'Pagamento' },
  { id: 2, label: 'Confirmar' },
  { id: 3, label: 'Sucesso' },
];

const PAYMENT_METHODS: {
  id: PaymentMethodOption;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}[] = [
  {
    id: 'PIX',
    label: 'PIX',
    description: 'Pagamento instantaneo via PIX. Aprovacao imediata.',
    icon: QrCode,
    badge: 'Recomendado',
  },
  {
    id: 'CARD',
    label: 'Cartao de Credito',
    description: 'Pague com cartao de credito em ate 12x.',
    icon: CreditCard,
  },
  {
    id: 'BOLETO',
    label: 'Boleto Bancario',
    description: 'Prazo de 1-3 dias uteis para compensacao.',
    icon: FileText,
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PurchaseFlow({
  listing,
  onComplete,
  onCancel,
  className,
}: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodOption>('PIX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing (buyer pays no fee)
  const listingPrice = listing.asking_price;
  const buyerFeeRate = PLATFORM.fees.buyerPercent / 100;
  const buyerFee = Math.round(listingPrice * buyerFeeRate * 100) / 100;
  const totalPrice = Math.round((listingPrice + buyerFee) * 100) / 100;
  const discountPercent =
    listing.original_price > 0
      ? Math.round(((listing.original_price - listingPrice) / listing.original_price) * 100)
      : 0;

  const thumbnailUrl = listing.images?.[0] || null;

  // Navigation
  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleConfirmPurchase() {
    setIsSubmitting(true);
    try {
      // Call the transactions API to create the transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          payment_method: selectedPaymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar transacao');
      }

      // Move to success step
      setDirection(1);
      setCurrentStep(3);

      onComplete({
        paymentMethod: selectedPaymentMethod,
        transactionId: result.data?.id,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      // Keep on confirm step so user can retry
      setIsSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Step 0: Review
  // -------------------------------------------------------------------------
  function renderReviewStep() {
    return (
      <motion.div
        key="review"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="space-y-4"
      >
        {/* Listing summary */}
        <div className="flex gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-zinc-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {listing.title}
            </h3>
            <div className="mt-1.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3" />
                <span>{listing.venue_name}, {listing.venue_city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(listing.event_date)}</span>
              </div>
            </div>
            {listing.seller && (
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Vendedor: {listing.seller.display_name || listing.seller.name}
              </p>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Resumo do Valor
          </h4>

          {/* Original price with discount */}
          {discountPercent > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Preco original
              </span>
              <span className="text-zinc-400 line-through">
                {formatCurrency(listing.original_price)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              Preco do anuncio
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatCurrency(listingPrice)}
              </span>
              {discountPercent > 0 && (
                <Badge variant="success" className="text-[10px]">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
          </div>

          {buyerFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">
                Taxa de servico ({PLATFORM.fees.buyerPercent}%)
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {formatCurrency(buyerFee)}
              </span>
            </div>
          )}

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Total
              </span>
              <span className="text-lg font-bold text-[#2563EB]">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Protection guarantee */}
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Protecao EventSwap
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">
              Seu pagamento fica retido em garantia ate a transferencia ser confirmada.
              Caso haja qualquer problema, voce sera reembolsado integralmente.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 1: Payment Method
  // -------------------------------------------------------------------------
  function renderPaymentStep() {
    return (
      <motion.div
        key="payment"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="space-y-3"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Escolha como deseja realizar o pagamento:
        </p>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentMethod === method.id;
            const IconComp = method.icon;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={cn(
                  'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
                  isSelected
                    ? 'border-[#2563EB] bg-[#2563EB]/5 ring-2 ring-[#2563EB]/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                )}
              >
                {/* Radio indicator */}
                <div
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected
                      ? 'border-[#2563EB]'
                      : 'border-zinc-300 dark:border-zinc-600'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2.5 w-2.5 rounded-full bg-[#2563EB]"
                    />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-[#2563EB]/10 text-[#2563EB]'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  <IconComp className="h-5 w-5" />
                </div>

                {/* Label + Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isSelected
                          ? 'text-[#2563EB]'
                          : 'text-zinc-900 dark:text-zinc-100'
                      )}
                    >
                      {method.label}
                    </span>
                    {method.badge && (
                      <Badge
                        variant={isSelected ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {method.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {method.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Secure payment note */}
        <div className="flex items-center gap-2 pt-2">
          <Lock className="h-3.5 w-3.5 text-zinc-400" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Pagamento processado de forma segura via Asaas
          </p>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 2: Confirm
  // -------------------------------------------------------------------------
  function renderConfirmStep() {
    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod);
    const MethodIcon = selectedMethod?.icon || CreditCard;

    return (
      <motion.div
        key="confirm"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="space-y-4"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Revise os detalhes antes de confirmar:
        </p>

        {/* Summary card */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          {/* Listing */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Anuncio</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
              {listing.title}
            </span>
          </div>

          {/* Payment method */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Pagamento</span>
            <div className="flex items-center gap-1.5">
              <MethodIcon className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {selectedMethod?.label}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Valor do anuncio</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {formatCurrency(listingPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Taxa de servico</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {formatCurrency(buyerFee)}
            </span>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Total a pagar
              </span>
              <span className="text-lg font-bold text-[#2563EB]">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms notice */}
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
          Ao confirmar, voce concorda com os{' '}
          <a href="/terms" className="text-[#2563EB] hover:underline">
            Termos de Uso
          </a>{' '}
          e a{' '}
          <a href="/privacy" className="text-[#2563EB] hover:underline">
            Politica de Privacidade
          </a>{' '}
          do EventSwap.
        </p>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Step 3: Success
  // -------------------------------------------------------------------------
  function renderSuccessStep() {
    return (
      <motion.div
        key="success"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col items-center text-center py-4 space-y-4"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Compra Iniciada!
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
            Sua transacao foi criada com sucesso. Acompanhe o status da sua compra
            na pagina de transacoes.
          </p>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-2 w-full max-w-xs pt-2"
        >
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() =>
              (window.location.href = '/dashboard/transacoes')
            }
          >
            Acompanhar Transacao
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => (window.location.href = '/marketplace')}
          >
            Voltar ao Marketplace
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isSuccessStep = currentStep === 3;

  return (
    <Card className={cn('w-full max-w-lg mx-auto overflow-hidden', className)}>
      {/* Step indicator */}
      {!isSuccessStep && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Finalizar Compra</CardTitle>

          {/* Step dots */}
          <div className="flex items-center gap-2 mt-3">
            {STEPS.slice(0, -1).map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                {/* Step circle */}
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                    index < currentStep
                      ? 'bg-emerald-500 text-white'
                      : index === currentStep
                        ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label (visible on sm+) */}
                <span
                  className={cn(
                    'hidden sm:block text-xs font-medium transition-colors',
                    index === currentStep
                      ? 'text-[#2563EB] dark:text-[#3B82F6]'
                      : index < currentStep
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                  )}
                >
                  {step.label}
                </span>

                {/* Connecting line */}
                {index < STEPS.length - 2 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 rounded-full transition-colors',
                      index < currentStep
                        ? 'bg-emerald-400'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(isSuccessStep && 'pt-6')}>
        {/* Step content with animation */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 0 && renderReviewStep()}
          {currentStep === 1 && renderPaymentStep()}
          {currentStep === 2 && renderConfirmStep()}
          {currentStep === 3 && renderSuccessStep()}
        </AnimatePresence>

        {/* Navigation buttons */}
        {!isSuccessStep && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={isSubmitting}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-zinc-500"
              >
                Cancelar
              </Button>
            )}

            {currentStep < 2 ? (
              <Button onClick={goNext} className="gap-1">
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirmPurchase}
                loading={isSubmitting}
                className="gap-1.5"
                size="lg"
              >
                <Lock className="h-4 w-4" />
                Confirmar Compra
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
