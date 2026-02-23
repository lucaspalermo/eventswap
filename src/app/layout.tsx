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
    process.env.NEXT_PUBLIC_APP_URL || "https://eventswap.com"
  ),
  title: {
    default: "EventSwap — Marketplace de Transferencia de Reservas de Eventos",
    template: "%s | EventSwap",
  },
  description:
    "Compre, venda e transfira reservas de eventos com seguranca. Casamentos, buffets, fotografos, decoracao e mais. Intermediacao segura com pagamento protegido.",
  keywords: [
    "transferencia de reserva",
    "marketplace eventos",
    "casamento",
    "buffet",
    "fotografo",
    "reserva evento",
    "comprar reserva",
    "vender reserva",
    "eventswap",
  ],
  authors: [{ name: "EventSwap" }],
  creator: "EventSwap",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "EventSwap",
    title: "EventSwap — Marketplace de Transferencia de Reservas de Eventos",
    description:
      "Compre, venda e transfira reservas de eventos com seguranca. Intermediacao segura com pagamento protegido.",
    images: [
      {
        url: "/api/og?title=EventSwap&description=Marketplace%20de%20Transferencia%20de%20Reservas%20de%20Eventos",
        width: 1200,
        height: 630,
        alt: "EventSwap - Marketplace de Reservas de Eventos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EventSwap",
    description:
      "Marketplace de transferencia de reservas de eventos com intermediacao segura.",
    images: [
      "/api/og?title=EventSwap&description=Marketplace%20de%20Transferencia%20de%20Reservas%20de%20Eventos",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EventSwap",
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
      </body>
    </html>
  );
}
