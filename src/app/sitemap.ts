import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { EVENT_CATEGORIES } from '@/lib/constants';

// =============================================================================
// Dynamic Sitemap Generator for EventSwap
// Next.js 14 convention: export default async function sitemap()
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---------------------------------------------------------------------------
  // 1. Static Pages
  // ---------------------------------------------------------------------------

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/como-funciona`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/planos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/vender-reserva`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/comprar-reserva`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/suporte`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Blog
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/como-transferir-reserva-de-casamento`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/cancelar-buffet-sem-multa`,
      lastModified: new Date('2026-01-22'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/transferencia-de-contrato-de-evento-e-legal`,
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/como-economizar-comprando-reservas-de-eventos`,
      lastModified: new Date('2026-02-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/o-que-fazer-quando-desiste-do-casamento`,
      lastModified: new Date('2026-02-14'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/guia-completo-escrow-pagamento-protegido`,
      lastModified: new Date('2026-02-20'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/transferencia-de-reserva-de-casamento-sao-paulo`,
      lastModified: new Date('2026-03-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/quanto-custa-cancelar-reserva-de-buffet`,
      lastModified: new Date('2026-03-03'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/transferencia-vs-cancelamento-de-evento`,
      lastModified: new Date('2026-03-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/como-vender-reserva-de-fotografo`,
      lastModified: new Date('2026-03-07'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/comprar-reserva-de-salao-de-festa-barato`,
      lastModified: new Date('2026-03-09'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/direitos-consumidor-transferencia-evento`,
      lastModified: new Date('2026-03-11'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/como-transferir-contrato-de-buffet`,
      lastModified: new Date('2026-03-14'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/melhores-datas-vender-reserva-casamento`,
      lastModified: new Date('2026-03-17'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/checklist-transferencia-segura-reserva`,
      lastModified: new Date('2026-03-20'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/como-escolher-reserva-de-evento-usada`,
      lastModified: new Date('2026-03-11'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/erros-comuns-ao-vender-reserva-de-evento`,
      lastModified: new Date('2026-03-13'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/fornecedor-recusou-transferencia-o-que-fazer`,
      lastModified: new Date('2026-03-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Auth / Legal
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // ---------------------------------------------------------------------------
  // 2. Category Pages
  //    /marketplace?category=WEDDING_VENUE, /categorias/casamento, etc.
  // ---------------------------------------------------------------------------

  const categoryPages: MetadataRoute.Sitemap = EVENT_CATEGORIES
    .filter((cat) => cat.id !== 'outro')
    .map((cat) => ({
      url: `${BASE_URL}/categorias/${cat.id}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

  // ---------------------------------------------------------------------------
  // 3. City Landing Pages
  //    /cidades/sao-paulo, /cidades/rio-de-janeiro, etc.
  // ---------------------------------------------------------------------------

  const cityLandingPages: MetadataRoute.Sitemap = [
    'sao-paulo', 'rio-de-janeiro', 'belo-horizonte', 'curitiba', 'porto-alegre',
    'brasilia', 'salvador', 'recife', 'fortaleza', 'florianopolis', 'goiania', 'campinas'
  ].map(slug => ({
    url: `${BASE_URL}/cidades/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // ---------------------------------------------------------------------------
  // 4. Dynamic: Active Listings from Supabase
  //    /marketplace/[slug]
  // ---------------------------------------------------------------------------

  let listingPages: MetadataRoute.Sitemap = [];
  let cityPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    // Fetch all active listings (slug + updated_at + city for city pages)
    const { data: listings } = await supabase
      .from('listings')
      .select('id, slug, updated_at, venue_city')
      .eq('status', 'ACTIVE')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (listings) {
      // Individual listing pages
      listingPages = listings.map((listing) => ({
        url: `${BASE_URL}/marketplace/${listing.slug || listing.id}`,
        lastModified: new Date(listing.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      // -----------------------------------------------------------------------
      // 4. City Pages
      //    Extract unique cities from active listings
      //    /marketplace?city=São Paulo, /marketplace?city=Rio de Janeiro, etc.
      // -----------------------------------------------------------------------

      const uniqueCities = Array.from(
        new Set(
          listings
            .map((l) => l.venue_city)
            .filter((city): city is string => Boolean(city && city.trim()))
        )
      );

      cityPages = uniqueCities.map((city) => ({
        url: `${BASE_URL}/marketplace?city=${encodeURIComponent(city)}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Silently fail - static pages and categories still work
  }

  return [...staticPages, ...categoryPages, ...cityLandingPages, ...listingPages, ...cityPages];
}
