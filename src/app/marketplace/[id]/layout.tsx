import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ListingJsonLd } from './listing-json-ld';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com';

  try {
    const supabase = await createClient();
    const isNumericId = /^\d+$/.test(slugOrId);

    const selectFields = 'title, description, venue_city, venue_state, asking_price, images, slug';

    const { data: listing } = isNumericId
      ? await supabase.from('listings').select(selectFields).eq('id', Number(slugOrId)).single()
      : await supabase.from('listings').select(selectFields).eq('slug', slugOrId).single();

    if (!listing) {
      return {
        title: 'Anuncio nao encontrado',
        description: 'O anuncio que voce procura nao existe ou foi removido.',
      };
    }

    const title = listing.title.length > 50
      ? listing.title.slice(0, 47) + '...'
      : listing.title;

    const description = listing.description
      ? listing.description.slice(0, 155) + (listing.description.length > 155 ? '...' : '')
      : `Reserva disponivel em ${listing.venue_city}${listing.venue_state ? ', ' + listing.venue_state : ''}`;

    const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
      title: listing.title,
      description: `${listing.venue_city}${listing.venue_state ? ', ' + listing.venue_state : ''} - R$ ${listing.asking_price.toLocaleString('pt-BR')}`,
      type: 'listing',
    }).toString()}`;

    const listingImages = listing.images && listing.images.length > 0
      ? listing.images.map((img: string) => ({ url: img, alt: listing.title }))
      : [{ url: ogImageUrl, width: 1200, height: 630, alt: listing.title }];

    return {
      title,
      description,
      alternates: {
        canonical: `${baseUrl}/marketplace/${listing.slug || slugOrId}`,
      },
      openGraph: {
        title: listing.title,
        description,
        type: 'article',
        images: listingImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description,
        images: listing.images && listing.images.length > 0
          ? [listing.images[0]]
          : [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'Reserva de Evento',
      description: 'Veja os detalhes desta reserva de evento no EventSwap.',
      openGraph: {
        title: 'Reserva de Evento | EventSwap',
        description: 'Veja os detalhes desta reserva de evento no EventSwap.',
        images: [{
          url: `${baseUrl}/api/og?title=Reserva%20de%20Evento&type=listing`,
          width: 1200,
          height: 630,
        }],
      },
    };
  }
}

export default async function ListingDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  return (
    <>
      {children}
      <ListingJsonLd id={id} />
    </>
  );
}
