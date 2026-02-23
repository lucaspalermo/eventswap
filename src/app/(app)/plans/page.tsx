'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Shield,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { PricingTable } from '@/components/plans/pricing-table';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Plans Page
// ---------------------------------------------------------------------------

export default function PlansPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'business'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    Promise.resolve(
      supabase
        .from('seller_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
      .then(({ data }) => {
        if (data) {
          setCurrentPlan(data.plan_type as 'free' | 'premium' | 'business');
        }
      })
      .catch(() => {
        // Default to free
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#6C3CE1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CE1]/10">
            <Crown className="h-6 w-6 text-[#6C3CE1]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Planos para Vendedores
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Escolha o plano ideal para o seu negocio. Quanto maior o plano, menor a taxa
          por transacao e mais recursos disponiveis.
        </p>
      </motion.div>

      {/* Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-800">
          <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Menor taxa</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">A partir de 3% por venda</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-[#6C3CE1]/5 dark:bg-[#6C3CE1]/10 p-4 border border-[#6C3CE1]/20">
          <Crown className="h-5 w-5 text-[#6C3CE1] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#6C3CE1]">Badge exclusivo</p>
            <p className="text-xs text-[#6C3CE1]/70">Destaque no marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Suporte premium</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Atendimento prioritario</p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PricingTable currentPlan={currentPlan} />
      </motion.div>

      {/* FAQ / Notes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="max-w-2xl mx-auto space-y-4 text-center"
      >
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Todos os planos incluem protecao de escrow, chat integrado e suporte basico.
          A cobranca e mensal e pode ser cancelada a qualquer momento.
          Pagamentos processados via PIX ou cartao de credito.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Duvidas? Entre em contato pelo email{' '}
          <a
            href="mailto:suporte@eventswap.com.br"
            className="text-[#6C3CE1] underline hover:no-underline"
          >
            suporte@eventswap.com.br
          </a>
        </p>
      </motion.div>
    </div>
  );
}
