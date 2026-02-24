import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, CreditCard, Users, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como Funciona a Transferência de Reservas de Eventos | EventSwap',
  description: 'Saiba como transferir sua reserva de casamento, buffet ou evento no EventSwap. Processo seguro em 3 passos: anuncie, negocie e transfira com proteção de escrow. Evite multas de cancelamento.',
  keywords: [
    'como transferir reserva de casamento',
    'como vender reserva de buffet',
    'transferência de reserva de evento como funciona',
    'processo de transferência de contrato de evento',
    'evitar multa cancelamento de buffet',
    'alternativa cancelamento de casamento',
  ],
  alternates: {
    canonical: 'https://eventswap.com.br/como-funciona',
  },
  openGraph: {
    title: 'Como Funciona | EventSwap - Transferência Segura de Reservas',
    description: 'Processo simples em 3 passos para transferir sua reserva de evento. Segurança total com escrow.',
    url: 'https://eventswap.com.br/como-funciona',
    type: 'website',
  },
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB]/5 via-white to-sky-50 dark:from-[#2563EB]/10 dark:via-zinc-950 dark:to-zinc-900 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            Como Funciona a Transferência de Reservas no{' '}
            <span className="text-[#2563EB]">EventSwap</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Desistiu do casamento, buffet ou festa? Não perca seu dinheiro com multas de cancelamento.
            Transfira sua reserva para outra pessoa de forma segura e rápida.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-12">
            Processo Simples em 3 Passos
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Anuncie sua Reserva
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Crie um anúncio com os detalhes da sua reserva: tipo de evento (casamento, buffet, salão de festa,
                  fotógrafo, DJ, decoração, etc.), data, local, valor original e preço desejado para a transferência.
                  Adicione fotos e documentos do contrato para maior credibilidade.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Negocie com Compradores
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Compradores interessados entram em contato pelo chat integrado da plataforma.
                  Negocie o valor, tire dúvidas e combine os detalhes da transferência.
                  O sistema de ofertas permite que compradores façam propostas que você pode aceitar ou recusar.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Transferência Segura com Escrow
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Quando o comprador aceita, o pagamento é feito via PIX ou cartão de crédito e fica
                  retido em escrow (conta protegida). O valor só é liberado para você após a confirmação
                  da transferência pelo fornecedor do serviço. Segurança total para ambas as partes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-12">
            Por que Usar o EventSwap em Vez de Cancelar?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 mb-4">
                <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Evite Multas de Cancelamento</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Buffets e fornecedores cobram multas de 10% a 50% do valor do contrato em caso de cancelamento.
                Com o EventSwap, você recupera seu investimento transferindo a reserva.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pagamento Protegido por Escrow</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                O dinheiro fica em uma conta protegida até a transferência ser confirmada.
                Se algo der errado, o comprador recebe reembolso integral.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 mb-4">
                <Users className="h-5 w-5 text-[#2563EB]" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Verificação de Identidade (KYC)</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Todos os vendedores passam por verificação de identidade,
                garantindo que são pessoas reais e confiáveis.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 mb-4">
                <FileCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Economize até 70%</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Compradores encontram reservas de eventos com descontos incríveis.
                Casamentos, buffets e festas por uma fração do preço original.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with semantic HTML */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-12">
            Perguntas Frequentes sobre Transferência de Reservas
          </h2>

          <div className="space-y-6">
            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                Posso transferir uma reserva de casamento?
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sim! Reservas de casamento são as mais comuns no EventSwap. Você pode transferir reservas de
                buffets para casamento, salões de festa, fotógrafos de casamento, decoração, DJ, vestido de noiva
                e qualquer outro serviço contratado para o casamento.
              </p>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                O fornecedor precisa aprovar a transferência?
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Depende do contrato. Alguns fornecedores exigem aprovação para transferência, outros não.
                O EventSwap possui um sistema de aprovação de fornecedor integrado, onde o fornecedor
                pode confirmar a transferência diretamente pela plataforma.
              </p>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                Quanto tempo demora para receber o pagamento?
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Após a confirmação da transferência pelo fornecedor, o pagamento é liberado do escrow
                para sua conta em até 3 dias úteis. Você pode acompanhar todo o processo em tempo real
                pelo painel do EventSwap.
              </p>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                E se o comprador desistir após o pagamento?
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Se a transferência já foi confirmada pelo fornecedor, o pagamento é garantido.
                Se houver disputas antes da confirmação, nosso sistema de mediação analisa o caso
                e toma a decisão mais justa para ambas as partes.
              </p>
            </details>

            <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                É legal transferir uma reserva de evento?
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sim, a transferência de contratos (cessão de direitos) é prevista no Código Civil Brasileiro.
                Desde que o fornecedor concorde com a transferência, o processo é totalmente legal.
                O EventSwap facilita e documenta todo o processo para sua segurança jurídica.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2563EB] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Pronto para Transferir sua Reserva?
          </h2>
          <p className="text-[#2563EB]/80 text-white/80 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a anunciar em minutos.
            Milhares de compradores estão buscando reservas de eventos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#2563EB] px-8 py-3 font-semibold hover:bg-zinc-100 transition-colors"
            >
              Criar Conta Grátis
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
