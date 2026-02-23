// ============================================================================
// EventSwap - Contract Template Generator
// Generates "Instrumento Particular de Cessão de Contrato de Evento"
// ============================================================================

export interface ContractData {
  transactionCode: string;
  // Seller (Cedente)
  sellerName: string;
  sellerCpf: string;
  sellerEmail: string;
  // Buyer (Cessionário)
  buyerName: string;
  buyerCpf: string;
  buyerEmail: string;
  // Event/Reservation
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  providerName: string;
  // Financial
  originalPrice: number;
  agreedPrice: number;
  platformFee: number;
  // Platform
  platformName: string; // 'EventSwap'
  transactionDate: string;
}

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateLong(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function numberToWords(value: number): string {
  // Simple implementation for common amounts
  const intValue = Math.floor(value);
  const cents = Math.round((value - intValue) * 100);

  const ones = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  ];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n <= 19) return ones[n];
    if (n <= 99) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      return o === 0 ? tens[t] : `${tens[t]} e ${ones[o]}`;
    }
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    if (n === 100) return 'cem';
    if (remainder === 0) return hundreds[h];
    return `${hundreds[h]} e ${convertGroup(remainder)}`;
  }

  function convert(n: number): string {
    if (n === 0) return 'zero';
    const parts: string[] = [];

    const billions = Math.floor(n / 1_000_000_000);
    const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
    const thousands = Math.floor((n % 1_000_000) / 1_000);
    const remainder = n % 1_000;

    if (billions > 0) {
      parts.push(`${convertGroup(billions)} ${billions === 1 ? 'bilhão' : 'bilhões'}`);
    }
    if (millions > 0) {
      parts.push(`${convertGroup(millions)} ${millions === 1 ? 'milhão' : 'milhões'}`);
    }
    if (thousands > 0) {
      parts.push(`${convertGroup(thousands)} ${thousands === 1 ? 'mil' : 'mil'}`);
    }
    if (remainder > 0) {
      parts.push(convertGroup(remainder));
    }

    return parts.join(' e ');
  }

  const reaisText = convert(intValue);
  const reaisLabel = intValue === 1 ? 'real' : 'reais';

  if (cents === 0) {
    return `${reaisText} ${reaisLabel}`;
  }

  const centsText = convert(cents);
  const centsLabel = cents === 1 ? 'centavo' : 'centavos';
  return `${reaisText} ${reaisLabel} e ${centsText} ${centsLabel}`;
}

