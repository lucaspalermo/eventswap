import { createClient } from '@/lib/supabase/server';

export async function ListingJsonLd({ id }: { id: string }) {
  const supabase = await createClient();

  const isNumeric = /^\d+$/.test(id);
  const query = supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(name, rating_avg, rating_count)')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? Number(id) : id)
    .single();

  const { data: listing } = await query;
  if (!listing) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description?.slice(0, 500) || `Reserva de evento: ${listing.title}`,
    image: listing.images?.[0] || `${baseUrl}/api/og?title=${encodeURIComponent(listing.title)}`,
    url: `${baseUrl}/marketplace/${listing.slug || listing.id}`,
    sku: `ES-${listing.id}`,
    brand: {
      '@type': 'Organization',
      name: 'EventSwap',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/marketplace/${listing.slug || listing.id}`,
      priceCurrency: 'BRL',
      price: listing.asking_price,
      priceValidUntil: listing.event_date,
      availability:
        listing.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Person',
        name: listing.seller?.name || 'Vendedor EventSwap',
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Preco Original',
        value: `R$ ${listing.original_price}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Local',
        value: `${listing.venue_name}, ${listing.venue_city}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Data do Evento',
        value: listing.event_date,
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: `${baseUrl}/marketplace`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.title,
        item: `${baseUrl}/marketplace/${listing.slug || listing.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
