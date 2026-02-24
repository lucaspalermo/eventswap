import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://eventswap.com.br"
  ),
  title: {
    default:
      "EventSwap - Marketplace de Transferência de Reservas de Eventos | Compre e Venda Reservas",
    template: "%s | EventSwap",
  },
  description:
    "Desistiu da reserva do seu evento? No EventSwap você vende ou compra reservas de casamento, buffet, salão de festa, fotógrafo e mais. Transferência segura com escrow, sem perder dinheiro. Marketplace #1 do Brasil para transferência de reservas de eventos.",
  keywords: [
    // Primary - High intent
    "transferência de reserva de evento",
    "vender reserva de casamento",
    "comprar reserva de buffet",
    "desistência de reserva de buffet",
    "transferir contrato de evento",
    "marketplace de eventos",
    // Secondary - Category specific
    "vender reserva de buffet",
    "transferir reserva de casamento",
    "comprar reserva de salão de festa",
    "vender contrato de fotógrafo",
    "transferir contrato de DJ",
    "desistência de contrato de casamento",
    "cancelar reserva de buffet sem multa",
    "vender reserva de decoração",
    "transferir reserva de videógrafo",
    // Long tail
    "como transferir reserva de casamento",
    "como vender reserva de buffet",
    "marketplace transferência de reserva",
    "plataforma para vender reserva de evento",
    "site para transferir contrato de casamento",
    "vender contrato de buffet usado",
    "comprar reserva de evento com desconto",
    "transferência segura de reserva de evento",
    "escrow para transferência de evento",
    // Location
    "transferir reserva evento São Paulo",
    "vender reserva casamento Rio de Janeiro",
    "marketplace eventos Brasil",
    // Problem-based
    "desisti do casamento o que fazer com a reserva",
    "cancelar buffet sem perder dinheiro",
    "como não perder dinheiro cancelando evento",
    "alternativa a cancelamento de reserva",
    "evitar multa cancelamento de buffet",
  ],
  authors: [{ name: "EventSwap", url: "https://eventswap.com.br" }],
  creator: "EventSwap",
  publisher: "EventSwap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://eventswap.com.br",
    siteName: "EventSwap",
    title: "EventSwap - Marketplace de Transferência de Reservas de Eventos",
    description:
      "Desistiu da reserva? Venda ou compre reservas de casamento, buffet, salão de festa e mais. Transferência segura com escrow. Economize até 70%.",
    images: [
      {
        url: "/api/og?title=EventSwap+-+Marketplace+de+Transferência+de+Reservas&description=Compre+e+venda+reservas+de+eventos+com+segurança",
        width: 1200,
        height: 630,
        alt: "EventSwap - Marketplace de Transferência de Reservas de Eventos",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EventSwap - Marketplace de Transferência de Reservas de Eventos",
    description:
      "Desistiu da reserva? Venda ou compre reservas de casamento, buffet e mais. Transferência segura com escrow.",
    images: [
      "/api/og?title=EventSwap&description=Marketplace+de+Transferência+de+Reservas",
    ],
    creator: "@eventswap",
    site: "@eventswap",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://eventswap.com.br",
    languages: {
      "pt-BR": "https://eventswap.com.br",
    },
  },
  category: "marketplace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EventSwap",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#6C3CE1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EventSwap",
    url: "https://eventswap.com.br",
    logo: "https://eventswap.com.br/images/logos/eventswap-logo.png",
    description:
      "Marketplace #1 do Brasil para transferência segura de reservas de eventos. Casamentos, buffets, salões de festa, fotógrafos e mais.",
    foundingDate: "2024",
    sameAs: [
      "https://instagram.com/eventswap",
      "https://facebook.com/eventswap",
      "https://twitter.com/eventswap",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "suporte@eventswap.com.br",
      contactType: "customer service",
      availableLanguage: "Portuguese",
    },
    areaServed: {
      "@type": "Country",
      name: "Brazil",
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EventSwap",
    url: "https://eventswap.com.br",
    description: "Marketplace de transferência de reservas de eventos",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://eventswap.com.br/marketplace?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Como transferir uma reserva de casamento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No EventSwap, você cria um anúncio com os detalhes da sua reserva (buffet, salão, fotógrafo, etc), define o preço desejado e aguarda compradores interessados. A transferência é feita com segurança via escrow - o pagamento fica retido até a transferência ser confirmada pelo fornecedor.",
        },
      },
      {
        "@type": "Question",
        name: "É seguro comprar uma reserva de evento no EventSwap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim! O EventSwap utiliza sistema de escrow (pagamento protegido). O valor pago fica retido na plataforma até que a transferência da reserva seja confirmada. Se houver qualquer problema, o comprador recebe o reembolso integral. Além disso, verificamos a identidade dos vendedores via KYC.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto custa anunciar no EventSwap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O plano Básico custa R$49,90 por anúncio e o plano Premium custa R$99,00 por anúncio (com 7 dias de destaque no marketplace). Em ambos os planos, há uma taxa de 10% sobre o valor da venda, cobrada apenas quando a transação é concluída com sucesso.",
        },
      },
      {
        "@type": "Question",
        name: "Posso transferir qualquer tipo de reserva de evento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim! O EventSwap aceita transferências de reservas de casamentos, buffets, salões de festa, fotógrafos, videógrafos, DJs e bandas, decoração, vestidos de noiva, festas infantis, eventos corporativos e mais. Qualquer reserva de evento pode ser anunciada.",
        },
      },
      {
        "@type": "Question",
        name: "Como evitar multa por cancelamento de buffet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Em vez de cancelar sua reserva e pagar multas que podem chegar a 50% do valor do contrato, você pode transferir sua reserva pelo EventSwap. Assim você recupera parte ou todo o valor investido, e o comprador consegue um evento com desconto. É a melhor alternativa ao cancelamento.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto tempo leva para vender uma reserva?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O tempo varia conforme a demanda e o preço. Reservas com bom desconto e em datas populares costumam vender em poucos dias. Com o plano Premium, seu anúncio fica em destaque por 7 dias, aumentando significativamente as chances de venda rápida.",
        },
      },
    ],
  };

  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
          <CookieConsent />
          <ServiceWorkerRegister />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </body>
    </html>
  );
}
