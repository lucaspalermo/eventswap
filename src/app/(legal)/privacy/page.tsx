import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  description: 'Politica de Privacidade da EventSwap - Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed">
      <h1>Politica de Privacidade</h1>
      <p className="text-neutral-500 dark:text-neutral-400 !text-xs">
        Ultima atualizacao: 23 de fevereiro de 2026
      </p>

      {/* 1. Introducao */}
      <h2>1. Introducao</h2>
      <p>
        A EventSwap (&quot;nos&quot;, &quot;nosso&quot; ou &quot;Plataforma&quot;) e um marketplace digital dedicado a transferencia
        segura de reservas de eventos, incluindo casamentos, buffets, fotografos, decoracao e demais servicos relacionados.
        Esta Politica de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais,
        em conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 - LGPD) e demais
        legislacoes aplicaveis.
      </p>
      <p>
        Ao utilizar a EventSwap, voce declara estar ciente e de acordo com as praticas descritas nesta politica.
        Caso nao concorde com algum dos termos, recomendamos que nao utilize nossos servicos.
      </p>

      {/* 2. Dados Coletados */}
      <h2>2. Dados Pessoais Coletados</h2>
      <p>Coletamos as seguintes categorias de dados pessoais:</p>

      <h3>2.1 Dados fornecidos por voce</h3>
      <ul>
        <li><strong>Dados de identificacao:</strong> nome completo, CPF, data de nascimento</li>
        <li><strong>Dados de contato:</strong> endereco de e-mail, numero de telefone celular</li>
        <li><strong>Dados de endereco:</strong> CEP, cidade, estado, logradouro e numero</li>
        <li><strong>Dados financeiros:</strong> informacoes bancarias para recebimento de valores (conta, agencia, tipo de chave Pix)</li>
        <li><strong>Dados de autenticacao:</strong> senha criptografada, tokens de acesso via Google OAuth</li>
        <li><strong>Dados de anuncios:</strong> descricoes, fotos, valores e condicoes das reservas anunciadas</li>
      </ul>

      <h3>2.2 Dados coletados automaticamente</h3>
      <ul>
        <li><strong>Dados de navegacao:</strong> endereco IP, tipo de navegador, sistema operacional, paginas visitadas, tempo de permanencia</li>
        <li><strong>Dados de dispositivo:</strong> tipo de dispositivo, resolucao de tela, idioma configurado</li>
        <li><strong>Cookies e tecnologias similares:</strong> cookies essenciais, analiticos e de preferencias (veja a secao 9)</li>
        <li><strong>Dados de uso:</strong> historico de buscas, anuncios visualizados, transacoes realizadas, interacoes com a plataforma</li>
      </ul>

      {/* 3. Finalidade do Tratamento */}
      <h2>3. Finalidade do Tratamento dos Dados</h2>
      <p>Seus dados pessoais sao tratados para as seguintes finalidades:</p>
      <ul>
        <li><strong>Criacao e gestao de conta:</strong> registro, autenticacao e manutencao do seu perfil na plataforma</li>
        <li><strong>Execucao de transacoes:</strong> intermediacao de transferencias de reservas entre compradores e vendedores, incluindo processamento de pagamentos</li>
        <li><strong>Prevencao a fraudes:</strong> verificacao de identidade, analise de risco e deteccao de atividades suspeitas para proteger todos os usuarios</li>
        <li><strong>Comunicacoes:</strong> envio de notificacoes sobre transacoes, alertas de seguranca, atualizacoes da plataforma e, com seu consentimento, comunicacoes de marketing</li>
        <li><strong>Melhoria dos servicos:</strong> analise de dados agregados e anonimizados para aprimorar a experiencia do usuario e desenvolver novos recursos</li>
        <li><strong>Cumprimento de obrigacoes legais:</strong> atendimento a requisicoes judiciais, fiscais e regulatorias</li>
        <li><strong>Suporte ao usuario:</strong> atendimento de solicitacoes, duvidas e reclamacoes</li>
      </ul>

      {/* 4. Base Legal */}
      <h2>4. Base Legal para o Tratamento</h2>
      <p>
        O tratamento dos seus dados pessoais e realizado com base nas seguintes hipoteses previstas na LGPD (Art. 7):
      </p>
      <ul>
        <li><strong>Consentimento (Art. 7, I):</strong> para o envio de comunicacoes de marketing, uso de cookies analiticos e de preferencias</li>
        <li><strong>Execucao de contrato (Art. 7, V):</strong> para a prestacao dos servicos contratados, incluindo intermediacao de transacoes e processamento de pagamentos</li>
        <li><strong>Interesse legitimo (Art. 7, IX):</strong> para prevencao a fraudes, seguranca da plataforma e melhoria dos servicos</li>
        <li><strong>Obrigacao legal ou regulatoria (Art. 7, II):</strong> para cumprimento de obrigacoes fiscais, contabeis e regulatorias</li>
      </ul>

      {/* 5. Compartilhamento de Dados */}
      <h2>5. Compartilhamento de Dados</h2>
      <p>
        Podemos compartilhar seus dados pessoais com terceiros nas seguintes situacoes:
      </p>
      <ul>
        <li>
          <strong>Processadores de pagamento:</strong> compartilhamos dados necessarios com a Asaas Gestao Financeira S.A.
          para processamento de pagamentos, transferencias e verificacao de identidade financeira
        </li>
        <li>
          <strong>Provedores de infraestrutura:</strong> utilizamos Supabase (autenticacao e banco de dados),
          Vercel (hospedagem) e servicos de armazenamento em nuvem para operar a plataforma
        </li>
        <li>
          <strong>Ferramentas de analise:</strong> utilizamos Google Analytics para compreender padroes de uso
          da plataforma (dados anonimizados e agregados)
        </li>
        <li>
          <strong>Prevencao a fraudes:</strong> podemos compartilhar dados com servicos especializados em
          deteccao de fraudes e verificacao de identidade
        </li>
        <li>
          <strong>Obrigacoes legais:</strong> quando exigido por lei, ordem judicial ou autoridade competente
        </li>
      </ul>
      <p>
        Nao vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing.
      </p>

      {/* 6. Seus Direitos */}
      <h2>6. Seus Direitos como Titular dos Dados</h2>
      <p>
        Em conformidade com a LGPD (Art. 18), voce possui os seguintes direitos em relacao aos seus dados pessoais:
      </p>
      <ul>
        <li><strong>Confirmacao e acesso:</strong> confirmar se tratamos seus dados e obter acesso a eles</li>
        <li><strong>Correcao:</strong> solicitar a correcao de dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Anonimizacao, bloqueio ou eliminacao:</strong> solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios, excessivos ou tratados em desconformidade com a LGPD</li>
        <li><strong>Portabilidade:</strong> solicitar a portabilidade dos seus dados a outro fornecedor de servico</li>
        <li><strong>Eliminacao:</strong> solicitar a eliminacao dos dados pessoais tratados com base no consentimento</li>
        <li><strong>Informacao sobre compartilhamento:</strong> ser informado sobre com quais entidades publicas ou privadas compartilhamos seus dados</li>
        <li><strong>Revogacao do consentimento:</strong> revogar o consentimento a qualquer momento, sem afetar a licitude do tratamento anteriormente realizado</li>
        <li><strong>Oposicao:</strong> opor-se ao tratamento realizado com fundamento em hipotese de dispensa de consentimento, caso esteja em desconformidade com a LGPD</li>
      </ul>
      <p>
        Para exercer seus direitos, voce pode acessar nossa{' '}
        <Link href="/data-deletion" className="text-[#6C3CE1] hover:underline no-underline">
          pagina de solicitacao de exclusao de dados
        </Link>{' '}
        ou entrar em contato conosco pelos canais indicados na secao 10.
      </p>

      {/* 7. Retencao de Dados */}
      <h2>7. Retencao de Dados</h2>
      <p>Seus dados pessoais serao retidos pelo tempo necessario para:</p>
      <ul>
        <li>Cumprir as finalidades para as quais foram coletados</li>
        <li>Atender obrigacoes legais, fiscais e regulatorias (minimo de 5 anos para dados financeiros e fiscais)</li>
        <li>Exercicio regular de direitos em processos judiciais, administrativos ou arbitrais</li>
        <li>Prevencao a fraudes e seguranca (enquanto a conta estiver ativa, acrescido de 6 meses apos exclusao)</li>
      </ul>
      <p>
        Apos o periodo de retencao, seus dados serao eliminados ou anonimizados de forma irreversivel.
      </p>

      {/* 8. Seguranca */}
      <h2>8. Seguranca dos Dados</h2>
      <p>
        Adotamos medidas tecnicas e organizacionais adequadas para proteger seus dados pessoais contra
        acessos nao autorizados, destruicao, perda, alteracao ou qualquer forma de tratamento inadequado:
      </p>
      <ul>
        <li><strong>Criptografia:</strong> dados em transito protegidos por TLS/SSL; senhas armazenadas com hash bcrypt</li>
        <li><strong>Controle de acesso:</strong> acesso restrito a dados pessoais apenas a colaboradores autorizados, com autenticacao multifator</li>
        <li><strong>Monitoramento:</strong> logs de acesso e auditoria para deteccao de atividades anomalas</li>
        <li><strong>Seguranca de infraestrutura:</strong> servidores em nuvem com certificacoes de seguranca, backups regulares e plano de recuperacao de desastres</li>
        <li><strong>Tokens de sessao:</strong> tokens JWT com expiracao e refresh tokens seguros</li>
        <li><strong>Row Level Security:</strong> isolamento de dados por usuario no banco de dados</li>
      </ul>

      {/* 9. Cookies */}
      <h2>9. Politica de Cookies</h2>
      <p>
        Utilizamos cookies e tecnologias similares para melhorar sua experiencia na plataforma.
        Os cookies sao classificados nas seguintes categorias:
      </p>

      <h3>9.1 Cookies essenciais</h3>
      <p>
        Necessarios para o funcionamento basico do site, como autenticacao, seguranca e preferencias de sessao.
        Nao podem ser desativados sem comprometer o uso da plataforma.
      </p>

      <h3>9.2 Cookies analiticos</h3>
      <p>
        Coletam informacoes anonimas sobre como voce utiliza a plataforma (paginas visitadas, tempo de navegacao, etc.),
        permitindo-nos melhorar continuamente nossos servicos. Utilizamos Google Analytics para esse fim.
      </p>

      <h3>9.3 Cookies de preferencias</h3>
      <p>
        Armazenam suas preferencias (como idioma e configuracoes de exibicao) para oferecer uma experiencia
        personalizada em visitas futuras.
      </p>
      <p>
        Voce pode gerenciar suas preferencias de cookies a qualquer momento atraves do banner de consentimento
        exibido ao acessar a plataforma pela primeira vez, ou limpando os cookies do seu navegador.
      </p>

      {/* 10. Contato do DPO */}
      <h2>10. Encarregado de Protecao de Dados (DPO)</h2>
      <p>
        Para quaisquer questoes relacionadas ao tratamento de seus dados pessoais, exercicio de direitos ou
        duvidas sobre esta politica, entre em contato com nosso Encarregado de Protecao de Dados:
      </p>
      <ul>
        <li><strong>E-mail:</strong> privacidade@eventswap.com</li>
        <li><strong>Formulario:</strong>{' '}
          <Link href="/data-deletion" className="text-[#6C3CE1] hover:underline no-underline">
            Solicitacao de exclusao de dados
          </Link>
        </li>
      </ul>
      <p>
        Nos comprometemos a responder todas as solicitacoes dentro do prazo de 15 (quinze) dias uteis,
        conforme previsto pela LGPD.
      </p>

      {/* 11. Alteracoes */}
      <h2>11. Alteracoes nesta Politica</h2>
      <p>
        Esta Politica de Privacidade pode ser atualizada periodicamente para refletir mudancas em nossas
        praticas de tratamento de dados ou alteracoes na legislacao aplicavel. Em caso de alteracoes
        significativas, voce sera notificado por:
      </p>
      <ul>
        <li>Aviso destacado na plataforma</li>
        <li>Notificacao por e-mail (para usuarios cadastrados)</li>
        <li>Atualizacao da data de &quot;ultima atualizacao&quot; no topo desta pagina</li>
      </ul>
      <p>
        Recomendamos que voce revise esta politica periodicamente para se manter informado sobre como
        protegemos seus dados.
      </p>

      {/* Links relacionados */}
      <div className="mt-12 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 not-prose">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Documentos relacionados
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/terms"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Termos de Uso
          </Link>
          <Link
            href="/data-deletion"
            className="text-sm text-[#6C3CE1] hover:underline"
          >
            Solicitar exclusao de dados
          </Link>
        </div>
      </div>
    </article>
  );
}
