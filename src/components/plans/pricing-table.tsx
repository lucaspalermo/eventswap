'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Check,
  Crown,
  Building2,
  Zap,
  Loader2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'free' | 'premium' | 'business';
  name: string;
  price: number | null;
  priceLabel: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
  commissionRate: string;
}

interface PricingTableProps {
  currentPlan?: 'free' | 'premium' | 'business';
  onSelectPlan?: (planId: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Plans Data
// ---------------------------------------------------------------------------

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: null,
    priceLabel: 'R$ 0',
    description: 'Para quem esta comecando a vender',
    icon: Zap,
    iconColor: '#737373',
    commissionRate: '8%',
    features: [
      { text: '8% taxa por transacao', included: true },
      { text: 'Ate 3 anuncios ativos', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Painel basico', included: true },
      { text: 'Badge Premium', included: false },
      { text: 'Suporte prioritario', included: false },
      { text: 'Analytics avancado', included: false },
      { text: 'Anuncios ilimitados', included: false },
      { text: 'Destaque gratuito', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    priceLabel: formatCurrency(49),
    description: 'Para vendedores frequentes',
    icon: Crown,
    iconColor: '#6C3CE1',
    commissionRate: '5%',
    highlighted: true,
    badge: 'Mais Popular',
    features: [
      { text: '5% taxa por transacao', included: true },
      { text: 'Ate 15 anuncios ativos', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Painel completo', included: true },
      { text: 'Badge Premium', included: true },
      { text: 'Suporte prioritario', included: true },
      { text: 'Analytics avancado', included: true },
      { text: 'Anuncios ilimitados', included: false },
      { text: 'Destaque gratuito', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 149,
    priceLabel: formatCurrency(149),
    description: 'Para profissionais e empresas',
    icon: Building2,
    iconColor: '#10B981',
    commissionRate: '3%',
    features: [
      { text: '3% taxa por transacao', included: true },
      { text: 'Anuncios ilimitados', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Painel completo', included: true },
      { text: 'Badge Business', included: true },
      { text: 'Gerente dedicado', included: true },
      { text: 'Analytics avancado', included: true },
      { text: 'API access', included: true },
      { text: '1 destaque gratis/mes', included: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PricingTable({
  currentPlan = 'free',
  onSelectPlan,
  className,
}: PricingTableProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === 'free' && currentPlan !== 'free') {
      toast.info('Para fazer downgrade, entre em contato com o suporte.');
      return;
    }

    setLoadingPlan(planId);

    try {
      if (onSelectPlan) {
        onSelectPlan(planId);
      } else {
        // Default behavior: call API
        const response = await fetch('/api/plans/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Falha ao assinar plano');
        }

        toast.success(`Plano ${planId} selecionado! Redirecionando para pagamento...`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao selecionar plano';
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto', className)}>
      {PLANS.map((plan, index) => {
        const isCurrentPlan = currentPlan === plan.id;
        const Icon = plan.icon;

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={cn(
              'relative flex flex-col rounded-2xl border-2 bg-white dark:bg-zinc-900 p-6 transition-all duration-300',
              plan.highlighted
                ? 'border-[#6C3CE1] shadow-xl shadow-[#6C3CE1]/10 scale-[1.02]'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600',
              isCurrentPlan && 'ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-zinc-950'
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6C3CE1] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <Star className="h-3 w-3 fill-white" />
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Current plan indicator */}
            {isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <Check className="h-3 w-3" />
                  Plano Atual
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: plan.iconColor + '15' }}
                >
                  <Icon className="h-5 w-5" style={{ color: plan.iconColor }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {plan.name}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {plan.priceLabel}
                </span>
                {plan.price !== null && (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">/mes</span>
                )}
              </div>

              {/* Commission rate highlight */}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Taxa de {plan.commissionRate} por venda
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      feature.included
                        ? 'bg-emerald-100 dark:bg-emerald-950/40'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    )}
                  >
                    {feature.included ? (
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="h-0.5 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      feature.included
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-400 dark:text-zinc-600'
                    )}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={isCurrentPlan || loadingPlan === plan.id}
              className={cn(
                'w-full h-11 font-semibold',
                plan.highlighted
                  ? 'bg-[#6C3CE1] hover:bg-[#5B32C1] text-white shadow-lg shadow-[#6C3CE1]/25'
                  : isCurrentPlan
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                    : ''
              )}
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isCurrentPlan
                ? 'Plano Atual'
                : plan.price === null
                  ? 'Plano Gratis'
                  : `Assinar por ${plan.priceLabel}/mes`}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
