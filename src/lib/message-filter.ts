/**
 * message-filter.ts
 *
 * Biblioteca de filtragem de mensagens para prevenir bypass de contato fora da plataforma.
 * Detecta tentativas de compartilhamento de telefone, e-mail, redes sociais e URLs.
 *
 * Modos:
 *   PRE_ESCROW  - Bloqueio estrito: nenhuma informação de contato é permitida
 *   POST_ESCROW - Permissivo: troca de contato liberada após confirmação de pagamento
 */

export type FilterMode = 'PRE_ESCROW' | 'POST_ESCROW';

export type ViolationSeverity = 'none' | 'low' | 'medium' | 'high';

export interface MessageAnalysis {
  isBlocked: boolean;
  severity: ViolationSeverity;
  violations: string[];
  sanitizedText: string;
}

// ---------------------------------------------------------------------------
// WHITELIST – padrões permitidos mesmo em PRE_ESCROW
// ---------------------------------------------------------------------------

/**
 * Remove da string os padrões da whitelist (valores monetários, datas, endereços
 * de evento) antes de aplicar as regras de bloqueio, evitando falsos positivos.
 */
function stripWhitelisted(text: string): string {
  let t = text;

  // Valores monetários: R$ 1.500, R$1500, R$ 250,00, etc.
  t = t.replace(/R\$\s*[\d.,]+/gi, 'VALOR_MOEDA');

  // Datas: 15/03/2026, 15-03-2026, 15.03.2026
  t = t.replace(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g, 'DATA_EVENTO');

  // Anos isolados que possam ser confundidos com telefone
  t = t.replace(/\b(20\d{2}|19\d{2})\b/g, 'ANO_EVENTO');

  // Horários: 18h, 18:30, 18h30
  t = t.replace(/\b\d{1,2}h(\d{2})?\b/gi, 'HORARIO_EVENTO');
  t = t.replace(/\b\d{1,2}:\d{2}\b/g, 'HORARIO_EVENTO');

  // CEP: 01310-100, 01310100
  t = t.replace(/\b\d{5}-?\d{3}\b/g, 'CEP_ENDERECO');

  // Porcentagens: 15%, 12,5%
  t = t.replace(/\b\d+[,.]?\d*\s*%/g, 'PERCENTUAL');

  // Números de ingresso / lote: "lote 2", "ingresso 3", "mesa 12"
  t = t.replace(/\b(lote|ingresso|mesa|lugar|assento|setor|cadeira|fila)\s+\d+\b/gi, 'NUMERO_INGRESSO');

  // Quantidades pequenas isoladas (1 a 20) que provavelmente são quantidades, não telefones
  t = t.replace(/\b([1-9]|1\d|20)\s*(ingressos?|pessoas?|convidados?|pax)\b/gi, 'QUANTIDADE');

  return t;
}

// ---------------------------------------------------------------------------
// REGEXES – Telefones
// ---------------------------------------------------------------------------

const PHONE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Formato completo BR: +55 11 99999-9999, (11) 99999-9999, 11999999999
  {
    pattern: /(\+55[\s\-\.]?)?\(?\d{2}\)?[\s\-\.]?\d{4,5}[\s\-\.]?\d{4}\b/g,
    label: 'número de telefone',
  },
  // Celular sem DDD: 9 9999-9999, 99999 9999
  {
    pattern: /\b9\d[\s\-\.]?\d{4}[\s\-\.]?\d{4}\b/g,
    label: 'número de celular',
  },
  // Separados por espaço/ponto/hífen ex: 9 9 9 9 9 9 9 9 9 (8-11 dígitos)
  {
    pattern: /\b(\d[\s\.\-_]{1,2}){7,10}\d\b/g,
    label: 'número de telefone (ofuscado)',
  },
  // Apenas dígitos agrupados 8-11: 99999999, 99999999999
  {
    pattern: /\b\d{8,11}\b/g,
    label: 'sequência numérica suspeita',
  },
];

// ---------------------------------------------------------------------------
// REGEXES – E-mail
// ---------------------------------------------------------------------------

