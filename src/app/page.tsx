import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Above the fold — static imports (critical path)
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";

export const metadata: Metadata = {
  title:
    "EventSwap - Compre e Venda Reservas de Eventos com Segurança | Marketplace #1 do Brasil",
  description:
    "Desistiu do casamento ou buffet? Não perca dinheiro! No EventSwap você transfere sua reserva para outra pessoa com total segurança. Casamentos, buffets, salões de festa, fotógrafos e muito mais. Economize até 70% comprando reservas.",
  alternates: {
    canonical: "https://eventswap.com.br",
  },
};

// Below the fold — lazy loaded for better initial load performance
const SocialProof = dynamic(
  () =>
    import("@/components/landing/social-proof").then((m) => ({
      default: m.SocialProof,
    })),
  { ssr: true }
);
const FeaturesSection = dynamic(
  () =>
    import("@/components/landing/features-section").then((m) => ({
      default: m.FeaturesSection,
    })),
  { ssr: true }
);
const MarketplacePreview = dynamic(
  () =>
    import("@/components/landing/marketplace-preview").then((m) => ({
      default: m.MarketplacePreview,
    })),
  { ssr: true }
);
const HowItWorks = dynamic(
  () =>
    import("@/components/landing/how-it-works").then((m) => ({
      default: m.HowItWorks,
    })),
  { ssr: true }
);
const Testimonials = dynamic(
  () =>
    import("@/components/landing/testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  { ssr: true }
);
const CTASection = dynamic(
  () =>
    import("@/components/landing/cta-section").then((m) => ({
      default: m.CTASection,
    })),
  { ssr: true }
);
const LandingFooter = dynamic(
  () =>
    import("@/components/landing/landing-footer").then((m) => ({
      default: m.LandingFooter,
    })),
  { ssr: true }
);

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <MarketplacePreview />
        <SocialProof />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  );
}
