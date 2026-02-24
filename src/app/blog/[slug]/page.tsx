import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { getArticleBySlug, getAllArticles, getRelatedArticles } from '../data/articles';
import { BlogCard } from '@/components/blog/blog-card';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Artigo nao encontrado | EventSwap' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  return {
    title: `${article.title} | Blog EventSwap`,
    description: article.description,
    keywords: article.keywords,
    authors: [{ name: 'EventSwap', url: baseUrl }],
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `${baseUrl}/blog/${article.slug}`,
      siteName: 'EventSwap',
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.publishedAt,
      authors: ['EventSwap'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug, 3);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: `${baseUrl}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'EventSwap',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EventSwap',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${baseUrl}/blog/${article.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-white truncate max-w-[200px]">{article.title}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readingTime} min de leitura
            </span>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="mb-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wide">
            Neste artigo
          </h2>
          <ul className="space-y-2">
            {article.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-[#6C3CE1] hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Article Body */}
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-[#6C3CE1]">
          {article.sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                {section.title}
              </h2>
              {section.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#6C3CE1] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Blog
          </Link>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-zinc-50 dark:bg-zinc-900 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
              Artigos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((related) => (
                <BlogCard
                  key={related.slug}
                  slug={related.slug}
                  title={related.title}
                  excerpt={related.excerpt}
                  image={related.image}
                  category={related.category}
                  publishedAt={related.publishedAt}
                  readingTime={related.readingTime}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#6C3CE1] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Pronto para Transferir ou Comprar uma Reserva?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente no EventSwap e explore reservas de eventos
            com ate 70% de desconto. Transferencia segura com escrow.
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
