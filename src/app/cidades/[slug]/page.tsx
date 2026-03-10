import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shield, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// CITY_SEO - Top 12 Brazilian cities for event reservation transfers
// =============================================================================

const CITY_SEO: Record<string, {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  cityName: string;
  state: string;
  seoText: string;
}> = {
  'sao-paulo': {
    title: 'Transferência de Reservas de Eventos em São Paulo | EventSwap',
    description: 'Compre e venda reservas de eventos em São Paulo com até 70% de desconto. Buffets, salões de festa, fotógrafos e mais. Transferência segura com escrow no EventSwap.',
    h1: 'Reservas de Eventos em São Paulo',
    subtitle: 'A maior cidade do Brasil tem milhares de eventos acontecendo todos os dias. Encontre reservas de casamentos, formaturas, festas e eventos corporativos em SP com preços incríveis.',
    cityName: 'São Paulo',
    state: 'SP',
    seoText: 'São Paulo é o maior polo de eventos do Brasil, com milhares de buffets, espaços e fornecedores. Se você desistiu de um evento em São Paulo, não perca dinheiro com multas de cancelamento. No EventSwap, você pode transferir sua reserva de buffet na Vila Olímpia, salão de festas em Moema, fotógrafo nos Jardins ou qualquer outro serviço contratado para seu evento em SP. Compradores encontram reservas de eventos em São Paulo com descontos que podem chegar a 70% do valor original.',
  },
  'rio-de-janeiro': {
    title: 'Transferência de Reservas de Eventos no Rio de Janeiro | EventSwap',
    description: 'Transfira ou compre reservas de eventos no Rio de Janeiro. Casamentos, festas e formaturas com desconto. Marketplace seguro para reservas de eventos no RJ.',
    h1: 'Reservas de Eventos no Rio de Janeiro',
    subtitle: 'A Cidade Maravilhosa é palco de eventos inesquecíveis. Encontre reservas de casamentos na praia, festas em coberturas e eventos em espaços icônicos do RJ.',
    cityName: 'Rio de Janeiro',
    state: 'RJ',
    seoText: 'O Rio de Janeiro é famoso por seus eventos em locações deslumbrantes, de casamentos à beira-mar em Copacabana a festas em coberturas na Barra da Tijuca. Se seus planos mudaram, transfira sua reserva de evento no Rio de Janeiro pelo EventSwap e recupere seu investimento. Compradores podem encontrar reservas de buffets no Leblon, fotógrafos em Ipanema, espaços de eventos em Niterói e muito mais, tudo com preços reduzidos e transferência segura via escrow.',
  },
  'belo-horizonte': {
    title: 'Transferência de Reservas de Eventos em Belo Horizonte | EventSwap',
    description: 'Compre e venda reservas de eventos em Belo Horizonte. Buffets, espaços e fornecedores em BH com desconto. Transferência segura de reservas de eventos em MG.',
    h1: 'Reservas de Eventos em Belo Horizonte',
    subtitle: 'A capital mineira é referência em gastronomia e hospitalidade. Aproveite reservas de eventos em BH com condições especiais no EventSwap.',
    cityName: 'Belo Horizonte',
    state: 'MG',
    seoText: 'Belo Horizonte é conhecida pela excelente gastronomia e tradição em eventos de alto padrão. Se você precisa desistir de um evento em BH, não perca seu investimento em buffets na Savassi, espaços de festas no Belvedere ou fotógrafos na Pampulha. O EventSwap conecta quem precisa transferir reservas de eventos em Belo Horizonte com compradores que buscam exatamente esses serviços com desconto. A transferência é segura, rápida e você pode recuperar até 100% do valor investido.',
  },
  'curitiba': {
    title: 'Transferência de Reservas de Eventos em Curitiba | EventSwap',
    description: 'Transfira reservas de eventos em Curitiba sem perder dinheiro. Buffets, salões e fotógrafos em Curitiba com desconto no EventSwap. Marketplace seguro.',
    h1: 'Reservas de Eventos em Curitiba',
    subtitle: 'Curitiba une sofisticação e natureza em seus eventos. Encontre reservas de casamentos, formaturas e festas na capital paranaense com preços reduzidos.',
    cityName: 'Curitiba',
    state: 'PR',
    seoText: 'Curitiba é uma das cidades mais organizadas do Brasil e oferece espaços de eventos de alta qualidade. Se você desistiu de um evento em Curitiba, transfira sua reserva de buffet no Batel, espaço de festas em Santa Felicidade ou fotógrafo no Centro Cívico pelo EventSwap. Compradores encontram reservas de eventos em Curitiba com economia significativa, aproveitando datas e fornecedores já garantidos. Toda transação é protegida pelo sistema de escrow da plataforma.',
  },
  'porto-alegre': {
    title: 'Transferência de Reservas de Eventos em Porto Alegre | EventSwap',
    description: 'Compre e venda reservas de eventos em Porto Alegre. Casamentos, festas e eventos corporativos em POA com desconto. Transferência segura no EventSwap.',
    h1: 'Reservas de Eventos em Porto Alegre',
    subtitle: 'A capital gaúcha é conhecida por seus eventos tradicionais e sofisticados. Encontre reservas de eventos em POA com preços especiais.',
    cityName: 'Porto Alegre',
    state: 'RS',
    seoText: 'Porto Alegre tem uma cena de eventos vibrante, com espaços que vão de salões clássicos no Moinhos de Vento a locais modernos na Orla do Guaíba. Se seus planos mudaram, transfira sua reserva de evento em Porto Alegre pelo EventSwap. Recupere o valor investido em buffets, fotógrafos, DJs e espaços de festas na capital gaúcha. Compradores encontram oportunidades únicas de reservas de eventos em POA com descontos de até 70%.',
  },
  'brasilia': {
    title: 'Transferência de Reservas de Eventos em Brasília | EventSwap',
    description: 'Transfira reservas de eventos em Brasília. Buffets, espaços e fornecedores no DF com desconto. Compre reservas de casamentos e festas em Brasília no EventSwap.',
    h1: 'Reservas de Eventos em Brasília',
    subtitle: 'A capital federal possui espaços de eventos únicos e modernos. Aproveite reservas de casamentos e festas em Brasília com condições especiais.',
    cityName: 'Brasília',
    state: 'DF',
    seoText: 'Brasília oferece espaços de eventos com arquitetura moderna e infraestrutura de primeiro mundo. Se você desistiu de um evento na capital federal, não pague multas caras. Transfira sua reserva de buffet no Lago Sul, espaço de festas na Asa Norte ou fotógrafo no Pontão pelo EventSwap. A cidade tem alta demanda por eventos corporativos e sociais, o que torna suas reservas muito valiosas para compradores que buscam economia sem abrir mão da qualidade.',
  },
  'salvador': {
    title: 'Transferência de Reservas de Eventos em Salvador | EventSwap',
    description: 'Compre e venda reservas de eventos em Salvador. Casamentos na praia, festas e formaturas na capital baiana com desconto. Transferência segura no EventSwap.',
    h1: 'Reservas de Eventos em Salvador',
    subtitle: 'Salvador é sinônimo de festa e alegria. Encontre reservas de casamentos na praia, formaturas e eventos corporativos na capital baiana.',
    cityName: 'Salvador',
    state: 'BA',
    seoText: 'Salvador é uma das cidades mais festeiras do Brasil, com opções de eventos que vão de casamentos à beira-mar no Litoral Norte a festas em casarões históricos no Pelourinho. Se seus planos mudaram, transfira sua reserva de evento em Salvador pelo EventSwap e recupere seu investimento. A alta demanda por espaços e fornecedores de eventos na capital baiana garante que sua reserva encontre comprador rapidamente, com transação segura via escrow.',
  },
  'recife': {
    title: 'Transferência de Reservas de Eventos em Recife | EventSwap',
    description: 'Transfira reservas de eventos em Recife sem perder dinheiro. Buffets, espaços e fornecedores em Recife com desconto. Marketplace seguro EventSwap.',
    h1: 'Reservas de Eventos em Recife',
    subtitle: 'A capital pernambucana encanta com seus eventos à beira-mar e cultura vibrante. Encontre reservas de eventos em Recife com preços especiais.',
    cityName: 'Recife',
    state: 'PE',
    seoText: 'Recife combina cultura, história e belezas naturais, sendo um destino muito procurado para casamentos e eventos. Se você desistiu de um evento em Recife, transfira sua reserva de buffet em Boa Viagem, espaço de festas em Casa Forte ou fotógrafo em Porto de Galinhas pelo EventSwap. Compradores encontram reservas de eventos em Recife com descontos significativos, aproveitando fornecedores já contratados e datas garantidas na capital pernambucana.',
  },
  'fortaleza': {
    title: 'Transferência de Reservas de Eventos em Fortaleza | EventSwap',
    description: 'Compre e venda reservas de eventos em Fortaleza. Casamentos, festas e eventos na capital cearense com desconto. Transferência segura no EventSwap.',
    h1: 'Reservas de Eventos em Fortaleza',
    subtitle: 'Sol o ano inteiro e praias deslumbrantes fazem de Fortaleza um destino perfeito para eventos. Encontre reservas com economia no EventSwap.',
    cityName: 'Fortaleza',
    state: 'CE',
    seoText: 'Fortaleza é um dos destinos mais procurados para casamentos e eventos no Nordeste, com praias paradisíacas e clima agradável o ano todo. Se seus planos mudaram, não perca o investimento em reservas de eventos em Fortaleza. Transfira sua reserva de buffet na Praia do Futuro, espaço de eventos no Meireles ou fotógrafo em Aquiraz pelo EventSwap. Compradores encontram oportunidades incríveis de eventos na capital cearense com preços muito abaixo do mercado.',
  },
  'florianopolis': {
    title: 'Transferência de Reservas de Eventos em Florianópolis | EventSwap',
    description: 'Transfira reservas de eventos em Florianópolis. Casamentos na praia, festas e eventos em Floripa com desconto. Marketplace seguro EventSwap.',
    h1: 'Reservas de Eventos em Florianópolis',
    subtitle: 'A Ilha da Magia é cenário perfeito para eventos inesquecíveis. Aproveite reservas de casamentos e festas em Floripa com preços especiais.',
    cityName: 'Florianópolis',
    state: 'SC',
    seoText: 'Florianópolis é um dos destinos mais desejados para casamentos e eventos no Sul do Brasil, com praias deslumbrantes como Jurerê Internacional e Campeche. Se você desistiu de um evento em Floripa, transfira sua reserva pelo EventSwap e recupere seu investimento. Buffets, espaços de eventos, fotógrafos e DJs na Ilha da Magia são muito procurados, especialmente na alta temporada. Compradores encontram reservas de eventos em Florianópolis com economia de até 70%.',
  },
  'goiania': {
    title: 'Transferência de Reservas de Eventos em Goiânia | EventSwap',
    description: 'Compre e venda reservas de eventos em Goiânia. Buffets, espaços e fornecedores na capital goiana com desconto. Transferência segura no EventSwap.',
    h1: 'Reservas de Eventos em Goiânia',
    subtitle: 'Goiânia é uma cidade que ama celebrar. Encontre reservas de casamentos, formaturas e festas na capital goiana com condições imperdíveis.',
    cityName: 'Goiânia',
    state: 'GO',
    seoText: 'Goiânia é uma das capitais que mais cresce no Brasil e tem uma cena de eventos pulsante, com espaços modernos e fornecedores de alta qualidade. Se você precisa desistir de um evento em Goiânia, transfira sua reserva de buffet no Setor Marista, espaço de festas no Jardim Goiás ou fotógrafo no Setor Bueno pelo EventSwap. A demanda por eventos na capital goiana é alta, o que facilita encontrar compradores rapidamente para suas reservas.',
  },
  'campinas': {
    title: 'Transferência de Reservas de Eventos em Campinas | EventSwap',
    description: 'Transfira reservas de eventos em Campinas sem perder dinheiro. Buffets, salões e fotógrafos em Campinas com desconto. Marketplace seguro EventSwap.',
    h1: 'Reservas de Eventos em Campinas',
    subtitle: 'Uma das maiores cidades do interior paulista, Campinas tem opções de eventos para todos os gostos. Encontre reservas com desconto no EventSwap.',
    cityName: 'Campinas',
    state: 'SP',
    seoText: 'Campinas é a maior cidade do interior de São Paulo e possui uma infraestrutura de eventos de alto nível, com fazendas para casamentos, buffets sofisticados e fotógrafos renomados. Se seus planos mudaram, transfira sua reserva de evento em Campinas pelo EventSwap. A proximidade com São Paulo e a demanda crescente por eventos na região de Campinas, Vinhedo e Valinhos tornam suas reservas muito atrativas para compradores que buscam economia.',
  },
};

