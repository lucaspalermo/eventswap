import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePricingSuggestion, type MarketData } from '@/lib/pricing-ai';

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
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido' },
      { status: 400 }
    );
  }

  const { category, event_date, venue_city, original_price, has_original_contract } = body;

  // Validate required fields
  if (!category || !event_date || !venue_city || !original_price) {
    return NextResponse.json(
      {
        error: 'Campos obrigatorios faltando',
        missing_fields: [
          !category && 'category',
          !event_date && 'event_date',
          !venue_city && 'venue_city',
          !original_price && 'original_price',
        ].filter(Boolean),
      },
      { status: 400 }
    );
  }

  const originalPriceNum = Number(original_price);
  if (isNaN(originalPriceNum) || originalPriceNum <= 0) {
    return NextResponse.json(
      { error: 'Preco original invalido' },
      { status: 400 }
    );
  }

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
