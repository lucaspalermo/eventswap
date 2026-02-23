import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica Antifraude',
  description: 'Politica Antifraude da EventSwap - Conheça as medidas de segurança, prevencao e deteccao de fraudes que protegem compradores e vendedores no marketplace.',
};

export default function AntifraudPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed">
      <h1>Politica Antifraude</h1>
      <p className="text-neutral-500 dark:text-neutral-400 !text-xs">
        Ultima atualizacao: 23 de fevereiro de 2026
      </p>

      {/* 1. Compromisso com a Segurança */}
      <h2>1. Compromisso com a Seguranca</h2>
      <p>
        A EventSwap tem como prioridade absoluta a seguranca de todos os seus usuarios. Sabemos que
        transacoes envolvendo reservas de eventos representam valores significativos e estao associadas
        a momentos importantes da vida das pessoas. Por isso, investimos continuamente em tecnologia,
        processos e politicas para prevenir, detectar e combater qualquer forma de fraude em nossa
        Plataforma.
      </p>
      <p>
        Esta Politica Antifraude descreve os mecanismos de seguranca que adotamos e as regras que todos
        os usuarios devem seguir para manter o ambiente da EventSwap seguro e confiavel. O combate a
        fraude e uma responsabilidade compartilhada entre a Plataforma e seus usuarios.
      </p>

      {/* 2. Medidas de Prevencao */}
      <h2>2. Medidas de Prevencao</h2>

      <h3>2.1 Verificacao de identidade</h3>
      <p>
        Todo usuario que deseja realizar transacoes na EventSwap passa por um processo de verificacao
        de identidade (KYC - Know Your Customer), que inclui:
      </p>
      <ul>
        <li>Validacao do CPF junto aos orgaos competentes</li>
        <li>Confirmacao do endereco de e-mail por link de verificacao</li>
        <li>Confirmacao do numero de telefone celular por codigo SMS ou WhatsApp</li>
        <li>Para vendedores com volumes maiores: envio de documento de identidade com foto (RG ou CNH)</li>
        <li>Verificacao de dados bancarios para repasse de valores (validacao de conta bancaria ou chave Pix)</li>
      </ul>

      <h3>2.2 KYC aprofundado</h3>
      <p>
        Para transacoes de alto valor (acima de R$ 5.000,00) ou em situacoes de risco identificadas
        por nosso sistema, podemos solicitar documentacao adicional, incluindo comprovante de residencia,
        selfie com documento ou informacoes adicionais sobre a reserva anunciada. A recusa em fornecer
        esses documentos pode resultar na suspensao temporaria da transacao ate a verificacao adequada.
      </p>

      <h3>2.3 Monitoramento continuo de atividades</h3>
      <p>
        Todas as atividades na Plataforma sao monitoradas em tempo real por nossos sistemas automatizados.
        Isso inclui navegacao, publicacao de anuncios, comunicacoes no chat (somente para fins de seguranca
        e deteccao de bypass), realizacao de pagamentos e comportamentos fora do padrao esperado.
      </p>

      {/* 3. Sistema de Deteccao */}
      <h2>3. Sistema de Deteccao de Fraudes</h2>

      <h3>3.1 Inteligencia artificial e machine learning</h3>
      <p>
        A EventSwap utiliza algoritmos de inteligencia artificial e aprendizado de maquina para analisar
        padroes de comportamento e identificar atividades suspeitas. Nosso sistema avalia centenas de
        variaveis simultaneamente, incluindo:
      </p>
      <ul>
        <li>Velocidade e frequencia de acoes na Plataforma</li>
        <li>Correspondencia entre dados cadastrais e comportamento</li>
        <li>Padroes de IP, dispositivo e localizacao geografica</li>
        <li>Historico de transacoes e reputacao do usuario</li>
        <li>Conteudo dos anuncios comparado ao banco de dados de fraudes conhecidas</li>
      </ul>

      <h3>3.2 Identificacao de padroes suspeitos</h3>
      <p>Nosso sistema identifica automaticamente e sinaliza para revisao manual os seguintes padroes:</p>
      <ul>
        <li>Multiplos cadastros com dados similares (CPF, e-mail, telefone, dispositivo)</li>
        <li>Anuncios com precos atipicos (muito abaixo ou muito acima do valor de mercado)</li>
        <li>Tentativas de compartilhar informacoes de contato pessoal antes do pagamento</li>
        <li>Acesso de localizacoes geograficas incomuns para o perfil do usuario</li>
        <li>Muitas transacoes em curto periodo de tempo</li>
        <li>Historico de chargebacks ou disputas em outras plataformas (via parceiros antifraude)</li>
      </ul>

      <h3>3.3 Alertas automaticos</h3>
      <p>
        Quando atividades suspeitas sao detectadas, nosso sistema pode automaticamente: bloquear
        temporariamente a transacao para revisao, solicitar autenticacao adicional ao usuario,
        notificar a equipe de seguranca da EventSwap ou, em casos extremos, suspender preventivamente
        a conta ate a verificacao manual.
      </p>

      {/* 4. Verificacao de Anuncios */}
      <h2>4. Verificacao de Anuncios</h2>

      <h3>4.1 Revisao antes da publicacao</h3>
      <p>
        Todos os anuncios publicados na EventSwap passam por um processo de revisao que combina
        verificacao automatizada e, quando necessario, analise manual. Durante esse processo verificamos:
      </p>
      <ul>
        <li>Consistencia das informacoes fornecidas (data, fornecedor, tipo de evento)</li>
        <li>Autenticidade das fotos utilizadas (verificacao de imagens geradas por IA ou roubadas)</li>
        <li>Valor da reserva em relacao ao mercado</li>
        <li>Historico do vendedor e seu nivel de verificacao</li>
        <li>Eventuais denuncias anteriores relacionadas ao fornecedor ou data anunciada</li>
      </ul>

      <h3>4.2 Checagem de documentos comprobatorios</h3>
      <p>
        Para anuncios de alto valor ou categorias especificas, podemos solicitar ao vendedor a
        apresentacao de documentacao comprobatoria da reserva, como: contrato assinado com o fornecedor,
        recibo de pagamento ou confirmacao de reserva emitida pelo estabelecimento. Esses documentos sao
        tratados com confidencialidade e utilizados exclusivamente para fins de verificacao antifraude.
      </p>

      {/* 5. Protecao do Comprador */}
      <h2>5. Protecao do Comprador</h2>

      <h3>5.1 Sistema de escrow (custodia)</h3>
      <p>
        O principal mecanismo de protecao ao comprador e o sistema de custodia (escrow). Quando o
        comprador realiza o pagamento, o valor nao e transferido imediatamente ao vendedor. O dinheiro
        fica retido em conta de custodia gerenciada pela EventSwap ate que:
      </p>
      <ul>
        <li>A transferencia da reserva seja confirmada pelo vendedor</li>
        <li>O comprador confirme o recebimento da reserva</li>
        <li>Ou o prazo de confirmacao automatica expire (7 dias uteis sem disputa)</li>
      </ul>

      <h3>5.2 Garantia de devolucao</h3>
      <p>
        O comprador tem direito a reembolso integral nos seguintes casos comprovados:
      </p>
      <ul>
        <li>O vendedor nao realizar a transferencia da reserva no prazo acordado</li>
        <li>A reserva transferida nao corresponder ao que foi anunciado</li>
        <li>A reserva anunciada nao existir ou ja tiver sido cancelada pelo fornecedor</li>
        <li>O fornecedor do servico se recusar a aceitar a transferencia por culpa do vendedor</li>
      </ul>

      <h3>5.3 Mediacao em disputas</h3>
      <p>
        Em caso de desacordo entre comprador e vendedor, a EventSwap oferece um servico de mediacao
        imparcial. Nossa equipe analisa todas as evidencias apresentadas pelas partes e emite uma decisao
        vinculante no ambito da Plataforma. Consulte nossa{' '}
        <Link href="/disputes" className="text-[#6C3CE1] hover:underline no-underline">
          Politica de Mediacao e Disputas
        </Link>{' '}
        para mais detalhes.
      </p>

      {/* 6. Protecao do Vendedor */}
      <h2>6. Protecao do Vendedor</h2>

      <h3>6.1 Verificacao de pagamento antes da transferencia</h3>
      <p>
        O vendedor somente deve realizar a transferencia da reserva apos receber a confirmacao
        da EventSwap de que o pagamento foi processado e retido em custodia. Nunca realize a
        transferencia sem essa confirmacao, pois isso o deixaria desprotegido em caso de fraude
        do comprador.
      </p>

      <h3>6.2 Protecao contra chargeback abusivo</h3>
      <p>
        A EventSwap protege vendedores de boa-fe contra tentativas de chargeback abusivo por parte
        de compradores mal-intencionados. Nosso sistema de escrow, combinado com o historico de
        confirmacao da transferencia, serve como evidencia robusta junto as operadoras de pagamento
        em casos de disputa. Consulte nossa{' '}
        <Link href="/chargeback" className="text-[#6C3CE1] hover:underline no-underline">
          Politica de Chargeback e Estorno
        </Link>{' '}
        para mais detalhes.
      </p>

      <h3>6.3 Reputacao e avaliacao</h3>
      <p>
        O sistema de avaliacao da EventSwap protege vendedores honestos ao permitir que sua boa
        reputacao seja visivel para potenciais compradores. Da mesma forma, compradores e vendedores
        com historico de comportamento fraudulento sao identificados e podem ter seu acesso restrito.
      </p>

      {/* 7. Condutas Proibidas */}
      <h2>7. Condutas Proibidas</h2>
      <p>
        As seguintes condutas sao expressamente proibidas na EventSwap e podem resultar em penalidades
        severas, incluindo banimento permanente e acao judicial:
      </p>
      <ul>
        <li>Criar anuncios de reservas inexistentes ou que o usuario nao possui direito de transferir</li>
        <li>Fornecer documentos falsos ou adulterados para verificacao de identidade ou comprovacao de reserva</li>
        <li>Tentar realizar transacoes fora da Plataforma (bypass) para evitar as protecoes e comissoes da EventSwap</li>
        <li>Compartilhar dados de contato pessoal (telefone, e-mail, redes sociais) antes da confirmacao do pagamento via escrow</li>
        <li>Criar multiplas contas para contornar restricoes ou penalidades aplicadas</li>
        <li>Utilizar meios de pagamento de terceiros ou de origem ilicita</li>
        <li>Solicitar chargeback de maneira fraudulenta apos receber a reserva transferida</li>
        <li>Manipular ou falsificar avaliacoes e comentarios na Plataforma</li>
        <li>Fazer uso de bots, scripts ou ferramentas automatizadas para publicacao de anuncios ou interacao com outros usuarios</li>
        <li>Coagir, ameacar ou pressionar outros usuarios a realizarem acoes fora dos termos da Plataforma</li>
        <li>Anunciar reservas com valores inflados artificialmente para fins de lavagem de dinheiro</li>
        <li>Utilizar identidades de terceiros sem autorizacao para criar contas ou realizar transacoes</li>
      </ul>

      {/* 8. Penalidades */}
      <h2>8. Penalidades</h2>
      <p>
        A EventSwap adota uma politica de tolerancia zero para fraudes. As penalidades aplicadas sao
        proporcionais a gravidade da infracão detectada:
      </p>

      <h3>8.1 Advertencia formal</h3>
      <p>
        Aplicada em casos de primeira infracão de baixa gravidade ou comportamento suspeito nao
        confirmado. O usuario recebe notificacao por e-mail descrevendo o comportamento identificado
        e as regras violadas.
      </p>

      <h3>8.2 Suspensão temporaria</h3>
      <p>
        Suspensão da conta por periodo de 7 a 30 dias, com bloqueio de publicacao de novos anuncios
        e realizacao de transacoes. Aplicada em casos de infracoes confirmadas de gravidade moderada
        ou reincidencia apos advertencia.
      </p>

      <h3>8.3 Banimento permanente</h3>
      <p>
        Exclusão definitiva da conta, com bloqueio de CPF e dispositivos associados para impedir
        novos cadastros. Aplicado em casos de fraude comprovada, tentativa de bypass, uso de
        identidade falsa ou reincidencia apos suspensão temporaria.
      </p>

      <h3>8.4 Acão judicial</h3>
      <p>
        Em casos de fraude que causem prejuizo financeiro a outros usuarios ou a EventSwap, alem
        das penalidades na Plataforma, a EventSwap pode adotar medidas judiciais, incluindo registro
        de boletim de ocorrencia, acão civil para ressarcimento de danos (Art. 927 do Codigo Civil)
        e notificacao as autoridades competentes (Ministerio Publico, Policia Civil e BACEN).
      </p>

      {/* 9. Como Reportar Fraude */}
      <h2>9. Como Reportar Fraude</h2>

      <h3>9.1 Canal de denúncia</h3>
      <p>
        Se voce identificar uma tentativa de fraude, comportamento suspeito ou violacao das regras
        da Plataforma, por favor reporte imediatamente por um dos seguintes canais:
      </p>
      <ul>
        <li><strong>E-mail:</strong> seguranca@eventswap.com</li>
        <li><strong>Chat de suporte:</strong> disponivel na Plataforma para usuarios autenticados</li>
        <li><strong>Botao &quot;Reportar&quot;:</strong> disponivel em todos os anuncios e perfis de usuarios</li>
      </ul>

      <h3>9.2 Informacoes para incluir na denuncia</h3>
      <p>Para agilizar a investigacao, inclua na sua denuncia:</p>
      <ul>
        <li>Identificacao do anuncio, usuario ou transacao suspeita</li>
        <li>Descricao detalhada do comportamento suspeito observado</li>
        <li>Prints de tela, conversas ou outros comprovantes (se disponivel)</li>
        <li>Seu nome completo e e-mail para retorno</li>
      </ul>

      <h3>9.3 Prazo de resposta</h3>
      <p>
        Nos comprometemos a analisar e responder todas as denuncias em ate <strong>48 horas uteis</strong>.
        Em casos de urgencia (fraude em andamento), o prazo de resposta inicial e de ate 4 horas.
        A identidade do denunciante e mantida em sigilo absoluto.
      </p>

      {/* 10. Atualizacoes */}
      <h2>10. Atualizacoes desta Politica</h2>
      <p>
        Esta Politica Antifraude pode ser atualizada periodicamente para refletir novas ameacas,
        melhorias nos nossos sistemas de seguranca ou mudancas na legislacao aplicavel. Atualizacoes
        significativas serao comunicadas por e-mail e mediante aviso na Plataforma. O uso continuado
        da EventSwap apos a publicacao de atualizacoes implica na aceitacao das novas disposicoes.
      </p>
      <p>
        Para duvidas sobre esta politica ou sobre seguranca na Plataforma, entre em contato com nossa
        equipe pelo e-mail seguranca@eventswap.com.
      </p>

      {/* Links relacionados */}
      <div className="mt-12 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 not-prose">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Documentos relacionados
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="text-sm text-[#6C3CE1] hover:underline">
            Termos de Uso
          </Link>
          <Link href="/chargeback" className="text-sm text-[#6C3CE1] hover:underline">
            Politica de Chargeback
          </Link>
          <Link href="/disputes" className="text-sm text-[#6C3CE1] hover:underline">
            Mediacao e Disputas
          </Link>
          <Link href="/privacy" className="text-sm text-[#6C3CE1] hover:underline">
            Politica de Privacidade
          </Link>
        </div>
      </div>
    </article>
  );
}
