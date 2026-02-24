'use client';

import { motion } from 'framer-motion';
import { Wallet, ArrowDownToLine } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface BalanceCardProps {
  availableBalance: number;
  onWithdraw: () => void;
}

export function BalanceCard({ availableBalance, onWithdraw }: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4A1FB8] p-6 sm:p-8 shadow-xl shadow-[#2563EB]/25"
    >
      {/* Decorative floating circles for visual depth */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-20 bottom-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute left-1/2 top-6 h-14 w-14 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-white/80">
            Saldo Disponível
          </span>
        </div>

        <div className="mb-8">
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            {formatCurrency(availableBalance)}
          </motion.p>
        </div>

        <Button
          onClick={onWithdraw}
          className="bg-white text-[#2563EB] shadow-lg shadow-black/10 hover:bg-white/90 hover:shadow-xl hover:text-[#1D4ED8] active:scale-[0.98]"
          size="lg"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Sacar
        </Button>
      </div>
    </motion.div>
  );
}