const EMAIL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // E-mail padrão
  {
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    label: 'endereço de e-mail',
  },
  // Evasão: "arr0ba", "arroba", "at", "[at]", "(at)"
  {
    pattern: /\b\w[\w.\-]*\s*(arr[0o]ba|arroba|\[?at\]?|\(at\))\s*\w[\w.\-]*\s*\.(com|net|org|br|io|co)\b/gi,
    label: 'e-mail (ofuscado)',
  },
];

// ---------------------------------------------------------------------------
// REGEXES – Redes sociais e apps de mensagem
// ---------------------------------------------------------------------------

const SOCIAL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // @username genérico (>= 3 chars, evita false positives de 1-2 chars)
  {
    pattern: /@[a-zA-Z0-9_.]{3,}/g,
    label: 'perfil em rede social',
  },
  // Domínios de redes sociais escritos por extenso
  {
    pattern: /\b(instagram|facebook|fb|twitter|x\.com|linkedin|tiktok|snapchat|telegram|signal)\s*[.\/:]?\s*[a-zA-Z0-9_.]{2,}/gi,
    label: 'perfil em rede social',
  },
  // "me chama no insta/zap/whats/face/tele/signal"
  {
    pattern: /\b(me\s+chama|chama\s+no|chama\s+a\s+gente|me\s+add|add\s+no|me\s+segue|me\s+manda|manda\s+msg|me\s+contata?|entra\s+em\s+contato)\s*(no|na|pelo?|via|pelo?\s+meu)?\s*(insta(gram)?|zap(zap)?|whats(app)?|face(book)?|tele(gram)?|signal|linkedin|twitter|tiktok)\b/gi,
    label: 'redirecionamento para rede social',
  },
  // Menção direta a apps: "whatsapp", "zap", "telegram", "signal" sem contexto
  {
    pattern: /\b(whatsapp|whats\s*app|zap\s*zap|zapzap|telegramm?|signal\s+app)\b/gi,
    label: 'menção a aplicativo de mensagem',
  },
];

// ---------------------------------------------------------------------------
// REGEXES – URLs
// ---------------------------------------------------------------------------

const URL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // http/https URLs
  {
    pattern: /https?:\/\/[^\s,;)>]+/gi,
    label: 'link externo',
  },
  // www. sem protocolo
  {
    pattern: /\bwww\.[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}[^\s]*/gi,
    label: 'link externo',
  },
  // Encurtadores: bit.ly, t.co, goo.gl, tinyurl, ow.ly
  {
    pattern: /\b(bit\.ly|t\.co|goo\.gl|tinyurl\.com|ow\.ly|short\.io|tiny\.cc|rb\.gy)\s*\/\s*[a-zA-Z0-9]+/gi,
    label: 'URL encurtada',
  },
  // Domínios comuns escritos sem protocolo: gmail.com, hotmail.com
  {
    pattern: /\b[a-zA-Z0-9\-]{2,}\.(com|net|org|br|io|co|app|me|link)\b/gi,
    label: 'endereço web',
  },
];

// ---------------------------------------------------------------------------
// KEYWORDS – Números escritos por extenso (evasão)
// ---------------------------------------------------------------------------

// Dígitos em português
// Dígitos em português (referência para padrões abaixo)
// zero=0, um=1, dois=2, três=3, quatro=4, cinco=5, seis=6, sete=7, oito=8, nove=9

// Frases que indicam compartilhamento de número escrito por extenso
const WRITTEN_NUMBER_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // "meu (número|cel|celular|zap|whats)" seguido de palavras numéricas
  {
    pattern: /\b(meu|minha)\s+(n[uú]mero|n[uú]mero\s+de\s+(cel|celular|telefone|whats|zap)|cel|celular|fone|telefone|contato)\b/gi,
    label: 'compartilhamento de número por extenso',
  },
  // Sequência de palavras numéricas: "nove oito sete seis..."
  {
    pattern: /\b(zero|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove)(\s+(zero|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove)){4,}\b/gi,
    label: 'número escrito por extenso',
  },
  // "meu nove oito..."
  {
    pattern: /\b(meu|minha)\s+(zero|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove)/gi,
    label: 'número escrito por extenso',
  },
];

// ---------------------------------------------------------------------------
// KEYWORDS – CPF como identificador de contato
// ---------------------------------------------------------------------------

