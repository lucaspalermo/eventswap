// ============================================================================
// EventSwap Constants
// Event categories, transaction statuses, listing statuses, and more
// ============================================================================

// ---------------------------------------------------------------------------
// Event Categories
// Icons reference Lucide React icon names
// ---------------------------------------------------------------------------

export interface EventCategory {
  id: string;
  label: string;
  labelPlural: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: "casamento",
    label: "Casamento",
    labelPlural: "Casamentos",
    icon: "Heart",
    description: "Cerimônias, festas e recepções de casamento",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
  },
  {
    id: "buffet",
    label: "Buffet",
    labelPlural: "Buffets",
    icon: "UtensilsCrossed",
    description: "Serviços de buffet e gastronomia para eventos",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
  },
  {
    id: "espaco",
    label: "Espaço para Eventos",
    labelPlural: "Espaços para Eventos",
    icon: "Building2",
    description: "Salões de festas, chácaras, sítios e espaços",
    color: "#6C3CE1",
    gradient: "linear-gradient(135deg, #6C3CE1 0%, #9B6DFF 100%)",
  },
  {
    id: "fotografia",
    label: "Fotografia",
    labelPlural: "Fotografias",
    icon: "Camera",
    description: "Fotógrafos e ensaios fotográficos para eventos",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
  },
  {
    id: "musica",
    label: "Música e DJ",
    labelPlural: "Músicas e DJs",
    icon: "Music",
    description: "Bandas, DJs e serviços musicais",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  },
  {
    id: "decoracao",
    label: "Decoração",
    labelPlural: "Decorações",
    icon: "Sparkles",
    description: "Decoração e ambientação de eventos",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  },
  {
    id: "video",
    label: "Filmagem",
    labelPlural: "Filmagens",
    icon: "Video",
    description: "Serviços de filmagem e vídeo para eventos",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
  },
  {
    id: "convite",
    label: "Convite",
    labelPlural: "Convites",
    icon: "Mail",
    description: "Convites e papelaria personalizada",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
  },
  {
    id: "vestido-noiva",
    label: "Vestido de Noiva",
    labelPlural: "Vestidos de Noiva",
    icon: "Shirt",
    description: "Vestidos de noiva e trajes para cerimônia",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F9A8D4 100%)",
  },
  {
    id: "festa-infantil",
    label: "Festa Infantil",
    labelPlural: "Festas Infantis",
    icon: "Cake",
    description: "Festas infantis, aniversários e comemorações",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
  },
  {
    id: "corporativo",
    label: "Evento Corporativo",
    labelPlural: "Eventos Corporativos",
    icon: "Briefcase",
    description: "Conferências, workshops e eventos empresariais",
    color: "#475569",
    gradient: "linear-gradient(135deg, #475569 0%, #64748B 100%)",
  },
  {
    id: "outro",
    label: "Outro",
    labelPlural: "Outros",
    icon: "CalendarDays",
    description: "Outros tipos de eventos e serviços",
    color: "#737373",
    gradient: "linear-gradient(135deg, #737373 0%, #A3A3A3 100%)",
  },
] as const;

/**
 * Lookup map for event categories by ID.
 */
export const EVENT_CATEGORIES_MAP: Record<string, EventCategory> =
  EVENT_CATEGORIES.reduce(
    (map, category) => {
      map[category.id] = category;
      return map;
    },
    {} as Record<string, EventCategory>
  );

/**
 * Returns an event category by its ID, or the "outro" fallback.
 */
export function getEventCategory(id: string): EventCategory {
  return EVENT_CATEGORIES_MAP[id] || EVENT_CATEGORIES_MAP["outro"];
}

// ---------------------------------------------------------------------------
// Transaction Statuses
// ---------------------------------------------------------------------------

export interface TransactionStatus {
  id: string;
  label: string;
  description: string;
  color: "neutral" | "primary" | "warning" | "success" | "error";
  icon: string;
}

