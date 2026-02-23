import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar Conta',
  description:
    'Crie sua conta no EventSwap e comece a comprar e vender reservas de eventos com seguranca e intermediacao protegida.',
  openGraph: {
    title: 'Criar Conta | EventSwap',
    description:
      'Crie sua conta no EventSwap e comece a comprar e vender reservas de eventos com seguranca.',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
