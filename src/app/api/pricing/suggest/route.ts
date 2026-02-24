import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePricingSuggestion, type MarketData } from '@/lib/pricing-ai';
import { pricingSuggestSchema, validateBody } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Pricing Suggestion API
// POST - Get AI-powered pricing suggestion based on market data
// ---------------------------------------------------------------------------

// Map UI category IDs to database enum values
const UI_TO_DB_CATEGORY: Record<string, string> = {
  casamento: 'WEDDING_VENUE',
  buffet: 'BUFFET',
  espaco: 'PARTY_VENUE',
  fotografia: 'PHOTOGRAPHER',
  musica: 'DJ_BAND',
  decoracao: 'DECORATION',
  video: 'VIDEOGRAPHER',
  convite: 'OTHER',
  'vestido-noiva': 'WEDDING_DRESS',
  'festa-infantil': 'PARTY_VENUE',
  corporativo: 'OTHER',
  outro: 'OTHER',
};

export async function POST(req: NextRequest) {
  // Check authentication
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Autenticacao necessaria' },
      { status: 401 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 });
  }

  const validation = validateBody(pricingSuggestSchema, rawBody);
  if (!validation.success) {
    return validation.response;
  }

  const { category, event_date, venue_city, original_price, has_original_contract } = validation.data;
  const originalPriceNum = original_price;

  // Resolve category: could be UI ID or DB enum
  const dbCategory = UI_TO_DB_CATEGORY[String(category)] || String(category);

  try {
    const supabase = await createClient();

    // Fetch market data: active listings in the same category
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('asking_price, original_price, venue_city, category, event_date, has_original_contract')
      .eq('category', dbCategory)
      .in('status', ['ACTIVE', 'RESERVED', 'SOLD'])
      .limit(100);

    if (listingsError) {
      console.error('[Pricing API] Listings query error:', listingsError);
    }

    // Fetch completed transactions in the same category
    const { data: transactionsRaw, error: txError } = await supabase
      .from('transactions')
      .select('agreed_price, listing:listings!listing_id(category, venue_city)')
      .in('status', ['COMPLETED', 'ESCROW_HELD', 'TRANSFER_PENDING'])
      .limit(100);

    if (txError) {
      console.error('[Pricing API] Transactions query error:', txError);
    }

    // Process transactions data
    const transactions = (transactionsRaw || [])
      .filter((t: Record<string, unknown>) => {
        const listing = t.listing as Record<string, unknown> | null;
        return listing && listing.category === dbCategory;
      })
      .map((t: Record<string, unknown>) => {
        const listing = t.listing as Record<string, unknown>;
        return {
          agreed_price: Number(t.agreed_price),
          category: String(listing.category),
          venue_city: String(listing.venue_city || ''),
        };
      });

    const marketData: MarketData = {
      listings: (listings || []).map((l) => ({
        asking_price: Number(l.asking_price),
        original_price: Number(l.original_price),
        venue_city: String(l.venue_city),
        category: String(l.category),
        event_date: String(l.event_date),
        has_original_contract: Boolean(l.has_original_contract),
      })),
      transactions,
    };

    const suggestion = calculatePricingSuggestion(
      {
        category: dbCategory,
        eventDate: String(event_date),
        venueCity: String(venue_city),
        originalPrice: originalPriceNum,
        hasOriginalContract: Boolean(has_original_contract),
      },
      marketData
    );

    return NextResponse.json({ data: suggestion });
  } catch (error) {
    console.error('[Pricing API] Error:', error);

    // Fallback: calculate with empty market data
    const suggestion = calculatePricingSuggestion(
      {
        category: dbCategory,
        eventDate: String(event_date),
        venueCity: String(venue_city),
        originalPrice: originalPriceNum,
        hasOriginalContract: Boolean(has_original_contract),
      },
      { listings: [], transactions: [] }
    );

    return NextResponse.json({ data: suggestion });
  }
}
