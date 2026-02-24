import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Shield } from 'lucide-react';

const CATEGORY_SEO: Record<string, {
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  marketplaceCategory: string;
  content: {
    intro: string;
    benefits: string[];
    tips: string;
  };
}> = {
  casamento: {
    title: 'Transferência de Reserva de Casamento | Compre e Venda | EventSwap',
    h1: 'Transferência de Reservas de Casamento',
    description: 'Desistiu do casamento? Transfira sua reserva de buffet, salão de festa, fotógrafo e decoração sem perder dinheiro. Compre reservas de casamento com até 70% de desconto no EventSwap.',
    keywords: ['transferência reserva casamento', 'vender reserva de casamento', 'comprar reserva de casamento', 'desistência de casamento reserva', 'cancelar casamento sem multa', 'transferir buffet de casamento'],
    marketplaceCategory: 'casamento',
    content: {
      intro: 'Desistir de um casamento é uma decisão difícil, mas perder todo o dinheiro investido em reservas não precisa fazer parte do processo. No EventSwap, você pode transferir todas as suas reservas de casamento — buffet, salão de festas, fotógrafo, DJ, decoração, vestido de noiva e muito mais — para outro casal que está buscando exatamente esses serviços.',
      benefits: [
        'Recupere até 100% do valor investido em reservas de casamento',
        'Evite multas de cancelamento que podem chegar a 50% do contrato',
        'Compradores encontram reservas de casamento com descontos de até 70%',
        'Transferência segura com sistema de escrow e verificação de identidade',
      ],
      tips: 'Para vender mais rápido, inclua fotos do local, detalhes do contrato e seja flexível no preço. Reservas com data mais próxima geralmente precisam de descontos maiores para atrair compradores.',
    },
  },
  buffet: {
    title: 'Transferência de Reserva de Buffet | Compre e Venda | EventSwap',
    h1: 'Transferência de Reservas de Buffet',
    description: 'Precisa cancelar o buffet? Não pague multa! Transfira sua reserva de buffet para outra pessoa no EventSwap. Compre reservas de buffet com até 70% de desconto. Marketplace seguro com escrow.',
    keywords: ['transferência reserva buffet', 'vender reserva de buffet', 'comprar reserva de buffet', 'cancelar buffet sem multa', 'desistência de buffet', 'transferir contrato de buffet'],
    marketplaceCategory: 'buffet',
    content: {
      intro: 'Reservas de buffet são um dos maiores investimentos em eventos, e cancelar pode significar perder milhares de reais em multas. O EventSwap é a solução: transfira sua reserva de buffet para outra pessoa que precisa do mesmo serviço, na mesma data e local.',
      benefits: [
        'Buffets com reserva geralmente custam entre R$5.000 e R$50.000 — não perca esse valor',
        'Multas de cancelamento de buffet variam de 10% a 50% do contrato',
        'Compradores economizam significativamente em reservas de buffet',
        'Processo de transferência mediado pela plataforma com total segurança',
      ],
      tips: 'Informe o cardápio incluso, capacidade de pessoas, se bebidas estão incluídas e qualquer personalização já contratada. Quanto mais detalhes, mais rápido você encontra um comprador.',
    },
  },
  'salao-de-festa': {
    title: 'Transferência de Reserva de Salão de Festa | EventSwap',
    h1: 'Transferência de Reservas de Salão de Festa',
    description: 'Desistiu da festa? Transfira sua reserva de salão de festa, espaço de eventos ou casa de festas no EventSwap. Compre espaços para eventos com desconto. Transferência segura.',
    keywords: ['transferência reserva salão de festa', 'vender reserva de espaço de evento', 'comprar reserva de salão', 'cancelar salão de festa', 'transferir espaço de evento'],
    marketplaceCategory: 'espaco',
    content: {
      intro: 'Espaços de eventos e salões de festa costumam exigir reservas com meses de antecedência e pagamentos significativos. Se você desistiu do evento, transferir a reserva do espaço é muito melhor do que cancelar e pagar multas.',
      benefits: [
        'Espaços premium podem custar de R$3.000 a R$30.000 — recupere seu investimento',
        'Datas populares (sábados, feriados) são muito procuradas por compradores',
        'Transferência inclui todas as condições já negociadas com o espaço',
        'Proteção de escrow garante segurança na transação',
      ],
      tips: 'Destaque a capacidade do espaço, se é coberto ou ao ar livre, estacionamento disponível e quais serviços estão inclusos (como segurança, limpeza, etc).',
    },
  },
  fotografia: {
    title: 'Transferência de Reserva de Fotógrafo | EventSwap',
    h1: 'Transferência de Reservas de Fotógrafo',
    description: 'Precisa cancelar o fotógrafo do evento? Transfira sua reserva de fotógrafo no EventSwap e não perca dinheiro. Compradores encontram fotógrafos de eventos com desconto.',
    keywords: ['transferência reserva fotógrafo', 'vender reserva de fotógrafo', 'cancelar fotógrafo de casamento', 'transferir contrato de fotógrafo'],
    marketplaceCategory: 'fotografia',
    content: {
      intro: 'Fotógrafos de eventos e casamentos geralmente são contratados com bastante antecedência e envolvem investimentos significativos. Se seu evento foi cancelado, transferir a reserva do fotógrafo é a melhor opção.',
      benefits: [
        'Pacotes de fotografia custam de R$2.000 a R$15.000',
        'Fotógrafos renomados têm agenda disputada — sua reserva tem valor',
        'Compradores buscam fotógrafos disponíveis em datas específicas',
        'Transferência segura com aprovação do fotógrafo',
      ],
      tips: 'Inclua o portfólio do fotógrafo, horas de cobertura incluídas, número de fotos editadas e se inclui álbum ou ensaio pré-evento.',
    },
  },
  musica: {
    title: 'Transferência de Reserva de DJ e Banda | EventSwap',
    h1: 'Transferência de Reservas de DJ e Banda',
    description: 'Cancelou o DJ ou banda do evento? Transfira sua reserva no EventSwap. Compradores encontram DJs e bandas para eventos com desconto.',
    keywords: ['transferência reserva DJ', 'vender reserva de banda', 'cancelar DJ de casamento', 'transferir contrato de música para evento'],
    marketplaceCategory: 'musica',
    content: {
      intro: 'DJs e bandas para eventos são serviços muito procurados, especialmente para casamentos e festas grandes. Se você precisa desistir, transferir a reserva é muito melhor do que simplesmente cancelar.',
      benefits: [
        'DJs e bandas cobram de R$1.500 a R$20.000 dependendo da fama',
        'Profissionais populares têm agenda lotada — sua data tem valor',
        'Compradores encontram músicos já reservados em datas concorridas',
        'Processo rápido e seguro de transferência',
      ],
      tips: 'Informe o tipo de música, duração do serviço, equipamento incluído e se há opção de personalizar a playlist.',
    },
  },
  decoracao: {
    title: 'Transferência de Reserva de Decoração de Evento | EventSwap',
    h1: 'Transferência de Reservas de Decoração',
    description: 'Desistiu da decoração do evento? Transfira sua reserva de decoração no EventSwap. Compre serviços de decoração com desconto para casamentos e festas.',
    keywords: ['transferência reserva decoração', 'vender reserva de decoração de casamento', 'cancelar decoração de festa', 'transferir contrato de decoração'],
    marketplaceCategory: 'decoracao',
    content: {
      intro: 'Serviços de decoração para eventos envolvem planejamento detalhado e investimentos consideráveis. Em vez de cancelar e perder dinheiro, transfira sua reserva de decoração no EventSwap.',
      benefits: [
        'Decorações personalizadas custam de R$3.000 a R$30.000',
        'Projetos já aprovados e planejados têm alto valor para compradores',
        'Inclui flores, mobiliário, iluminação e toda a ambientação',
        'Transferência documentada e segura',
      ],
      tips: 'Compartilhe o projeto de decoração, fotos de referência e lista de itens inclusos. Quanto mais visual, mais atrativo para compradores.',
    },
  },
  videografia: {
    title: 'Transferência de Reserva de Videógrafo | EventSwap',
    h1: 'Transferência de Reservas de Videógrafo',
    description: 'Cancelou o videógrafo do evento? Transfira sua reserva no EventSwap. Compradores encontram videógrafos de eventos com preços reduzidos.',
    keywords: ['transferência reserva videógrafo', 'vender reserva de filmagem de casamento', 'cancelar videógrafo de evento'],
    marketplaceCategory: 'video',
    content: {
      intro: 'Videógrafos de eventos e casamentos são cada vez mais procurados. Se você desistiu do evento, não perca o valor investido — transfira a reserva.',
      benefits: [
        'Pacotes de filmagem custam de R$3.000 a R$20.000',
        'Inclui edição, drone e highlights para redes sociais',
        'Datas disputadas tornam sua reserva valiosa',
        'Segurança total na transferência',
      ],
      tips: 'Descreva o pacote: horas de filmagem, drone incluso, edição de highlights, same day edit, e entregas.',
    },
  },
  'vestido-de-noiva': {
    title: 'Transferência de Reserva de Vestido de Noiva | EventSwap',
    h1: 'Transferência de Reservas de Vestido de Noiva',
    description: 'Desistiu do casamento? Transfira a reserva do vestido de noiva no EventSwap. Compre vestidos de noiva reservados com desconto.',
    keywords: ['transferência reserva vestido de noiva', 'vender reserva de vestido de noiva', 'vestido de noiva com desconto', 'cancelar reserva vestido noiva'],
    marketplaceCategory: 'vestido-noiva',
    content: {
      intro: 'Vestidos de noiva geralmente são reservados com meses de antecedência e envolvem valores significativos, especialmente quando incluem ajustes e personalização. Transfira sua reserva em vez de cancelar.',
      benefits: [
        'Vestidos de noiva custam de R$2.000 a R$30.000+',
        'Reservas incluem ajustes já pagos e personalização',
        'Noivas encontram vestidos prontos com desconto',
        'Processo seguro com fotos e documentação',
      ],
      tips: 'Inclua fotos do vestido, tamanho, estilista/marca, ajustes já feitos e acessórios inclusos.',
    },
  },
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_SEO[slug];

  if (!category) {
    return { title: 'Categoria não encontrada | EventSwap' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    alternates: {
      canonical: `${baseUrl}/categorias/${slug}`,
    },
    openGraph: {
      title: category.h1,
      description: category.description,
      url: `${baseUrl}/categorias/${slug}`,
      type: 'website',
      siteName: 'EventSwap',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_SEO).map((slug) => ({ slug }));
}

export default async function CategorySeoPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORY_SEO[slug];

  if (!category) {
    redirect('/marketplace');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.h1,
    description: category.description,
    url: `${baseUrl}/categorias/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'EventSwap',
      url: baseUrl,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Categorias', item: `${baseUrl}/categorias` },
        { '@type': 'ListItem', position: 3, name: category.h1, item: `${baseUrl}/categorias/${slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB]/5 via-white to-sky-50 dark:from-[#2563EB]/10 dark:via-zinc-950 dark:to-zinc-900 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {category.h1}
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {category.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/marketplace?category=${category.marketplaceCategory}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white px-8 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Ver Anúncios Disponíveis
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

      {/* Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Por que transferir em vez de cancelar?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base">
              {category.content.intro}
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {category.content.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 dark:text-emerald-300">{benefit}</p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-12 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border border-[#2563EB]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2563EB] mb-2">Dica para vender mais rápido</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{category.content.tips}</p>
          </div>

          {/* How it works quick */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
              Como funciona a transferência?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">1</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Anuncie</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Crie seu anúncio com fotos e detalhes da reserva</p>
              </div>
              <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">2</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Negocie</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Receba ofertas e negocie pelo chat seguro</p>
              </div>
              <div className="text-center p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl mb-4">3</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Transfira</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Pagamento seguro via escrow até a confirmação</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href={`/marketplace?category=${category.marketplaceCategory}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white px-8 py-3 font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Explorar {category.h1}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
