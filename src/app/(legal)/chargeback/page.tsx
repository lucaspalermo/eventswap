import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Chargeback e Estorno',
  description: 'Politica de Chargeback e Estorno da EventSwap - Entenda quando e como solicitar estorno, prazos de analise e como o sistema de escrow protege suas transacoes.',
};

export default function ChargebackPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed">
      <h1>Politica de Chargeback e Estorno</h1>
      <p className="text-neutral-500 dark:text-neutral-400 !text-xs">
        Ultima atualizacao: 23 de fevereiro de 2026
      </p>

      {/* 1. O que e Chargeback */}
      <h2>1. O que e Chargeback</h2>
      <p>
        Chargeback e o processo de reversao de uma transacao financeira iniciado pelo titular do
        cartao de credito junto a sua operadora, geralmente em situacoes de uso nao autorizado,
        nao entrega do servico contratado ou divergencia significativa entre o produto/servico
        recebido e o anunciado.
      </p>
      <p>
        Na EventSwap, &quot;estorno&quot; e o termo mais abrangente que engloba tanto o chargeback
        (iniciado via operadora de cartao) quanto a devolucao direta do valor processado via
        Pix ou boleto bancario, solicitada diretamente a Plataforma. Esta Politica cobre ambos
        os casos e define as regras, prazos e processos aplicaveis.
      </p>
      <p>
        Dado que a EventSwap utiliza um sistema de custodia (escrow), a grande maioria das
        situacoes de insatisfacao pode ser resolvida diretamente pela Plataforma, sem necessidade
        de recorrer a operadora de cartao. Isso e mais rapido, mais simples e oferece maior
        protecao a ambas as partes.
      </p>

      {/* 2. Quando o Chargeback se Aplica */}
      <h2>2. Quando o Estorno/Chargeback se Aplica</h2>
      <p>
        O comprador tem direito a estorno integral do valor pago nas seguintes situacoes:
      </p>

      <h3>2.1 Cancelamento antes da transferencia da reserva</h3>
      <p>
        Se o comprador solicitar o cancelamento da transacao antes de o vendedor confirmar
        a transferencia da reserva ao fornecedor, o reembolso sera integral, descontadas
        apenas as taxas impostas pelo meio de pagamento (quando aplicavel). A solicitacao
        deve ser feita dentro de 24 horas apos o pagamento para isenção total das taxas.
      </p>

      <h3>2.2 Nao conformidade com o anunciado</h3>
      <p>
        Se a reserva transferida apresentar divergencias significativas em relacao ao que
        foi anunciado, como:
      </p>
      <ul>
        <li>Data do evento diferente da informada no anuncio</li>
        <li>Fornecedor distinto do anunciado (ex.: outro buffet, outro fotografo)</li>
        <li>Servicos contratados significativamente inferiores ao descrito</li>
        <li>Restricoes nao informadas que inviabilizem o uso da reserva pelo comprador</li>
      </ul>
      <p>
        Nesses casos, o comprador deve abrir uma disputa em ate <strong>5 dias uteis</strong> apos
        a confirmacao da transferencia. Consulte nossa{' '}
        <Link href="/disputes" className="text-[#2563EB] hover:underline no-underline">
          Politica de Mediacao e Disputas
        </Link>{' '}
        para o procedimento detalhado.
      </p>

      <h3>2.3 Fraude comprovada</h3>
      <p>
        Em casos de fraude comprovada, como anuncio de reserva inexistente, uso de identidade falsa
        pelo vendedor ou qualquer outra pratica fraudulenta identificada pela EventSwap, o reembolso
        sera integral e prioritario, processado em ate <strong>3 dias uteis</strong> apos a
        confirmacao da fraude.
      </p>

      <h3>2.4 Falha tecnica na transacao</h3>
      <p>
        Se o valor for debitado do comprador mas a transacao nao for registrada na Plataforma por
        falha tecnica, o reembolso sera realizado assim que a falha for identificada e confirmada,
        em no maximo 5 dias uteis.
      </p>

      {/* 3. Quando o Chargeback NAO se Aplica */}
      <h2>3. Quando o Estorno NAO se Aplica</h2>
      <p>
        O estorno nao sera concedido nas seguintes situacoes:
      </p>

      <h3>3.1 Desistencia apos transferencia concluida</h3>
      <p>
        Uma vez que a transferencia da reserva tenha sido confirmada pelo fornecedor e aceita
        pelo comprador, a transacao e considerada concluida. Mudancas de opiniao ou desistencia
        posterior nao dao direito a estorno. A EventSwap recomenda que o comprador verifique
        todas as informacoes antes de confirmar o recebimento.
      </p>

      <h3>3.2 Mudanca de opiniao sem justificativa</h3>
      <p>
        Cancelamentos solicitados sem motivo justificado apos o vendedor ter iniciado o processo
        de transferencia, gerando custos e prejuizos ao vendedor, podem nao ser elegíveis a
        reembolso integral. Nesses casos, aplica-se a taxa administrativa descrita na secao 6.
      </p>

      <h3>3.3 Problemas com o fornecedor apos a transferencia</h3>
      <p>
        Questoes relacionadas ao desempenho ou qualidade do fornecedor do servico de evento
        (ex.: qualidade da comida no buffet, desempenho do fotografo no dia do evento) estao
        fora do escopo da EventSwap, que atua exclusivamente como intermediaria na transferencia
        da reserva. Nesses casos, o comprador deve buscar seus direitos diretamente com o
        fornecedor do servico.
      </p>

      <h3>3.4 Chargeback abusivo</h3>
      <p>
        A tentativa de chargeback junto a operadora de cartao em situacoes nas quais o servico
        foi efetivamente prestado (transferencia da reserva confirmada) e considerada fraude
        pelo usuario. Nesse caso, a EventSwap apresentara todas as evidencias disponiveis a
        operadora de cartao e podera adotar medidas legais contra o comprador.
      </p>

      {/* 4. Processo de Solicitacao */}
      <h2>4. Processo de Solicitacao de Estorno</h2>

      <h3>4.1 Como solicitar</h3>
      <p>Para solicitar um estorno, o comprador deve:</p>
      <ol>
        <li>Acessar a transacao em questao na secao &quot;Minhas Compras&quot; da Plataforma</li>
        <li>Clicar em &quot;Solicitar Estorno&quot; ou &quot;Abrir Disputa&quot;</li>
        <li>Selecionar o motivo da solicitacao</li>
        <li>Descrever detalhadamente o problema</li>
        <li>Anexar evidencias (prints, conversas, documentos) quando disponivel</li>
        <li>Enviar a solicitacao</li>
      </ol>

      <h3>4.2 Prazo para solicitacao</h3>
      <p>
        A solicitacao de estorno deve ser feita em ate <strong>7 dias uteis</strong> apos a data
        de conclusao da transacao (confirmacao da transferencia pelo comprador ou liberacao automatica
        do escrow). Solicitacoes fora deste prazo serao analisadas em carater excepcional e podem
        nao ser elegíveis a reembolso.
      </p>

      {/* 5. Prazos de Analise */}
      <h2>5. Prazos de Analise</h2>
      <p>Apos o recebimento da solicitacao, a EventSwap seguira os seguintes prazos:</p>
      <ul>
        <li><strong>Confirmacao de recebimento:</strong> ate 1 dia util</li>
        <li><strong>Analise inicial:</strong> ate 2 dias uteis</li>
        <li><strong>Solicitacao de documentacao adicional</strong> (se necessario): a partir da analise inicial</li>
        <li><strong>Decisao final:</strong> ate 10 dias uteis a partir da data de abertura da solicitacao</li>
        <li><strong>Processamento do reembolso</strong> (caso aprovado): conforme prazos por meio de pagamento (secao 7)</li>
      </ul>
      <p>
        Em casos de alta complexidade ou necessidade de investigacao aprofundada, o prazo de analise
        pode ser estendido por mais 5 dias uteis, com notificacao ao solicitante.
      </p>

      {/* 6. Valores e Taxas */}
      <h2>6. Valores e Taxas</h2>

      <h3>6.1 Reembolso integral</h3>
      <p>
        Nos casos elegíveis listados na secao 2, o reembolso e integral ao valor pago pelo
        comprador, sem desconto de taxas ou comissoes da EventSwap.
      </p>

      <h3>6.2 Taxa administrativa por cancelamento voluntario</h3>
      <p>
        Em casos de cancelamento voluntario pelo comprador, sem culpa do vendedor, apos o
        vendedor ter iniciado o processo de transferencia, aplica-se uma <strong>taxa administrativa
        de 5% (cinco por cento)</strong> sobre o valor total da transacao, destinada a cobrir
        custos operacionais e compensar parcialmente o vendedor pelo tempo e esforco empregados.
      </p>

      <h3>6.3 Taxas de meio de pagamento</h3>
      <p>
        As taxas cobradas pelos meios de pagamento (operadoras de cartao, bancos) podem ser
        nao reembolsaveis, dependendo das politicas de cada operadora. A EventSwap informara
        o valor exato do reembolso antes de sua processamento.
      </p>

      {/* 7. Estorno por Meio de Pagamento */}
      <h2>7. Prazos de Estorno por Meio de Pagamento</h2>

      <h3>7.1 Estorno via Pix</h3>
      <p>
        Reembolsos de transacoes pagas via Pix sao processados pela EventSwap em ate
        <strong> 3 dias uteis</strong> apos a aprovacao do estorno. O valor e devolvido
        para a mesma chave Pix utilizada no pagamento ou, a criterio do usuario, para
        uma chave Pix diferente informada na solicitacao.
      </p>

      <h3>7.2 Estorno via Cartao de Credito</h3>
      <p>
        Reembolsos de transacoes pagas com cartao de credito podem levar de
        <strong> 10 a 30 dias uteis</strong> para aparecerem na fatura, dependendo da
        operadora do cartao. A EventSwap processa o estorno em ate 5 dias uteis apos
        a aprovacao; a efetivacao na fatura depende do ciclo de fechamento da operadora.
        Para transacoes parceladas, o estorno pode ser realizado em parcelas ou de forma
        consolidada, conforme politica da operadora.
      </p>

      <h3>7.3 Estorno via Boleto Bancario</h3>
      <p>
        Transacoes pagas via boleto sao reembolsadas por transferencia bancaria (TED/PIX)
        para uma conta informada pelo solicitante. O prazo e de ate <strong>5 dias uteis</strong>
        apos a aprovacao do estorno e confirmacao dos dados bancarios. O CPF do titular da
        conta deve coincidir com o CPF cadastrado na EventSwap.
      </p>

      {/* 8. Casos de Fraude */}
      <h2>8. Casos de Fraude</h2>

      <h3>8.1 Fraude identificada pela EventSwap</h3>
      <p>
        Quando a EventSwap identifica uma fraude em uma transacao, a Plataforma atua de
        forma proativa para proteger o usuario prejudicado:
      </p>
      <ul>
        <li>Bloqueio imediato dos valores em custodia</li>
        <li>Suspensao preventiva da conta do infrator</li>
        <li>Reembolso integral ao usuario prejudicado em ate 3 dias uteis</li>
        <li>Abertura de investigacao interna</li>
        <li>Notificacao as autoridades competentes, quando cabivel</li>
      </ul>

      <h3>8.2 Fraude reportada pelo usuario</h3>
      <p>
        Caso o usuario identifique uma fraude, deve reportar imediatamente pelo canal de
        seguranca (seguranca@eventswap.com). Nossa equipe analisara o caso em carater
        urgente e tomara as medidas necessarias. Consulte nossa{' '}
        <Link href="/antifraud" className="text-[#2563EB] hover:underline no-underline">
          Politica Antifraude
        </Link>{' '}
        para mais detalhes sobre como reportar.
      </p>

      {/* 9. Protecao Escrow */}
      <h2>9. Protecao Escrow e Reducao de Chargebacks</h2>
      <p>
        O sistema de custodia (escrow) da EventSwap e o principal instrumento de reducao
        de chargebacks e estornos, pois:
      </p>
      <ul>
        <li>
          <strong>Protege o comprador:</strong> o dinheiro nao vai ao vendedor antes da confirmacao
          da transferencia, eliminando o risco de o vendedor sumir com o dinheiro sem entregar a reserva
        </li>
        <li>
          <strong>Protege o vendedor:</strong> o pagamento esta garantido em custodia antes de
          o vendedor realizar qualquer acao, eliminando o risco de nao receber apos a transferencia
        </li>
        <li>
          <strong>Reduz disputas:</strong> como ambas as partes tem suas obrigacoes claramente
          definidas e monitoradas pela Plataforma, ha menor margem para mal-entendidos
        </li>
        <li>
          <strong>Evidencia para chargebacks:</strong> todo o processo e registrado na Plataforma,
          fornecendo evidencias claras em caso de disputa com operadoras de cartao
        </li>
      </ul>
      <p>
        A EventSwap recomenda que compradores e vendedores sempre utilizem os canais oficiais da
        Plataforma para comunicacao e resolucao de problemas, aproveitando todas as protecoes
        oferecidas pelo sistema de escrow.
      </p>

      {/* 10. Contato */}
      <h2>10. Contato</h2>
      <p>
        Para duvidas sobre esta politica, solicitacoes de estorno ou qualquer questao relacionada
        a transacoes, entre em contato com nosso suporte:
      </p>
      <ul>
        <li><strong>E-mail:</strong> suporte@eventswap.com</li>
        <li><strong>Disputas e estornos:</strong> financeiro@eventswap.com</li>
        <li><strong>Chat de suporte:</strong> disponivel na Plataforma para usuarios autenticados</li>
      </ul>
      <p>
        Nos comprometemos a responder todas as solicitacoes dentro do prazo de 2 dias uteis
        e a processar reembolsos aprovados no menor prazo possivel.
      </p>

      {/* Links relacionados */}
      <div className="mt-12 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 not-prose">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Documentos relacionados
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="text-sm text-[#2563EB] hover:underline">
            Termos de Uso
          </Link>
          <Link href="/antifraud" className="text-sm text-[#2563EB] hover:underline">
            Politica Antifraude
          </Link>
          <Link href="/disputes" className="text-sm text-[#2563EB] hover:underline">
            Mediacao e Disputas
          </Link>
          <Link href="/privacy" className="text-sm text-[#2563EB] hover:underline">
            Politica de Privacidade
          </Link>
        </div>
      </div>
    </article>
  );
}
