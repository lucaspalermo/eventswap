'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  X,
  Check,
  ShieldCheck,
  Store,
  Search,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'onboarding_complete';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

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
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OnboardingWizardProps {
  userName?: string;
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Step 1 - Welcome
// ---------------------------------------------------------------------------

function StepWelcome({ userName }: { userName?: string }) {
  const greeting = userName ? `Bem-vindo ao EventSwap, ${userName}!` : 'Bem-vindo ao EventSwap!';

  return (
    <div className="flex flex-col items-center px-8 pb-6 pt-10 text-center">
      {/* Illustration placeholder */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2563EB]/20 to-purple-200 dark:from-[#2563EB]/30 dark:to-purple-900/40">
        <Sparkles className="h-12 w-12 text-[#2563EB] dark:text-purple-400" strokeWidth={1.5} />
      </div>

      <h2 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {greeting}
      </h2>

      <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Compre e venda reservas de eventos com seguranca. A EventSwap conecta quem precisa
        transferir com quem esta procurando, com protecao total em cada transacao.
      </p>

      {/* Feature highlights */}
      <div className="w-full max-w-sm space-y-3">
        {[
          {
            Icon: ShieldCheck,
            title: 'Transacoes protegidas',
            description: 'Pagamento via escrow com garantia total',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          },
          {
            Icon: Store,
            title: 'Marketplace especializado',
            description: 'Milhares de reservas disponiveis para eventos',
            color: 'text-[#2563EB] dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/50',
          },
          {
            Icon: Search,
            title: 'Encontre facilmente',
            description: 'Busca inteligente por evento, cidade e data',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
          },
        ].map(({ Icon, title, description, color, bg }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-left',
              bg
            )}
          >
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bg)}>
              <Icon className={cn('h-5 w-5', color)} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 - All set
// ---------------------------------------------------------------------------

function StepComplete({ userName }: { userName?: string }) {
  return (
    <div className="flex flex-col items-center px-8 pb-6 pt-10 text-center">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/60 dark:to-emerald-900/40"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
        >
          <Check className="h-12 w-12 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="mb-1 flex items-center justify-center gap-2">
          <PartyPopper className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tudo pronto!
          </h2>
          <PartyPopper className="h-5 w-5 text-amber-500" />
        </div>

        <p className="mb-8 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {userName ? `Parabens, ${userName}!` : 'Parabens!'} Sua conta esta configurada.
          Agora voce pode explorar o marketplace ou criar seu primeiro anuncio.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        {/* Primary CTA */}
        <a
          href="/marketplace"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200',
            'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[#2563EB]/25 hover:shadow-lg hover:shadow-[#2563EB]/30',
            'active:scale-[0.98]'
          )}
        >
          <Search className="h-4 w-4" />
          Explorar Marketplace
        </a>

        {/* Secondary CTA */}
        <a
          href="/sell/new"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-200',
            'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300',
            'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
            'active:scale-[0.98]'
          )}
        >
          <Store className="h-4 w-4" />
          Criar meu primeiro anuncio
        </a>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OnboardingWizard component
// ---------------------------------------------------------------------------

export function OnboardingWizard({ userName, onComplete }: OnboardingWizardProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const totalSteps = 2;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Check localStorage on mount — show only once
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const markComplete = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Ignore storage errors
    }
    setVisible(false);
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      markComplete();
    }
  }, [currentStep, markComplete]);

  const handleSkip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleSkip, handleNext]);

  const isLast = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="onboarding-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleSkip();
          }}
        >
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* ---- Progress bar at top ---- */}
            <div className="px-0">
              <div className="h-1 rounded-t-2xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <motion.div
                  className="h-full bg-[#2563EB]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* ---- Skip button (top right) ---- */}
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
              aria-label="Pular onboarding"
            >
              Pular
              <X className="h-3.5 w-3.5" />
            </button>

            {/* ---- Step content with slide animation ---- */}
            <div className="relative min-h-[420px] overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {currentStep === 0 && <StepWelcome userName={userName} />}
                  {currentStep === 1 && <StepComplete userName={userName} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ---- Footer: navigation ---- */}
            <div className="border-t border-neutral-100 bg-neutral-50/50 px-8 py-5 dark:border-neutral-800 dark:bg-neutral-900/50">
              {/* Step indicator dots */}
              <div className="mb-5 flex items-center justify-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      index === currentStep
                        ? 'w-6 bg-[#2563EB]'
                        : index < currentStep
                          ? 'w-2 bg-[#2563EB]/40'
                          : 'w-2 bg-neutral-300 dark:bg-neutral-600'
                    )}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-end">
                {isLast ? (
                  <Button size="default" onClick={markComplete} className="gap-1.5">
                    <Check className="h-4 w-4" />
                    Concluir
                  </Button>
                ) : (
                  <Button size="default" onClick={handleNext} className="gap-1.5">
                    Proximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