export const TRANSACTION_STATUSES: TransactionStatus[] = [
  {
    id: "pending",
    label: "Pendente",
    description: "Aguardando confirmação de pagamento",
    color: "warning",
    icon: "Clock",
  },
  {
    id: "processing",
    label: "Processando",
    description: "Pagamento sendo processado pelo gateway",
    color: "primary",
    icon: "Loader2",
  },
  {
    id: "paid",
    label: "Pago",
    description: "Pagamento confirmado com sucesso",
    color: "success",
    icon: "CheckCircle2",
  },
  {
    id: "in_escrow",
    label: "Em Garantia",
    description: "Valor retido em garantia até a transferência ser confirmada",
    color: "primary",
    icon: "Shield",
  },
  {
    id: "released",
    label: "Liberado",
    description: "Valor liberado para o vendedor",
    color: "success",
    icon: "BadgeCheck",
  },
  {
    id: "refunded",
    label: "Reembolsado",
    description: "Valor devolvido ao comprador",
    color: "neutral",
    icon: "RotateCcw",
  },
  {
    id: "disputed",
    label: "Em Disputa",
    description: "Transação em análise por disputa entre as partes",
    color: "error",
    icon: "AlertTriangle",
  },
  {
    id: "cancelled",
    label: "Cancelado",
    description: "Transação cancelada",
    color: "error",
    icon: "XCircle",
  },
  {
    id: "failed",
    label: "Falhou",
    description: "Erro no processamento do pagamento",
    color: "error",
    icon: "AlertOctagon",
  },
] as const;

export const TRANSACTION_STATUSES_MAP: Record<string, TransactionStatus> =
  TRANSACTION_STATUSES.reduce(
    (map, status) => {
      map[status.id] = status;
      return map;
    },
    {} as Record<string, TransactionStatus>
  );

export function getTransactionStatus(id: string): TransactionStatus {
  return (
    TRANSACTION_STATUSES_MAP[id] || {
      id: "unknown",
      label: "Desconhecido",
      description: "Status não identificado",
      color: "neutral" as const,
      icon: "HelpCircle",
    }
  );
}

// ---------------------------------------------------------------------------
// Listing Statuses
// ---------------------------------------------------------------------------

export interface ListingStatus {
  id: string;
  label: string;
  description: string;
  color: "neutral" | "primary" | "warning" | "success" | "error";
  icon: string;
}

export const LISTING_STATUSES: ListingStatus[] = [
  {
    id: "draft",
    label: "Rascunho",
    description: "Anúncio em edição, não visível publicamente",
    color: "neutral",
    icon: "FileEdit",
  },
  {
    id: "pending_review",
    label: "Em Análise",
    description: "Anúncio aguardando aprovação da equipe",
    color: "warning",
    icon: "Eye",
  },
  {
    id: "active",
    label: "Ativo",
    description: "Anúncio publicado e visível no marketplace",
    color: "success",
    icon: "CheckCircle2",
  },
  {
    id: "paused",
    label: "Pausado",
    description: "Anúncio temporariamente pausado pelo vendedor",
    color: "neutral",
    icon: "PauseCircle",
  },
  {
    id: "reserved",
    label: "Reservado",
    description: "Reserva em andamento, aguardando pagamento",
    color: "primary",
    icon: "Clock",
  },
  {
    id: "sold",
    label: "Vendido",
    description: "Reserva transferida com sucesso para o comprador",
    color: "success",
    icon: "BadgeCheck",
  },
  {
    id: "expired",
    label: "Expirado",
    description: "Anúncio expirou (data do evento passou)",
    color: "neutral",
    icon: "CalendarX",
  },
  {
    id: "rejected",
    label: "Rejeitado",
    description: "Anúncio não aprovado pela equipe de moderação",
    color: "error",
    icon: "XCircle",
  },
  {
    id: "cancelled",
    label: "Cancelado",
    description: "Anúncio cancelado pelo vendedor",
    color: "error",
    icon: "Ban",
  },
] as const;

