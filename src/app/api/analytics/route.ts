import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ---------------------------------------------------------------------------
// Analytics API
// GET - Returns analytics data based on user role (user or admin)
// Query params:
//   ?role=admin  -> returns platform-wide metrics (requires ADMIN/SUPER_ADMIN)
//   (default)    -> returns current user's personal analytics
// ---------------------------------------------------------------------------

interface MonthlyData {
  month: string;
  label: string;
  gmv: number;
  revenue: number;
  transactions: number;
}

interface CategoryData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface CityData {
  city: string;
  state: string;
  transactions: number;
  gmv: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  casamento: 'Casamento',
  buffet: 'Buffet',
  espaco: 'Espaco para Eventos',
  fotografia: 'Fotografia',
  musica: 'Musica e DJ',
  decoracao: 'Decoracao',
  video: 'Filmagem',
  convite: 'Convite',
  'vestido-noiva': 'Vestido de Noiva',
  'festa-infantil': 'Festa Infantil',
  corporativo: 'Evento Corporativo',
  outro: 'Outros',
};

const CATEGORY_COLORS: Record<string, string> = {
  casamento: '#EC4899',
  buffet: '#F97316',
  espaco: '#2563EB',
  fotografia: '#0EA5E9',
  musica: '#10B981',
  decoracao: '#F59E0B',
  video: '#EF4444',
  convite: '#8B5CF6',
  'vestido-noiva': '#EC4899',
  'festa-infantil': '#06B6D4',
  corporativo: '#475569',
  outro: '#737373',
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [, month] = key.split('-');
  return MONTH_NAMES[parseInt(month, 10) - 1] || key;
}

function getLast12MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(getMonthKey(d));
  }
  return keys;
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ---------------------------------------------------------------------------
// User Analytics (regular users)
// ---------------------------------------------------------------------------
async function getUserAnalytics(userId: string) {
  const supabase = await createClient();
  const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel queries
  const [
    listingsResult,
    salesResult,
    purchasesResult,
    viewsResult,
    offersResult,
  ] = await Promise.all([
    // All user listings
    supabase
      .from('listings')
      .select('id, status, category, view_count, favorite_count, created_at')
      .eq('seller_id', userId),
    // Sales (user is seller)
    supabase
      .from('transactions')
      .select('id, agreed_price, platform_fee, seller_net_amount, status, created_at')
      .eq('seller_id', userId),
    // Purchases (user is buyer)
    supabase
      .from('transactions')
      .select('id, agreed_price, platform_fee, status, created_at, listing:listings!listing_id(category)')
      .eq('buyer_id', userId),
    // Total views across all listings
    supabase
      .from('listings')
      .select('view_count')
      .eq('seller_id', userId),
    // Offers received (for response time)
    supabase
      .from('offers')
      .select('id, status, created_at, responded_at')
      .eq('seller_id', userId)
      .gte('created_at', twelveMonthsAgo),
  ]);

  const listings = listingsResult.data || [];
  const sales = salesResult.data || [];
  const purchases = purchasesResult.data || [];
  const viewsData = viewsResult.data || [];
  const offers = offersResult.data || [];

  // -- Listing stats --
  const activeListings = listings.filter((l) => l.status === 'ACTIVE').length;
  const soldListings = listings.filter((l) => l.status === 'SOLD').length;
  const expiredListings = listings.filter((l) => l.status === 'EXPIRED').length;

  // -- Transaction stats --
  const completedSales = sales.filter((s) => s.status === 'COMPLETED');
  const completedPurchases = purchases.filter((p) => p.status === 'COMPLETED');
  const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.seller_net_amount || 0), 0);
  const totalSpent = completedPurchases.reduce((sum, p) => sum + Number(p.agreed_price || 0), 0);

  // -- Monthly volume (last 12 months) --
  const monthKeys = getLast12MonthKeys();
  const monthlyMap: Record<string, { revenue: number; spent: number; salesCount: number; purchasesCount: number }> = {};
  monthKeys.forEach((k) => {
    monthlyMap[k] = { revenue: 0, spent: 0, salesCount: 0, purchasesCount: 0 };
  });

  sales.forEach((s) => {
    const key = getMonthKey(new Date(s.created_at));
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += Number(s.seller_net_amount || 0);
      if (s.status === 'COMPLETED') monthlyMap[key].salesCount++;
    }
  });

  purchases.forEach((p) => {
    const key = getMonthKey(new Date(p.created_at));
    if (monthlyMap[key]) {
      monthlyMap[key].spent += Number(p.agreed_price || 0);
      if (p.status === 'COMPLETED') monthlyMap[key].purchasesCount++;
    }
  });

  const monthlyVolume = monthKeys.map((key) => ({
    month: key,
    label: getMonthLabel(key),
    revenue: monthlyMap[key].revenue,
    spent: monthlyMap[key].spent,
    sales: monthlyMap[key].salesCount,
    purchases: monthlyMap[key].purchasesCount,
  }));

  // -- Top categories --
  const categoryCounts: Record<string, number> = {};
  // From listings
  listings.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });
  // From purchases
  purchases.forEach((p) => {
    const cat = (p.listing as { category?: string } | null)?.category;
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const totalCatCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const topCategories: CategoryData[] = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat] || cat,
      count,
      percentage: totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0,
      color: CATEGORY_COLORS[cat] || '#737373',
    }));

  // -- Conversion rate --
  const totalViews = viewsData.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const totalTransactions = completedSales.length + completedPurchases.length;
  const conversionRate = totalViews > 0 ? (totalTransactions / totalViews) * 100 : 0;

  // -- Average response time to offers --
  const respondedOffers = offers.filter((o) => o.responded_at);
  let avgResponseTimeHours = 0;
  if (respondedOffers.length > 0) {
    const totalMs = respondedOffers.reduce((sum, o) => {
      return sum + (new Date(o.responded_at!).getTime() - new Date(o.created_at).getTime());
    }, 0);
    avgResponseTimeHours = Math.round(totalMs / respondedOffers.length / (1000 * 60 * 60));
  }

  // -- Trends vs previous month --
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const prevMonthKey = monthKeys[monthKeys.length - 2];
  const currentMonth = monthlyMap[currentMonthKey] || { revenue: 0, salesCount: 0 };
  const prevMonth = monthlyMap[prevMonthKey] || { revenue: 0, salesCount: 0 };

  // -- Funnel data --
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favorite_count || 0), 0);
  const totalOffers = offers.length;
  const funnel = [
    { step: 'Visualizacoes', count: totalViews },
    { step: 'Favoritos', count: totalFavorites },
    { step: 'Ofertas', count: totalOffers },
    { step: 'Transacoes', count: sales.length + purchases.length },
    { step: 'Concluidas', count: completedSales.length + completedPurchases.length },
  ];

  return {
    type: 'user' as const,
    listings: {
      total: listings.length,
      active: activeListings,
      sold: soldListings,
      expired: expiredListings,
    },
    transactions: {
      asBuyer: purchases.length,
      asSeller: sales.length,
      completedSales: completedSales.length,
      completedPurchases: completedPurchases.length,
    },
    financial: {
      totalRevenue,
      totalSpent,
    },
    monthlyVolume,
    topCategories,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgResponseTimeHours,
    funnel,
    trends: {
      revenue: calculateTrend(currentMonth.revenue, prevMonth.revenue),
      sales: calculateTrend(currentMonth.salesCount, prevMonth.salesCount),
    },
  };
}

