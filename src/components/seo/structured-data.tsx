// ============================================================================
// Advanced Structured Data (JSON-LD) Components for SEO
// Server components — no 'use client' directive
// ============================================================================

// ---------------------------------------------------------------------------
// Product Schema — for listing detail pages
// ---------------------------------------------------------------------------

interface ProductSchemaProps {
  name: string;
  description: string;
  price: number;
  image: string;
  seller: {
    name: string;
    rating?: number;
    ratingCount?: number;
  };
  rating?: number;
  ratingCount?: number;
  url: string;
  originalPrice?: number;
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
  currency?: string;
  sku?: string;
  eventDate?: string;
  category?: string;
  venueName?: string;
  venueCity?: string;
}

export function ProductSchema({
  name,
  description,
  price,
  image,
  seller,
  rating,
  ratingCount,
  url,
  originalPrice,
  availability = 'InStock',
  currency = 'BRL',
  sku,
  eventDate,
  category,
  venueName,
  venueCity,
}: ProductSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description.slice(0, 500),
    image,
    url,
    brand: {
      '@type': 'Organization',
      name: 'EventSwap',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price,
      priceValidUntil: eventDate || undefined,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Person',
        name: seller.name,
      },
    },
  };

  if (sku) {
    schema.sku = sku;
  }

  if (category) {
    schema.category = category;
  }

  if (rating && ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (originalPrice && originalPrice > price) {
    (schema.offers as Record<string, unknown>).priceSpecification = {
      '@type': 'PriceSpecification',
      price,
      priceCurrency: currency,
      valueAddedTaxIncluded: true,
    };
  }

  const additionalProperties: Record<string, unknown>[] = [];
  if (originalPrice) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Preco Original',
      value: `R$ ${originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    });
  }
  if (venueName && venueCity) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Local',
      value: `${venueName}, ${venueCity}`,
    });
  }
  if (eventDate) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Data do Evento',
      value: eventDate,
    });
  }
  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemList Schema — for marketplace / category pages
// ---------------------------------------------------------------------------

interface ItemListItem {
  name: string;
  url: string;
  price?: number;
  image?: string;
  position?: number;
}

interface ItemListSchemaProps {
  items: ItemListItem[];
  name?: string;
  description?: string;
  url?: string;
}

export function ItemListSchema({
  items,
  name,
  description,
  url,
}: ItemListSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        '@type': 'ListItem',
        position: item.position ?? index + 1,
        name: item.name,
        url: item.url,
      };

      if (item.image) {
        listItem.image = item.image;
      }

      if (item.price !== undefined) {
        listItem.item = {
          '@type': 'Product',
          name: item.name,
          url: item.url,
          image: item.image,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: item.price,
            availability: 'https://schema.org/InStock',
          },
        };
      }

      return listItem;
    }),
  };

  if (name) {
    schema.name = name;
  }
  if (description) {
    schema.description = description;
  }
  if (url) {
    schema.url = url;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// FAQ Schema — for FAQ sections
// ---------------------------------------------------------------------------

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  questions: FAQItem[];
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  if (questions.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// BreadcrumbList Schema — for breadcrumbs
// ---------------------------------------------------------------------------

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ---------------------------------------------------------------------------
// LocalBusiness Schema — for vendor profiles
// ---------------------------------------------------------------------------

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  address?: {
    city: string;
    state?: string;
    country?: string;
  };
  rating?: number;
  ratingCount?: number;
  priceRange?: string;
  telephone?: string;
  email?: string;
  openingHours?: string[];
  sameAs?: string[];
  category?: string;
}

export function LocalBusinessSchema({
  name,
  description,
  url,
  image,
  address,
  rating,
  ratingCount,
  priceRange,
  telephone,
  email,
  openingHours,
  sameAs,
  category,
}: LocalBusinessSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
  };

  if (image) {
    schema.image = image;
  }

  if (address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: address.city,
      addressRegion: address.state || undefined,
      addressCountry: address.country || 'BR',
    };
  }

  if (rating && ratingCount && ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (priceRange) {
    schema.priceRange = priceRange;
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  if (email) {
    schema.email = email;
  }

  if (openingHours && openingHours.length > 0) {
    schema.openingHours = openingHours;
  }

  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (category) {
    schema.additionalType = category;
  }

  // Mark it as part of EventSwap marketplace
  schema.isPartOf = {
    '@type': 'WebSite',
    name: 'EventSwap',
    url: 'https://eventswap.com.br',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
