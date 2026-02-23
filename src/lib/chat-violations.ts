/**
 * chat-violations.ts
 *
 * Rastreamento de violações de chat por usuário (demo mode via localStorage).
 * Gerencia níveis de penalidade com base no número de infrações acumuladas.
 */

export type PenaltyLevel = 'none' | 'warning' | 'restricted' | 'suspended';

export interface ViolationRecord {
  userId: string;
  conversationId: number;
  violationType: string;
  messageSnippet: string;
  timestamp: string;
}

export interface UserViolationData {
  userId: string;
  count: number;
  records: ViolationRecord[];
  lastViolationAt: string | null;
  penaltyLevel: PenaltyLevel;
}

const STORAGE_KEY = 'eventswap_user_violations';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function loadAllViolations(): Record<string, UserViolationData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserViolationData>) : {};
  } catch {
    return {};
  }
}

function saveAllViolations(data: Record<string, UserViolationData>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail (storage full, etc.)
  }
}

/**
 * Calcula o nível de penalidade com base no total de violações do usuário.
 *
 * 0 violações     → 'none'
 * 1–2 violações   → 'warning'   (aviso, mensagem bloqueada)
 * 3–4 violações   → 'restricted' (restrições extras)
 * 5+  violações   → 'suspended' (chat desativado, admin notificado)
 */
function computePenaltyLevel(count: number): PenaltyLevel {
  if (count === 0) return 'none';
  if (count <= 2) return 'warning';
  if (count <= 4) return 'restricted';
  return 'suspended';
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Registra uma nova violação para o usuário.
 * Retorna o estado atualizado do usuário após o registro.
 */
export function recordViolation(
  userId: string,
  violation: {
    conversationId: number;
    violationType: string;
    messageSnippet: string;
  }
): UserViolationData {
  const all = loadAllViolations();

  const existing: UserViolationData = all[userId] ?? {
    userId,
    count: 0,
    records: [],
    lastViolationAt: null,
    penaltyLevel: 'none',
  };

  const now = new Date().toISOString();

  const newRecord: ViolationRecord = {
    userId,
    conversationId: violation.conversationId,
    violationType: violation.violationType,
    messageSnippet: violation.messageSnippet.slice(0, 120),
    timestamp: now,
  };

  const updated: UserViolationData = {
    ...existing,
    count: existing.count + 1,
    records: [...existing.records, newRecord],
    lastViolationAt: now,
    penaltyLevel: computePenaltyLevel(existing.count + 1),
  };

  all[userId] = updated;
  saveAllViolations(all);

  return updated;
}

/**
 * Retorna o número total de violações registradas para o usuário.
 */
export function getViolationCount(userId: string): number {
  const all = loadAllViolations();
  return all[userId]?.count ?? 0;
}

/**
 * Retorna o nível de penalidade atual do usuário.
 */
export function getUserPenaltyLevel(userId: string): PenaltyLevel {
  const all = loadAllViolations();
  const count = all[userId]?.count ?? 0;
  return computePenaltyLevel(count);
}

/**
 * Retorna o objeto completo de dados de violação do usuário.
 * Retorna null se não houver nenhum registro.
 */
export function getUserViolationData(userId: string): UserViolationData | null {
  const all = loadAllViolations();
  return all[userId] ?? null;
}

/**
 * Retorna uma mensagem amigável ao usuário conforme o nível de penalidade.
 */
export function getPenaltyMessage(level: PenaltyLevel): string {
  switch (level) {
    case 'warning':
      return 'Atenção: o compartilhamento de informações de contato não é permitido antes da confirmação do pagamento. Mais infrações resultarão em suspensão do chat.';
    case 'restricted':
      return 'Seu chat está em modo restrito devido a infrações anteriores. Evite compartilhar informações de contato.';
    case 'suspended':
      return 'Seu chat foi suspenso temporariamente devido a múltiplas tentativas de compartilhar contatos fora da plataforma. Entre em contato com o suporte.';
    default:
      return '';
  }
}

/**
 * Limpa todas as violações de um usuário (uso administrativo).
 */
export function clearUserViolations(userId: string): void {
  const all = loadAllViolations();
  delete all[userId];
  saveAllViolations(all);
}

/**
 * Retorna todos os dados de violação armazenados (uso administrativo / página antifraud).
 */
export function getAllViolationsData(): Record<string, UserViolationData> {
  return loadAllViolations();
}
