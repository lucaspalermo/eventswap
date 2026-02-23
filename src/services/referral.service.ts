// ============================================================================
// EventSwap Referral Service
// Manages referral codes, stats, and rewards
// Demo mode: uses localStorage under 'eventswap_referrals'
// ============================================================================

const STORAGE_KEY = 'eventswap_referrals';
const REFERRER_REWARD = 50; // R$ 50 credit for referrer
const REFEREE_REWARD = 25; // R$ 25 discount for referee on first transaction

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  referredEmail: string;
  code: string;
  status: 'pending' | 'registered' | 'first_transaction' | 'rewarded';
  referrerReward: number;
  referredReward: number;
  createdAt: string;
  completedAt?: string;
}

export interface ReferralStats {
  code: string;
  totalInvited: number;
  totalRegistered: number;
  totalCompleted: number;
  totalEarned: number;
  pendingRewards: number;
}

// ---------------------------------------------------------------------------
// Storage helpers (demo mode)
// ---------------------------------------------------------------------------

interface ReferralStore {
  codes: Record<string, string>; // userId -> code
  referrals: Referral[];
  pendingCode?: string; // code stored during registration
}

function loadStore(): ReferralStore {
  if (typeof window === 'undefined') {
    return { codes: {}, referrals: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { codes: {}, referrals: [] };
    return JSON.parse(raw) as ReferralStore;
  } catch {
    return { codes: {}, referrals: [] };
  }
}

function saveStore(store: ReferralStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part = '';
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVNT-${part}`;
}

function generateId(): string {
  return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const referralService = {
  /**
   * Generates (or retrieves) a unique referral code for a user.
   */
  generateReferralCode(userId: string): string {
    const store = loadStore();

    if (store.codes[userId]) {
      return store.codes[userId];
    }

    // Ensure uniqueness
    const existingCodes = new Set(Object.values(store.codes));
    let code: string;
    do {
      code = generateCode();
    } while (existingCodes.has(code));

    store.codes[userId] = code;
    saveStore(store);
    return code;
  },

  /**
   * Returns referral stats for the given user.
   */
  getReferralStats(userId: string): ReferralStats {
    const store = loadStore();
    const code = store.codes[userId] ?? this.generateReferralCode(userId);

    const userReferrals = store.referrals.filter((r) => r.referrerId === userId);

    const totalInvited = userReferrals.length;
    const totalRegistered = userReferrals.filter(
      (r) => r.status === 'registered' || r.status === 'first_transaction' || r.status === 'rewarded'
    ).length;
    const totalCompleted = userReferrals.filter(
      (r) => r.status === 'first_transaction' || r.status === 'rewarded'
    ).length;
    const totalEarned = userReferrals
      .filter((r) => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.referrerReward, 0);
    const pendingRewards = userReferrals
      .filter((r) => r.status === 'first_transaction')
      .reduce((sum, r) => sum + r.referrerReward, 0);

    return {
      code,
      totalInvited,
      totalRegistered,
      totalCompleted,
      totalEarned,
      pendingRewards,
    };
  },

  /**
   * Applies a referral code when a new user registers.
   * Creates a 'pending' referral entry.
   */
  applyReferralCode(userId: string, code: string): { success: boolean; message: string } {
    const store = loadStore();
    const normalizedCode = code.trim().toUpperCase();

    // Find who owns this code
    const referrerId = Object.entries(store.codes).find(
      ([, c]) => c === normalizedCode
    )?.[0];

    if (!referrerId) {
      return { success: false, message: 'Código de indicação inválido.' };
    }

    if (referrerId === userId) {
      return { success: false, message: 'Você não pode usar seu próprio código.' };
    }

    // Check if already used
    const alreadyUsed = store.referrals.some(
      (r) => r.referredId === userId
    );
    if (alreadyUsed) {
      return { success: false, message: 'Você já usou um código de indicação.' };
    }

    const referral: Referral = {
      id: generateId(),
      referrerId,
      referredId: userId,
      referredName: 'Novo usuário',
      referredEmail: '',
      code: normalizedCode,
      status: 'registered',
      referrerReward: REFERRER_REWARD,
      referredReward: REFEREE_REWARD,
      createdAt: new Date().toISOString(),
    };

    store.referrals.push(referral);
    saveStore(store);

    return { success: true, message: `Código aplicado! Você ganhou R$ ${REFEREE_REWARD} de desconto na primeira transação.` };
  },

  /**
   * Returns the full referral history for a user.
   */
  getReferralHistory(userId: string): Referral[] {
    const store = loadStore();
    return store.referrals
      .filter((r) => r.referrerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Calculates the referral reward based on transaction amount.
   * Returns { referrerReward, referredReward }.
   */
  calculateReferralReward(): { referrerReward: number; referredReward: number } {
    return {
      referrerReward: REFERRER_REWARD,
      referredReward: REFEREE_REWARD,
    };
  },

  /**
   * Marks a referral as having completed a first transaction and triggers reward.
   */
  completeReferral(referredUserId: string): void {
    const store = loadStore();
    const referral = store.referrals.find(
      (r) => r.referredId === referredUserId && r.status === 'registered'
    );
    if (!referral) return;
    referral.status = 'first_transaction';
    referral.completedAt = new Date().toISOString();
    saveStore(store);
  },

  /**
   * Stores a referral code during registration flow (before userId is known).
   */
  storePendingReferralCode(code: string): void {
    if (typeof window === 'undefined') return;
    const store = loadStore();
    store.pendingCode = code.trim().toUpperCase();
    saveStore(store);
  },

  /**
   * Retrieves and clears the pending referral code.
   */
  consumePendingReferralCode(): string | null {
    if (typeof window === 'undefined') return null;
    const store = loadStore();
    const code = store.pendingCode ?? null;
    if (code) {
      delete store.pendingCode;
      saveStore(store);
    }
    return code;
  },

  /**
   * Validates a referral code format without applying it.
   */
  validateCodeFormat(code: string): boolean {
    return /^EVNT-[A-Z0-9]{4}$/.test(code.trim().toUpperCase());
  },

  /**
   * Checks if a code exists in the store (is valid and owned by someone).
   */
  isCodeValid(code: string): boolean {
    const store = loadStore();
    const normalizedCode = code.trim().toUpperCase();
    return Object.values(store.codes).includes(normalizedCode);
  },

  /**
   * Adds a demo referral entry for UI preview purposes.
   */
  seedDemoData(userId: string): void {
    const store = loadStore();
    if (!store.codes[userId]) {
      store.codes[userId] = this.generateReferralCode(userId);
    }

    // Only seed if no referrals yet
    if (store.referrals.some((r) => r.referrerId === userId)) return;

    const code = store.codes[userId];
    const demoReferrals: Referral[] = [
      {
        id: generateId(),
        referrerId: userId,
        referredId: 'demo-user-1',
        referredName: 'Ana Beatriz',
        referredEmail: 'ana.beatriz@email.com',
        code,
        status: 'rewarded',
        referrerReward: REFERRER_REWARD,
        referredReward: REFEREE_REWARD,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        referrerId: userId,
        referredId: 'demo-user-2',
        referredName: 'Carlos Mendes',
        referredEmail: 'carlos.mendes@email.com',
        code,
        status: 'first_transaction',
        referrerReward: REFERRER_REWARD,
        referredReward: REFEREE_REWARD,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        referrerId: userId,
        referredId: 'demo-user-3',
        referredName: 'Fernanda Lima',
        referredEmail: 'fernanda.lima@email.com',
        code,
        status: 'registered',
        referrerReward: REFERRER_REWARD,
        referredReward: REFEREE_REWARD,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        referrerId: userId,
        referredId: 'demo-user-4',
        referredName: 'Rafael Costa',
        referredEmail: 'rafael.costa@email.com',
        code,
        status: 'pending',
        referrerReward: REFERRER_REWARD,
        referredReward: REFEREE_REWARD,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    store.referrals.push(...demoReferrals);
    saveStore(store);
  },
};
