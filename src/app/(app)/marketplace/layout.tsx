import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace de Reservas de Eventos | Compre e Venda | EventSwap',
  description:
    'Explore reservas de casamento, buffet, salão de festa, fotógrafo, DJ e decoração com até 70% de desconto. Transferência segura com escrow. Marketplace #1 do Brasil.',
  keywords: [
    'marketplace reservas de eventos',
    'comprar reserva de casamento',
    'vender reserva de buffet',
    'transferência de reserva com desconto',
  ],
  openGraph: {
    title: 'Marketplace de Reservas de Eventos | EventSwap',
    description:
      'Encontre reservas de casamento, buffet e muito mais com até 70% de desconto.',
    url: 'https://eventswap.com.br/marketplace',
    images: ['/api/og?title=Marketplace+de+Reservas&description=Compre+e+venda+com+segurança&type=marketplace'],
  },
  alternates: {
    canonical: 'https://eventswap.com.br/marketplace',
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
