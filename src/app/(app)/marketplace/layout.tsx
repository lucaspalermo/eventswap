import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Encontre reservas de eventos com precos imperdveis. Casamentos, buffets, espacos, fotografia e muito mais no EventSwap.',
  openGraph: {
    title: 'Marketplace | EventSwap',
    description:
      'Encontre reservas de eventos com precos imperdveis. Casamentos, buffets, espacos, fotografia e muito mais.',
    images: [{
      url: '/api/og?title=Marketplace&description=Encontre%20reservas%20de%20eventos%20com%20precos%20imperdveis',
      width: 1200,
      height: 630,
    }],
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
