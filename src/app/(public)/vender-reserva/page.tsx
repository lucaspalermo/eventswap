import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, TrendingUp, Upload, Search, ShieldCheck, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

export const metadata: Metadata = {
  title: 'Vender Reserva de Evento | Recupere seu Investimento | EventSwap',
  description:
    'Desistiu da reserva? Venda sua reserva de casamento, buffet, salao de festa ou fotografo no EventSwap. Pagamento protegido por escrow, sem risco. Recupere ate 100% do valor investido.',
  keywords: [
    'vender reserva de evento',
    'vender reserva de casamento',
    'como vender reserva de buffet',
    'transferir reserva de evento',
    'vender contrato de casamento',
    'evitar multa cancelamento buffet',
    'como nao perder dinheiro cancelando evento',
  ],
  alternates: { canonical: `${BASE_URL}/vender-reserva` },
  openGraph: {
    title: 'Vender Reserva de Evento - Recupere seu Investimento | EventSwap',
    description:
      'Desistiu da reserva? Venda com seguranca no EventSwap. Escrow, verificacao e suporte.',
    url: `${BASE_URL}/vender-reserva`,
    siteName: 'EventSwap',
    type: 'website',
  },
};

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Recupere ate 100% do valor',
    description:
      'Em vez de pagar multas de 30-50% por cancelamento, transfira sua reserva e recupere o que investiu.',
    color: 'text-success-600 dark:text-success-400',
    bg: 'bg-success-50 dark:bg-success-950/50',
  },
  {
    icon: Clock,
    title: 'Anuncio em 5 minutos',
    description:
      'Processo simples: preencha os dados, adicione fotos e pronto. Seu anuncio fica disponivel imediatamente.',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/50',
  },
  {
    icon: Shield,
    title: 'Pagamento protegido por escrow',
    description:
      'O comprador paga e o valor fica em custodia ate a transferencia ser confirmada. Seguranca total.',
    color: 'text-accent-600 dark:text-accent-400',
    bg: 'bg-accent-50 dark:bg-accent-950/50',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Anuncie sua reserva',
    description: 'Cadastre detalhes da sua reserva, adicione fotos e defina o preco desejado.',
    icon: Upload,
  },
  {
    number: 2,
    title: 'Receba propostas',
    description: 'Compradores interessados entram em contato via chat seguro da plataforma.',
    icon: Search,
  },
  {
    number: 3,
    title: 'Receba o pagamento',
    description: 'Apos a confirmacao da transferencia pelo fornecedor, o valor e liberado para voce.',
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    question: 'Quanto custa anunciar no EventSwap?',
    answer:
      'Voce pode anunciar gratuitamente. Cobramos apenas uma taxa de sucesso quando a venda e concluida: 12% no plano Gratuito, 8% no plano Pro (R$39,90/anuncio) ou 5% no plano Business (R$99,90/anuncio).',
  },
  {
    question: 'Que tipos de reservas posso vender?',
    answer:
      'Voce pode vender reservas de casamento, buffet, salao de festa, fotografo, videomaker, DJ, decoracao, vestido de noiva, festas infantis, eventos corporativos e muito mais.',
  },
  {
    question: 'Como o pagamento funciona?',
    answer:
      'Utilizamos sistema de escrow (pagamento em custodia). O comprador paga e o valor fica retido na plataforma. Apos a confirmacao da transferencia pelo fornecedor, o dinheiro e liberado para voce.',
  },
  {
    question: 'E se o comprador desistir?',
    answer:
      'Se o comprador desistir antes da confirmacao, o valor retido e devolvido a ele e sua reserva volta a ficar disponivel no marketplace. Voce nao perde nada.',
  },
  {
    question: 'O fornecedor precisa aprovar a transferencia?',
    answer:
      'Sim. A transferencia so e concluida apos o fornecedor confirmar que aceita o novo titular. Isso garante seguranca para todas as partes.',
  },
];

