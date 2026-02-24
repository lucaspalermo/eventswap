import type { Metadata } from 'next';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/json-ld';
import { LandingPageClient } from '@/components/landing/landing-page-client';

// =============================================================================
// Metadata (Server)
// =============================================================================

export const metadata: Metadata = {
  title:
    'EventSwap - Compre e Venda Reservas de Eventos com Seguranca | Marketplace #1 do Brasil',
  description:
    'Desistiu do casamento ou buffet? Nao perca dinheiro! No EventSwap voce transfere sua reserva para outra pessoa com total seguranca. Casamentos, buffets, saloes de festa, fotografos e muito mais. Economize ate 70% comprando reservas.',
  alternates: {
    canonical: 'https://eventswap.com.br',
  },
};

// =============================================================================
// Page Component (Server)
// =============================================================================

export default function HomePage() {
  return (
    <>
      {/* Structured Data (Server-rendered) */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* Full interactive landing page */}
      <LandingPageClient />
    </>
  );
}
