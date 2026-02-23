import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar',
  description:
    'Faca login na sua conta EventSwap para comprar, vender e transferir reservas de eventos com seguranca.',
  openGraph: {
    title: 'Entrar | EventSwap',
    description:
      'Faca login na sua conta EventSwap para comprar, vender e transferir reservas de eventos com seguranca.',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
