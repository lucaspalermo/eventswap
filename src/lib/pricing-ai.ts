// ============================================================================
// EventSwap - AI Pricing Engine
// Intelligent pricing suggestions based on market data and weighted factors
// No external AI API needed - pure algorithmic calculation
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PricingSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: 'low' | 'medium' | 'high';
  factors: PricingFactor[];
  marketAnalysis: {
    avgPrice: number;
    medianPrice: number;
    totalListings: number;
    avgDiscount: number;
    demandLevel: 'low' | 'medium' | 'high';
  };
}

export interface PricingFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number; // -1.0 to +1.0
}

export interface PricingInput {
  category: string;
  eventDate: string;
  venueCity: string;
  originalPrice: number;
  hasOriginalContract: boolean;
  providerName?: string;
}

export interface MarketData {
  listings: {
    asking_price: number;
    original_price: number;
    venue_city: string;
    category: string;
    event_date: string;
    has_original_contract: boolean;
  }[];
  transactions: {
    agreed_price: number;
    category: string;
    venue_city: string;
  }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Cities with higher demand */
const HIGH_DEMAND_CITIES = [
  'sao paulo', 'são paulo',
  'rio de janeiro',
  'belo horizonte',
  'curitiba',
  'brasilia', 'brasília',
  'salvador',
  'florianopolis', 'florianópolis',
];

const MEDIUM_DEMAND_CITIES = [
  'campinas',
  'porto alegre',
  'recife',
  'fortaleza',
  'goiania', 'goiânia',
  'vitoria', 'vitória',
  'santos',
  'guarulhos',
  'niteroi', 'niterói',
  'jundiai', 'jundiaí',
];

/** High season months for weddings/events (Dec, Jan, Feb, Jun, Jul) */
const HIGH_SEASON_MONTHS = [12, 1, 2, 6, 7];

/** Typical discount ranges per category (from original price) */
const CATEGORY_DISCOUNT_RANGES: Record<string, { min: number; max: number; typical: number }> = {
  WEDDING_VENUE: { min: 0.10, max: 0.45, typical: 0.25 },
  BUFFET: { min: 0.10, max: 0.40, typical: 0.22 },
  PHOTOGRAPHER: { min: 0.15, max: 0.50, typical: 0.30 },
  VIDEOGRAPHER: { min: 0.15, max: 0.50, typical: 0.30 },
  DJ_BAND: { min: 0.15, max: 0.55, typical: 0.35 },
  DECORATION: { min: 0.20, max: 0.55, typical: 0.35 },
  CATERING: { min: 0.10, max: 0.40, typical: 0.22 },
  WEDDING_DRESS: { min: 0.20, max: 0.60, typical: 0.40 },
  BEAUTY_MAKEUP: { min: 0.15, max: 0.50, typical: 0.30 },
  PARTY_VENUE: { min: 0.10, max: 0.45, typical: 0.25 },
  TRANSPORT: { min: 0.15, max: 0.50, typical: 0.30 },
  ACCOMMODATION: { min: 0.10, max: 0.40, typical: 0.20 },
  OTHER: { min: 0.15, max: 0.50, typical: 0.30 },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getDaysUntilEvent(eventDate: string): number {
  const event = new Date(eventDate);
  const now = new Date();
  const diffMs = event.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Main Pricing Engine
// ---------------------------------------------------------------------------

export function calculatePricingSuggestion(
  input: PricingInput,
  marketData: MarketData
): PricingSuggestion {
  const factors: PricingFactor[] = [];
  let adjustmentMultiplier = 1.0;

  const categoryRange = CATEGORY_DISCOUNT_RANGES[input.category] || CATEGORY_DISCOUNT_RANGES.OTHER;

  // -------------------------------------------------------------------------
  // Factor 1: Category typical discount
  // -------------------------------------------------------------------------
  const typicalDiscount = categoryRange.typical;
  const basePrice = input.originalPrice * (1 - typicalDiscount);

  // -------------------------------------------------------------------------
  // Factor 2: Time until event (urgency)
  // -------------------------------------------------------------------------
  const daysUntil = getDaysUntilEvent(input.eventDate);
  let urgencyFactor = 0;
  let urgencyDescription = '';

  if (daysUntil <= 14) {
    urgencyFactor = -0.20;
    urgencyDescription = `Evento em ${daysUntil} dias - desconto por urgencia`;
  } else if (daysUntil <= 30) {
    urgencyFactor = -0.15;
    urgencyDescription = `Evento em ${daysUntil} dias - desconto por prazo curto`;
  } else if (daysUntil <= 60) {
    urgencyFactor = -0.10;
    urgencyDescription = `Evento em ${Math.round(daysUntil / 30)} meses - leve desconto`;
  } else if (daysUntil <= 90) {
    urgencyFactor = -0.05;
    urgencyDescription = `Evento em ${Math.round(daysUntil / 30)} meses - prazo razoavel`;
  } else if (daysUntil <= 180) {
    urgencyFactor = 0;
    urgencyDescription = `Evento em ${Math.round(daysUntil / 30)} meses - prazo confortavel`;
  } else {
    urgencyFactor = 0.05;
    urgencyDescription = `Evento em ${Math.round(daysUntil / 30)} meses - antecedencia premium`;
  }

  if (urgencyFactor !== 0) {
    adjustmentMultiplier += urgencyFactor;
    factors.push({
      name: 'Prazo ate o evento',
      impact: urgencyFactor > 0 ? 'positive' : urgencyFactor < 0 ? 'negative' : 'neutral',
      description: urgencyDescription,
      weight: urgencyFactor,
    });
  }

  // -------------------------------------------------------------------------
  // Factor 3: City demand
  // -------------------------------------------------------------------------
  const normalizedCity = normalizeCity(input.venueCity);
  let cityFactor = 0;
  let cityDescription = '';

  if (HIGH_DEMAND_CITIES.some((c) => normalizedCity.includes(normalizeCity(c)))) {
    cityFactor = 0.08;
    cityDescription = `${input.venueCity} - alta demanda`;
  } else if (MEDIUM_DEMAND_CITIES.some((c) => normalizedCity.includes(normalizeCity(c)))) {
    cityFactor = 0.03;
    cityDescription = `${input.venueCity} - demanda moderada`;
  } else {
    cityFactor = -0.05;
    cityDescription = `${input.venueCity} - mercado menor`;
  }

  adjustmentMultiplier += cityFactor;
  factors.push({
    name: 'Demanda da cidade',
    impact: cityFactor > 0 ? 'positive' : cityFactor < 0 ? 'negative' : 'neutral',
    description: cityDescription,
    weight: cityFactor,
  });

  // -------------------------------------------------------------------------
  // Factor 4: Season
  // -------------------------------------------------------------------------
  const eventMonth = new Date(input.eventDate).getMonth() + 1;
  let seasonFactor = 0;
  let seasonDescription = '';

  if (HIGH_SEASON_MONTHS.includes(eventMonth)) {
    seasonFactor = 0.08;
    seasonDescription = 'Alta temporada de eventos';
  } else if ([3, 4, 5, 10, 11].includes(eventMonth)) {
    seasonFactor = 0.02;
    seasonDescription = 'Temporada media';
  } else {
    seasonFactor = -0.05;
    seasonDescription = 'Baixa temporada';
  }

  adjustmentMultiplier += seasonFactor;
  factors.push({
    name: 'Temporada',
    impact: seasonFactor > 0 ? 'positive' : seasonFactor < 0 ? 'negative' : 'neutral',
    description: seasonDescription,
    weight: seasonFactor,
  });

  // -------------------------------------------------------------------------
  // Factor 5: Has original contract
  // -------------------------------------------------------------------------
  if (input.hasOriginalContract) {
    const contractFactor = 0.05;
    adjustmentMultiplier += contractFactor;
    factors.push({
      name: 'Contrato original',
      impact: 'positive',
      description: 'Possui contrato original - mais seguranca',
      weight: contractFactor,
    });
  } else {
    const noContractFactor = -0.05;
    adjustmentMultiplier += noContractFactor;
    factors.push({
      name: 'Sem contrato original',
      impact: 'negative',
      description: 'Sem contrato original - menor confianca',
      weight: noContractFactor,
    });
  }

  // -------------------------------------------------------------------------
  // Factor 6: Market data analysis (if available)
  // -------------------------------------------------------------------------
  const similarListings = marketData.listings.filter(
    (l) => l.category === input.category
  );

  const sameCityListings = similarListings.filter(
    (l) => normalizeCity(l.venue_city) === normalizedCity
  );

  let marketPrices = sameCityListings.map((l) => l.asking_price);
  if (marketPrices.length < 3) {
    // Fall back to all category listings if not enough city data
    marketPrices = similarListings.map((l) => l.asking_price);
  }

  const completedTransactions = marketData.transactions.filter(
    (t) => t.category === input.category
  );

  let avgPrice = 0;
  let medianPrice = 0;
  let avgDiscount = typicalDiscount * 100;

  if (marketPrices.length > 0) {
    avgPrice = marketPrices.reduce((sum, p) => sum + p, 0) / marketPrices.length;
    medianPrice = getMedian(marketPrices);

    // Compare with market
    const marketAvgDiscount = similarListings.reduce((sum, l) => {
      if (l.original_price > 0) {
        return sum + ((l.original_price - l.asking_price) / l.original_price);
      }
      return sum;
    }, 0) / Math.max(1, similarListings.length);

    avgDiscount = marketAvgDiscount * 100;

    // Adjust toward market average if significant difference
    const marketRatio = medianPrice > 0 ? basePrice / medianPrice : 1;

    if (marketRatio > 1.2) {
      // Our base price is significantly higher than market
      const marketFactor = -0.08;
      adjustmentMultiplier += marketFactor;
      factors.push({
        name: 'Preco acima do mercado',
        impact: 'negative',
        description: `Media do mercado: R$ ${Math.round(medianPrice).toLocaleString('pt-BR')}`,
        weight: marketFactor,
      });
    } else if (marketRatio < 0.8) {
      // Our base price is significantly lower than market
      const marketFactor = 0.06;
      adjustmentMultiplier += marketFactor;
      factors.push({
        name: 'Preco competitivo',
        impact: 'positive',
        description: `Abaixo da media do mercado: R$ ${Math.round(medianPrice).toLocaleString('pt-BR')}`,
        weight: marketFactor,
      });
    }
  }

  // Use completed transaction prices if available
  if (completedTransactions.length > 0) {
    const avgTransactionPrice =
      completedTransactions.reduce((sum, t) => sum + t.agreed_price, 0) /
      completedTransactions.length;

    if (avgTransactionPrice > 0 && Math.abs(basePrice - avgTransactionPrice) / avgTransactionPrice > 0.15) {
      const transactionRatio = basePrice / avgTransactionPrice;
      if (transactionRatio > 1.15) {
        const txFactor = -0.05;
        adjustmentMultiplier += txFactor;
        factors.push({
          name: 'Historico de vendas',
          impact: 'negative',
          description: `Vendas concluidas nesta categoria: ~R$ ${Math.round(avgTransactionPrice).toLocaleString('pt-BR')}`,
          weight: txFactor,
        });
      } else if (transactionRatio < 0.85) {
        const txFactor = 0.04;
        adjustmentMultiplier += txFactor;
        factors.push({
          name: 'Historico de vendas',
          impact: 'positive',
          description: `Preco abaixo das vendas recentes: ~R$ ${Math.round(avgTransactionPrice).toLocaleString('pt-BR')}`,
          weight: txFactor,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Factor 7: Supply in category/city
  // -------------------------------------------------------------------------
  if (sameCityListings.length > 0) {
    let supplyFactor = 0;
    let supplyDescription = '';

    if (sameCityListings.length >= 10) {
      supplyFactor = -0.06;
      supplyDescription = `${sameCityListings.length} anuncios similares na cidade - alta concorrencia`;
    } else if (sameCityListings.length >= 5) {
      supplyFactor = -0.03;
      supplyDescription = `${sameCityListings.length} anuncios similares na cidade`;
    } else {
      supplyFactor = 0.04;
      supplyDescription = `Apenas ${sameCityListings.length} anuncio(s) similar(es) - pouca concorrencia`;
    }

    adjustmentMultiplier += supplyFactor;
    factors.push({
      name: 'Oferta na regiao',
      impact: supplyFactor > 0 ? 'positive' : supplyFactor < 0 ? 'negative' : 'neutral',
      description: supplyDescription,
      weight: supplyFactor,
    });
  }

  // -------------------------------------------------------------------------
  // Calculate final suggested price
  // -------------------------------------------------------------------------
  const suggestedPrice = Math.round(basePrice * adjustmentMultiplier);

  // Min/max range
  const minDiscount = categoryRange.max;
  const maxDiscount = categoryRange.min;
  const rawMin = Math.round(input.originalPrice * (1 - minDiscount) * 0.9);
  const rawMax = Math.round(input.originalPrice * (1 - maxDiscount) * 1.1);

  const minPrice = Math.max(50, rawMin);
  const maxPrice = Math.min(500000, Math.max(rawMax, suggestedPrice * 1.2));

  // Clamp suggested to range
  const clampedSuggested = clamp(suggestedPrice, minPrice, maxPrice);

  // -------------------------------------------------------------------------
  // Calculate confidence
  // -------------------------------------------------------------------------
  const totalDataPoints = similarListings.length + completedTransactions.length;
  let confidence: 'low' | 'medium' | 'high';

  if (totalDataPoints >= 10 && sameCityListings.length >= 3) {
    confidence = 'high';
  } else if (totalDataPoints >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // -------------------------------------------------------------------------
  // Determine demand level
  // -------------------------------------------------------------------------
  let demandLevel: 'low' | 'medium' | 'high';
  const demandScore =
    (HIGH_DEMAND_CITIES.some((c) => normalizedCity.includes(normalizeCity(c))) ? 2 : 0) +
    (HIGH_SEASON_MONTHS.includes(eventMonth) ? 1 : 0) +
    (completedTransactions.length > 5 ? 1 : 0);

  if (demandScore >= 3) {
    demandLevel = 'high';
  } else if (demandScore >= 1) {
    demandLevel = 'medium';
  } else {
    demandLevel = 'low';
  }

  return {
    suggestedPrice: clampedSuggested,
    minPrice,
    maxPrice,
    confidence,
    factors,
    marketAnalysis: {
      avgPrice: Math.round(avgPrice) || clampedSuggested,
      medianPrice: Math.round(medianPrice) || clampedSuggested,
      totalListings: similarListings.length,
      avgDiscount: Math.round(avgDiscount * 10) / 10,
      demandLevel,
    },
  };
}
