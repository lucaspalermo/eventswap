'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  ArrowRight,
  Loader2,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import type { PricingSuggestion, PricingFactor } from '@/lib/pricing-ai';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PricingAssistantProps {
  category: string;
  venueCity: string;
  eventDate: string;
  originalPrice: number;
  hasOriginalContract: boolean;
  onUseSuggestedPrice: (price: number) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConfidenceMeter({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const levels = {
    low: { bars: 1, color: 'bg-amber-500', label: 'Baixa', textColor: 'text-amber-600' },
    medium: { bars: 2, color: 'bg-blue-500', label: 'Media', textColor: 'text-blue-600' },
    high: { bars: 3, color: 'bg-emerald-500', label: 'Alta', textColor: 'text-emerald-600' },
  };

  const level = levels[confidence];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <motion.div
            key={bar}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: bar * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'w-2 rounded-sm origin-bottom',
              bar === 1 ? 'h-2' : bar === 2 ? 'h-3' : 'h-4',
              bar <= level.bars ? level.color : 'bg-neutral-200 dark:bg-neutral-700'
            )}
          />
        ))}
      </div>
      <span className={cn('text-xs font-medium', level.textColor)}>
        Confianca {level.label}
      </span>
    </div>
  );
}

function FactorCard({ factor }: { factor: PricingFactor }) {
  const impactConfig = {
    positive: {
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    negative: {
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800/50',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    neutral: {
      icon: Minus,
      color: 'text-neutral-500',
      bg: 'bg-neutral-50 dark:bg-neutral-900/20',
      border: 'border-neutral-200 dark:border-neutral-700',
      badge: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    },
  };

  const config = impactConfig[factor.impact];
  const Icon = config.icon;
  const percentStr = factor.weight > 0
    ? `+${(factor.weight * 100).toFixed(0)}%`
    : `${(factor.weight * 100).toFixed(0)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        config.bg,
        config.border
      )}
    >
      <div className={cn('flex-shrink-0', config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {factor.name}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {factor.description}
        </p>
      </div>
      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0', config.badge)}>
        {percentStr}
      </span>
    </motion.div>
  );
}

function DemandIndicator({ level }: { level: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { label: 'Baixa', color: 'text-amber-600', dots: 1 },
    medium: { label: 'Media', color: 'text-blue-600', dots: 2 },
    high: { label: 'Alta', color: 'text-emerald-600', dots: 3 },
  };

  const c = config[level];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((d) => (
          <div
            key={d}
            className={cn(
              'h-2 w-2 rounded-full',
              d <= c.dots
                ? level === 'high'
                  ? 'bg-emerald-500'
                  : level === 'medium'
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                : 'bg-neutral-200 dark:bg-neutral-700'
            )}
          />
        ))}
      </div>
      <span className={cn('text-xs font-medium', c.color)}>
        Demanda {c.label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PricingAssistant({
  category,
  venueCity,
  eventDate,
  originalPrice,
  hasOriginalContract,
  onUseSuggestedPrice,
}: PricingAssistantProps) {
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const canSuggest = category && venueCity && eventDate && originalPrice > 0;

  async function handleSuggest() {
    if (!canSuggest) return;

    setLoading(true);
    setError(null);
    setSuggestion(null);
    setApplied(false);

    try {
      const res = await fetch('/api/pricing/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          event_date: eventDate,
          venue_city: venueCity,
          original_price: originalPrice,
          has_original_contract: hasOriginalContract,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Erro ao obter sugestao');
      }

      setSuggestion(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  function handleUsePrice() {
    if (!suggestion) return;
    onUseSuggestedPrice(suggestion.suggestedPrice);
    setApplied(true);
  }

  const discount = suggestion
    ? Math.round(((originalPrice - suggestion.suggestedPrice) / originalPrice) * 100)
    : 0;

  return (
    <Card className="border-[#6C3CE1]/20 bg-gradient-to-br from-[#6C3CE1]/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C3CE1]/10">
            <Sparkles className="h-4 w-4 text-[#6C3CE1]" />
          </div>
          Assistente de Precificacao
        </CardTitle>
        <p className="text-xs text-neutral-500 mt-1">
          Sugestao inteligente baseada em dados do mercado
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Suggest Button */}
        {!suggestion && !loading && (
          <Button
            onClick={handleSuggest}
            disabled={!canSuggest}
            className="w-full bg-[#6C3CE1] hover:bg-[#5B32C1] text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Sugerir preco
          </Button>
        )}

        {!canSuggest && !suggestion && !loading && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Preencha a categoria, cidade, data do evento e preco original para receber uma sugestao.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-6 gap-3"
          >
            <div className="relative">
              <Loader2 className="h-8 w-8 text-[#6C3CE1] animate-spin" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-[#6C3CE1]/20" />
            </div>
            <p className="text-sm text-neutral-500">Analisando mercado...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="space-y-4"
            >
              {/* Suggested Price */}
              <div className="text-center py-4 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <p className="text-xs text-neutral-500 mb-1">Preco Sugerido</p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-3xl font-bold text-[#6C3CE1]"
                >
                  {formatCurrency(suggestion.suggestedPrice)}
                </motion.p>
                {discount > 0 && (
                  <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {discount}% de desconto
                  </Badge>
                )}
                <div className="mt-3">
                  <ConfidenceMeter confidence={suggestion.confidence} />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{formatCurrency(suggestion.minPrice)}</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Faixa de preco</span>
                  <span>{formatCurrency(suggestion.maxPrice)}</span>
                </div>
                <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                  {/* Range bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500"
                  />
                  {/* Suggested price indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#6C3CE1] border-2 border-white dark:border-neutral-900 shadow-md"
                    style={{
                      left: `${clampPercent(
                        ((suggestion.suggestedPrice - suggestion.minPrice) /
                          (suggestion.maxPrice - suggestion.minPrice)) *
                          100
                      )}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#6C3CE1]" />
                  Fatores de ajuste
                </h4>
                <div className="space-y-2">
                  {suggestion.factors.map((factor, idx) => (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08 }}
                    >
                      <FactorCard factor={factor} />
                    </motion.div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Market Analysis */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#6C3CE1]" />
                  Analise de Mercado
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Preco Medio</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(suggestion.marketAnalysis.avgPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Preco Mediano</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(suggestion.marketAnalysis.medianPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Anuncios similares</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {suggestion.marketAnalysis.totalListings}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500">Desconto medio</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {suggestion.marketAnalysis.avgDiscount.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <DemandIndicator level={suggestion.marketAnalysis.demandLevel} />
              </div>

              <Separator />

              {/* Use Price Button */}
              {!applied ? (
                <Button
                  onClick={handleUsePrice}
                  className="w-full bg-[#6C3CE1] hover:bg-[#5B32C1] text-white gap-2"
                >
                  Usar este preco
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Preco aplicado!</span>
                </div>
              )}

              {/* Try again */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSuggest}
                className="w-full text-xs text-neutral-500 hover:text-neutral-700"
              >
                Recalcular sugestao
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampPercent(value: number): number {
  return Math.max(5, Math.min(95, value));
}
