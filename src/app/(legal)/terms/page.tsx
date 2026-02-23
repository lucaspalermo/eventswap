import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso da EventSwap - Regras e condicoes para utilizacao do marketplace de transferencia de reservas de eventos.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed">
      <h1>Termos de Uso</h1>
      <p className="text-neutral-500 dark:text-neutral-400 !text-xs">
        Ultima atualizacao: 23 de fevereiro de 2026
      </p>

      {/* 1. Aceitacao dos Termos */}
      <h2>1. Aceitacao dos Termos</h2>
      <p>
        Ao acessar ou utilizar a plataforma EventSwap (&quot;Plataforma&quot;), voce concorda integralmente
        com estes Termos de Uso. Caso nao concorde com qualquer disposicao, nao utilize nossos servicos.
      </p>
      <p>
        Estes Termos constituem um contrato vinculante entre voce (&quot;Usuario&quot;) e a EventSwap,
        aplicavel a todo e qualquer uso da Plataforma, incluindo navegacao, cadastro, publicacao de
        anuncios e realizacao de transacoes.
      </p>

      {/* 2. Descricao do Servico */}
      <h2>2. Descricao do Servico</h2>
      <p>
        A EventSwap e um marketplace digital que conecta pessoas que desejam transferir reservas de
        eventos (vendedores) com pessoas interessadas em adquiri-las (compradores). A Plataforma atua
        como intermediaria, oferecendo:
      </p>
      <ul>
        <li>Publicacao de anuncios de reservas de eventos (casamentos, buffets, fotografos, decoracao, entre outros)</li>
        <li>Sistema de busca e filtragem para encontrar reservas disponiveis</li>
        <li>Chat integrado para comunicacao entre compradores e vendedores</li>
        <li>Processamento seguro de pagamentos com custodia temporaria (escrow)</li>
        <li>Sistema de avaliacoes e reputacao para usuarios</li>
        <li>Suporte na mediacao de disputas</li>
      </ul>
      <p>
        A EventSwap nao e parte dos contratos firmados entre compradores e vendedores, nem e prestadora
        dos servicos de eventos anunciados. Atuamos exclusivamente como intermediaria tecnologica.
      </p>

      {/* 3. Cadastro e Conta */}
      <h2>3. Cadastro e Conta</h2>

      <h3>3.1 Requisitos de cadastro</h3>
      <p>Para utilizar a Plataforma, voce deve:</p>
      <ul>
        <li>Ter no minimo 18 (dezoito) anos de idade ou ser emancipado nos termos da lei civil brasileira</li>
        <li>Fornecer informacoes veridicas, completas e atualizadas durante o cadastro</li>
        <li>Possuir um CPF valido e regular</li>
        <li>Possuir um endereco de e-mail valido e acessivel</li>
      </ul>

      <h3>3.2 Responsabilidade pela conta</h3>
      <p>
        Voce e inteiramente responsavel por manter a confidencialidade de suas credenciais de acesso
        (e-mail e senha) e por todas as atividades realizadas em sua conta. Em caso de uso nao autorizado,
        notifique-nos imediatamente pelo e-mail suporte@eventswap.com.
      </p>

      <h3>3.3 Veracidade das informacoes</h3>
      <p>
        Voce se compromete a manter seus dados cadastrais atualizados. A prestacao de informacoes falsas
        ou incompletas pode resultar na suspensao ou exclusao da sua conta, sem prejuizo das medidas
        legais cabiveis.
      </p>

      {/* 4. Regras de Uso */}
      <h2>4. Regras de Uso</h2>

      <h3>4.1 Condutas proibidas</h3>
      <p>Ao utilizar a Plataforma, voce se compromete a nao:</p>
      <ul>
        <li>Publicar anuncios falsos, enganosos ou fraudulentos</li>
        <li>Anunciar reservas que nao possui ou nao tem autorizacao para transferir</li>
        <li>Utilizar a Plataforma para lavagem de dinheiro ou quaisquer atividades ilicitas</li>
        <li>Tentar burlar o sistema de pagamentos da Plataforma, negociando diretamente com outros usuarios</li>
        <li>Assediar, ameacar, difamar ou discriminar outros usuarios</li>
        <li>Utilizar bots, scrapers ou qualquer ferramenta automatizada sem autorizacao</li>
        <li>Tentar acessar areas restritas ou dados de outros usuarios</li>
        <li>Publicar conteudo que viole direitos autorais, marcas registradas ou outros direitos de propriedade intelectual de terceiros</li>
        <li>Criar multiplas contas para o mesmo usuario</li>
      </ul>

      <h3>4.2 Regras para anuncios</h3>
      <p>Todo anuncio publicado na Plataforma deve:</p>
      <ul>
        <li>Conter descricao precisa e detalhada da reserva oferecida</li>
        <li>Informar corretamente o fornecedor do servico, data do evento e valor da reserva original</li>
        <li>Incluir fotos reais e atualizadas, quando aplicavel</li>
        <li>Indicar todas as condicoes e restricoes para a transferencia</li>
        <li>Praticar precos compativeis com o valor de mercado</li>
      </ul>

      {/* 5. Politica Anti-Bypass */}
      <h2>5. Politica Anti-Bypass</h2>

      <h3>5.1 Definicao de bypass</h3>
      <p>
        Entende-se por &quot;bypass&quot; qualquer tentativa, direta ou indireta, de realizar transacoes
        fora da Plataforma EventSwap apos o primeiro contato entre comprador e vendedor ter sido
        estabelecido por meio da Plataforma. O bypass inclui, mas nao se limita a: combinar
        pagamentos por fora, negociar diretamente sem o uso do escrow, ou qualquer outra pratica
        que vise contornar os mecanismos de seguranca e a comissao da EventSwap.
      </p>

      <h3>5.2 Monitoramento automatizado</h3>
      <p>
        A Plataforma utiliza sistemas automatizados de monitoramento para detectar o compartilhamento
        de informacoes de contato pessoal antes da confirmacao do pagamento via escrow. Isso inclui
        analise de mensagens trocadas no chat da Plataforma para identificacao de padroes indicativos
        de bypass, como compartilhamento de numeros de telefone, enderecos de e-mail, perfis em
        redes sociais, links externos e outros dados que possibilitem contato direto.
      </p>

      <h3>5.3 Informacoes bloqueadas antes do pagamento</h3>
      <p>
        Para proteger ambas as partes, as seguintes informacoes sao bloqueadas ou sinalizadas
        automaticamente quando compartilhadas no chat antes da confirmacao do pagamento via escrow:
      </p>
      <ul>
        <li>Numeros de telefone celular ou fixo</li>
        <li>Enderecos de e-mail</li>
        <li>Perfis ou links para redes sociais (Instagram, WhatsApp, Facebook, LinkedIn, etc.)</li>
        <li>Links externos a Plataforma</li>
        <li>CPF, CNPJ ou outros documentos de identificacao</li>
        <li>Dados bancarios ou chaves Pix</li>
        <li>QR Codes ou codigos para contato direto</li>
      </ul>

      <h3>5.4 Liberacao de informacoes de contato</h3>
      <p>
        As informacoes de contato entre comprador e vendedor sao liberadas <strong>exclusivamente
        apos a confirmacao do pagamento via escrow</strong>. Esse processo garante que:
      </p>
      <ul>
        <li>O comprador tem a seguranca de que o pagamento esta protegido antes de qualquer contato direto</li>
        <li>O vendedor tem a garantia de que o pagamento esta reservado antes de fornecer seus dados de contato</li>
        <li>A EventSwap pode intervir como mediadora em caso de qualquer problema</li>
      </ul>

      <h3>5.5 Penalidades por bypass</h3>
      <p>
        O descumprimento desta politica sujeita o usuario as seguintes penalidades, aplicadas
        progressivamente conforme a gravidade e reincidencia:
      </p>
      <ul>
        <li><strong>1a ocorrencia:</strong> advertencia formal por e-mail com registro no historico da conta</li>
        <li><strong>2a ocorrencia:</strong> suspensao temporaria de 7 (sete) dias, com bloqueio de publicacao de anuncios e realizacao de transacoes</li>
        <li><strong>3a ocorrencia:</strong> suspensao permanente da conta, com bloqueio de reativacao por CPF e dispositivo</li>
        <li><strong>Bypass com prejuizo comprovado:</strong> acão judicial para ressarcimento dos danos causados a Plataforma e aos usuarios prejudicados</li>
      </ul>

      <h3>5.6 Justificativa e base legal</h3>
      <p>
        A Politica Anti-Bypass existe para proteger todos os usuarios da Plataforma:
      </p>
      <ul>
        <li><strong>Protecao do comprador:</strong> o escrow garante que o pagamento so e liberado apos a confirmacao da transferencia, protegendo o comprador de golpes</li>
        <li><strong>Protecao do vendedor:</strong> o escrow garante que o pagamento esta reservado antes de o vendedor realizar a transferencia da reserva</li>
        <li><strong>Mediacao disponivel:</strong> ao manter a transacao dentro da Plataforma, ambas as partes tem acesso ao sistema de mediacao em caso de problemas</li>
      </ul>
      <p>
        Esta politica tem amparo legal no <strong>Art. 927 do Codigo Civil Brasileiro</strong>
        (responsabilidade civil por danos causados a terceiros) e no{' '}
        <strong>Art. 39 do Codigo de Defesa do Consumidor</strong> (pratica abusiva). A EventSwap
        reserva-se o direito de buscar ressarcimento judicial pelos danos diretos e indiretos
        causados pelo bypass, incluindo a comissao devida sobre transacoes realizadas fora
        da Plataforma apos contato inicial estabelecido por meio dela.
      </p>

      {/* 6. Transacoes */}
      <h2>6. Transacoes</h2>

      <h3>6.1 Como funcionam as transferencias</h3>
      <p>O processo de transferencia de reserva na EventSwap segue as seguintes etapas:</p>
      <ol>
        <li>O vendedor publica o anuncio da reserva com todos os detalhes</li>
        <li>O comprador seleciona a reserva e inicia o processo de compra</li>
        <li>O pagamento e processado e mantido em custodia (escrow) pela EventSwap</li>
        <li>O vendedor realiza a transferencia da reserva junto ao fornecedor do servico</li>
        <li>O comprador confirma o recebimento da reserva transferida</li>
        <li>O valor e liberado ao vendedor, descontada a comissao da Plataforma</li>
      </ol>

      <h3>6.2 Comissao da Plataforma</h3>
      <p>
        A EventSwap cobra uma comissao de <strong>8% (oito por cento)</strong> sobre o valor de cada transacao
        concluida com sucesso. A comissao e descontada automaticamente do valor a ser repassado ao vendedor.
        A comissao remunera os servicos de intermediacao, processamento de pagamentos, seguranca antifraude
        e suporte ao usuario.
      </p>

      <h3>6.3 Prazo de custodia</h3>
      <p>
        O valor pago pelo comprador permanece em custodia ate a confirmacao da transferencia da reserva.
        Caso o comprador nao confirme o recebimento em ate 7 (sete) dias uteis apos a data prevista
        para a transferencia, e nao haja disputa aberta, o valor sera automaticamente liberado ao vendedor.
      </p>

      {/* 7. Pagamentos */}
      <h2>7. Pagamentos</h2>

      <h3>7.1 Processamento de pagamentos</h3>
      <p>
        Os pagamentos sao processados pela Asaas Gestao Financeira S.A., empresa regulada pelo Banco Central
        do Brasil. A EventSwap nao armazena dados de cartao de credito. Os metodos de pagamento aceitos incluem:
      </p>
      <ul>
        <li>Pix (transferencia instantanea)</li>
        <li>Cartao de credito (parcelamento em ate 12x)</li>
        <li>Boleto bancario</li>
      </ul>

      <h3>7.2 Politica de reembolso</h3>
      <p>O reembolso pode ser solicitado nas seguintes situacoes:</p>
      <ul>
        <li><strong>Desistencia do comprador antes da transferencia:</strong> reembolso integral, descontadas as taxas de processamento do meio de pagamento</li>
        <li><strong>Falha na transferencia da reserva por culpa do vendedor:</strong> reembolso integral ao comprador</li>
        <li><strong>Reserva significativamente diferente do anunciado:</strong> reembolso integral apos analise pela equipe da EventSwap</li>
        <li><strong>Disputa entre as partes:</strong> o valor permanece em custodia ate a resolucao da disputa</li>
      </ul>
      <p>
        O prazo para solicitacao de reembolso e de ate 7 (sete) dias apos a conclusao da transacao.
        Reembolsos sao processados em ate 10 (dez) dias uteis, dependendo do meio de pagamento utilizado.
      </p>

      {/* 8. Responsabilidades */}
      <h2>8. Responsabilidades e Limitacao de Responsabilidade</h2>

      <h3>8.1 Responsabilidade do usuario</h3>
      <p>O usuario e responsavel por:</p>
      <ul>
        <li>A veracidade das informacoes fornecidas nos anuncios e no cadastro</li>
        <li>O cumprimento das obrigacoes assumidas nas transacoes</li>
        <li>A verificacao da viabilidade de transferencia da reserva junto ao fornecedor do servico</li>
        <li>O cumprimento de todas as leis e regulamentos aplicaveis</li>
      </ul>

      <h3>8.2 Limitacao de responsabilidade da Plataforma</h3>
      <p>A EventSwap nao se responsabiliza por:</p>
      <ul>
        <li>A qualidade, seguranca ou legalidade dos servicos de eventos anunciados</li>
        <li>A capacidade dos vendedores de efetuar a transferencia das reservas</li>
        <li>Danos indiretos, incidentais ou consequentes decorrentes do uso da Plataforma</li>
        <li>Interrupcoes temporarias nos servicos por manutencao, atualizacao ou forca maior</li>
        <li>Atos de terceiros, incluindo fornecedores de servicos de eventos que se recusem a aceitar a transferencia</li>
      </ul>

      {/* 9. Propriedade Intelectual */}
      <h2>9. Propriedade Intelectual</h2>
      <p>
        Todos os direitos de propriedade intelectual da Plataforma, incluindo mas nao se limitando a marca,
        logotipo, layout, codigo-fonte, design, textos, graficos e demais elementos visuais, sao de
        titularidade exclusiva da EventSwap ou de seus licenciantes.
      </p>
      <p>
        Ao publicar conteudo na Plataforma (fotos, descricoes, etc.), voce concede a EventSwap uma licenca
        nao exclusiva, gratuita e mundial para utilizar, reproduzir e exibir tal conteudo exclusivamente
        para fins de operacao e promocao da Plataforma.
      </p>

      {/* 10. Cancelamento */}
      <h2>10. Cancelamento e Exclusao de Conta</h2>

      <h3>10.1 Cancelamento pelo usuario</h3>
      <p>
        Voce pode solicitar o cancelamento da sua conta a qualquer momento, desde que nao haja transacoes
        pendentes ou em andamento. O cancelamento pode ser feito nas configuracoes da sua conta ou
        mediante solicitacao ao suporte.
      </p>

      <h3>10.2 Cancelamento pela Plataforma</h3>
      <p>A EventSwap reserva-se o direito de suspender ou excluir sua conta em caso de:</p>
      <ul>
        <li>Violacao destes Termos de Uso</li>
        <li>Pratica de fraude ou tentativa de fraude</li>
        <li>Fornecimento de informacoes falsas</li>
        <li>Inatividade superior a 24 (vinte e quatro) meses</li>
        <li>Ordem judicial ou determinacao de autoridade competente</li>
      </ul>

      <h3>10.3 Efeitos do cancelamento</h3>
      <p>
        Apos o cancelamento, seus dados pessoais serao tratados conforme nossa{' '}
        <Link href="/privacy" className="text-[#6C3CE1] hover:underline no-underline">
          Politica de Privacidade
        </Link>
        , sendo retidos pelo periodo necessario para cumprimento de obrigacoes legais e exercicio regular
        de direitos.
      </p>

      {/* 11. Disputas */}
      <h2>11. Resolucao de Disputas</h2>

      <h3>11.1 Mediacao interna</h3>
      <p>
        Em caso de desacordo entre comprador e vendedor, a EventSwap oferece um sistema de mediacao
        para buscar uma solucao amigavel. Ambas as partes devem apresentar suas argumentacoes e
        evidencias, e a equipe da EventSwap emitira uma decisao em ate 10 (dez) dias uteis.
        Consulte nossa{' '}
        <Link href="/disputes" className="text-[#6C3CE1] hover:underline no-underline">
          Politica de Mediacao e Disputas
        </Link>{' '}
        para o processo detalhado.
      </p>

      <h3>11.2 Decisao da Plataforma</h3>
      <p>
        A decisao da EventSwap na mediacao e vinculante no ambito da Plataforma, podendo resultar em
        reembolso total ou parcial ao comprador, liberacao do valor ao vendedor, ou divisao proporcional
        entre as partes. Esta decisao nao impede que as partes busquem seus direitos pelos meios judiciais
        competentes.
      </p>

      {/* 12. Foro */}
      <h2>12. Legislacao Aplicavel e Foro</h2>
      <p>
        Estes Termos de Uso sao regidos pelas leis da Republica Federativa do Brasil, incluindo o
        Codigo de Defesa do Consumidor (Lei n. 8.078/1990), o Marco Civil da Internet
        (Lei n. 12.965/2014) e a Lei Geral de Protecao de Dados (Lei n. 13.709/2018).
      </p>
      <p>
        Fica eleito o Foro da Comarca de Sao Paulo, Estado de Sao Paulo, para dirimir quaisquer
        controversias decorrentes destes Termos, com renuncia a qualquer outro, por mais privilegiado
        que seja, ressalvado o direito do consumidor de optar pelo foro de seu domicilio, conforme
        previsto no Codigo de Defesa do Consumidor.
      </p>

      {/* Links relacionados */}
      <div className="mt-12 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 not-prose">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Documentos relacionados
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/privacy"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Politica de Privacidade
          </Link>
          <Link
            href="/data-deletion"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Solicitar exclusao de dados
          </Link>
          <Link
            href="/antifraud"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Politica Antifraude
          </Link>
          <Link
            href="/chargeback"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Politica de Chargeback
          </Link>
          <Link
            href="/disputes"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Mediacao e Disputas
          </Link>
        </div>
      </div>
    </article>
  );
}
