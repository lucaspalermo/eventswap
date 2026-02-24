import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const adminService = {
  // ============================================================================
  // DASHBOARD
  // ============================================================================
  async getDashboardStats() {
    const [users, listings, transactions, activeListings] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
    ]);

    // Get revenue (sum of platform_fee from completed transactions)
    const { data: revenueData } = await supabase
      .from("transactions")
      .select("platform_fee")
      .eq("status", "COMPLETED");

    const revenue = revenueData?.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0;

    // Get open disputes count
    const { count: disputeCount } = await supabase
      .from("disputes")
      .select("*", { count: "exact", head: true })
      .eq("status", "OPEN");

    return {
      totalUsers: users.count || 0,
      totalListings: listings.count || 0,
      totalTransactions: transactions.count || 0,
      activeListings: activeListings.count || 0,
      revenue,
      openDisputes: disputeCount || 0,
    };
  },

  async getRecentUsers(limit = 10) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getRecentTransactions(limit = 10) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(title, category), buyer:profiles!buyer_id(name), seller:profiles!seller_id(name)"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getPendingListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*, seller:profiles!seller_id(name, email, is_verified)")
      .eq("status", "PENDING_REVIEW")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async approveListing(listingId: number) {
    const { error } = await supabase
      .from("listings")
      .update({ status: "ACTIVE" })
      .eq("id", listingId);

    if (error) throw error;
  },

  async rejectListing(listingId: number) {
    const { error } = await supabase
      .from("listings")
      .update({ status: "CANCELLED" })
      .eq("id", listingId);

    if (error) throw error;
  },

  async getOpenDisputes() {
    const { data, error } = await supabase
      .from("disputes")
      .select(
        "*, transaction:transactions!transaction_id(code, agreed_price), opener:profiles!opened_by(name, email)"
      )
      .eq("status", "OPEN")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // ============================================================================
  // USERS
  // ============================================================================
  async getUsers(params?: {
    search?: string;
    role?: string;
    kycStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, kycStatus, page = 1, limit = 20 } = params || {};
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role && role !== "all") {
      query = query.eq("role", role);
    }
    if (kycStatus && kycStatus !== "all") {
      query = query.eq("kyc_status", kycStatus);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Get user stats in parallel
    const [listingsCount, purchasesCount, salesCount, reviewsCount, recentTx] = await Promise.all([
      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", userId),
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", userId),
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", userId),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("target_id", userId),
      supabase
        .from("transactions")
        .select("*, listing:listings!listing_id(title)")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      ...data,
      stats: {
        listings: listingsCount.count || 0,
        purchases: purchasesCount.count || 0,
        sales: salesCount.count || 0,
        reviews: reviewsCount.count || 0,
      },
      recentTransactions: recentTx.data || [],
    };
  },

  // ============================================================================
  // LISTINGS / EVENTS
  // ============================================================================
  async getListings(params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, category, page = 1, limit = 20 } = params || {};
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("listings")
      .select("*, seller:profiles!seller_id(name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getListingById(listingId: number) {
    const { data, error } = await supabase
      .from("listings")
      .select("*, seller:profiles!seller_id(id, name, email, avatar_url, rating_avg, rating_count, is_verified, created_at)")
      .eq("id", listingId)
      .single();

    if (error) throw error;

    // Get seller total sales
    if (data?.seller) {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", (data.seller as { id: string }).id)
        .eq("status", "COMPLETED");

      (data.seller as Record<string, unknown>).totalSales = count || 0;
    }

    return data;
  },

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================
  async getTransactions(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 20 } = params || {};
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(title, category), buyer:profiles!buyer_id(name), seller:profiles!seller_id(name)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("code", `%${search}%`);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getTransactionById(transactionId: string) {
    // Try matching by code (e.g., TXN-089) or id
    const isNumeric = /^\d+$/.test(transactionId);
    let query = supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(id, title, category, event_date), buyer:profiles!buyer_id(id, name, email, avatar_url, is_verified), seller:profiles!seller_id(id, name, email, avatar_url, is_verified)"
      );

    if (isNumeric) {
      query = query.eq("id", Number(transactionId));
    } else {
      query = query.eq("code", transactionId);
    }

    const { data, error } = await query.single();
    if (error) throw error;

    // Get payment info
    if (data) {
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", data.id)
        .single();

      return { ...data, payment };
    }

    return data;
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  async getAnalyticsData() {
    // Get revenue data by month (last 12 months)
    const { data: revenueData } = await supabase
      .from("transactions")
      .select("platform_fee, created_at")
      .eq("status", "COMPLETED")
      .gte("created_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    // Get total GMV
    const { data: gmvData } = await supabase
      .from("transactions")
      .select("agreed_price")
      .eq("status", "COMPLETED");

    const totalGmv = gmvData?.reduce((sum, t) => sum + Number(t.agreed_price || 0), 0) || 0;
    const totalRevenue = revenueData?.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0;

    // Get total active users (users who have at least one listing or transaction)
    const { count: activeUsersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get category distribution
    const { data: categoryData } = await supabase
      .from("listings")
      .select("category")
      .in("status", ["ACTIVE", "SOLD", "RESERVED"]);

    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach((l) => {
      categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
    });

    return {
      totalGmv,
      totalRevenue,
      activeUsers: activeUsersCount || 0,
      categoryCounts,
      revenueByMonth: revenueData || [],
    };
  },

  // ============================================================================
  // ANTIFRAUD
  // ============================================================================
  async getAntifraudAlerts() {
    // For now, antifraud alerts would come from a dedicated table.
    // Since we don't have one yet, we return null so the page falls back to mock data.
    // When a fraud_alerts table is created, this can be replaced.
    return null;
  },

  // ============================================================================
  // CHAT VIOLATIONS
  // ============================================================================

  /**
   * Registra uma tentativa de bypass de contato detectada no chat.
   *
   * Em modo demo, persiste no localStorage sob a chave 'eventswap_chat_violations'.
   * Em produção, inseriria um registro na tabela fraud_alerts (ou similar).
   *
   * @param userId          ID do usuário que tentou enviar a mensagem bloqueada
   * @param conversationId  ID da conversa onde ocorreu a tentativa
   * @param messageContent  Conteúdo (parcial) da mensagem bloqueada
   * @param violationType   Tipos de violação detectados (ex: "número de telefone, e-mail")
   */
  async reportChatViolation(
    userId: string,
    conversationId: number,
    messageContent: string,
    violationType: string
  ): Promise<void> {
    const VIOLATIONS_KEY = 'eventswap_chat_violations';

    // Estrutura do registro de violação
    const record = {
      id: `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      conversationId,
      // Truncar conteúdo para evitar armazenar dados sensíveis demais
      messageSnippet: messageContent.slice(0, 100),
      violationType,
      reportedAt: new Date().toISOString(),
      status: 'pending_review',
    };

    // --- Persistência em localStorage (demo mode) ---
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(VIOLATIONS_KEY);
        const existing: typeof record[] = raw ? JSON.parse(raw) : [];
        existing.push(record);
        // Manter apenas as 200 violações mais recentes para não encher o storage
        const trimmed = existing.slice(-200);
        localStorage.setItem(VIOLATIONS_KEY, JSON.stringify(trimmed));
      } catch {
        // Silently fail (storage indisponível ou cheio)
      }
    }

    // --- Persistência em Supabase (produção) ---
    // Quando a tabela fraud_alerts existir, substituir o bloco acima por:
    //
    // try {
    //   await supabase.from('fraud_alerts').insert({
    //     user_id: userId,
    //     conversation_id: conversationId,
    //     alert_type: 'CHAT_BYPASS',
    //     description: `Tentativa de bypass: ${violationType}`,
    //     metadata: { messageSnippet: messageContent.slice(0, 100) },
    //   });
    // } catch {
    //   // silently fail – não bloquear o fluxo principal
    // }
  },

  /**
   * Recupera todas as violações de chat armazenadas (uso no painel admin).
   * Retorna os registros do localStorage em modo demo.
   */
  getChatViolationsFromStorage(): Array<{
    id: string;
    userId: string;
    conversationId: number;
    messageSnippet: string;
    violationType: string;
    reportedAt: string;
    status: string;
  }> {
    const VIOLATIONS_KEY = 'eventswap_chat_violations';
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(VIOLATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // ============================================================================
  // ADMIN ACTIONS
  // ============================================================================

  async suspendUser(userId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) throw error;
  },

  async deleteUser(userId: string) {
    // Soft delete: deactivate + anonymize
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        name: "Usuario removido",
        email: `deleted_${Date.now()}@removed.eventswap.com`,
        phone: null,
        cpf: null,
        avatar_url: null,
        bio: null,
      })
      .eq("id", userId);

    if (error) throw error;
  },

  async suspendListing(listingId: number) {
    const { error } = await supabase
      .from("listings")
      .update({ status: "SUSPENDED" })
      .eq("id", listingId);

    if (error) throw error;
  },

  async forceRefund(transactionId: number) {
    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Falha ao processar reembolso");
    }

    return res.json();
  },
};