export default function VenderReservaPage() {
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/40 px-4 py-1.5 text-label-sm text-primary-700 dark:text-primary-300">
            <TrendingUp className="h-3.5 w-3.5" />
            Para Vendedores
          </div>
          <h1 className="text-[28px] leading-[1.15] font-bold sm:text-display-lg md:text-display-xl text-neutral-950 dark:text-white">
            Desistiu da reserva?{' '}
            <span className="text-gradient-hero">Recupere seu investimento.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg sm:text-body-xl text-neutral-500 dark:text-neutral-300">
            Em vez de cancelar e pagar multas, transfira sua reserva pelo EventSwap.
            Pagamento protegido, processo simples e suporte completo.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
                'bg-primary text-white font-semibold text-label-lg',
                'shadow-primary-glow transition-all duration-normal',
                'hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.97]',
              )}
            >
              Anunciar minha reserva
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/como-funciona"
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4',
                'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white',
                'text-label-lg font-semibold transition-all hover:border-primary-300 dark:hover:border-primary-700',
              )}
            >
              Como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 p-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-display-sm text-neutral-900 dark:text-white mb-4">
              Cancelar = Perder dinheiro
            </h2>
            <p className="text-body-lg text-neutral-500 dark:text-neutral-300">
              A maioria dos contratos de evento cobra multas de <strong className="text-neutral-900 dark:text-white">30% a 50%</strong> do
              valor total por cancelamento. Em um casamento de R$ 100.000, isso pode significar{' '}
              <strong className="text-neutral-900 dark:text-white">R$ 30.000 a R$ 50.000 perdidos</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-6">
              <h3 className="text-heading-sm text-red-700 dark:text-red-400 mb-2">Cancelamento tradicional</h3>
              <ul className="space-y-2 text-body-md text-neutral-600 dark:text-neutral-300">
                <li>Multa de 30-50% do valor do contrato</li>
                <li>Burocracia e estresse</li>
                <li>Perda total em muitos casos</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-success-200/60 dark:border-success-900/40 bg-success-50/50 dark:bg-success-950/20 p-6">
              <h3 className="text-heading-sm text-success-700 dark:text-success-400 mb-2">Transferencia pelo EventSwap</h3>
              <ul className="space-y-2 text-body-md text-neutral-600 dark:text-neutral-300">
                <li>Recupere ate 100% do valor investido</li>
                <li>Processo online, simples e rapido</li>
                <li>Pagamento protegido por escrow</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white dark:bg-neutral-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              VANTAGENS
            </span>
            <h2 className="text-display-md text-neutral-900 dark:text-white">
              Por que vender no EventSwap?
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

      {/* How it Works */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              COMO FUNCIONA
            </span>
            <h2 className="text-display-md text-neutral-900 dark:text-white">
              Tres passos para vender sua reserva
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

      {/* Pricing */}
      <section className="bg-white dark:bg-neutral-950 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              TAXAS TRANSPARENTES
            </span>
            <h2 className="text-display-sm text-neutral-900 dark:text-white">
              Pague apenas quando vender
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { plan: 'Gratuito', price: 'R$ 0', fee: '12% de taxa', desc: 'Ate 3 anuncios ativos' },
              { plan: 'Pro', price: 'R$ 39,90', fee: '8% de taxa', desc: 'Anuncios ilimitados + destaque' },
              { plan: 'Business', price: 'R$ 99,90', fee: '5% de taxa', desc: 'Destaque premium + gerente dedicado' },
            ].map((p) => (
              <div
                key={p.plan}
                className="rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-900 p-6 text-center"
              >
                <h3 className="text-heading-sm text-neutral-900 dark:text-white">{p.plan}</h3>
                <p className="mt-1 text-display-sm font-bold text-neutral-900 dark:text-white">{p.price}</p>
                <p className="text-label-sm text-primary dark:text-primary-300 font-medium mt-1">{p.fee}</p>
                <p className="mt-2 text-body-sm text-neutral-500 dark:text-neutral-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="text-center mb-12">
            <span className="mb-4 inline-block text-overline uppercase tracking-widest text-primary dark:text-primary-300">
              PERGUNTAS FREQUENTES
            </span>
            <h2 className="text-display-sm text-neutral-900 dark:text-white">
              Duvidas sobre vender sua reserva?
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 overflow-hidden"
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
          <h2 className="text-display-md text-white mb-6">Pronto para recuperar seu investimento?</h2>
          <p className="text-body-xl text-white/70 mb-10">
            Cadastre-se gratuitamente e crie seu primeiro anuncio em menos de 5 minutos.
          </p>
          <Link
            href="/register"
            className={cn(
              'group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4',
              'bg-white text-primary font-semibold text-label-lg',
              'shadow-float transition-all duration-normal',
              'hover:bg-neutral-50 hover:shadow-2xl hover:gap-3',
            )}
          >
            Comecar a vender
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-6 text-caption text-white/40">
            Sem cartao de credito. Crie sua conta em 30 segundos.
          </p>
        </div>
      </section>
    </>
  );
}
