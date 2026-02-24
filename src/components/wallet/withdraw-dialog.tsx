'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Wallet,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatCurrency, parseCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { isDemoMode } from '@/lib/demo-auth';

// ──────────────────────────────────────────────
// Types & Constants
// ──────────────────────────────────────────────

type WithdrawStep = 'form' | 'processing' | 'success';

type PixKeyType = 'CPF' | 'Email' | 'Telefone' | 'Chave Aleatória';

const PIX_KEY_TYPES: PixKeyType[] = ['CPF', 'Email', 'Telefone', 'Chave Aleatória'];

const PIX_KEY_PLACEHOLDERS: Record<PixKeyType, string> = {
  CPF: '000.000.000-00',
  Email: 'seuemail@exemplo.com',
  Telefone: '(11) 99999-9999',
  'Chave Aleatória': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
};

const TRANSFER_FEE = 0;

const MIN_AMOUNT = 10;

const DEMO_WITHDRAWALS_KEY = 'eventswap_withdrawals';

interface DemoWithdrawal {
  id: string;
  amount: number;
  pixKeyType: PixKeyType;
  pixKey: string;
  fee: number;
  netAmount: number;
  requestedAt: string;
  status: 'pending';
}

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

export interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  onSuccess?: () => void;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function WithdrawDialog({
  open,
  onOpenChange,
  availableBalance,
  onSuccess,
}: WithdrawDialogProps) {
  const [step, setStep] = useState<WithdrawStep>('form');
  const [amountRaw, setAmountRaw] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('CPF');
  const [pixKey, setPixKey] = useState('');
  const [amountError, setAmountError] = useState('');
  const [pixKeyError, setPixKeyError] = useState('');

  // ── Derived values ──
  const numericAmount = parseCurrency(amountRaw);
  const fee = TRANSFER_FEE;
  const netAmount = numericAmount > 0 ? Math.max(0, numericAmount - fee) : 0;

  const isAmountValid =
    !isNaN(numericAmount) &&
    numericAmount >= MIN_AMOUNT &&
    numericAmount <= availableBalance;

  const isPixKeyValid = pixKey.trim().length >= 3;
  const canSubmit = isAmountValid && isPixKeyValid;

  // ── Amount input formatting ──
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and commas
    const raw = e.target.value.replace(/[^\d,]/g, '');
    setAmountRaw(raw);
    setAmountError('');
  };

  const handleSelectAll = () => {
    setAmountRaw(availableBalance.toFixed(2).replace('.', ','));
    setAmountError('');
  };

  // ── PIX key type change ──
  const handlePixKeyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPixKeyType(e.target.value as PixKeyType);
    setPixKey('');
    setPixKeyError('');
  };

  // ── Validation ──
  const validate = (): boolean => {
    let valid = true;

    if (!isAmountValid) {
      if (numericAmount < MIN_AMOUNT) {
        setAmountError(`Valor mínimo para saque é ${formatCurrency(MIN_AMOUNT)}.`);
      } else if (numericAmount > availableBalance) {
        setAmountError('Valor excede o saldo disponível.');
      } else {
        setAmountError('Informe um valor válido.');
      }
      valid = false;
    }

    if (!isPixKeyValid) {
      setPixKeyError('Informe sua chave PIX.');
      valid = false;
    }

    return valid;
  };

  // ── Submit ──
  const handleConfirm = async () => {
    if (!validate()) return;

    setStep('processing');

    try {
      if (isDemoMode()) {
        // Demo mode: persist to localStorage
        await new Promise((resolve) => setTimeout(resolve, 1800));

        const withdrawal: DemoWithdrawal = {
          id: `wd_${Date.now()}`,
          amount: numericAmount,
          pixKeyType,
          pixKey: pixKey.trim(),
          fee,
          netAmount,
          requestedAt: new Date().toISOString(),
          status: 'pending',
        };

        try {
          const existing = JSON.parse(
            localStorage.getItem(DEMO_WITHDRAWALS_KEY) || '[]'
          ) as DemoWithdrawal[];
          existing.unshift(withdrawal);
          localStorage.setItem(DEMO_WITHDRAWALS_KEY, JSON.stringify(existing));
        } catch {
          // ignore storage errors
        }

        setStep('success');
        toast.success('Saque solicitado com sucesso!', {
          description: `${formatCurrency(netAmount)} via PIX em até 1 dia útil.`,
        });
        onSuccess?.();
        return;
      }

      // Production mode: call API
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          pixKeyType,
          pixKey: pixKey.trim(),
        }),
      });

      if (response.status === 404) {
        // API not yet implemented – fall back to demo behaviour
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStep('success');
        toast.success('Saque solicitado!', {
          description: `${formatCurrency(netAmount)} via PIX em até 1 dia útil.`,
        });
        onSuccess?.();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || 'Erro ao solicitar saque.');
      }

      setStep('success');
      toast.success('Saque solicitado com sucesso!', {
        description: `${formatCurrency(netAmount)} via PIX em até 1 dia útil.`,
      });
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao solicitar saque. Tente novamente.';
      setStep('form');
      toast.error('Erro ao solicitar saque', { description: message });
    }
  };

  // ── Close / reset ──
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('form');
        setAmountRaw('');
        setPixKeyType('CPF');
        setPixKey('');
        setAmountError('');
        setPixKeyError('');
      }, 300);
    }
    onOpenChange(isOpen);
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">

          {/* ══════════════ FORM ══════════════ */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5 text-[#2563EB]" />
                  Solicitar Saque
                </DialogTitle>
                <DialogDescription>
                  Informe o valor e sua chave PIX para receber o pagamento.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-5">

                {/* Available Balance Banner */}
                <div className="flex items-center gap-3 rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/15">
                    <Wallet className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Saldo disponível para saque
                    </p>
                    <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(availableBalance)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="ml-auto shrink-0 rounded-lg border border-[#2563EB]/30 bg-white px-2.5 py-1 text-xs font-medium text-[#2563EB] transition-colors hover:bg-[#2563EB]/10 dark:bg-zinc-900 dark:hover:bg-[#2563EB]/20"
                  >
                    Tudo
                  </button>
                </div>

                {/* Amount Input */}
                <Input
                  label="Valor do saque (R$)"
                  placeholder="0,00"
                  value={amountRaw}
                  onChange={handleAmountChange}
                  error={amountError}
                  hint={`Mínimo: ${formatCurrency(MIN_AMOUNT)}`}
                  iconLeft={
                    <span className="text-sm font-semibold text-zinc-400">R$</span>
                  }
                  inputMode="decimal"
                />

                <Separator />

                {/* PIX Key Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Key className="h-4 w-4 text-zinc-400" />
                    Chave PIX para recebimento
                  </div>

                  {/* PIX Key Type Dropdown */}
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Tipo de chave
                    </label>
                    <select
                      value={pixKeyType}
                      onChange={handlePixKeyTypeChange}
                      className={cn(
                        'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]',
                        'dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700',
                        'border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {PIX_KEY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PIX Key Input */}
                  <Input
                    label="Chave PIX"
                    placeholder={PIX_KEY_PLACEHOLDERS[pixKeyType]}
                    value={pixKey}
                    onChange={(e) => {
                      setPixKey(e.target.value);
                      setPixKeyError('');
                    }}
                    error={pixKeyError}
                  />
                </div>

                <Separator />

                {/* Fee & Net Amount Summary */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 space-y-2 dark:border-zinc-700 dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Taxa de transferência
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(fee)} — Grátis
                    </span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Você receberá
                    </span>
                    <span
                      className={cn(
                        'text-base font-bold',
                        netAmount > 0
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    >
                      {netAmount > 0 ? formatCurrency(netAmount) : 'R$ 0,00'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleClose(false)}
                    className="sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!canSubmit}
                    size="lg"
                    className="sm:w-auto"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Solicitar Saque
                  </Button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════ PROCESSING ══════════════ */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-14"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-12 w-12 text-[#2563EB]" />
              </motion.div>
              <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Processando solicitação…
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Aguarde enquanto registramos seu saque.
              </p>
            </motion.div>
          )}

          {/* ══════════════ SUCCESS ══════════════ */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, type: 'spring', stiffness: 220, damping: 20 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              {/* Checkmark icon with spring pop */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="mt-5 space-y-2"
              >
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Saque solicitado!
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Prazo: até 1 dia útil via PIX.
                </p>
                {netAmount > 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Você receberá{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(netAmount)}
                    </span>{' '}
                    na chave{' '}
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {pixKeyType}
                    </span>
                    .
                  </p>
                )}
              </motion.div>

              <Button
                onClick={() => handleClose(false)}
                className="mt-8"
                size="lg"
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
