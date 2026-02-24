import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getAllArticles } from './data/articles';
import { BlogCard } from '@/components/blog/blog-card';

export const metadata: Metadata = {
  title: 'Blog | Dicas sobre Transferencia de Reservas de Eventos | EventSwap',
  description: 'Artigos e guias sobre como transferir reservas de casamento, buffet, salao de festa e mais. Dicas para economizar, aspectos legais e como usar o escrow para proteger sua transacao.',
  keywords: [
    'blog transferencia reserva evento',
    'como transferir reserva casamento',
    'cancelar buffet sem multa',
    'dicas vender reserva evento',
    'guia marketplace eventos',
  ],
  alternates: {
    canonical: 'https://eventswap.com.br/blog',
  },
  openGraph: {
    title: 'Blog | EventSwap - Dicas sobre Transferencia de Reservas',
    description: 'Artigos e guias completos sobre transferencia de reservas de eventos.',
    url: 'https://eventswap.com.br/blog',
    type: 'website',
  },
};

export default function BlogPage() {
  const articles = getAllArticles();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog EventSwap',
    description: 'Artigos e guias sobre transferencia de reservas de eventos',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'EventSwap',
      url: baseUrl,
    },
    blogPost: articles.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      url: `${baseUrl}/blog/${article.slug}`,
      datePublished: article.publishedAt,
      author: { '@type': 'Organization', name: 'EventSwap' },
    })),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#6C3CE1]/5 via-white to-sky-50 dark:from-[#6C3CE1]/10 dark:via-zinc-950 dark:to-zinc-900 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CE1]/10">
              <BookOpen className="h-6 w-6 text-[#6C3CE1]" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            Blog <span className="text-[#6C3CE1]">EventSwap</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Dicas, guias e informacoes sobre transferencia de reservas de eventos.
            Aprenda como economizar, seus direitos legais e como funciona o marketplace.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <BlogCard
                key={article.slug}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                image={article.image}
                category={article.category}
                publishedAt={article.publishedAt}
                readingTime={article.readingTime}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Sobre o Blog EventSwap
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            No blog do EventSwap, compartilhamos guias completos sobre como transferir reservas de
            casamento, buffet, salao de festa, fotografo, DJ e outros servicos de eventos. Nossos
            artigos cobrem aspectos legais da transferencia de contratos, dicas para economizar na
            compra de reservas e como o sistema de escrow protege compradores e vendedores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/categorias/casamento" className="text-sm text-[#6C3CE1] hover:underline">
              Reservas de Casamento
            </Link>
            <Link href="/categorias/buffet" className="text-sm text-[#6C3CE1] hover:underline">
              Reservas de Buffet
            </Link>
            <Link href="/marketplace" className="text-sm text-[#6C3CE1] hover:underline">
              Ver Marketplace
            </Link>
            <Link href="/como-funciona" className="text-sm text-[#6C3CE1] hover:underline">
              Como Funciona
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6C3CE1] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Pronto para Transferir ou Comprar uma Reserva?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e explore o marketplace com reservas de eventos
            com ate 70% de desconto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#6C3CE1] px-8 py-3 font-semibold hover:bg-zinc-100 transition-colors"
            >
              Criar Conta Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 text-white px-8 py-3 font-semibold hover:bg-white/10 transition-colors"
            >
              Ver Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