const CPF_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // CPF formatado: 123.456.789-09
  {
    pattern: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
    label: 'CPF',
  },
  // CPF sem formatação: 12345678909
  {
    pattern: /\b\d{11}\b/g,
    label: 'sequência numérica longa (possível CPF)',
  },
];

// ---------------------------------------------------------------------------
// KEYWORDS – Indicações de contato fora da plataforma
// ---------------------------------------------------------------------------

const BYPASS_KEYWORD_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // "falar fora", "conversar fora", "fechar fora"
  {
    pattern: /\b(fechar?\s+fora|negoci(ar?|amos)\s+fora|conversar?\s+fora|falar\s+fora|tratar\s+fora|resolver\s+fora|contato\s+fora|direto\s+comigo|direto\s+pelo)\b/gi,
    label: 'tentativa de negociação fora da plataforma',
  },
  // "pix", "transferência direta" como forma de pagamento alternativa
  {
    pattern: /\b(pix\s+direto|transfere\s+direto|manda?\s+pix|passa?\s+o\s+pix|pix\s+pessoal)\b/gi,
    label: 'pagamento direto fora da plataforma',
  },
  // "telegram", pedindo para sair da plataforma
  {
    pattern: /\b(sai?\s+da\s+plataforma|saindo\s+daqui|v[aã]?\s+no\s+(zap|whats|insta|tele)|continua?\s+(l[aá]|no\s+whats|no\s+zap))\b/gi,
    label: 'indicação para sair da plataforma',
  },
];

// ---------------------------------------------------------------------------
// Helper: verificar se um match é de um padrão whitelistado que sobrou
// ---------------------------------------------------------------------------

/**
 * Verifica se uma correspondência de "sequência numérica" é de fato perigosa,
 * ou se foi deixada acidentalmente pela remoção da whitelist.
 * Retorna true se deve ser considerada violação.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isRealPhoneCandidate(match: string, originalText: string): boolean {
  const digits = match.replace(/\D/g, '');
  // Menos de 8 dígitos não é telefone
  if (digits.length < 8) return false;
  // 11 dígitos podem ser CPF – tratado separadamente
  if (digits.length === 11) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export function analyzeMessage(
  text: string,
  mode: FilterMode = 'PRE_ESCROW'
): MessageAnalysis {
  // Em modo POST_ESCROW, a mensagem é sempre permitida
  if (mode === 'POST_ESCROW') {
    return {
      isBlocked: false,
      severity: 'none',
      violations: [],
      sanitizedText: text,
    };
  }

  const violations: string[] = [];
  let sanitized = text;

  // 1. Remove padrões whitelistados para evitar falsos positivos
  const stripped = stripWhitelisted(text);

  // Função helper para testar e registrar violações
  const check = (
    patterns: Array<{ pattern: RegExp; label: string }>,
    source: string,
    validator?: (match: string, orig: string) => boolean
  ) => {
    for (const { pattern, label } of patterns) {
      // Reset lastIndex para regexes globais
      pattern.lastIndex = 0;
      const matches = source.match(pattern);
      if (matches) {
        const valid = matches.filter((m) =>
          validator ? validator(m, text) : true
        );
        if (valid.length > 0 && !violations.includes(label)) {
          violations.push(label);
          // Sanitizar no texto original (substituir por placeholder)
          pattern.lastIndex = 0;
          sanitized = sanitized.replace(pattern, '[informação bloqueada]');
        }
      }
      pattern.lastIndex = 0;
    }
  };

  // 2. Checar e-mails (alta prioridade)
  check(EMAIL_PATTERNS, stripped);

  // 3. Checar URLs
  check(URL_PATTERNS, stripped);

  // 4. Checar redes sociais
  check(SOCIAL_PATTERNS, stripped);

  // 5. Checar números escritos por extenso
  check(WRITTEN_NUMBER_PATTERNS, stripped);

  // 6. Checar padrões de bypass de plataforma
  check(BYPASS_KEYWORD_PATTERNS, stripped);

  // 7. Checar CPF
  check(CPF_PATTERNS, stripped);

  // 8. Checar telefones (com validator)
  check(PHONE_PATTERNS, stripped, isRealPhoneCandidate);

  // Deduplica violações
  const uniqueViolations = Array.from(new Set(violations));

  // Calcular severidade
  let severity: ViolationSeverity = 'none';
  if (uniqueViolations.length > 0) {
    // E-mail, telefone, URL e redes sociais são 'high'
    const highTriggers = [
      'endereço de e-mail',
      'e-mail (ofuscado)',
      'número de telefone',
      'número de celular',
      'número de telefone (ofuscado)',
      'link externo',
      'URL encurtada',
      'perfil em rede social',
      'redirecionamento para rede social',
      'menção a aplicativo de mensagem',
      'CPF',
    ];
    const mediumTriggers = [
      'número escrito por extenso',
      'compartilhamento de número por extenso',
      'tentativa de negociação fora da plataforma',
      'pagamento direto fora da plataforma',
      'indicação para sair da plataforma',
      'sequência numérica suspeita',
      'sequência numérica longa (possível CPF)',
      'endereço web',
    ];

    if (uniqueViolations.some((v) => highTriggers.includes(v))) {
      severity = 'high';
    } else if (uniqueViolations.some((v) => mediumTriggers.includes(v))) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
  }

  const isBlocked = severity !== 'none';

  return {
    isBlocked,
    severity,
    violations: uniqueViolations,
    sanitizedText: sanitized,
  };
}

/**
 * Retorna uma mensagem amigável descrevendo a violação principal detectada.
 */
