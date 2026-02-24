import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Mediacao e Disputas',
  description: 'Politica de Mediacao e Disputas da EventSwap - Entenda como funciona o processo de resolucao de conflitos entre compradores e vendedores na Plataforma.',
};

export default function DisputesPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed">
      <h1>Politica de Mediacao e Disputas</h1>
      <p className="text-neutral-500 dark:text-neutral-400 !text-xs">
        Ultima atualizacao: 23 de fevereiro de 2026
      </p>

      {/* 1. Principios da Mediacao */}
      <h2>1. Principios da Mediacao EventSwap</h2>
      <p>
        A EventSwap acredita que a grande maioria dos conflitos entre compradores e vendedores pode
        ser resolvida de forma amigavel, rapida e justa. Nosso sistema de mediacao foi desenvolvido
        com base nos seguintes principios:
      </p>
      <ul>
        <li><strong>Imparcialidade:</strong> a EventSwap nao tem interesse financeiro no resultado da disputa, uma vez que a comissao ja foi destacada do valor em custodia. Nossa analise e sempre baseada em evidencias objetivas</li>
        <li><strong>Transparencia:</strong> ambas as partes sao informadas sobre cada etapa do processo e tem acesso as mesmas informacoes relevantes para a decisao</li>
        <li><strong>Celeridade:</strong> disputas sao resolvidas em prazos definidos e curtos, minimizando o impacto sobre os eventos das partes envolvidas</li>
        <li><strong>Proporcionalidade:</strong> as resolucoes buscam equilibrar os interesses legitimos de ambas as partes, evitando prejuizos desnecessarios</li>
        <li><strong>Boa-fe:</strong> esperamos que ambas as partes atuem com honestidade e colaboracao durante o processo</li>
      </ul>
      <p>
        O processo de mediacao da EventSwap nao substitui nem impede que as partes busquem seus
        direitos pela via judicial, conforme previsto nos Termos de Uso.
      </p>

      {/* 2. Quando Abrir uma Disputa */}
      <h2>2. Quando Abrir uma Disputa</h2>
      <p>
        O comprador pode abrir uma disputa nas seguintes situacoes:
      </p>

      <h3>2.1 Listagem nao corresponde a realidade</h3>
      <p>Quando a reserva recebida difere significativamente do que foi anunciado, por exemplo:</p>
      <ul>
        <li>O fornecedor do servico e diferente do indicado no anuncio</li>
        <li>A data ou horario do evento esta incorreto</li>
        <li>Os servicos incluidos na reserva sao diferentes ou inferiores ao descrito</li>
        <li>O local do evento e diferente do anunciado</li>
        <li>Informacoes essenciais foram omitidas ou ocultadas no anuncio</li>
      </ul>

      <h3>2.2 Fornecedor nao aceita a transferencia</h3>
      <p>
        Quando o fornecedor do servico (buffet, fotografo, decorador, etc.) se recusa a aceitar a
        transferencia da reserva por razoes relacionadas ao vendedor, como:
      </p>
      <ul>
        <li>O vendedor nao possui autorizacao do fornecedor para transferir a reserva</li>
        <li>Existem debitos ou pendencias do vendedor com o fornecedor que impedem a transferencia</li>
        <li>O contrato original veda expressamente a transferencia da reserva</li>
      </ul>

      <h3>2.3 Problemas de pagamento e entrega</h3>
      <ul>
        <li>O vendedor recebeu a confirmacao do pagamento em custodia mas nao esta respondendo</li>
        <li>O vendedor declarou ter realizado a transferencia, mas o comprador nao recebeu confirmacao do fornecedor</li>
        <li>Documentacao da transferencia apresentada pelo vendedor apresenta inconsistencias</li>
      </ul>

      <h3>2.4 O vendedor pode abrir disputa quando:</h3>
      <ul>
        <li>O comprador confirmou o recebimento da reserva mas esta solicitando estorno sem justificativa</li>
        <li>O comprador nao esta confirmando o recebimento, impedindo a liberacao do pagamento</li>
        <li>Acusacoes infundadas de nao conformidade estao sendo feitas contra um anuncio legitimo</li>
      </ul>

      {/* 3. Como Abrir uma Disputa */}
      <h2>3. Como Abrir uma Disputa</h2>

      <h3>3.1 Passo a passo</h3>
      <ol>
        <li>
          <strong>Acesse a transacao:</strong> va ate a secao &quot;Minhas Compras&quot; ou &quot;Minhas Vendas&quot;
          e localize a transacao em questao
        </li>
        <li>
          <strong>Clique em &quot;Abrir Disputa&quot;:</strong> o botao esta disponivel enquanto o
          valor estiver em custodia ou dentro do prazo de 5 dias uteis apos a conclusao
        </li>
        <li>
          <strong>Selecione o motivo:</strong> escolha a categoria que melhor descreve o problema
        </li>
        <li>
          <strong>Descreva o problema:</strong> forneca uma descricao clara, objetiva e detalhada
          da situacao, incluindo o que foi prometido e o que foi entregue
        </li>
        <li>
          <strong>Anexe evidencias:</strong> inclua prints de conversas, documentos, fotos e
          qualquer material que sustente sua posicao
        </li>
        <li>
          <strong>Envie a disputa:</strong> nossa equipe recebera notificacao imediata e dara
          inicio ao processo de mediacao
        </li>
      </ol>

      <h3>3.2 Prazo para abertura de disputa</h3>
      <p>
        A disputa deve ser aberta em ate <strong>5 dias uteis apos a confirmacao da transferencia</strong>
        da reserva (data em que o comprador confirmou o recebimento ou data da liberacao automatica
        do escrow). Disputas abertas fora deste prazo serao analisadas em carater excepcional.
      </p>
      <p>
        Quando o valor ainda estiver em custodia (antes da confirmacao), a disputa pode ser aberta
        a qualquer momento durante o periodo de custodia.
      </p>

      {/* 4. Processo de Mediacao */}
      <h2>4. Processo de Mediacao</h2>

      <h3>4.1 Etapa 1: Analise inicial (ate 24 horas)</h3>
      <p>
        Apos o recebimento da disputa, nossa equipe realiza uma analise inicial para verificar
        se a solicitacao esta dentro dos criterios estabelecidos nesta politica, se ha informacoes
        suficientes para dar inicio ao processo e se e necessario solicitar documentacao adicional.
        O usuario recebera uma notificacao confirmando o recebimento e o numero do protocolo.
      </p>

      <h3>4.2 Etapa 2: Coleta de evidencias (ate 3 dias uteis)</h3>
      <p>
        A outra parte (vendedor ou comprador, dependendo de quem abriu a disputa) e notificada e
        tem um prazo de <strong>3 dias uteis</strong> para apresentar sua versao dos fatos e
        evidencias. Durante este periodo:
      </p>
      <ul>
        <li>O valor permanece em custodia</li>
        <li>Ambas as partes podem enviar documentos e evidencias adicionais</li>
        <li>A equipe da EventSwap pode solicitar informacoes especificas a qualquer das partes</li>
        <li>Recomendamos que as partes tentem um acordo direto neste periodo</li>
      </ul>

      <h3>4.3 Etapa 3: Analise e decisao (ate 5 dias uteis)</h3>
      <p>
        Apos a coleta de evidencias, nossa equipe analisa todo o material apresentado e emite
        uma decisao fundamentada em ate <strong>5 dias uteis</strong>. A decisao e comunicada
        a ambas as partes simultaneamente, com justificativa clara para o resultado.
      </p>

      {/* 5. Evidencias Aceitas */}
      <h2>5. Evidencias Aceitas</h2>
      <p>
        Para embasar sua posicao na disputa, voce pode apresentar as seguintes evidencias:
      </p>

      <h3>5.1 Evidencias documentais</h3>
      <ul>
        <li>Contrato original de reserva com o fornecedor</li>
        <li>Recibos e comprovantes de pagamento ao fornecedor</li>
        <li>E-mails e confirmacoes do fornecedor sobre a reserva</li>
        <li>Documentos de transferencia de titularidade da reserva</li>
        <li>Orcamentos e proposta comercial do fornecedor</li>
      </ul>

      <h3>5.2 Comunicacoes</h3>
      <ul>
        <li>Prints do chat da Plataforma (verificados automaticamente pela EventSwap)</li>
        <li>E-mails trocados entre as partes</li>
        <li>Prints de conversas por WhatsApp ou outros aplicativos de mensagem</li>
        <li>Gravacoes de chamadas (desde que obtidas conforme a legislacao aplicavel)</li>
      </ul>

      <h3>5.3 Materiais visuais</h3>
      <ul>
        <li>Fotos e videos da reserva ou do local do evento</li>
        <li>Comparativo entre fotos do anuncio e a realidade</li>
        <li>Screenshots do anuncio original (a EventSwap tambem mantém historico interno)</li>
      </ul>

      <h3>5.4 Declaracoes de terceiros</h3>
      <ul>
        <li>Confirmacao escrita do fornecedor sobre o status da reserva</li>
        <li>Declaracoes de testemunhas relevantes para o caso</li>
      </ul>
      <p>
        <strong>Importante:</strong> evidencias adulteradas ou fabricadas sao consideradas fraude
        e resultarao em penalidades severas, independentemente do resultado da disputa.
      </p>

      {/* 6. Criterios de Decisao */}
      <h2>6. Criterios de Decisao</h2>
      <p>Nossa equipe considera os seguintes criterios ao analisar uma disputa:</p>
      <ul>
        <li>
          <strong>Conformidade com o anuncio:</strong> a reserva entregue corresponde em todos os aspectos essenciais ao que foi anunciado?
        </li>
        <li>
          <strong>Qualidade das evidencias:</strong> qual das partes apresentou evidencias mais robustas e consistentes?
        </li>
        <li>
          <strong>Historico de comportamento:</strong> as partes tem historico de boa-fe na Plataforma?
        </li>
        <li>
          <strong>Proporcionalidade:</strong> a resolucao solicitada e proporcional ao problema identificado?
        </li>
        <li>
          <strong>Legislacao aplicavel:</strong> o Codigo de Defesa do Consumidor, o Codigo Civil e demais normas aplicaveis sao levados em consideracao
        </li>
        <li>
          <strong>Precedentes:</strong> casos similares resolvidos anteriormente pela Plataforma sao considerados para manter a consistencia das decisoes
        </li>
      </ul>

      {/* 7. Possiveis Resolucoes */}
      <h2>7. Possiveis Resolucoes</h2>
      <p>A decisao da mediacao pode resultar em:</p>

      <h3>7.1 Reembolso total ao comprador</h3>
      <p>
        Aplicado quando ha evidencias claras de que o vendedor nao cumpriu o acordado, a reserva
        nao existe ou apresenta divergencias substanciais em relacao ao anunciado. O valor em
        custodia e devolvido integralmente ao comprador.
      </p>

      <h3>7.2 Reembolso parcial ao comprador</h3>
      <p>
        Aplicado em casos de nao conformidade parcial, onde a reserva foi entregue mas com algumas
        deficiencias em relacao ao anunciado. O valor e dividido proporcionalmente entre comprador
        (reembolso) e vendedor (pagamento pela parte entregue), com deducao da comissao da Plataforma.
      </p>

      <h3>7.3 Liberacao total ao vendedor</h3>
      <p>
        Aplicado quando as evidencias demonstram que o vendedor cumpriu integralmente o acordado
        e a disputa nao tem fundamentacao. O valor em custodia e liberado ao vendedor, descontada
        a comissao da Plataforma.
      </p>

      <h3>7.4 Acordo mutuo facilitado</h3>
      <p>
        Em alguns casos, a equipe de mediacao pode propor um acordo especifico que atenda parcialmente
        aos interesses de ambas as partes, como um credito na Plataforma, reprogramacao da reserva
        ou outro beneficio acordado mutuamente.
      </p>

      {/* 8. Recurso */}
      <h2>8. Recurso</h2>
      <p>
        Cada parte tem direito a apresentar <strong>1 (um) recurso</strong> contra a decisao da
        mediacao, dentro de <strong>3 dias uteis</strong> apos o recebimento da decisao.
      </p>

      <h3>8.1 Como apresentar recurso</h3>
      <p>O recurso deve ser apresentado por e-mail (disputas@eventswap.com) contendo:</p>
      <ul>
        <li>Numero do protocolo da disputa original</li>
        <li>Justificativa clara para o recurso</li>
        <li>Novas evidencias ou argumentos nao apresentados na disputa original (o recurso baseado nos mesmos argumentos ja analisados sera indeferido)</li>
      </ul>

      <h3>8.2 Analise do recurso</h3>
      <p>
        O recurso sera analisado por um membro senior da equipe de mediacao, diferente do responsavel
        pela decisao original. A decisao sobre o recurso sera emitida em ate <strong>5 dias uteis</strong>
        e e definitiva no ambito da Plataforma.
      </p>

      {/* 9. Papel do Escrow */}
      <h2>9. Papel do Escrow na Disputa</h2>
      <p>
        O sistema de custodia (escrow) da EventSwap e fundamental para o processo de mediacao:
      </p>
      <ul>
        <li>
          <strong>Fundos retidos:</strong> enquanto uma disputa estiver aberta, o valor permanece
          integralmente em custodia, sem possibilidade de liberacao unilateral por qualquer das partes
        </li>
        <li>
          <strong>Protecao durante a analise:</strong> nenhuma das partes tem acesso ao valor durante
          o processo de mediacao, garantindo imparcialidade e reduzindo a pressao sobre as decisoes
        </li>
        <li>
          <strong>Execucao imediata:</strong> apos a decisao final (ou do recurso), a liberacao ou
          devolucao dos fundos e realizada automaticamente pela Plataforma, sem necessidade de acoes
          adicionais das partes
        </li>
        <li>
          <strong>Evidencia de pagamento:</strong> o escrow serve como comprovante inequivoco de que
          o pagamento foi realizado, eliminando discussoes sobre este aspecto nas disputas
        </li>
      </ul>

      {/* 10. Prevencao de Disputas */}
      <h2>10. Prevencao de Disputas</h2>
      <p>
        A melhor disputa e a que nunca precisa ser aberta. Confira nossas dicas para compradores
        e vendedores:
      </p>

      <h3>10.1 Dicas para o comprador</h3>
      <ul>
        <li>Leia o anuncio com atencao, incluindo todas as restricoes e condicoes de transferencia</li>
        <li>Tire todas as suas duvidas com o vendedor pelo chat da Plataforma antes de realizar o pagamento</li>
        <li>Solicite comprovacao de que o fornecedor aceita transferencias da reserva</li>
        <li>Confirme a data e os detalhes da reserva diretamente com o fornecedor antes de confirmar o recebimento</li>
        <li>Nao confirme o recebimento sem verificar que a reserva foi efetivamente transferida para seu nome</li>
      </ul>

      <h3>10.2 Dicas para o vendedor</h3>
      <ul>
        <li>Descreva a reserva com precisao e honestidade, incluindo todas as restricoes relevantes</li>
        <li>Verifique com o fornecedor a possibilidade de transferencia antes de publicar o anuncio</li>
        <li>Documente todas as etapas da transferencia com confirmacoes por escrito do fornecedor</li>
        <li>Comunique qualquer problema ou atraso imediatamente ao comprador pelo chat da Plataforma</li>
        <li>Mantenha a comunicacao sempre dentro da Plataforma para garantir que tudo fique registrado</li>
      </ul>

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
          <Link href="/chargeback" className="text-sm text-[#2563EB] hover:underline">
            Politica de Chargeback
          </Link>
          <Link href="/privacy" className="text-sm text-[#2563EB] hover:underline">
            Politica de Privacidade
          </Link>
        </div>
      </div>
    </article>
  );
}