export function generateTransferContract(data: ContractData): string {
  const sellerNetAmount = data.agreedPrice - data.platformFee;
  const agreedPriceWords = numberToWords(data.agreedPrice);
  const platformFeeWords = numberToWords(data.platformFee);
  const sellerNetWords = numberToWords(sellerNetAmount);

  const transactionDateFormatted = formatDateLong(data.transactionDate);
  const eventDateFormatted = formatDateLong(data.eventDate);

  const currentYear = new Date(data.transactionDate).getFullYear() || new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contrato de Cessão - ${data.transactionCode} - ${data.platformName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Crimson Pro', 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
    }

    .contract-wrapper {
      max-width: 210mm;
      margin: 0 auto;
      padding: 25mm 20mm;
      background: #fff;
    }

    .contract-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1a1a1a;
    }

    .contract-logo {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .contract-logo .brand-accent {
      color: #6C3CE1;
    }

    .contract-logo .brand-main {
      color: #1a1a1a;
    }

    .contract-title {
      font-size: 14pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 16px;
      color: #1a1a1a;
    }

    .contract-subtitle {
      font-size: 10pt;
      color: #555;
      margin-top: 4px;
      font-style: italic;
    }

    .contract-code-badge {
      display: inline-block;
      background: #f4f0fd;
      color: #6C3CE1;
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 4px;
      margin-top: 10px;
      border: 1px solid #d4c5f9;
    }

    .preambulo {
      margin-bottom: 28px;
    }

    .preambulo p {
      text-align: justify;
      margin-bottom: 10px;
      hyphens: auto;
    }

    .parte-box {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-left: 4px solid #6C3CE1;
      border-radius: 4px;
      padding: 14px 18px;
      margin: 12px 0;
    }

    .parte-box .parte-tipo {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6C3CE1;
      margin-bottom: 6px;
    }

    .parte-box .parte-nome {
      font-weight: 700;
      font-size: 12pt;
    }

    .parte-box .parte-dados {
      font-size: 10.5pt;
      color: #444;
      margin-top: 2px;
    }

    .section {
      margin-bottom: 24px;
    }

    .clausula-titulo {
      font-family: 'Inter', sans-serif;
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #1a1a1a;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e0e0e0;
    }

    .clausula-numero {
      color: #6C3CE1;
    }

    .clausula-body {
      text-align: justify;
      hyphens: auto;
    }

    .clausula-body p {
      margin-bottom: 8px;
    }

    .paragrafo {
      margin: 8px 0 8px 20px;
      text-align: justify;
      font-style: italic;
      color: #333;
    }

    .paragrafo-numero {
      font-style: normal;
      font-weight: 600;
    }

    .highlight-box {
      background: #f4f0fd;
      border: 1px solid #d4c5f9;
      border-radius: 4px;
      padding: 12px 16px;
      margin: 12px 0;
    }

    .highlight-box .hl-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 3px 0;
      font-size: 11pt;
    }

    .highlight-box .hl-row .hl-label {
      color: #555;
    }

    .highlight-box .hl-row .hl-value {
      font-weight: 700;
      color: #1a1a1a;
    }

    .highlight-box .hl-total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #d4c5f9;
      display: flex;
      justify-content: space-between;
      font-size: 12pt;
      font-weight: 700;
    }

    .highlight-box .hl-total .hl-total-label {
      color: #1a1a1a;
    }

    .highlight-box .hl-total .hl-total-value {
      color: #6C3CE1;
      font-size: 13pt;
    }

    .assinaturas {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #ccc;
    }

    .assinaturas-titulo {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #777;
      text-align: center;
      margin-bottom: 28px;
    }

    .assinaturas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }

    .assinatura-bloco {
      text-align: center;
    }

    .assinatura-linha {
      border-bottom: 1px solid #1a1a1a;
      height: 60px;
      margin-bottom: 8px;
    }

    .assinatura-nome {
      font-size: 10pt;
      font-weight: 700;
    }

    .assinatura-qualif {
      font-size: 9pt;
      color: #666;
      font-style: italic;
    }

    .assinatura-cpf {
      font-size: 9pt;
      color: #666;
      font-family: 'Inter', sans-serif;
    }

    .local-data {
      text-align: center;
      margin: 32px 0 24px;
      font-style: italic;
      color: #444;
    }

    .contrato-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #999;
    }

    .page-number {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #bbb;
      text-align: right;
      margin-bottom: 16px;
    }

    @media print {
      body {
        font-size: 11pt;
      }
      .contract-wrapper {
        padding: 15mm 15mm;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="contract-wrapper">

    <div class="page-number">Cód. ${data.transactionCode}</div>

    <!-- CABEÇALHO -->
    <div class="contract-header">
      <div class="contract-logo">
        <span class="brand-accent">Event</span><span class="brand-main">Swap</span>
      </div>
      <div class="contract-title">
        Instrumento Particular de Cessão de Contrato de Evento
      </div>
      <div class="contract-subtitle">
        Cessão onerosa de direitos e obrigações contratuais com intervenção de plataforma digital
      </div>
      <div class="contract-code-badge">Transação ${data.transactionCode}</div>
    </div>

    <!-- PREÂMBULO -->
    <div class="preambulo">
      <p>
        Pelo presente <strong>Instrumento Particular de Cessão de Contrato de Evento</strong>,
        as partes abaixo qualificadas têm entre si, de forma justa e contratada, o que mutuamente
        acordam e outorgam, a saber:
      </p>

      <div class="parte-box">
        <div class="parte-tipo">I — Cedente (Vendedor)</div>
        <div class="parte-nome">${data.sellerName}</div>
        <div class="parte-dados">
          CPF: ${data.sellerCpf} &nbsp;|&nbsp; E-mail: ${data.sellerEmail}
        </div>
      </div>

      <div class="parte-box">
        <div class="parte-tipo">II — Cessionário (Comprador)</div>
        <div class="parte-nome">${data.buyerName}</div>
        <div class="parte-dados">
          CPF: ${data.buyerCpf} &nbsp;|&nbsp; E-mail: ${data.buyerEmail}
        </div>
      </div>

      <div class="parte-box">
        <div class="parte-tipo">III — Interveniente-Anuente (Plataforma)</div>
        <div class="parte-nome">${data.platformName} Tecnologia Ltda.</div>
        <div class="parte-dados">
          Plataforma digital de intermediação de cessão de reservas e contratos de eventos,
          operadora do escrow e responsável pela intermediação da presente transação.
        </div>
      </div>

      <p>
        As partes acima identificadas, denominadas em conjunto como "as Partes", têm entre si
        celebrado o presente instrumento particular, que se regerá pelas cláusulas e condições
        a seguir estabelecidas, nos termos dos artigos 286 a 298 do Código Civil Brasileiro
        (Lei nº 10.406/2002).
      </p>
    </div>

    <!-- CLÁUSULA 1 - DO OBJETO -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 1ª</span> — Do Objeto
      </div>
      <div class="clausula-body">
        <p>
          1.1. O presente instrumento tem por objeto a cessão onerosa, pelo <strong>Cedente</strong> ao
          <strong>Cessionário</strong>, de todos os direitos e obrigações decorrentes do contrato de
          prestação de serviços de evento celebrado originalmente entre o Cedente e o fornecedor,
          conforme dados abaixo:
        </p>
        <div class="highlight-box">
          <div class="hl-row">
            <span class="hl-label">Descrição da Reserva / Serviço:</span>
            <span class="hl-value">${data.eventTitle}</span>
          </div>
          <div class="hl-row">
            <span class="hl-label">Fornecedor / Prestador Original:</span>
            <span class="hl-value">${data.providerName || 'A ser identificado'}</span>
          </div>
          <div class="hl-row">
            <span class="hl-label">Local do Evento:</span>
            <span class="hl-value">${data.venueName}${data.venueAddress ? ` — ${data.venueAddress}` : ''}</span>
          </div>
          <div class="hl-row">
            <span class="hl-label">Data do Evento:</span>
            <span class="hl-value">${eventDateFormatted}</span>
          </div>
        </div>
        <p>
          1.2. Por meio desta cessão, o <strong>Cessionário</strong> sub-roga-se integralmente
          na posição contratual do <strong>Cedente</strong> perante o fornecedor, assumindo todos
          os direitos, obrigações, restrições e condições originalmente pactuadas, salvo disposição
          expressa em contrário neste instrumento.
        </p>
        <p>
          1.3. O <strong>Cedente</strong> declara, sob as penas da lei, que o contrato objeto
          desta cessão encontra-se em plena vigência, sem inadimplemento, sem ônus, gravames
          ou restrições que impeçam ou dificultem a presente cessão, e que possui plena
          titularidade dos direitos cedidos.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 2 - DO PREÇO E FORMA DE PAGAMENTO -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 2ª</span> — Do Preço e da Forma de Pagamento
      </div>
      <div class="clausula-body">
        <p>
          2.1. Pela cessão ora efetuada, o <strong>Cessionário</strong> pagará ao
          <strong>Cedente</strong> o valor total de
          <strong>${formatCurrencyBRL(data.agreedPrice)} (${agreedPriceWords})</strong>,
          sendo este o preço livremente acordado entre as Partes através da plataforma
          ${data.platformName}.
        </p>
        <div class="highlight-box">
          <div class="hl-row">
            <span class="hl-label">Valor original do contrato:</span>
            <span class="hl-value">${formatCurrencyBRL(data.originalPrice)}</span>
          </div>
          <div class="hl-row">
            <span class="hl-label">Valor acordado da cessão:</span>
            <span class="hl-value">${formatCurrencyBRL(data.agreedPrice)}</span>
          </div>
          <div class="hl-row">
            <span class="hl-label">Taxa de intermediação ${data.platformName}:</span>
            <span class="hl-value">${formatCurrencyBRL(data.platformFee)} (${platformFeeWords})</span>
          </div>
          <div class="hl-total">
            <span class="hl-total-label">Valor líquido ao Cedente:</span>
            <span class="hl-total-value">${formatCurrencyBRL(sellerNetAmount)} (${sellerNetWords})</span>
          </div>
        </div>
        <p>
          2.2. O pagamento será realizado exclusivamente por meio da plataforma digital
          ${data.platformName}, através de sistema de escrow (garantia em custódia), sendo que:
        </p>
        <div class="paragrafo">
          <span class="paragrafo-numero">§ 1º</span> — O valor pago pelo Cessionário
          ficará retido em custódia segura pela plataforma ${data.platformName} até a confirmação
          efetiva da transferência contratual pelo fornecedor;
        </div>
        <div class="paragrafo">
          <span class="paragrafo-numero">§ 2º</span> — Confirmada a transferência, o valor
          líquido de ${formatCurrencyBRL(sellerNetAmount)} (${sellerNetWords}) será
          liberado ao Cedente, descontada a taxa de intermediação;
        </div>
        <div class="paragrafo">
          <span class="paragrafo-numero">§ 3º</span> — Na hipótese de recusa do fornecedor
          em aceitar a cessão, o valor integral pago pelo Cessionário será devolvido,
          observadas as políticas da plataforma ${data.platformName}.
        </div>
      </div>
    </div>

    <!-- CLÁUSULA 3 - OBRIGAÇÕES DO CEDENTE -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 3ª</span> — Das Obrigações do Cedente
      </div>
      <div class="clausula-body">
        <p>São obrigações do <strong>Cedente</strong>:</p>
        <p>
          3.1. Entregar ao Cessionário, no prazo de até 5 (cinco) dias úteis após a confirmação
          do pagamento em escrow, toda a documentação original ou cópia autenticada do contrato
          de prestação de serviços com o fornecedor, incluindo recibos, comprovantes de pagamento
          e demais documentos pertinentes à reserva objeto desta cessão;
        </p>
        <p>
          3.2. Comunicar formalmente ao fornecedor a cessão ora realizada, apresentando as
          informações do Cessionário para fins de substituição contratual, colaborando para
          que a anuência do fornecedor seja obtida no menor prazo possível;
        </p>
        <p>
          3.3. Garantir que detém plena titularidade sobre os direitos ora cedidos, sendo
          responsável por eventuais litígios, ações, restrições ou encargos anteriores à
          presente cessão que possam afetar o contrato ou os direitos transferidos;
        </p>
        <p>
          3.4. Prestar ao Cessionário e à plataforma ${data.platformName} todas as informações
          verdadeiras e atualizadas sobre o contrato original, o fornecedor e as condições
          de prestação do serviço;
        </p>
        <p>
          3.5. Abster-se de praticar qualquer ato que possa comprometer, dificultar ou
          inviabilizar a transferência contratual ora acordada, incluindo cancelamentos
          unilaterais junto ao fornecedor.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 4 - OBRIGAÇÕES DO CESSIONÁRIO -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 4ª</span> — Das Obrigações do Cessionário
      </div>
      <div class="clausula-body">
        <p>São obrigações do <strong>Cessionário</strong>:</p>
        <p>
          4.1. Efetuar o pagamento do valor acordado de ${formatCurrencyBRL(data.agreedPrice)}
          exclusivamente por meio da plataforma ${data.platformName}, no prazo estabelecido
          na transação, sob pena de cancelamento automático desta cessão;
        </p>
        <p>
          4.2. Aceitar integralmente as condições, restrições, datas, horários, especificações
          técnicas e demais termos originalmente pactuados entre o Cedente e o fornecedor,
          assumindo todas as obrigações remanescentes do contrato;
        </p>
        <p>
          4.3. Apresentar-se ao fornecedor com documentação válida para fins de formalização
          da substituição contratual, quando solicitado;
        </p>
        <p>
          4.4. Responsabilizar-se por todas as obrigações contratuais a partir da data de
          confirmação da presente cessão, incluindo eventuais parcelas ainda não pagas
          diretamente ao fornecedor;
        </p>
        <p>
          4.5. Verificar, antes da conclusão desta transação, as condições do serviço, local
          do evento, e demais especificações do contrato, reconhecendo ciência plena das
          condições da reserva adquirida.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 5 - DA INTERMEDIAÇÃO -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 5ª</span> — Da Intermediação e do Papel da Plataforma
      </div>
      <div class="clausula-body">
        <p>
          5.1. A plataforma ${data.platformName}, na qualidade de <strong>Interveniente-Anuente</strong>,
          atua exclusivamente como intermediadora tecnológica, responsável por:
          (i) disponibilizar a infraestrutura para anúncio e negociação;
          (ii) realizar a custódia do valor pago em escrow até a confirmação da transferência;
          (iii) facilitar a comunicação entre as Partes; e
          (iv) processar os pagamentos, conforme suas políticas e termos de uso.
        </p>
        <p>
          5.2. A taxa de intermediação no valor de
          <strong>${formatCurrencyBRL(data.platformFee)} (${platformFeeWords})</strong>
          é devida à plataforma ${data.platformName} pelos serviços de intermediação,
          custódia em escrow, processamento de pagamento e suporte à transação, e será
          descontada do valor a ser repassado ao Cedente no momento da liberação do escrow.
        </p>
        <p>
          5.3. O sistema de escrow da ${data.platformName} garante que o Cessionário somente
          perderá o valor pago caso a transferência seja devidamente confirmada, e que o
          Cedente somente receberá o pagamento após a confirmação efetiva da cessão pelo fornecedor.
        </p>
        <p>
          5.4. A plataforma ${data.platformName} registrará eletronicamente todas as etapas
          desta transação, incluindo confirmações, comunicações relevantes e logs de acesso,
          que poderão ser utilizados como prova em eventual disputa ou procedimento legal.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 6 - DA RESPONSABILIDADE -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 6ª</span> — Da Responsabilidade e Limitação de Garantias
      </div>
      <div class="clausula-body">
        <p>
          6.1. A plataforma ${data.platformName} <strong>não se responsabiliza</strong> pela
          qualidade, execução, adequação ou resultado final do serviço de evento contratado
          originalmente, sendo tais obrigações exclusivas do fornecedor/prestador de serviços.
        </p>
        <p>
          6.2. A ${data.platformName} não garante que o fornecedor aceitará a cessão, sendo
          que, em caso de recusa, o valor em escrow será devolvido integralmente ao Cessionário,
          conforme § 3º da Cláusula 2ª.
        </p>
        <p>
          6.3. O <strong>Cedente</strong> responderá integralmente pelas informações prestadas
          acerca do contrato original, eximindo a ${data.platformName} e o Cessionário de
          qualquer responsabilidade por inexatidões ou omissões culposas do Cedente.
        </p>
        <p>
          6.4. Em caso de disputa entre as Partes, a plataforma ${data.platformName} poderá
          atuar como mediadora, sem obrigação de julgamento definitivo, podendo manter o
          valor em escrow pelo prazo necessário à resolução, conforme suas políticas internas.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 7 - DA ANUÊNCIA DO FORNECEDOR -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 7ª</span> — Da Anuência do Fornecedor Original
      </div>
      <div class="clausula-body">
        <p>
          7.1. A eficácia plena da presente cessão, em especial a obrigação de entrega do
          serviço pelo fornecedor ao Cessionário, está condicionada à anuência formal do
          fornecedor original, nos termos do artigo 290 do Código Civil Brasileiro.
        </p>
        <p>
          7.2. O <strong>Cedente</strong> compromete-se a obter e apresentar, no prazo
          máximo de 15 (quinze) dias corridos a partir da confirmação do escrow, a anuência
          formal do fornecedor, por escrito ou por qualquer meio eletrônico aceito pelo
          fornecedor, comprovando a aceitação da substituição contratual.
        </p>
        <p>
          7.3. Caso o fornecedor exija documentação adicional, pagamento de taxa de
          transferência ou cumprimento de formalidades contratuais específicas para aceitar
          a cessão, tais ônus serão negociados entre as Partes, salvo acordo específico
          em sentido contrário.
        </p>
        <p>
          7.4. O simples descumprimento das cláusulas do contrato original por parte do
          Cessionário, após a cessão, é de responsabilidade exclusiva do Cessionário
          perante o fornecedor, não podendo o Cedente ser responsabilizado por tais atos.
        </p>
      </div>
    </div>

    <!-- CLÁUSULA 8 - DISPOSIÇÕES GERAIS -->
    <div class="section">
      <div class="clausula-titulo">
        <span class="clausula-numero">Cláusula 8ª</span> — Das Disposições Gerais
      </div>
      <div class="clausula-body">
        <p>
          8.1. <strong>Lei Aplicável:</strong> O presente contrato é celebrado em conformidade
          com a legislação brasileira, em especial o Código Civil (Lei nº 10.406/2002),
          o Código de Defesa do Consumidor (Lei nº 8.078/1990) e o Marco Civil da Internet
          (Lei nº 12.965/2014), sendo regido e interpretado de acordo com as leis da
          República Federativa do Brasil.
        </p>
        <p>
          8.2. <strong>Foro:</strong> As Partes elegem o foro da comarca de São Paulo/SP
          para dirimir quaisquer dúvidas, litígios ou controvérsias oriundas deste instrumento,
          com renúncia expressa a qualquer outro, por mais privilegiado que seja.
        </p>
        <p>
          8.3. <strong>Validade e Integridade:</strong> A eventual nulidade ou ineficácia
          de qualquer cláusula deste instrumento não contaminará as demais, que permanecerão
          válidas e eficazes, devendo as Partes renegociar a cláusula inválida de boa-fé.
        </p>
        <p>
          8.4. <strong>Assinatura Eletrônica:</strong> As Partes reconhecem que a aceitação
          dos termos na plataforma ${data.platformName}, por meio de confirmação eletrônica
          mediante credencial de acesso (login e senha), possui validade jurídica equivalente
          à assinatura manuscrita, nos termos do artigo 10, § 2º, da MP 2.200-2/2001 e do
          artigo 784, III, do CPC.
        </p>
        <p>
          8.5. <strong>Integralidade:</strong> O presente instrumento, juntamente com os
          Termos de Uso e a Política de Privacidade da plataforma ${data.platformName},
          constitui o acordo integral entre as Partes relativamente ao objeto aqui tratado,
          prevalecendo sobre quaisquer negociações, entendimentos ou acordos anteriores,
          verbais ou escritos.
        </p>
        <p>
          8.6. <strong>Registro:</strong> A presente cessão é registrada digitalmente na
          plataforma ${data.platformName} sob o código de transação
          <strong>${data.transactionCode}</strong>, datado de ${transactionDateFormatted},
          servindo tal registro como prova de formação do negócio jurídico entre as Partes.
        </p>
      </div>
    </div>

    <!-- LOCAL E DATA -->
    <div class="local-data">
      São Paulo, ${transactionDateFormatted}.
    </div>

    <!-- ASSINATURAS -->
    <div class="assinaturas">
      <div class="assinaturas-titulo">Assinaturas das Partes</div>
      <div class="assinaturas-grid">
        <div class="assinatura-bloco">
          <div class="assinatura-linha"></div>
          <div class="assinatura-nome">${data.sellerName}</div>
          <div class="assinatura-qualif">Cedente</div>
          <div class="assinatura-cpf">CPF: ${data.sellerCpf}</div>
        </div>
        <div class="assinatura-bloco">
          <div class="assinatura-linha"></div>
          <div class="assinatura-nome">${data.buyerName}</div>
          <div class="assinatura-qualif">Cessionário</div>
          <div class="assinatura-cpf">CPF: ${data.buyerCpf}</div>
        </div>
        <div class="assinatura-bloco">
          <div class="assinatura-linha"></div>
          <div class="assinatura-nome">${data.platformName} Tecnologia Ltda.</div>
          <div class="assinatura-qualif">Interveniente-Anuente</div>
          <div class="assinatura-cpf">Plataforma Digital</div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="contrato-footer">
      <p>
        Documento gerado eletronicamente pela plataforma ${data.platformName} &bull;
        Transação: ${data.transactionCode} &bull; ${transactionDateFormatted}
      </p>
      <p style="margin-top: 4px;">
        Este instrumento é válido nos termos da legislação brasileira vigente. Guarde este documento.
      </p>
      <p style="margin-top: 4px;">
        &copy; ${currentYear} ${data.platformName}. Todos os direitos reservados.
      </p>
    </div>

  </div>
</body>
</html>`;
}
