// =============================================================================
// JSON-LD Structured Data Components for EventSwap SEO
// Server Components - no 'use client' directive
// Schema.org markup for rich Google snippets
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListingData {
  title: string;
  description: string;
  asking_price: number;
  original_price: number;
  images: string[];
  venue_city: string;
  venue_state: string;
  category: string;
  slug: string;
  created_at: string;
  status: string;
  seller?: {
    name: string;
    rating_avg: number;
    review_count: number;
  };
}

interface SellerData {
  name: string;
  rating_avg: number;
  review_count: number;
  slug?: string;
  avatar_url?: string | null;
}

// ---------------------------------------------------------------------------
// Helper: renders a <script type="application/ld+json"> tag
// ---------------------------------------------------------------------------

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

// ---------------------------------------------------------------------------
// Organization Schema
// Company-level structured data shown on the homepage / all pages
// ---------------------------------------------------------------------------

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EventSwap',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'EventSwap - O marketplace de reservas de eventos. Compre e venda reservas de casamentos, buffets, espaços, fotografia e mais com pagamento protegido por escrow.',
    foundingDate: '2025',
    sameAs: [
      'https://www.instagram.com/eventswap',
      'https://www.facebook.com/eventswap',
      'https://www.linkedin.com/company/eventswap',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+55-48-99142-0313',
        contactType: 'customer service',
        availableLanguage: ['Portuguese'],
        areaServed: 'BR',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
    },
  };

  return <JsonLdScript data={data} />;
}

// ---------------------------------------------------------------------------
// Product / Listing Schema
// Individual listing page structured data for rich search results
// ---------------------------------------------------------------------------

export function ListingJsonLd({ listing }: { listing: ListingData }) {
  const discount = listing.original_price > 0
    ? Math.round(((listing.original_price - listing.asking_price) / listing.original_price) * 100)
    : 0;

  const availability =
    listing.status === 'ACTIVE' || listing.status === 'active'
      ? 'https://schema.org/InStock'
      : listing.status === 'RESERVED' || listing.status === 'reserved'
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/SoldOut';

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description || `Reserva de evento disponível em ${listing.venue_city}, ${listing.venue_state}. Economize até ${discount}% do valor original.`,
    url: `${BASE_URL}/marketplace/${listing.slug}`,
    image: listing.images.length > 0 ? listing.images : [`${BASE_URL}/og-image.png`],
    category: listing.category,
    brand: {
      '@type': 'Organization',
      name: 'EventSwap',
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/marketplace/${listing.slug}`,
      priceCurrency: 'BRL',
      price: listing.asking_price.toFixed(2),
      availability,
      itemCondition: 'https://schema.org/UsedCondition',
      seller: listing.seller
        ? {
            '@type': 'Person',
            name: listing.seller.name,
          }
        : undefined,
      priceValidUntil: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0],
    },
    datePublished: listing.created_at,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Cidade',
        value: listing.venue_city,
      },
      {
        '@type': 'PropertyValue',
        name: 'Estado',
        value: listing.venue_state,
      },
      {
        '@type': 'PropertyValue',
        name: 'Valor Original',
        value: `R$ ${listing.original_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
      ...(discount > 0
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Desconto',
              value: `${discount}%`,
            },
          ]
        : []),
    ],
  };

  // Add aggregate rating from seller if available
  if (listing.seller && listing.seller.review_count > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: listing.seller.rating_avg.toFixed(1),
      reviewCount: listing.seller.review_count,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return <JsonLdScript data={data} />;
}

// ---------------------------------------------------------------------------
// FAQ Schema
// FAQ page or section structured data for rich FAQ snippets in search
// ---------------------------------------------------------------------------

export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLdScript data={data} />;
}

// ---------------------------------------------------------------------------
// BreadcrumbList Schema
// Breadcrumb navigation structured data for search result breadcrumbs
// ---------------------------------------------------------------------------

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <JsonLdScript data={data} />;
}

// ---------------------------------------------------------------------------
// AggregateRating Schema for Seller Profiles
// Seller rating structured data for seller profile pages
// ---------------------------------------------------------------------------

export function SellerRatingJsonLd({ seller }: { seller: SellerData }) {
  if (seller.review_count === 0) {
    return null;
  }

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${seller.name} - Vendedor EventSwap`,
    url: seller.slug
      ? `${BASE_URL}/vendedor/${seller.slug}`
      : BASE_URL,
    image: seller.avatar_url || `${BASE_URL}/logo.png`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: seller.rating_avg.toFixed(1),
      reviewCount: seller.review_count,
      bestRating: '5',
      worstRating: '1',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'EventSwap',
      url: BASE_URL,
    },
  };

  return <JsonLdScript data={data} />;
}

// ---------------------------------------------------------------------------
// WebSite Schema with SearchAction
// Enables sitelinks search box in Google results
// ---------------------------------------------------------------------------

export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EventSwap',
    url: BASE_URL,
    description:
      'Marketplace de reservas de eventos. Compre e venda reservas de casamentos, buffets e mais.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/marketplace?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLdScript data={data} />;
}