export function getViolationDescription(violations: string[]): string {
  if (violations.length === 0) return '';

  const priority = [
    'endereço de e-mail',
    'e-mail (ofuscado)',
    'número de telefone',
    'número de celular',
    'número de telefone (ofuscado)',
    'perfil em rede social',
    'redirecionamento para rede social',
    'menção a aplicativo de mensagem',
    'link externo',
    'URL encurtada',
    'endereço web',
    'tentativa de negociação fora da plataforma',
    'pagamento direto fora da plataforma',
    'indicação para sair da plataforma',
    'número escrito por extenso',
    'compartilhamento de número por extenso',
    'CPF',
    'sequência numérica suspeita',
    'sequência numérica longa (possível CPF)',
  ];

  const messages: Record<string, string> = {
    'endereço de e-mail': 'Endereços de e-mail não são permitidos antes da confirmação do pagamento.',
    'e-mail (ofuscado)': 'Tentativa de compartilhar e-mail foi detectada.',
    'número de telefone': 'Números de telefone não são permitidos antes da confirmação do pagamento.',
    'número de celular': 'Números de celular não são permitidos antes da confirmação do pagamento.',
    'número de telefone (ofuscado)': 'Tentativa de compartilhar número de telefone foi detectada.',
    'perfil em rede social': 'Perfis de redes sociais não são permitidos antes da confirmação do pagamento.',
    'redirecionamento para rede social': 'Não é permitido direcionar a conversa para redes sociais.',
    'menção a aplicativo de mensagem': 'Aplicativos de mensagem externos não são permitidos nesta fase.',
    'link externo': 'Links externos não são permitidos antes da confirmação do pagamento.',
    'URL encurtada': 'URLs encurtadas não são permitidas antes da confirmação do pagamento.',
    'endereço web': 'Endereços web não são permitidos antes da confirmação do pagamento.',
    'tentativa de negociação fora da plataforma': 'Negociações devem ocorrer dentro da EventSwap.',
    'pagamento direto fora da plataforma': 'Pagamentos fora da plataforma não são permitidos.',
    'indicação para sair da plataforma': 'A conversa deve permanecer dentro da EventSwap.',
    'número escrito por extenso': 'Tentativa de compartilhar número escrito por extenso foi detectada.',
    'compartilhamento de número por extenso': 'Números não podem ser compartilhados antes do pagamento.',
    'CPF': 'CPF não deve ser compartilhado pelo chat antes da confirmação do pagamento.',
    'sequência numérica suspeita': 'Sequência numérica suspeita detectada.',
    'sequência numérica longa (possível CPF)': 'Sequência numérica longa detectada.',
  };

  for (const p of priority) {
    if (violations.includes(p)) {
      return messages[p] || 'Informação de contato detectada.';
    }
  }

  return 'Informação não permitida nesta fase da negociação.';
}