export const LISTING_STATUSES_MAP: Record<string, ListingStatus> =
  LISTING_STATUSES.reduce(
    (map, status) => {
      map[status.id] = status;
      return map;
    },
    {} as Record<string, ListingStatus>
  );

export function getListingStatus(id: string): ListingStatus {
  return (
    LISTING_STATUSES_MAP[id] || {
      id: "unknown",
      label: "Desconhecido",
      description: "Status não identificado",
      color: "neutral" as const,
      icon: "HelpCircle",
    }
  );
}

// ---------------------------------------------------------------------------
// Sort Options (for marketplace search)
// ---------------------------------------------------------------------------

export interface SortOption {
  id: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: "newest",
    label: "Mais Recentes",
    field: "created_at",
    direction: "desc",
  },
  {
    id: "oldest",
    label: "Mais Antigos",
    field: "created_at",
    direction: "asc",
  },
  {
    id: "price_asc",
    label: "Menor Preço",
    field: "price",
    direction: "asc",
  },
  {
    id: "price_desc",
    label: "Maior Preço",
    field: "price",
    direction: "desc",
  },
  {
    id: "event_date_asc",
    label: "Data do Evento (Próximo)",
    field: "event_date",
    direction: "asc",
  },
  {
    id: "event_date_desc",
    label: "Data do Evento (Distante)",
    field: "event_date",
    direction: "desc",
  },
  {
    id: "discount_desc",
    label: "Maior Desconto",
    field: "discount_percent",
    direction: "desc",
  },
] as const;

// ---------------------------------------------------------------------------
// Brazilian States
// ---------------------------------------------------------------------------

export interface BrazilianState {
  uf: string;
  name: string;
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
] as const;

// ---------------------------------------------------------------------------
// Platform Constants
// ---------------------------------------------------------------------------

export const PLATFORM = {
  name: "EventSwap",
  tagline: "O marketplace de reservas de eventos",
  description:
    "Compre e venda reservas de eventos com segurança. Casamentos, buffets, espaços, fotógrafos e muito mais.",
  url: "https://eventswap.com.br",
  supportEmail: "suporte@eventswap.com.br",
  fees: {
    sellerPercent: 8,
    buyerPercent: 5,
    minimumFeeReais: 5,
  },
  limits: {
    maxImagesPerListing: 10,
    maxImageSizeMB: 5,
    maxTitleLength: 120,
    maxDescriptionLength: 5000,
    minPriceReais: 50,
    maxPriceReais: 500000,
  },
} as const;

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  defaultPage: 1,
  defaultPerPage: 12,
  perPageOptions: [12, 24, 48, 96],
  maxPerPage: 96,
} as const;

// ---------------------------------------------------------------------------
// Transfer Protection Labels
// ---------------------------------------------------------------------------

export interface ProtectionLevel {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const PROTECTION_LEVELS: ProtectionLevel[] = [
  {
    id: "basic",
    label: "Proteção Básica",
    description: "Verificação de identidade do vendedor e comprovação da reserva",
    icon: "Shield",
    color: "#0EA5E9",
  },
  {
    id: "standard",
    label: "Proteção Padrão",
    description:
      "Verificação completa, escrow de pagamento e suporte na transferência",
    icon: "ShieldCheck",
    color: "#6C3CE1",
  },
  {
    id: "premium",
    label: "Proteção Premium",
    description:
      "Proteção total com garantia de reembolso, mediação de conflitos e acompanhamento dedicado",
    icon: "ShieldPlus",
    color: "#10B981",
  },
] as const;

export const PROTECTION_LEVELS_MAP: Record<string, ProtectionLevel> =
  PROTECTION_LEVELS.reduce(
    (map, level) => {
      map[level.id] = level;
      return map;
    },
    {} as Record<string, ProtectionLevel>
  );
