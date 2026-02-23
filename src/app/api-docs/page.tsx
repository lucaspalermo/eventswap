import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Key,
  BookOpen,
  List,
  Tag,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Zap,
  Shield,
  Code2,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Documentacao da API publica do EventSwap para parceiros e integracoes.',
};

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-neutral-950 dark:text-white mt-16 mb-6 scroll-mt-24 flex items-center gap-3"
    >
      {children}
    </h2>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CodeBlock({ title, language, children }: { title?: string; language: string; children: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 uppercase">
            {language}
          </span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-neutral-950 dark:bg-neutral-900">
        <code className="text-sm text-emerald-400 font-mono leading-relaxed whitespace-pre">
          {children}
        </code>
      </pre>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  const methodColor =
    method === 'GET'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : method === 'POST'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

  return (
    <div className="flex items-center gap-3 mb-2">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${methodColor}`}
      >
        {method}
      </span>
      <code className="text-sm font-mono text-neutral-700 dark:text-neutral-300">
        {path}
      </code>
      <span className="text-sm text-neutral-500 hidden sm:inline">
        - {description}
      </span>
    </div>
  );
}

function ParamTable({
  params,
}: {
  params: { name: string; type: string; required: boolean; description: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Parametro
            </th>
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Tipo
            </th>
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Obrigatorio
            </th>
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Descricao
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, i) => (
            <tr
              key={param.name}
              className={
                i % 2 === 0
                  ? 'bg-white dark:bg-neutral-900'
                  : 'bg-neutral-50/50 dark:bg-neutral-800/20'
              }
            >
              <td className="px-4 py-2">
                <code className="text-xs font-mono text-[#6C3CE1]">{param.name}</code>
              </td>
              <td className="px-4 py-2 text-xs text-neutral-500">{param.type}</td>
              <td className="px-4 py-2">
                {param.required ? (
                  <span className="text-xs font-medium text-red-500">Sim</span>
                ) : (
                  <span className="text-xs text-neutral-400">Nao</span>
                )}
              </td>
              <td className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400">
                {param.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorTable() {
  const errors = [
    { code: 401, name: 'UNAUTHORIZED', description: 'API key ausente ou invalida' },
    { code: 403, name: 'FORBIDDEN', description: 'API key sem permissao para o recurso' },
    { code: 404, name: 'NOT_FOUND', description: 'Recurso nao encontrado' },
    { code: 400, name: 'INVALID_PARAMETER', description: 'Parametro invalido na requisicao' },
    { code: 429, name: 'RATE_LIMITED', description: 'Limite de requisicoes excedido' },
    { code: 500, name: 'INTERNAL_ERROR', description: 'Erro interno do servidor' },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              HTTP Status
            </th>
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Codigo
            </th>
            <th className="text-left px-4 py-2 font-medium text-neutral-600 dark:text-neutral-400">
              Descricao
            </th>
          </tr>
        </thead>
        <tbody>
          {errors.map((err, i) => (
            <tr
              key={err.code}
              className={
                i % 2 === 0
                  ? 'bg-white dark:bg-neutral-900'
                  : 'bg-neutral-50/50 dark:bg-neutral-800/20'
              }
            >
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {err.code}
                </span>
              </td>
              <td className="px-4 py-2">
                <code className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                  {err.name}
                </code>
              </td>
              <td className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400">
                {err.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xl font-bold text-[#6C3CE1] tracking-tight"
            >
              EventSwap
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              API Docs
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/api"
              className="text-sm font-medium text-neutral-600 hover:text-[#6C3CE1] transition-colors"
            >
              Gerenciar Chaves
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6C3CE1] text-white px-4 py-2 text-sm font-medium hover:bg-[#5B32C1] transition-colors shadow-sm shadow-[#6C3CE1]/25"
            >
              Solicitar Acesso
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Guia
              </p>
              <a
                href="#introduction"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Introducao
              </a>
              <a
                href="#authentication"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <Key className="h-3.5 w-3.5" />
                Autenticacao
              </a>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 mt-6">
                Endpoints
              </p>
              <a
                href="#listings"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <List className="h-3.5 w-3.5" />
                Listings
              </a>
              <a
                href="#categories"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <Tag className="h-3.5 w-3.5" />
                Categories
              </a>
              <a
                href="#stats"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Stats
              </a>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 mt-6">
                Referencia
              </p>
              <a
                href="#rate-limits"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                Rate Limits
              </a>
              <a
                href="#errors"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#6C3CE1] dark:text-neutral-400 dark:hover:text-[#6C3CE1] py-1.5 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Errors
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C3CE1]/10 text-[#6C3CE1] text-xs font-medium mb-4">
                <Code2 className="h-3.5 w-3.5" />
                REST API v1
              </div>
              <h1 className="text-4xl font-bold text-neutral-950 dark:text-white mb-4">
                EventSwap API
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                API publica para parceiros integrarem dados de reservas de eventos
                em seus sistemas. Acesse listings, categorias e estatisticas da
                plataforma de forma programatica.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                  <Shield className="h-3.5 w-3.5" />
                  Autenticacao via API Key
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                  <Zap className="h-3.5 w-3.5" />
                  100 req/min
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                  <Code2 className="h-3.5 w-3.5" />
                  JSON responses
                </div>
              </div>
            </div>

            {/* Base URL */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-8">
              <p className="text-xs font-medium text-neutral-500 mb-1">Base URL</p>
              <code className="text-sm font-mono text-[#6C3CE1]">
                https://eventswap.com.br/api/v1
              </code>
            </div>

            {/* ============================================================ */}
            {/* Introduction */}
            {/* ============================================================ */}

            <SectionAnchor id="introduction">
              <BookOpen className="h-6 w-6 text-[#6C3CE1]" />
              Introducao
            </SectionAnchor>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              A API do EventSwap permite que parceiros -- como cerimonialistas, espacos de
              eventos, plataformas de casamento e outros -- acessem dados publicos da plataforma.
              Com ela, voce pode buscar anuncios ativos, listar categorias de eventos e consultar
              estatisticas gerais.
            </p>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Todas as respostas seguem um formato padronizado em JSON, com campos{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">data</code>,{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">pagination</code>{' '}
              (quando aplicavel) e{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">meta</code>{' '}
              contendo{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">request_id</code>{' '}
              e{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">timestamp</code>{' '}
              para debugging.
            </p>

            <CodeBlock title="Formato de resposta padrao" language="json">
{`{
  "data": { ... },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "request_id": "req_a1b2c3d4e5f6g7h8i9j0k1l2",
    "timestamp": "2026-02-23T14:30:00.000Z",
    "response_time_ms": 45
  }
}`}
            </CodeBlock>

            {/* ============================================================ */}
            {/* Authentication */}
            {/* ============================================================ */}

            <SectionAnchor id="authentication">
              <Key className="h-6 w-6 text-[#6C3CE1]" />
              Autenticacao
            </SectionAnchor>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              Todas as requisicoes a API devem incluir uma chave de API no header{' '}
              <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">x-api-key</code>.
              Voce pode gerar chaves na{' '}
              <Link href="/settings/api" className="text-[#6C3CE1] hover:underline font-medium">
                pagina de configuracoes
              </Link>.
            </p>

            <SubSection title="Exemplo de autenticacao">
              <CodeBlock title="cURL" language="bash">
{`curl -X GET "https://eventswap.com.br/api/v1/listings" \\
  -H "x-api-key: evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"`}
              </CodeBlock>

              <CodeBlock title="JavaScript (fetch)" language="javascript">
{`const response = await fetch('https://eventswap.com.br/api/v1/listings', {
  headers: {
    'x-api-key': 'evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4',
  },
});

const data = await response.json();
console.log(data);`}
              </CodeBlock>

              <CodeBlock title="Python (requests)" language="python">
{`import requests

response = requests.get(
    'https://eventswap.com.br/api/v1/listings',
    headers={'x-api-key': 'evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4'}
)

data = response.json()
print(data)`}
              </CodeBlock>
            </SubSection>

            {/* ============================================================ */}
            {/* Listings */}
            {/* ============================================================ */}

            <SectionAnchor id="listings">
              <List className="h-6 w-6 text-[#6C3CE1]" />
              Listings
            </SectionAnchor>

            <SubSection title="Listar anuncios">
              <Endpoint method="GET" path="/api/v1/listings" description="Buscar anuncios ativos com filtros" />

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Retorna uma lista paginada de anuncios ativos na plataforma.
                Suporta filtros por categoria, cidade, faixa de preco e data do evento.
              </p>

              <ParamTable
                params={[
                  { name: 'category', type: 'string', required: false, description: 'ID da categoria (ex: casamento, buffet, espaco)' },
                  { name: 'city', type: 'string', required: false, description: 'Nome da cidade (busca parcial)' },
                  { name: 'state', type: 'string', required: false, description: 'UF do estado (ex: SP, RJ, MG)' },
                  { name: 'search', type: 'string', required: false, description: 'Busca textual no titulo, descricao e local' },
                  { name: 'min_price', type: 'number', required: false, description: 'Preco minimo em BRL' },
                  { name: 'max_price', type: 'number', required: false, description: 'Preco maximo em BRL' },
                  { name: 'event_date_from', type: 'date', required: false, description: 'Data minima do evento (ISO 8601)' },
                  { name: 'event_date_to', type: 'date', required: false, description: 'Data maxima do evento (ISO 8601)' },
                  { name: 'sort', type: 'string', required: false, description: 'Ordenacao: newest, oldest, price_asc, price_desc, event_date_asc, event_date_desc, discount_desc' },
                  { name: 'page', type: 'integer', required: false, description: 'Pagina (default: 1)' },
                  { name: 'per_page', type: 'integer', required: false, description: 'Itens por pagina, max 50 (default: 20)' },
                ]}
              />

              <CodeBlock title="Exemplo de requisicao" language="bash">
{`curl -X GET "https://eventswap.com.br/api/v1/listings?category=casamento&city=Sao+Paulo&min_price=1000&page=1&per_page=10" \\
  -H "x-api-key: evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"`}
              </CodeBlock>

              <CodeBlock title="Exemplo de resposta" language="json">
{`{
  "data": [
    {
      "id": 42,
      "title": "Reserva Buffet Premium - Casamento 150 pessoas",
      "slug": "reserva-buffet-premium-casamento-150-pessoas-lx8k2m",
      "category": "buffet",
      "description": "Buffet completo para casamento...",
      "event_date": "2026-06-15",
      "venue_name": "Espaco Villa Garden",
      "venue_city": "Sao Paulo",
      "venue_state": "SP",
      "venue_country": "BR",
      "original_price": 35000.00,
      "asking_price": 28000.00,
      "discount_percent": 20,
      "is_negotiable": true,
      "images": ["https://..."],
      "status": "ACTIVE",
      "view_count": 234,
      "favorite_count": 18,
      "created_at": "2026-02-10T10:30:00.000Z",
      "updated_at": "2026-02-15T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 47,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "request_id": "req_a1b2c3d4e5f6g7h8i9j0k1l2",
    "timestamp": "2026-02-23T14:30:00.000Z",
    "response_time_ms": 45
  }
}`}
              </CodeBlock>
            </SubSection>

            <SubSection title="Detalhe de um anuncio">
              <Endpoint method="GET" path="/api/v1/listings/:id" description="Buscar um anuncio especifico por ID" />

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Retorna os detalhes completos de um anuncio especifico, incluindo
                informacoes adicionais como endereco do local e condicoes de transferencia.
              </p>

              <CodeBlock title="Exemplo de requisicao" language="bash">
{`curl -X GET "https://eventswap.com.br/api/v1/listings/42" \\
  -H "x-api-key: evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"`}
              </CodeBlock>

              <CodeBlock title="Exemplo de resposta" language="json">
{`{
  "data": {
    "id": 42,
    "title": "Reserva Buffet Premium - Casamento 150 pessoas",
    "slug": "reserva-buffet-premium-casamento-150-pessoas-lx8k2m",
    "category": "buffet",
    "description": "Buffet completo para casamento com entrada, prato principal...",
    "event_date": "2026-06-15",
    "event_end_date": null,
    "venue_name": "Espaco Villa Garden",
    "venue_address": "Rua das Flores, 123",
    "venue_city": "Sao Paulo",
    "venue_state": "SP",
    "venue_country": "BR",
    "original_price": 35000.00,
    "asking_price": 28000.00,
    "discount_percent": 20,
    "is_negotiable": true,
    "images": ["https://..."],
    "has_original_contract": true,
    "transfer_conditions": "Necessario aprovacao do fornecedor",
    "status": "ACTIVE",
    "view_count": 234,
    "favorite_count": 18,
    "created_at": "2026-02-10T10:30:00.000Z",
    "updated_at": "2026-02-15T14:20:00.000Z"
  },
  "meta": {
    "request_id": "req_x9y8z7w6v5u4t3s2r1q0p9o8",
    "timestamp": "2026-02-23T14:31:00.000Z",
    "response_time_ms": 32
  }
}`}
              </CodeBlock>
            </SubSection>

            {/* ============================================================ */}
            {/* Categories */}
            {/* ============================================================ */}

            <SectionAnchor id="categories">
              <Tag className="h-6 w-6 text-[#6C3CE1]" />
              Categories
            </SectionAnchor>

            <SubSection title="Listar categorias">
              <Endpoint method="GET" path="/api/v1/categories" description="Listar todas as categorias com contagem de anuncios" />

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Retorna todas as categorias de eventos disponiveis na plataforma,
                com a contagem de anuncios ativos em cada uma.
              </p>

              <CodeBlock title="Exemplo de requisicao" language="bash">
{`curl -X GET "https://eventswap.com.br/api/v1/categories" \\
  -H "x-api-key: evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"`}
              </CodeBlock>

              <CodeBlock title="Exemplo de resposta" language="json">
{`{
  "data": [
    {
      "id": "casamento",
      "label": "Casamento",
      "label_plural": "Casamentos",
      "description": "Cerimonias, festas e recepcoes de casamento",
      "active_listings_count": 47
    },
    {
      "id": "buffet",
      "label": "Buffet",
      "label_plural": "Buffets",
      "description": "Servicos de buffet e gastronomia para eventos",
      "active_listings_count": 23
    },
    {
      "id": "espaco",
      "label": "Espaco para Eventos",
      "label_plural": "Espacos para Eventos",
      "description": "Saloes de festas, chacaras, sitios e espacos",
      "active_listings_count": 31
    }
  ],
  "meta": {
    "request_id": "req_m1n2o3p4q5r6s7t8u9v0w1x2",
    "timestamp": "2026-02-23T14:32:00.000Z",
    "response_time_ms": 28
  }
}`}
              </CodeBlock>
            </SubSection>

            {/* ============================================================ */}
            {/* Stats */}
            {/* ============================================================ */}

            <SectionAnchor id="stats">
              <BarChart3 className="h-6 w-6 text-[#6C3CE1]" />
              Stats
            </SectionAnchor>

            <SubSection title="Estatisticas da plataforma">
              <Endpoint method="GET" path="/api/v1/stats" description="Estatisticas publicas da plataforma" />

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Retorna estatisticas gerais da plataforma: total de anuncios ativos,
                transacoes completadas, preco medio geral e preco medio por categoria.
                Respostas sao cacheadas por 5 minutos.
              </p>

              <CodeBlock title="Exemplo de requisicao" language="bash">
{`curl -X GET "https://eventswap.com.br/api/v1/stats" \\
  -H "x-api-key: evtswap_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"`}
              </CodeBlock>

              <CodeBlock title="Exemplo de resposta" language="json">
{`{
  "data": {
    "total_active_listings": 156,
    "total_completed_transactions": 89,
    "average_price": 18500.50,
    "currency": "BRL",
    "avg_price_by_category": {
      "casamento": {
        "count": 47,
        "avg_price": 25000.00
      },
      "buffet": {
        "count": 23,
        "avg_price": 15000.00
      },
      "espaco": {
        "count": 31,
        "avg_price": 12000.00
      }
    }
  },
  "meta": {
    "request_id": "req_j1k2l3m4n5o6p7q8r9s0t1u2",
    "timestamp": "2026-02-23T14:33:00.000Z",
    "response_time_ms": 120
  }
}`}
              </CodeBlock>
            </SubSection>

            {/* ============================================================ */}
            {/* Rate Limits */}
            {/* ============================================================ */}

            <SectionAnchor id="rate-limits">
              <Zap className="h-6 w-6 text-amber-500" />
              Rate Limits
            </SectionAnchor>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              A API aplica limites de taxa para garantir estabilidade e uso justo.
              Cada chave de API tem um limite de{' '}
              <strong>100 requisicoes por minuto</strong>.
            </p>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              Os headers de resposta incluem informacoes sobre o limite atual:
            </p>

            <ParamTable
              params={[
                { name: 'X-RateLimit-Limit', type: 'integer', required: false, description: 'Limite maximo de requisicoes por minuto' },
                { name: 'X-RateLimit-Remaining', type: 'integer', required: false, description: 'Requisicoes restantes na janela atual' },
                { name: 'X-RateLimit-Reset', type: 'datetime', required: false, description: 'Quando o limite sera resetado (ISO 8601)' },
                { name: 'X-Request-Id', type: 'string', required: false, description: 'ID unico da requisicao para debugging' },
              ]}
            />

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              Ao exceder o limite, a API retorna status <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">429 Too Many Requests</code> com
              o header <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">Retry-After</code> indicando
              quantos segundos aguardar.
            </p>

            {/* ============================================================ */}
            {/* Errors */}
            {/* ============================================================ */}

            <SectionAnchor id="errors">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Codigos de Erro
            </SectionAnchor>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              A API usa codigos de status HTTP padrao e retorna mensagens de erro
              descritivas no corpo da resposta. Todos os erros seguem o formato:
            </p>

            <CodeBlock title="Formato de erro" language="json">
{`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key required. Include x-api-key header."
  },
  "meta": {
    "request_id": "req_a1b2c3d4e5f6g7h8i9j0k1l2",
    "timestamp": "2026-02-23T14:30:00.000Z"
  }
}`}
            </CodeBlock>

            <ErrorTable />

            {/* CTA */}
            <div className="mt-16 mb-8 bg-gradient-to-br from-[#6C3CE1]/5 to-[#6C3CE1]/10 border border-[#6C3CE1]/20 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
                Pronto para integrar?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                Crie sua conta no EventSwap e gere suas chaves de API para comecar
                a integrar listagens de reservas de eventos no seu sistema.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#6C3CE1] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#5B32C1] transition-colors shadow-md shadow-[#6C3CE1]/25"
                >
                  Solicitar Acesso
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/settings/api"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Gerenciar Chaves
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            EventSwap API v1 - Documentacao
          </p>
          <p className="text-xs text-neutral-400">
            suporte@eventswap.com.br
          </p>
        </div>
      </footer>
    </div>
  );
}
