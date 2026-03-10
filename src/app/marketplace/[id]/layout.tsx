import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ListingJsonLd } from './listing-json-ld';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  // Try by slug first, then by numeric id
  let listing;
  const { data: bySlug } = await supabase
    .from('listings')
    .select('id, title, description, asking_price, original_price, category, event_date, venue_city, venue_state, images, slug, seller:profiles!seller_id(name)')
    .eq('slug', id)
    .maybeSingle();

  if (bySlug) {
    listing = bySlug;
  } else {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      const { data: byId } = await supabase
        .from('listings')
        .select('id, title, description, asking_price, original_price, category, event_date, venue_city, venue_state, images, slug, seller:profiles!seller_id(name)')
        .eq('id', numId)
        .maybeSingle();
      listing = byId;
    }
  }

  if (!listing) {
    return {
      title: 'Anúncio não encontrado | EventSwap',
      description: 'Este anúncio não está mais disponível no EventSwap.',
    };
  }

  const discount = listing.original_price > 0
    ? Math.round(((listing.original_price - listing.asking_price) / listing.original_price) * 100)
    : 0;

  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(listing.asking_price);
  const location = [listing.venue_city, listing.venue_state].filter(Boolean).join(', ');

  const title = `${listing.title} - ${priceFormatted}${discount > 0 ? ` (${discount}% OFF)` : ''} | EventSwap`;
  const description = `${listing.title} em ${location}. ${priceFormatted}${discount > 0 ? ` com ${discount}% de desconto` : ''}. Transferência segura com escrow no EventSwap.${listing.description ? ' ' + listing.description.slice(0, 120) + '...' : ''}`;

  const ogImage = listing.images?.[0] || `${BASE_URL}/api/og?title=${encodeURIComponent(listing.title)}&description=${encodeURIComponent(priceFormatted + ' - ' + location)}`;
  const canonicalSlug = listing.slug || listing.id;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/marketplace/${canonicalSlug}`,
    },
    openGraph: {
      type: 'website',
      title: listing.title,
      description,
      url: `${BASE_URL}/marketplace/${canonicalSlug}`,
      siteName: 'EventSwap',
      images: [{ url: ogImage, width: 1200, height: 630, alt: listing.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ListingLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  return (
    <>
      {children}
      <ListingJsonLd id={id} />
    </>
  );
}