// ---------------------------------------------------------------------------
// Admin Analytics (platform-wide)
// ---------------------------------------------------------------------------
async function getAdminAnalytics() {
  const adminClient = createAdminClient();
  const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const [
    transactionsResult,
    usersResult,
    listingsResult,
    disputesResult,
    recentUsersResult,
  ] = await Promise.all([
    // All transactions
    adminClient
      .from('transactions')
      .select('id, agreed_price, platform_fee, status, created_at, listing:listings!listing_id(category, venue_city, venue_state)'),
    // Total users
    adminClient
      .from('profiles')
      .select('id, created_at', { count: 'exact' }),
    // Active listings
    adminClient
      .from('listings')
      .select('id, category, status, view_count, favorite_count'),
    // Disputes
    adminClient
      .from('disputes')
      .select('id, status', { count: 'exact' }),
    // User growth data (all users with creation dates)
    adminClient
      .from('profiles')
      .select('created_at')
      .gte('created_at', twelveMonthsAgo),
  ]);

  const transactions = transactionsResult.data || [];
  const users = usersResult.data || [];
  const allListings = listingsResult.data || [];
  const disputes = disputesResult.data || [];
  const recentUsers = recentUsersResult.data || [];

  // -- GMV & Revenue --
  const completedTx = transactions.filter((t) => t.status === 'COMPLETED');
  const totalGmv = completedTx.reduce((sum, t) => sum + Number(t.agreed_price || 0), 0);
  const totalRevenue = completedTx.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0);

  // -- Monthly data --
  const monthKeys = getLast12MonthKeys();
  const monthlyMap: Record<string, MonthlyData> = {};
  monthKeys.forEach((k) => {
    monthlyMap[k] = { month: k, label: getMonthLabel(k), gmv: 0, revenue: 0, transactions: 0 };
  });

  transactions.forEach((t) => {
    const key = getMonthKey(new Date(t.created_at));
    if (monthlyMap[key]) {
      if (t.status === 'COMPLETED') {
        monthlyMap[key].gmv += Number(t.agreed_price || 0);
        monthlyMap[key].revenue += Number(t.platform_fee || 0);
      }
      monthlyMap[key].transactions++;
    }
  });

  const monthlyData = monthKeys.map((k) => monthlyMap[k]);

  // -- User growth --
  const userGrowthMap: Record<string, number> = {};
  monthKeys.forEach((k) => {
    userGrowthMap[k] = 0;
  });
  recentUsers.forEach((u) => {
    const key = getMonthKey(new Date(u.created_at));
    if (userGrowthMap[key] !== undefined) {
      userGrowthMap[key]++;
    }
  });
  const userGrowth = monthKeys.map((k) => ({
    month: k,
    label: getMonthLabel(k),
    newUsers: userGrowthMap[k],
  }));

  // -- Transaction volume by status --
  const statusCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  // -- Top cities --
  const cityMap: Record<string, { transactions: number; gmv: number; state: string }> = {};
  completedTx.forEach((t) => {
    const listing = t.listing as { venue_city?: string; venue_state?: string } | null;
    if (listing?.venue_city) {
      const city = listing.venue_city;
      if (!cityMap[city]) {
        cityMap[city] = { transactions: 0, gmv: 0, state: listing.venue_state || '' };
      }
      cityMap[city].transactions++;
      cityMap[city].gmv += Number(t.agreed_price || 0);
    }
  });

  const topCities: CityData[] = Object.entries(cityMap)
    .sort(([, a], [, b]) => b.transactions - a.transactions)
    .slice(0, 10)
    .map(([city, data]) => ({
      city,
      state: data.state,
      transactions: data.transactions,
      gmv: data.gmv,
    }));

  // -- Category distribution --
  const categoryCounts: Record<string, number> = {};
  allListings.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  const totalCatCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const categoryDistribution: CategoryData[] = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat] || cat,
      count,
      percentage: totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0,
      color: CATEGORY_COLORS[cat] || '#737373',
    }));

  // -- Average transaction value --
  const avgTransactionValue = completedTx.length > 0
    ? totalGmv / completedTx.length
    : 0;

  // -- Active listings count --
  const activeListingsCount = allListings.filter((l) => l.status === 'ACTIVE').length;

  // -- Dispute rate --
  const openDisputes = disputes.filter((d) => d.status === 'OPEN').length;
  const totalDisputeCount = disputesResult.count || 0;
  const disputeRate = transactions.length > 0
    ? (totalDisputeCount / transactions.length) * 100
    : 0;

  // -- Funnel (platform-wide) --
  const totalViews = allListings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const totalFavorites = allListings.reduce((sum, l) => sum + (l.favorite_count || 0), 0);

  const funnel = [
    { step: 'Visualizacoes', count: totalViews },
    { step: 'Favoritos', count: totalFavorites },
    { step: 'Transacoes Iniciadas', count: transactions.length },
    { step: 'Pagamentos Confirmados', count: transactions.filter((t) => ['PAYMENT_CONFIRMED', 'ESCROW_HELD', 'TRANSFER_PENDING', 'COMPLETED'].includes(t.status)).length },
    { step: 'Concluidas', count: completedTx.length },
  ];

  // -- Trends --
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const prevMonthKey = monthKeys[monthKeys.length - 2];
  const currentMonth = monthlyMap[currentMonthKey];
  const prevMonth = monthlyMap[prevMonthKey];

  return {
    type: 'admin' as const,
    gmv: {
      total: totalGmv,
      monthly: monthlyData,
    },
    revenue: {
      total: totalRevenue,
      monthly: monthlyData,
    },
    users: {
      total: users.length,
      growth: userGrowth,
    },
    transactions: {
      total: transactions.length,
      completed: completedTx.length,
      byStatus: statusCounts,
    },
    topCities,
    categoryDistribution,
    avgTransactionValue: Math.round(avgTransactionValue),
    activeListings: activeListingsCount,
    disputes: {
      total: totalDisputeCount,
      open: openDisputes,
      rate: Math.round(disputeRate * 100) / 100,
    },
    funnel,
    trends: {
      gmv: calculateTrend(currentMonth?.gmv || 0, prevMonth?.gmv || 0),
      revenue: calculateTrend(currentMonth?.revenue || 0, prevMonth?.revenue || 0),
      transactions: calculateTrend(currentMonth?.transactions || 0, prevMonth?.transactions || 0),
      users: calculateTrend(
        userGrowthMap[currentMonthKey] || 0,
        userGrowthMap[prevMonthKey] || 0
      ),
    },
  };
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get('role');

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Autenticacao necessaria' },
        { status: 401 }
      );
    }

    // If admin role requested, verify admin status
    if (requestedRole === 'admin') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Acesso negado. Permissao de administrador necessaria.' },
          { status: 403 }
        );
      }

      const data = await getAdminAnalytics();
      return NextResponse.json({ data }, {
        headers: {
          'Cache-Control': 'private, s-maxage=600, stale-while-revalidate=300',
        },
      });
    }

    // Default: return user analytics
    const data = await getUserAnalytics(user.id);
    return NextResponse.json({ data }, {
      headers: {
        'Cache-Control': 'private, s-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados de analytics' },
      { status: 500 }
    );
  }
}
