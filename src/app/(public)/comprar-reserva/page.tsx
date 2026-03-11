import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Percent, Search, CheckCircle2, Heart, UtensilsCrossed, Camera, Building2, Music, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

export const metadata: Metadata = {
  title: 'Comprar Reserva de Evento com Desconto | Ate 70% OFF | EventSwap',
  description:
    'Compre reservas de casamento, buffet, salao de festa e fotografo com ate 70% de desconto. Pagamento protegido por escrow, verificacao de vendedor e suporte completo no EventSwap.',
  keywords: [
    'comprar reserva de evento barato',
    'comprar reserva de casamento com desconto',
    'reserva de buffet barata',
    'evento com desconto',
    'comprar transferencia de reserva',
    'salao de festa barato',
    'casamento barato',
  ],
  alternates: { canonical: `${BASE_URL}/comprar-reserva` },
  openGraph: {
    title: 'Comprar Reserva de Evento com ate 70% OFF | EventSwap',
    description:
      'Encontre reservas de casamento, buffet e mais com descontos incriveis. Pagamento seguro.',
    url: `${BASE_URL}/comprar-reserva`,
    siteName: 'EventSwap',
    type: 'website',
    images: [{ url: `${BASE_URL}/api/og?title=${encodeURIComponent('Compre Reservas com até 70% OFF')}&description=${encodeURIComponent('Casamento, buffet, salão e mais com desconto')}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comprar Reserva de Evento com ate 70% OFF | EventSwap',
    description: 'Encontre reservas de casamento, buffet e mais com descontos incriveis. Pagamento seguro.',
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent('Compre Reservas com até 70% OFF')}&description=${encodeURIComponent('Casamento, buffet, salão e mais com desconto')}`],
  },
};

const CATEGORIES = [
  { label: 'Casamento', icon: Heart, href: '/marketplace?category=casamento', color: 'from-pink-500 to-pink-400' },
  { label: 'Buffet', icon: UtensilsCrossed, href: '/marketplace?category=buffet', color: 'from-orange-500 to-orange-400' },
  { label: 'Salao de Festa', icon: Building2, href: '/marketplace?category=espaco', color: 'from-blue-500 to-blue-400' },
  { label: 'Fotografia', icon: Camera, href: '/marketplace?category=fotografia', color: 'from-sky-500 to-sky-400' },
  { label: 'Musica e DJ', icon: Music, href: '/marketplace?category=musica', color: 'from-emerald-500 to-emerald-400' },
  { label: 'Decoracao', icon: Sparkles, href: '/marketplace?category=decoracao', color: 'from-amber-500 to-amber-400' },
];

const BENEFITS = [
  {
    icon: Percent,
    title: 'Economia de ate 70%',
    description:
      'Compre reservas de eventos premium por uma fracao do preco original. Vendedores precisam transferir, voce economiza.',
    color: 'text-success-600 dark:text-success-400',
    bg: 'bg-success-50 dark:bg-success-950/50',
  },
  {
    icon: Shield,
    title: 'Pagamento 100% protegido',
    description:
      'Seu dinheiro fica em custodia (escrow) ate a transferencia ser confirmada pelo fornecedor. Sem risco.',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/50',
  },
  {
    icon: CheckCircle2,
    title: 'Vendedores verificados',
    description:
      'Todos os vendedores passam por verificacao de identidade (KYC). Documentos e dados confirmados.',
    color: 'text-accent-600 dark:text-accent-400',
    bg: 'bg-accent-50 dark:bg-accent-950/50',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Busque reservas',
    description: 'Explore o marketplace por categoria, cidade ou tipo de evento. Filtre por preco e data.',
    icon: Search,
  },
  {
    number: 2,
    title: 'Negocie com seguranca',
    description: 'Converse com o vendedor pelo chat da plataforma. Tire duvidas e combine os detalhes.',
    icon: Heart,
  },
  {
    number: 3,
    title: 'Compre com escrow',
    description: 'Pague pelo EventSwap. O valor fica retido ate o fornecedor confirmar a transferencia.',
    icon: Shield,
  },
];

const FAQS = [
  {
    question: 'Como sei que a reserva e real?',
    answer:
      'Verificamos a identidade do vendedor via KYC (documento + selfie) e validamos os detalhes da reserva. Alem disso, o pagamento so e liberado ao vendedor apos a confirmacao da transferencia pelo fornecedor original.',
  },
  {
    question: 'E se a transferencia nao for aceita pelo fornecedor?',
    answer:
      'Se o fornecedor nao aceitar a transferencia, voce recebe reembolso integral automatico. Seu dinheiro fica protegido do inicio ao fim.',
  },
  {
    question: 'Preciso pagar alguma taxa como comprador?',
    answer:
      'Nao! O comprador nao paga nenhuma taxa adicional no EventSwap. Voce paga apenas o valor anunciado da reserva.',
  },
  {
    question: 'Como funciona o pagamento escrow?',
    answer:
      'Escrow e um sistema de pagamento em custodia. Quando voce compra, o valor fica retido na plataforma (nao vai direto ao vendedor). So e liberado apos a confirmacao da transferencia. Se algo der errado, voce recebe o reembolso.',
  },
  {
    question: 'Quais formas de pagamento sao aceitas?',
    answer:
      'Aceitamos cartao de credito (parcelamento em ate 12x), PIX e boleto bancario. Todos os pagamentos sao processados com seguranca.',
  },
];

export default function ComprarReservaPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-neutral-950 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-40 dark:opacity-10" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-success-50 dark:bg-success-950/50 border border-success-200/60 dark:border-success-800/40 px-4 py-1.5 text-label-sm text-success-700 dark:text-success-300">
            <Percent className="h-3.5 w-3.5" />
            Para Compradores
          </div>
          <h1 className="text-[28px] leading-[1.15] font-bold sm:text-display-lg md:text-display-xl text-neutral-950 dark:text-white">
            Seu evento dos sonhos{' '}
            <span className="text-gradient-hero">por ate 70% menos.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg sm:text-body-xl text-neutral-500 dark:text-neutral-300">
            Encontre reservas de casamento, buffet, salao de festa e mais com descontos
            incriveis. Pagamento protegido por escrow — sem risco para voce.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/marketplace"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'bg-primary text-white font-semibold text-label-lg',
                'shadow-primary-glow transition-all duration-normal',
                'hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.97]',
              )}
            >
              Explorar marketplace
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/register"
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4',
                'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white',
                'text-label-lg font-semibold transition-all hover:border-primary-300 dark:hover:border-primary-700',
              )}
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              CATEGORIAS
            </span>
            <h2 className="text-display-md text-neutral-900 dark:text-white">
              Encontre por tipo de evento
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={cn(
                    'group flex flex-col items-center gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60',
                    'bg-white dark:bg-neutral-950 p-6 shadow-sm transition-all duration-300',
                    'hover:shadow-lg hover:-translate-y-1',
                  )}
                >
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md', cat.color)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-label-md text-neutral-800 dark:text-neutral-200 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white dark:bg-neutral-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              POR QUE COMPRAR AQUI
            </span>
            <h2 className="text-display-md text-neutral-900 dark:text-white">
              Seguranca total para voce
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 p-8 shadow-sm"
                >
                  <div className={cn('mb-6 flex h-12 w-12 items-center justify-center rounded-xl', benefit.bg)}>
                    <Icon className={cn('h-6 w-6', benefit.color)} />
                  </div>
                  <h3 className="mb-3 text-heading-sm text-neutral-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-body-md text-neutral-500 dark:text-neutral-300">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to buy */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              COMO COMPRAR
            </span>
            <h2 className="text-display-md text-neutral-900 dark:text-white">
              Tres passos para seu evento com desconto
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-heading-md font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="mb-2 text-heading-sm text-neutral-900 dark:text-white">{step.title}</h3>
                  <p className="text-body-sm text-neutral-500 dark:text-neutral-300">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-neutral-950 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="text-center mb-12">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              PERGUNTAS FREQUENTES
            </span>
            <h2 className="text-display-sm text-neutral-900 dark:text-white">
              Duvidas sobre comprar reservas?
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900 overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-heading-sm text-neutral-900 dark:text-white">
                  {faq.question}
                  <CheckCircle2 className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-body-md text-neutral-500 dark:text-neutral-300">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-hero py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2 className="text-display-md text-white mb-6">Encontre o evento dos seus sonhos</h2>
          <p className="text-body-xl text-white/70 mb-10">
            Explore dezenas de reservas com descontos incriveis. R$ 0 de taxa para comprador.
          </p>
          <Link
            href="/marketplace"
            className={cn(
              'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
              'bg-white text-primary font-semibold text-label-lg',
              'shadow-float transition-all duration-normal',
              'hover:bg-neutral-50 hover:shadow-2xl hover:gap-3',
            )}
          >
            Explorar marketplace
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-6 text-caption text-white/40">
            Sem taxa para comprador. Pagamento protegido por escrow.
          </p>
        </div>
      </section>
    </>
  );
}
