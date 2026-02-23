'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ReceiptText,
  Percent,
  Inbox,
} from 'lucide-react';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type WalletTransactionType =
  | 'sale_received'
  | 'withdrawal'
  | 'refund_received'
  | 'fee_charged';

export interface WalletTransaction {
  id: number;
  type: WalletTransactionType;
  description: string;
  amount: number;
  date: string;
}

type FilterTab = 'all' | 'income' | 'expense';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Entradas' },
  { key: 'expense', label: 'Saídas' },
];

const INCOME_TYPES: WalletTransactionType[] = ['sale_received', 'refund_received'];
const EXPENSE_TYPES: WalletTransactionType[] = ['withdrawal', 'fee_charged'];

function getTransactionIcon(type: WalletTransactionType) {
  switch (type) {
    case 'sale_received':
      return <ArrowUpRight className="h-4 w-4" />;
    case 'withdrawal':
      return <ArrowDownLeft className="h-4 w-4" />;
    case 'refund_received':
      return <ReceiptText className="h-4 w-4" />;
    case 'fee_charged':
      return <Percent className="h-4 w-4" />;
  }
}

function getTransactionColor(type: WalletTransactionType) {
  if (INCOME_TYPES.includes(type)) {
    return {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      amountText: 'text-emerald-600 dark:text-emerald-400',
      prefix: '+',
    };
  }
  return {
    iconBg: 'bg-red-50 dark:bg-red-950',
    iconText: 'text-red-500 dark:text-red-400',
    amountText: 'text-red-500 dark:text-red-400',
    prefix: '-',
  };
}

export interface TransactionHistoryProps {
  transactions: WalletTransaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'income') return INCOME_TYPES.includes(tx.type);
    return EXPENSE_TYPES.includes(tx.type);
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'relative flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                activeFilter === tab.key
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              )}
            >
              {activeFilter === tab.key && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-zinc-700"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const colors = getTransactionColor(tx.type);
                return (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        colors.iconBg,
                        colors.iconText
                      )}
                    >
                      {getTransactionIcon(tx.type)}
                    </div>

                    {/* Description & Date */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {tx.description}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(tx.date)}
                      </p>
                    </div>

                    {/* Amount */}
                    <span
                      className={cn(
                        'shrink-0 text-sm font-semibold',
                        colors.amountText
                      )}
                    >
                      {colors.prefix} {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Inbox className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Nenhuma transação encontrada
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Não há transações para o filtro selecionado.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