// =============================================================================
// Types
// =============================================================================

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

// =============================================================================
// Metadata & Static Params
// =============================================================================

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITY_SEO[slug];

  if (!city) {
    return { title: 'Cidade não encontrada | EventSwap' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  return {
    title: city.title,
    description: city.description,
    alternates: {
      canonical: `${baseUrl}/cidades/${slug}`,
    },
    openGraph: {
      title: city.h1,
      description: city.description,
      url: `${baseUrl}/cidades/${slug}`,
      type: 'website',
      siteName: 'EventSwap',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CITY_SEO).map((slug) => ({ slug }));
}

// =============================================================================
// Page Component
// =============================================================================

export default async function CityLandingPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = CITY_SEO[slug];

  if (!city) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  // Structured data for SEO
  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: city.h1,
    description: city.description,
    url: `${baseUrl}/cidades/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'EventSwap',
      url: baseUrl,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Cidades', item: `${baseUrl}/cidades` },
        { '@type': 'ListItem', position: 3, name: city.cityName, item: `${baseUrl}/cidades/${slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }}
      />

      {/* Breadcrumb */}
      <nav className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="hover:text-[#2563EB] transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="text-zinc-400 dark:text-zinc-500">Cidades</span>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{city.cityName}</span>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB]/5 via-white to-sky-50 dark:from-[#2563EB]/10 dark:via-zinc-950 dark:to-zinc-900 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full bg-[#2563EB]/10 px-4 py-1 text-sm font-medium text-[#2563EB] mb-4">
            {city.cityName} - {city.state}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {city.h1}
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {city.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/marketplace?city=${encodeURIComponent(city.cityName)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white px-8 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Ver Anúncios em {city.cityName}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2563EB] text-[#2563EB] px-8 py-3 font-semibold hover:bg-[#2563EB]/5 transition-colors"
            >
              Anunciar Minha Reserva
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-12">
            Por que usar o EventSwap em {city.cityName}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Economize */}
            <div className={cn(
              'flex flex-col items-center text-center p-8 rounded-2xl',
              'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'
            )}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-5">
                <TrendingDown className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Economize</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Compre reservas de eventos em {city.cityName} com até 70% de desconto sobre o valor original. Buffets, fotógrafos, espaços e mais.
              </p>
            </div>

            {/* Seguranca */}
            <div className={cn(
              'flex flex-col items-center text-center p-8 rounded-2xl',
              'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
            )}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-5">
                <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Segurança</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Toda transação é protegida pelo sistema de escrow do EventSwap. Seu dinheiro só é liberado quando a transferência é confirmada.
              </p>
            </div>

            {/* Variedade */}
            <div className={cn(
              'flex flex-col items-center text-center p-8 rounded-2xl',
              'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800'
            )}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 mb-5">
                <Sparkles className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Variedade</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Encontre reservas de casamentos, formaturas, festas corporativas, aniversários e mais em {city.cityName}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-[#2563EB]/5 dark:bg-[#2563EB]/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Pronto para encontrar a reserva ideal em {city.cityName}?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
            Navegue pelos anúncios disponíveis e economize no seu próximo evento.
          </p>
          <Link
            href={`/marketplace?city=${encodeURIComponent(city.cityName)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white px-8 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Explorar Anúncios em {city.cityName}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-12">
            Como funciona a transferência?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Anuncie sua reserva</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Crie seu anúncio com fotos, detalhes do contrato e preço desejado. É rápido e gratuito.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Negocie com segurança</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Receba ofertas de interessados e negocie pelo chat seguro da plataforma.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Transfira e receba</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                O pagamento fica em escrow até a transferência ser confirmada pelo fornecedor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Text Section */}
      <section className="py-16 sm:py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Eventos em {city.cityName} - {city.state}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
              {city.seoText}
            </p>
          </div>

          {/* Final CTA */}
          <div className="mt-10 text-center">
            <Link
              href={`/marketplace?city=${encodeURIComponent(city.cityName)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white px-8 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Ver Reservas de Eventos em {city.cityName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
