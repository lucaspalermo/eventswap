export interface ArticleSection {
  id: string
  title: string
  content: string
}

export interface Article {
  slug: string
  title: string
  excerpt: string
  description: string
  keywords: string[]
  author: string
  publishedAt: string
  readingTime: number
  image: string
  category: 'guia' | 'dicas' | 'juridico' | 'financeiro'
  sections: ArticleSection[]
}

export const articles: Article[] = [
  {
    slug: 'como-transferir-reserva-de-casamento',
    title: 'Como Transferir sua Reserva de Casamento sem Perder Dinheiro',
    excerpt: 'Descubra o passo a passo completo para transferir suas reservas de casamento de forma segura e sem perder o dinheiro investido.',
    description: 'Guia completo sobre como transferir reservas de casamento sem prejuízo. Aprenda o passo a passo, documentos necessários e como o EventSwap protege vendedores e compradores.',
    keywords: [
      'transferir reserva casamento',
      'transferência contrato casamento',
      'vender reserva casamento',
      'desistência casamento reserva',
    ],
    author: 'EventSwap',
    publishedAt: '2026-01-15',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    category: 'guia',
    sections: [
      {
        id: 'introducao',
        title: 'Por que Transferir em vez de Cancelar?',
        content:
          'Organizar um casamento é uma das experiências mais emocionantes — e financeiramente intensas — da vida de um casal. São meses de planejamento, dezenas de fornecedores contratados e, muitas vezes, valores que ultrapassam R$ 50.000 ou até R$ 100.000 em reservas antecipadas. Quando os planos mudam, seja por motivos pessoais, mudança de cidade ou simplesmente uma nova data, o primeiro instinto é cancelar tudo. Mas será que essa é a melhor opção?\n\nCancelar reservas de casamento pode significar perder entre 20% e 50% do valor já pago em multas contratuais. Fornecedores como buffets, espaços de eventos, fotógrafos e decoradores geralmente possuem cláusulas de cancelamento bastante rígidas, especialmente quando a data está próxima. A transferência da reserva para outro casal é uma alternativa inteligente que permite recuperar grande parte — ou até a totalidade — do investimento realizado.\n\nA boa notícia é que transferir reservas de casamento é uma prática legal, amparada pelo Código Civil brasileiro, e cada vez mais comum no mercado de eventos. Plataformas como o EventSwap surgiram justamente para facilitar esse processo, conectando quem precisa vender suas reservas a casais que buscam boas oportunidades com desconto.',
      },
      {
        id: 'passo-a-passo',
        title: 'Passo a Passo para Transferir sua Reserva',
        content:
          'O processo de transferência de uma reserva de casamento pode parecer complicado, mas quando feito de forma organizada, é surpreendentemente simples. O primeiro passo é reunir toda a documentação relacionada ao contrato original: o contrato assinado com o fornecedor, comprovantes de pagamento, e-mails de confirmação e qualquer aditivo contratual. Esses documentos serão essenciais tanto para o comprador avaliar a reserva quanto para formalizar a transferência.\n\nO segundo passo é verificar as condições contratuais de transferência. A maioria dos contratos de casamento não proíbe explicitamente a cessão de direitos, mas alguns fornecedores podem cobrar uma taxa administrativa para formalizar a mudança de titularidade. Leia atentamente as cláusulas do seu contrato e, se necessário, entre em contato com o fornecedor para confirmar a viabilidade da transferência antes de anunciar.\n\nCom a documentação em mãos e a confirmação de que a transferência é possível, o próximo passo é criar seu anúncio no EventSwap. Na plataforma, você cadastra todos os detalhes da reserva — data, local, serviços incluídos, valor original e valor de venda — e o anúncio fica disponível para milhares de casais que buscam oportunidades. O EventSwap cuida de toda a intermediação, incluindo o sistema de pagamento protegido (escrow), que garante segurança para ambas as partes.\n\nPor fim, após encontrar um comprador interessado, a transferência é formalizada diretamente com o fornecedor. O EventSwap disponibiliza modelos de termos de cessão de direitos que podem ser usados para documentar a operação. O pagamento só é liberado para o vendedor após a confirmação de que a transferência foi realizada com sucesso junto ao fornecedor.',
      },
      {
        id: 'documentos-necessarios',
        title: 'Documentos Necessários para a Transferência',
        content:
          'Para que a transferência ocorra de forma segura e sem contratempos, é fundamental ter todos os documentos organizados. O documento mais importante é o contrato original firmado com o fornecedor, que estabelece as condições do serviço contratado, incluindo data, horário, pacote escolhido e valores pagos. Sem esse documento, é impossível validar a reserva e garantir ao comprador que ele está adquirindo algo legítimo.\n\nAlém do contrato, você precisará dos comprovantes de pagamento de todas as parcelas já quitadas. Extratos bancários, recibos emitidos pelo fornecedor ou comprovantes de transferência PIX servem como prova do investimento realizado. Esses documentos são especialmente importantes para justificar o preço de venda e dar transparência à negociação.\n\nOutro documento essencial é o termo de cessão de direitos, que formaliza a transferência do contrato entre o vendedor original e o novo comprador. O EventSwap oferece modelos prontos desse documento, adaptados para diferentes tipos de serviços de casamento. Em alguns casos, o fornecedor pode exigir que a cessão seja feita por instrumento particular com firma reconhecida, ou até mesmo que um aditivo contratual seja assinado pelas três partes (vendedor, comprador e fornecedor).\n\nPor último, tenha em mãos documentos pessoais de identificação (RG e CPF) de ambas as partes. Para transferências de maior valor, o EventSwap realiza verificação de identidade (KYC) para garantir a segurança da operação e prevenir fraudes.',
      },
      {
        id: 'definindo-preco',
        title: 'Como Definir o Preço Ideal para sua Reserva',
        content:
          'Definir o preço de venda da sua reserva é uma das decisões mais importantes do processo. Preços muito altos afastam compradores, enquanto preços muito baixos significam prejuízo desnecessário. O ponto de partida é calcular o valor total já investido: some todas as parcelas pagas, taxas e eventuais custos adicionais. Esse é o seu "teto" — raramente um comprador pagará mais do que o valor original.\n\nNa prática, reservas de casamento no EventSwap são vendidas com descontos que variam entre 15% e 40% em relação ao valor original, dependendo de alguns fatores: proximidade da data (quanto mais próxima, maior o desconto esperado pelo comprador), flexibilidade do serviço (pacotes mais genéricos são mais fáceis de vender do que pacotes muito personalizados) e reputação do fornecedor.\n\nUma boa estratégia é pesquisar anúncios similares no EventSwap para entender o que o mercado está praticando. Se sua reserva é para um espaço muito disputado ou para uma data em alta temporada (como outubro ou novembro), você pode praticar descontos menores. Se a data é mais próxima ou em período de baixa temporada, considere um desconto mais agressivo para garantir a venda rápida.\n\nLembre-se: mesmo vendendo com desconto, você ainda estará recuperando muito mais do que recuperaria com um cancelamento, que pode custar até metade do valor já pago em multas. Vender com 25% de desconto no EventSwap é infinitamente melhor do que perder 50% com o cancelamento.',
      },
      {
        id: 'escrow-protecao',
        title: 'Como o EventSwap Protege Vendedores e Compradores',
        content:
          'A maior preocupação tanto de quem vende quanto de quem compra uma reserva de evento é a segurança da transação. E essa preocupação é completamente legítima — estamos falando de valores significativos e de um serviço que será utilizado em uma data futura. É por isso que o EventSwap utiliza um sistema de pagamento protegido (escrow) que funciona como um intermediário financeiro.\n\nO funcionamento é simples: quando o comprador decide adquirir uma reserva, o pagamento é feito diretamente para o EventSwap, que retém o valor em uma conta protegida. O dinheiro NÃO vai imediatamente para o vendedor. Somente após o comprador confirmar que a transferência da reserva foi realizada com sucesso junto ao fornecedor é que o valor é liberado para o vendedor. Se por qualquer motivo a transferência não se concretizar, o comprador recebe o reembolso integral.\n\nEsse sistema protege o vendedor contra compradores que desistem após a negociação (o pagamento já está garantido no escrow) e protege o comprador contra vendedores desonestos ou reservas que não existem (o dinheiro só é liberado após confirmação). Além disso, o EventSwap possui um processo de verificação de anúncios que inclui conferência de documentos e validação da reserva junto ao fornecedor, adicionando uma camada extra de segurança à operação.',
      },
    ],
  },
  {
    slug: 'cancelar-buffet-sem-multa',
    title: 'Como Cancelar Buffet sem Pagar Multa: Guia Completo 2026',
    excerpt: 'Entenda como evitar multas de cancelamento de buffet e conheça alternativas inteligentes para não perder o dinheiro investido.',
    description: 'Guia completo sobre como cancelar reserva de buffet sem pagar multa em 2026. Conheça seus direitos, alternativas ao cancelamento e como transferir sua reserva.',
    keywords: [
      'cancelar buffet sem multa',
      'multa cancelamento buffet',
      'desistência buffet',
      'transferir reserva buffet',
      'evitar multa buffet',
    ],
    author: 'EventSwap',
    publishedAt: '2026-01-22',
    readingTime: 9,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    category: 'financeiro',
    sections: [
      {
        id: 'realidade-multas',
        title: 'A Realidade das Multas de Cancelamento de Buffets',
        content:
          'O mercado de buffets para eventos no Brasil opera com uma realidade financeira que poucos contratantes conhecem em detalhes antes de assinar o contrato: as multas de cancelamento. Quando você reserva um buffet para casamento, formatura, aniversário ou evento corporativo, a maioria dos contratos prevê multas que variam de 10% a 50% do valor total contratado, dependendo da antecedência com que o cancelamento é solicitado.\n\nNa prática, funciona assim: cancelamentos feitos com mais de 6 meses de antecedência geralmente incorrem em multas de 10% a 20%. Entre 3 e 6 meses, a multa sobe para 20% a 30%. Com menos de 3 meses da data do evento, não é raro encontrar contratos que preveem multas de 40% a 50% — e em alguns casos, a perda total do sinal. Para um buffet contratado por R$ 30.000, isso pode significar um prejuízo de R$ 6.000 a R$ 15.000.\n\nEssas multas existem porque o buffet reserva a data exclusivamente para o seu evento, recusa outros clientes para aquela data, e muitas vezes já iniciou o planejamento e a compra de insumos. Do ponto de vista do fornecedor, o cancelamento representa uma perda real de receita. Entender essa dinâmica é importante para avaliar suas opções e tomar a melhor decisão financeira.',
      },
      {
        id: 'direitos-consumidor',
        title: 'Seus Direitos como Consumidor no Cancelamento',
        content:
          'O Código de Defesa do Consumidor (CDC) e o Código Civil brasileiro oferecem algumas proteções importantes que todo contratante deve conhecer. Primeiramente, o artigo 51 do CDC estabelece que são nulas as cláusulas contratuais que "estabeleçam obrigações consideradas iníquas, abusivas, que coloquem o consumidor em desvantagem exagerada". Isso significa que multas de cancelamento excessivas podem ser questionadas judicialmente.\n\nA jurisprudência brasileira tem entendido que multas superiores a 20-25% do valor do contrato podem ser consideradas abusivas, dependendo do caso concreto. Se o seu contrato prevê uma multa de 50%, por exemplo, há boas chances de redução judicial. No entanto, é importante destacar que recorrer à justiça é um processo demorado (pode levar anos) e custoso (honorários advocatícios, custas processuais), e o resultado não é garantido.\n\nOutro ponto importante: se o buffet alterou unilateralmente alguma condição do contrato (como mudança de cardápio, troca de data por indisponibilidade, ou alteração do espaço), você pode ter direito ao cancelamento sem multa, pois a alteração contratual unilateral é vedada pelo CDC. Documente qualquer mudança que o fornecedor tenha feito sem sua concordância, pois isso pode ser seu argumento para um cancelamento sem penalidades.\n\nCasos de força maior — como problemas graves de saúde devidamente comprovados, falecimento de familiar próximo ou desastres naturais — também podem justificar a rescisão contratual sem multa ou com multa reduzida, conforme o artigo 393 do Código Civil. Mantenha toda a documentação comprobatória organizada.',
      },
      {
        id: 'alternativa-transferencia',
        title: 'A Alternativa Inteligente: Transferir em vez de Cancelar',
        content:
          'Se o cancelamento direto implica multas pesadas e a via judicial é incerta e demorada, qual é a melhor alternativa? A resposta é a transferência da reserva para outra pessoa. Em vez de devolver a data para o buffet e arcar com a multa, você pode encontrar alguém interessado em assumir sua reserva — geralmente com um desconto atrativo — e recuperar a maior parte do seu investimento.\n\nVamos fazer as contas: imagine que você contratou um buffet por R$ 40.000 e já pagou R$ 20.000 de entrada. Se cancelar com menos de 3 meses da data, a multa pode ser de 40%, ou seja, R$ 16.000. Você receberia de volta apenas R$ 4.000 dos R$ 20.000 pagos. Agora, se transferir a reserva pelo EventSwap com 25% de desconto, você venderia por R$ 30.000. Descontando a taxa da plataforma, você receberia aproximadamente R$ 27.000 — recuperando R$ 7.000 a mais do que os R$ 20.000 que pagou, ou R$ 23.000 a mais do que receberia com o cancelamento.\n\nO EventSwap é a maior plataforma brasileira de transferência de reservas de eventos, e buffets são uma das categorias mais procuradas por compradores. A demanda por buffets com desconto é constante, especialmente para datas em alta temporada. O processo de cadastro do anúncio leva menos de 10 minutos, e a plataforma cuida de toda a intermediação, incluindo pagamento protegido por escrow.\n\nAlém da vantagem financeira, a transferência é mais rápida do que qualquer processo judicial e não gera conflito com o fornecedor. Na verdade, muitos buffets preferem a transferência ao cancelamento, pois mantêm a data ocupada e o evento acontecendo normalmente.',
      },
      {
        id: 'comparativo-custos',
        title: 'Comparativo Real de Custos: Cancelar vs Transferir',
        content:
          'Para deixar ainda mais clara a diferença entre cancelar e transferir, preparamos um comparativo detalhado considerando três cenários reais de cancelamento de buffet.\n\nCenário 1 — Buffet para casamento, valor contratado R$ 50.000, pago R$ 25.000 de entrada, cancelamento com 4 meses de antecedência. Multa contratual de 30% (R$ 15.000): valor recuperado no cancelamento seria R$ 10.000. Na transferência via EventSwap com 20% de desconto (venda por R$ 40.000), valor recuperado seria aproximadamente R$ 36.000 após taxas. Diferença a favor da transferência: R$ 26.000.\n\nCenário 2 — Buffet para formatura, valor contratado R$ 25.000, pago R$ 12.500, cancelamento com 2 meses de antecedência. Multa contratual de 40% (R$ 10.000): valor recuperado seria R$ 2.500. Transferência com 30% de desconto (venda por R$ 17.500), valor recuperado seria aproximadamente R$ 15.700. Diferença: R$ 13.200.\n\nCenário 3 — Buffet para aniversário, valor contratado R$ 15.000, pago integralmente, cancelamento com 1 mês de antecedência. Multa contratual de 50% (R$ 7.500): valor recuperado seria R$ 7.500. Transferência com 35% de desconto (venda por R$ 9.750), valor recuperado seria aproximadamente R$ 8.750. Diferença: R$ 1.250.\n\nEm todos os cenários, a transferência gera resultado financeiro significativamente superior ao cancelamento. E quanto mais alto o valor do contrato e mais próxima a data, maior a vantagem da transferência. Os números não mentem: transferir pelo EventSwap é, na imensa maioria dos casos, a decisão financeiramente mais inteligente.',
      },
      {
        id: 'passo-a-passo-buffet',
        title: 'Passo a Passo para Transferir sua Reserva de Buffet',
        content:
          'O processo de transferência de uma reserva de buffet pelo EventSwap é simples e pode ser concluído em poucos passos. Primeiro, entre em contato com o seu buffet e confirme se o contrato permite cessão de direitos (transferência). A grande maioria permite, mas é importante verificar se há alguma taxa administrativa cobrada pelo fornecedor para formalizar a mudança de titular.\n\nEm seguida, crie sua conta no EventSwap e cadastre seu anúncio. Você precisará informar: nome do buffet, endereço, data do evento, pacote contratado (número de convidados, cardápio, serviços incluídos), valor total do contrato, valor já pago e o preço de venda desejado. Quanto mais detalhado o anúncio, maior a chance de venda rápida. Adicione fotos do espaço e do cardápio, se disponíveis.\n\nApós a publicação, o EventSwap divulga seu anúncio para sua base de compradores interessados na região. Quando um comprador demonstrar interesse, a plataforma intermedia toda a negociação. O comprador faz o pagamento via escrow (pagamento protegido) e, em seguida, vendedor e comprador formalizam a transferência junto ao buffet, utilizando o modelo de termo de cessão fornecido pelo EventSwap.\n\nApós a confirmação do buffet de que a transferência foi realizada com sucesso, o EventSwap libera o pagamento para o vendedor. Todo o processo costuma levar entre 3 e 15 dias, dependendo da velocidade de resposta do buffet e da disponibilidade das partes. Simples, seguro e muito mais vantajoso do que o cancelamento.',
      },
    ],
  },
  {
    slug: 'transferencia-de-contrato-de-evento-e-legal',
    title: 'Transferência de Contrato de Evento é Legal? Entenda seus Direitos',
    excerpt: 'Entenda a base legal da transferência de contratos de eventos no Brasil e saiba como a cessão de direitos é amparada pelo Código Civil.',
    description: 'Análise jurídica completa sobre a legalidade da transferência de contratos de eventos no Brasil. Entenda a cessão de direitos no Código Civil e como o EventSwap documenta o processo.',
    keywords: [
      'transferência contrato evento legal',
      'cessão de direitos evento',
      'lei transferência reserva',
      'código civil cessão contrato',
    ],
    author: 'EventSwap',
    publishedAt: '2026-02-03',
    readingTime: 10,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
    category: 'juridico',
    sections: [
      {
        id: 'base-legal',
        title: 'A Base Legal: Cessão de Direitos no Código Civil Brasileiro',
        content:
          'A transferência de um contrato de evento é, juridicamente, uma operação conhecida como "cessão de crédito" ou "cessão de direitos", regulamentada pelos artigos 286 a 298 do Código Civil brasileiro (Lei 10.406/2002). Essa é uma das figuras jurídicas mais consolidadas do direito brasileiro, utilizada há décadas em diversos tipos de contratos, desde imóveis até planos de saúde.\n\nO artigo 286 do Código Civil estabelece que "o credor pode ceder o seu crédito, se a isso não se opuser a natureza da obrigação, a lei, ou a convenção com o devedor". Em termos práticos, isso significa que se você contratou um serviço de evento (buffet, espaço, fotógrafo), você pode transferir seus direitos sobre esse contrato para outra pessoa, desde que o contrato não proíba expressamente essa transferência e que a natureza do serviço permita.\n\nÉ importante distinguir entre cessão de crédito e cessão de posição contratual. Na cessão de crédito, apenas os direitos são transferidos — por exemplo, o direito de utilizar o espaço na data reservada. Na cessão de posição contratual, tanto os direitos quanto as obrigações são transferidos — o novo contratante assume também o compromisso de pagar as parcelas restantes. No contexto de eventos, geralmente ocorre a cessão de posição contratual, o que exige a concordância do fornecedor (devedor cedido), conforme entendimento doutrinário e jurisprudencial.',
      },
      {
        id: 'quando-fornecedor-precisa-aprovar',
        title: 'Quando o Fornecedor Precisa Aprovar a Transferência?',
        content:
          'A necessidade de aprovação do fornecedor depende do tipo de cessão realizada. Para a cessão simples de crédito (artigo 286 do Código Civil), em regra, não é necessário o consentimento do devedor — basta que ele seja notificado da transferência. No entanto, quando se trata de cessão de posição contratual, que é o caso mais comum em contratos de eventos, a doutrina majoritária e a jurisprudência entendem que o consentimento do devedor cedido (o fornecedor) é necessário.\n\nNa prática, a maioria dos fornecedores de eventos aceita a transferência sem grandes objeções. Afinal, para o fornecedor, é indiferente quem será o titular do evento — o serviço será prestado da mesma forma. Muitos preferem a transferência ao cancelamento, pois mantêm a receita e a agenda ocupada. Alguns fornecedores cobram uma taxa administrativa pela transferência, geralmente entre R$ 200 e R$ 1.000, o que é perfeitamente legal desde que previsto em contrato ou acordado entre as partes.\n\nExistem, contudo, situações em que o fornecedor pode recusar a transferência. Contratos que contenham cláusula expressa de intransferibilidade impedem a cessão sem o consentimento do fornecedor. Porém, mesmo nesse caso, é possível argumentar que a cláusula é abusiva se impedir completamente a transferência sem oferecer alternativa razoável ao consumidor, conforme o princípio da boa-fé objetiva (artigo 422 do Código Civil) e a vedação de cláusulas abusivas do Código de Defesa do Consumidor.\n\nO EventSwap recomenda sempre entrar em contato com o fornecedor antes de anunciar a reserva, para confirmar que a transferência será aceita. A plataforma inclusive auxilia nessa comunicação, oferecendo modelos de notificação ao fornecedor que facilitam o processo.',
      },
      {
        id: 'protecao-consumidor',
        title: 'Proteção do Consumidor na Transferência de Eventos',
        content:
          'O Código de Defesa do Consumidor (CDC — Lei 8.078/1990) oferece diversas proteções que se aplicam tanto ao vendedor original quanto ao comprador que assume a reserva. O artigo 6º, inciso V, do CDC garante ao consumidor o direito à "modificação das cláusulas contratuais que estabeleçam prestações desproporcionais", o que inclui multas de cancelamento excessivas que poderiam ser evitadas pela simples transferência do contrato.\n\nPara o comprador que assume a reserva, o CDC garante todos os direitos que o contratante original tinha, incluindo o direito de exigir a prestação do serviço conforme contratado (artigo 35), o direito à informação clara sobre o serviço (artigo 6º, III) e o direito à reparação por vícios do serviço (artigo 20). A transferência de contrato não diminui em nada os direitos consumeristas do novo titular.\n\nUm ponto crucial que merece atenção é a responsabilidade solidária. O vendedor original pode permanecer solidariamente responsável pelo cumprimento das obrigações contratuais caso a cessão de posição contratual não seja formalmente aceita pelo fornecedor. Por isso, a formalização adequada da transferência — com o conhecimento e aceite expresso do fornecedor — é fundamental para liberar o vendedor original de qualquer responsabilidade futura.\n\nO EventSwap se preocupa profundamente com a segurança jurídica de todas as partes envolvidas. Por isso, a plataforma disponibiliza modelos de termos de cessão de direitos elaborados por advogados especializados, e orienta tanto vendedores quanto compradores sobre a documentação necessária para que a transferência seja feita com total amparo legal.',
      },
      {
        id: 'como-eventswap-documenta',
        title: 'Como o EventSwap Documenta a Transferência Legalmente',
        content:
          'O processo de documentação legal da transferência no EventSwap foi desenvolvido com o auxílio de advogados especializados em direito do consumidor e direito contratual. A plataforma adota um protocolo de documentação que garante segurança jurídica para vendedores, compradores e fornecedores.\n\nO primeiro documento gerado é o Termo de Cessão de Direitos e Obrigações, que formaliza a transferência entre o cedente (vendedor) e o cessionário (comprador). Esse documento contém a identificação completa das partes, a descrição detalhada da reserva sendo transferida, o valor da transação, e as condições da cessão. O termo é assinado eletronicamente por ambas as partes através da plataforma, com validade jurídica conforme a Lei 14.063/2020 e a Medida Provisória 2.200-2/2001.\n\nO segundo documento é a Notificação ao Fornecedor, que comunica formalmente ao prestador de serviços sobre a transferência de titularidade. Essa notificação é essencial para atender ao requisito do artigo 290 do Código Civil, que determina que a cessão de crédito não tem eficácia em relação ao devedor senão quando a este notificada. O EventSwap envia essa notificação por e-mail com confirmação de leitura e, quando necessário, por carta registrada.\n\nAlém desses documentos, o EventSwap mantém um registro completo da transação, incluindo: comprovantes de pagamento, histórico de mensagens entre as partes, documentos de identificação verificados e a confirmação do fornecedor. Esse acervo documental funciona como um dossiê da transação, disponível para consulta a qualquer momento e utilizável como prova em caso de qualquer questionamento futuro. Todo esse cuidado com a documentação é o que torna o EventSwap a plataforma mais segura do Brasil para transferência de reservas de eventos.',
      },
      {
        id: 'jurisprudencia',
        title: 'Jurisprudência e Precedentes sobre Transferência de Contratos de Eventos',
        content:
          'Os tribunais brasileiros têm se manifestado de forma consistente sobre a legalidade e os limites da cessão de contratos de eventos. Diversas decisões do TJSP, TJRJ e TJMG reconhecem o direito do consumidor de ceder sua posição contratual, desde que observados os requisitos legais. A tendência jurisprudencial é favorável ao consumidor, especialmente quando a alternativa à transferência é o pagamento de multas que os tribunais consideram excessivas.\n\nUm ponto recorrente nas decisões judiciais é a análise da razoabilidade das multas contratuais. Tribunais de todo o país têm reduzido multas de cancelamento consideradas abusivas, geralmente fixando o patamar máximo entre 10% e 25% do valor do contrato. Essa jurisprudência reforça indiretamente o direito à transferência, pois se o consumidor pode cancelar com multa moderada, com mais razão pode ceder seus direitos a terceiro sem qualquer prejuízo ao fornecedor.\n\nOutro precedente relevante é o reconhecimento, por diversos tribunais, de que cláusulas contratuais que proíbem totalmente a cessão de direitos em contratos de consumo podem ser consideradas abusivas, especialmente quando o fornecedor não demonstra prejuízo concreto com a transferência. O fundamento é que a proibição absoluta de transferência, combinada com multas elevadas de cancelamento, coloca o consumidor em situação de onerosidade excessiva, violando os princípios do CDC.\n\nÉ importante ressaltar que, embora a transferência seja legal e amparada pela legislação e jurisprudência, a formalização adequada é essencial para evitar problemas. Utilizar uma plataforma como o EventSwap, que oferece documentação jurídica profissional e intermediação especializada, é a forma mais segura de realizar a operação dentro da legalidade.',
      },
    ],
  },
  {
    slug: 'como-economizar-comprando-reservas-de-eventos',
    title: 'Como Economizar até 70% Comprando Reservas de Eventos',
    excerpt: 'Descubra como comprar reservas de eventos com grandes descontos no EventSwap e economizar milhares de reais em casamentos e festas.',
    description: 'Guia do comprador: aprenda a encontrar reservas de eventos com até 70% de desconto no EventSwap. Dicas para verificar anúncios, categorias com maiores descontos e proteção do escrow.',
    keywords: [
      'comprar reserva evento desconto',
      'economizar casamento',
      'reserva evento barato',
      'marketplace eventos desconto',
    ],
    author: 'EventSwap',
    publishedAt: '2026-02-10',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
    category: 'dicas',
    sections: [
      {
        id: 'oportunidade',
        title: 'A Oportunidade que Poucos Conhecem no Mercado de Eventos',
        content:
          'O mercado de eventos no Brasil movimenta mais de R$ 200 bilhões por ano, e uma parcela significativa desse valor é desperdiçada em cancelamentos. Estima-se que entre 15% e 20% das reservas de eventos são canceladas ou não utilizadas, gerando um volume enorme de contratos que poderiam ser aproveitados por outras pessoas. É exatamente essa ineficiência que cria uma oportunidade única para compradores atentos.\n\nQuando alguém desiste de um casamento, adia uma formatura ou cancela um evento corporativo, as reservas feitas com fornecedores como buffets, espaços, fotógrafos e decoradores ficam ociosas. O vendedor quer recuperar o máximo possível do investimento e, por isso, está disposto a oferecer descontos significativos em relação ao preço original. Para o comprador, isso significa acesso a fornecedores premium por uma fração do custo normal.\n\nO EventSwap é o marketplace que conecta essas duas pontas: pessoas que precisam vender suas reservas e pessoas que buscam oportunidades para seus eventos. Na plataforma, é possível encontrar reservas de casamento, formatura, aniversário, eventos corporativos e muito mais, com descontos que podem chegar a 70% em relação ao valor contratado originalmente. E tudo com a segurança de um sistema de pagamento protegido.',
      },
      {
        id: 'categorias-desconto',
        title: 'Categorias com os Maiores Descontos',
        content:
          'Nem todas as categorias de reservas oferecem o mesmo nível de desconto. Conhecer as faixas típicas de cada categoria ajuda você a identificar quando uma oferta está realmente boa ou quando pode ser melhor esperar por uma oportunidade mais vantajosa.\n\nEspaços para eventos e buffets costumam ter descontos de 15% a 40%. São as categorias mais valorizadas, pois representam o maior custo de um evento e são os serviços mais difíceis de contratar em cima da hora. Mesmo com descontos menores, a economia em valores absolutos é enorme — um espaço de R$ 30.000 com 25% de desconto representa R$ 7.500 de economia.\n\nServiços de fotografia e vídeo geralmente aparecem com descontos de 20% a 50%. Como são serviços que dependem muito do profissional e não do comprador, são facilmente transferíveis. Decoração e floricultura podem ter descontos de 30% a 60%, especialmente quando a desistência é próxima da data e o vendedor tem urgência em vender.\n\nAs categorias com maiores descontos são vestidos de noiva e trajes (30% a 70% de desconto, pois são itens pessoais que o vendedor precisa se desfazer) e pacotes completos (25% a 50%, quando o vendedor transfere todas as reservas de um evento de uma vez). Pacotes completos são especialmente vantajosos porque incluem múltiplos fornecedores já contratados e coordenados entre si, economizando não apenas dinheiro, mas também tempo de planejamento.',
      },
      {
        id: 'o-que-verificar',
        title: 'O que Verificar Antes de Comprar uma Reserva',
        content:
          'Comprar uma reserva de evento usada é um negócio inteligente, mas exige atenção a alguns pontos para garantir que a transação seja segura e vantajosa. O primeiro item a verificar é a autenticidade do contrato original. No EventSwap, todos os anúncios passam por um processo de verificação que inclui análise do contrato e confirmação junto ao fornecedor. Ainda assim, como comprador, é seu direito solicitar e analisar o contrato original antes de fechar o negócio.\n\nVerifique se o contrato permite transferência de titularidade e se há custos adicionais para essa operação. Alguns fornecedores cobram taxas administrativas de transferência que podem variar de R$ 200 a R$ 2.000, dependendo do tipo de serviço. Esse custo adicional deve ser considerado no seu cálculo de economia total. Confirme também se o pacote contratado atende às suas necessidades — número de convidados, cardápio, horários, serviços incluídos.\n\nOutro ponto crucial é a reputação e situação do fornecedor. Pesquise sobre o fornecedor no Reclame Aqui, Google Reviews e redes sociais. Verifique se a empresa está ativa e sem processos judiciais relevantes. Um fornecedor com boa reputação e situação financeira saudável é garantia de que o serviço será prestado conforme contratado, independentemente de quem seja o titular.\n\nPor fim, confirme a data e as condições de uso da reserva. Certifique-se de que a data disponível funciona para o seu evento e que não há restrições contratuais que impeçam a utilização conforme planejado. O EventSwap disponibiliza todas essas informações no anúncio e facilita a comunicação entre comprador e vendedor para esclarecer qualquer dúvida antes da compra.',
      },
      {
        id: 'escrow-comprador',
        title: 'Como o Escrow Protege Você como Comprador',
        content:
          'Um dos maiores receios de quem compra uma reserva transferida é: "E se eu pagar e a transferência não acontecer?" É uma preocupação totalmente válida, e é exatamente por isso que o EventSwap implementou um sistema de pagamento protegido (escrow) que elimina esse risco.\n\nQuando você decide comprar uma reserva no EventSwap, o pagamento não vai diretamente para o vendedor. O valor é depositado em uma conta protegida, administrada pela plataforma, e fica retido até que a transferência da reserva seja confirmada. Você, como comprador, tem o controle: somente quando confirmar que a transferência foi realizada com sucesso junto ao fornecedor é que o dinheiro é liberado para o vendedor.\n\nSe por qualquer motivo a transferência não se concretizar — seja porque o fornecedor recusou, o vendedor desistiu, ou as condições não eram as anunciadas — você recebe o reembolso integral do valor pago. Sem burocracia, sem discussão. O EventSwap atua como um árbitro imparcial, protegendo ambas as partes e garantindo que a transação só se conclua quando todos estiverem satisfeitos.\n\nAlém do escrow, o EventSwap oferece um suporte dedicado para acompanhar todo o processo de transferência. Uma equipe especializada auxilia na comunicação com o fornecedor, na documentação necessária e na resolução de qualquer imprevisto. Esse nível de proteção e suporte é o que diferencia comprar pelo EventSwap de tentar negociar diretamente com desconhecidos em grupos de redes sociais.',
      },
      {
        id: 'dicas-melhores-ofertas',
        title: 'Dicas para Encontrar as Melhores Ofertas',
        content:
          'Para maximizar suas chances de encontrar as melhores ofertas no EventSwap, existem algumas estratégias que compradores experientes utilizam. A primeira é ativar as notificações para as categorias e regiões que interessam. As melhores ofertas costumam ser vendidas rapidamente, então ser notificado assim que um novo anúncio é publicado pode fazer a diferença entre conseguir ou perder uma oportunidade incrível.\n\nOutra dica valiosa é ter flexibilidade de datas. Se você ainda não definiu a data do seu evento, pode aproveitar ofertas com datas variadas e escolher a que melhor funcionar. Casais que estão abertos a diferentes datas de casamento, por exemplo, encontram as melhores oportunidades, pois podem aproveitar qualquer oferta que surgir em vez de ficar limitados a uma data específica.\n\nConsidere também comprar reservas em períodos de "alta oferta" — os meses que antecedem a alta temporada de casamentos (setembro a novembro) costumam ter mais anúncios de desistência, pois é quando as pessoas que reservaram com muita antecedência começam a revisar seus planos. Janeiro e fevereiro também são meses de alta oferta, após o período de festas e com a chegada do Carnaval, quando muitos eventos são cancelados ou adiados.\n\nPor último, não tenha medo de negociar. Embora os preços no EventSwap já incluam descontos significativos, muitos vendedores estão abertos a negociação, especialmente quando a data está próxima. Utilize o chat da plataforma para conversar com o vendedor, demonstrar seu interesse genuíno e, se apropriado, propor um valor que funcione para ambas as partes. As melhores economias vêm da combinação de boas ofertas com negociação inteligente.',
      },
    ],
  },
  {
    slug: 'o-que-fazer-quando-desiste-do-casamento',
    title: 'Desistiu do Casamento? Saiba o que Fazer com suas Reservas',
    excerpt: 'Um guia prático e acolhedor para quem cancelou o casamento e precisa lidar com todas as reservas já feitas sem perder dinheiro.',
    description: 'Guia completo e prático para quem desistiu do casamento. Saiba como lidar com todas as reservas (buffet, espaço, fotógrafo, vestido) e recuperar seu investimento com o EventSwap.',
    keywords: [
      'desistiu do casamento',
      'cancelar casamento reservas',
      'o que fazer desistência casamento',
      'recuperar dinheiro casamento',
    ],
    author: 'EventSwap',
    publishedAt: '2026-02-17',
    readingTime: 9,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200',
    category: 'guia',
    sections: [
      {
        id: 'voce-nao-esta-sozinha',
        title: 'Você Não Está Sozinha: A Desistência é Mais Comum do que Parece',
        content:
          'Tomar a decisão de cancelar um casamento é uma das experiências emocionais mais difíceis que uma pessoa pode enfrentar. Além da dor emocional, há a sensação de frustração ao pensar em todo o planejamento, tempo e dinheiro investidos em algo que não vai mais acontecer. Se você está passando por isso, saiba que não está sozinha — e que essa decisão, por mais dolorosa que seja, pode ser a mais corajosa e sábia da sua vida.\n\nEstudos indicam que entre 13% e 20% dos noivados são desfeitos antes do casamento. Isso significa que, no Brasil, milhares de pessoas passam por essa situação todos os anos. As razões são as mais diversas: incompatibilidades descobertas durante o planejamento, mudanças de vida, problemas familiares, ou simplesmente a percepção de que aquele não era o momento certo. Não há vergonha alguma em mudar de planos — muito pelo contrário, é um ato de honestidade consigo mesma e com a outra pessoa.\n\nO que este artigo vai te ajudar a resolver é a parte prática: o que fazer com todas as reservas já contratadas. Buffet, espaço de eventos, fotógrafo, DJ, decoração, vestido de noiva, convites, cerimonialista — a lista pode ser longa e os valores, assustadores. Mas respire fundo: existem soluções inteligentes para recuperar grande parte do seu investimento, e vamos te guiar por cada uma delas.',
      },
      {
        id: 'inventario-reservas',
        title: 'Faça um Inventário Completo de Todas as suas Reservas',
        content:
          'O primeiro passo — e o mais importante — é fazer um levantamento completo de tudo que foi contratado e pago para o casamento. Pegue uma planilha ou caderno e liste absolutamente todos os fornecedores, com as seguintes informações: nome do fornecedor, tipo de serviço, valor total contratado, valor já pago, data do evento, e condições de cancelamento previstas no contrato.\n\nAs categorias mais comuns de reservas de casamento incluem: espaço/local da cerimônia e recepção (geralmente o maior custo, entre R$ 10.000 e R$ 50.000), buffet e alimentação (R$ 8.000 a R$ 40.000), fotografia e vídeo (R$ 3.000 a R$ 15.000), decoração e floricultura (R$ 3.000 a R$ 20.000), DJ e música (R$ 2.000 a R$ 8.000), vestido de noiva e trajes (R$ 2.000 a R$ 15.000), convites e papelaria (R$ 500 a R$ 3.000), e cerimonialista (R$ 3.000 a R$ 12.000).\n\nSomando tudo, não é raro que o investimento total em reservas ultrapasse R$ 50.000 ou até R$ 100.000. Ao visualizar esses números, a importância de uma estratégia inteligente de recuperação fica evidente. Cancelar tudo e arcar com as multas pode significar uma perda de R$ 15.000 a R$ 50.000. Transferir pelo EventSwap pode reduzir essa perda para algo entre R$ 5.000 e R$ 15.000 — ou até eliminá-la completamente em alguns casos.\n\nCom o inventário pronto, organize as reservas por ordem de urgência (datas de cancelamento mais restritivas primeiro) e por valor (priorize a recuperação dos contratos mais caros). Essa organização vai te ajudar a agir de forma estratégica nos próximos passos.',
      },
      {
        id: 'custos-cancelar-vs-transferir',
        title: 'Os Custos Reais de Cancelar vs Transferir cada Reserva',
        content:
          'Vamos analisar, fornecedor por fornecedor, qual é o custo real de cancelar versus transferir. Para o espaço de eventos, a multa de cancelamento geralmente varia de 20% a 50% dependendo da antecedência. Um espaço contratado por R$ 25.000 teria uma multa de R$ 5.000 a R$ 12.500 se cancelado. Transferindo pelo EventSwap com desconto de 20%, você venderia por R$ 20.000, recuperando R$ 18.000 após taxas — uma diferença potencial de até R$ 13.000 em relação ao cancelamento.\n\nPara o buffet, a situação é semelhante. Multas de 25% a 40% são comuns. Um buffet de R$ 30.000 com multa de 30% significaria perda de R$ 9.000. Transferindo com 25% de desconto pelo EventSwap, você recuperaria aproximadamente R$ 20.000 após taxas. A economia é expressiva em qualquer cenário.\n\nFotógrafos e videomakers costumam ter multas menores (10% a 25%), mas ainda assim a transferência é vantajosa. Decoração e floricultura são categorias onde a transferência faz especial sentido quando incluem itens já comprados ou encomendados. Para vestidos de noiva e trajes, o EventSwap oferece uma seção específica onde esses itens são vendidos com descontos de 30% a 70%, atraindo muitas compradoras.\n\nO DJ e a música têm multas geralmente moderadas, e muitos profissionais aceitam a transferência sem custos adicionais. Já a cerimonialista pode ter cláusulas mais restritivas, mas a maioria compreende a situação e facilita a transferência ou oferece cancelamento com multa reduzida. Em todos os casos, vale a pena verificar as condições específicas de cada contrato antes de decidir entre cancelar e transferir.',
      },
      {
        id: 'estrategia-eventswap',
        title: 'Como o EventSwap é a Melhor Solução para sua Situação',
        content:
          'Diante de um cenário de dezenas de milhares de reais em reservas, o EventSwap oferece a solução mais completa e prática para recuperar seu investimento. Em vez de lidar com cada fornecedor individualmente, negociar cancelamentos, enfrentar multas e possivelmente recorrer a advogados, você pode colocar todas as suas reservas à venda na plataforma e deixar que o marketplace faça o trabalho de encontrar compradores.\n\nO processo é simples: crie uma conta gratuita no EventSwap, cadastre cada reserva como um anúncio separado (ou crie um pacote completo com todas as reservas do casamento — pacotes são muito procurados e vendem mais rápido), defina seus preços de venda e publique. A plataforma tem uma base crescente de casais procurando oportunidades, e reservas de casamento são a categoria mais demandada.\n\nUma funcionalidade especialmente útil para quem está desistindo do casamento é a opção de vender como "pacote completo". Em vez de anunciar cada fornecedor separadamente, você pode criar um único anúncio com todas as reservas — espaço, buffet, decoração, fotógrafo, DJ — e vender tudo de uma vez para um casal que está planejando o casamento na mesma data. Pacotes completos são extremamente atrativos porque o comprador assume um casamento praticamente pronto, economizando não apenas dinheiro, mas meses de planejamento.\n\nO EventSwap cuida de toda a burocracia: intermediação com compradores, documentação legal de cessão de direitos, pagamento protegido por escrow e suporte durante todo o processo de transferência com cada fornecedor. Você pode focar na sua recuperação emocional enquanto a plataforma cuida da recuperação financeira.',
      },
      {
        id: 'proximos-passos',
        title: 'Próximos Passos: Agindo com Rapidez e Inteligência',
        content:
          'O tempo é um fator crucial na recuperação do seu investimento. Quanto mais próxima a data do evento, maior tende a ser o desconto exigido pelos compradores e maior a multa de cancelamento junto aos fornecedores. Por isso, assim que a decisão de cancelar o casamento for tomada, comece a agir imediatamente na parte financeira.\n\nNas primeiras 48 horas, faça o inventário completo de reservas, reúna todos os contratos e comprovantes de pagamento, e crie sua conta no EventSwap. Nos primeiros 7 dias, cadastre todos os anúncios na plataforma, entre em contato com cada fornecedor para verificar as condições de transferência, e defina preços competitivos para venda rápida. Lembre-se: uma venda rápida com desconto maior é quase sempre melhor do que esperar meses por uma venda com desconto menor.\n\nSe algum fornecedor se recusar a aceitar a transferência, não desista imediatamente. Negocie, explique a situação e, se necessário, mencione seus direitos legais. A maioria dos fornecedores acaba aceitando, especialmente quando apresentados com um comprador concreto e disposto a manter o contrato.\n\nPor último, cuide de você. A desistência de um casamento é emocionalmente desgastante, e ter que lidar com a parte financeira pode aumentar o estresse. Usar o EventSwap tira grande parte desse peso das suas costas, pois a plataforma gerencia a complexidade da negociação e da transferência. Permita-se delegar essa parte prática e foque no que realmente importa: seguir em frente com confiança e tranquilidade. Milhares de pessoas já passaram por isso e reconstruíram suas vidas com alegria — e você também vai conseguir.',
      },
    ],
  },
  {
    slug: 'guia-completo-escrow-pagamento-protegido',
    title: 'Escrow: Como Funciona o Pagamento Protegido na Transferência de Eventos',
    excerpt: 'Entenda em detalhes como o sistema de escrow do EventSwap protege compradores e vendedores em cada etapa da transferência de reservas.',
    description: 'Guia completo sobre o sistema de escrow (pagamento protegido) do EventSwap. Entenda o fluxo de pagamento, resolução de disputas, verificação KYC e por que é mais seguro.',
    keywords: [
      'escrow pagamento protegido',
      'como funciona escrow',
      'pagamento seguro transferência evento',
      'proteção comprador vendedor',
    ],
    author: 'EventSwap',
    publishedAt: '2026-02-20',
    readingTime: 10,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200',
    category: 'guia',
    sections: [
      {
        id: 'o-que-e-escrow',
        title: 'O que é Escrow e Por que Ele Existe',
        content:
          'Escrow — ou "pagamento protegido" em português — é um mecanismo financeiro onde um terceiro de confiança retém o pagamento de uma transação até que determinadas condições sejam cumpridas por ambas as partes. Pense nele como um cofre intermediário: o comprador deposita o dinheiro, o vendedor sabe que o dinheiro existe e está garantido, mas ninguém tem acesso ao valor até que a entrega do produto ou serviço seja confirmada.\n\nEsse sistema existe porque transações entre desconhecidos sempre envolvem um dilema de confiança. O comprador tem medo de pagar e não receber o que foi prometido. O vendedor tem medo de entregar e não receber o pagamento. Em transações presenciais de baixo valor, esse risco é manejável. Mas quando falamos de transferências de reservas de eventos que podem valer R$ 10.000, R$ 30.000 ou até R$ 100.000, o risco se torna inaceitável para ambas as partes.\n\nO escrow resolve esse problema ao eliminar a necessidade de confiança direta entre comprador e vendedor. Ambas as partes confiam no intermediário — no caso, o EventSwap — que aplica regras claras e transparentes para a liberação do pagamento. Esse modelo é amplamente utilizado em marketplaces ao redor do mundo, como Mercado Livre, AirBnb e plataformas de freelancers, justamente por sua eficácia em proteger transações entre desconhecidos.',
      },
      {
        id: 'fluxo-pagamento',
        title: 'O Fluxo Completo do Pagamento Protegido no EventSwap',
        content:
          'O sistema de escrow do EventSwap funciona em cinco etapas bem definidas, cada uma projetada para maximizar a segurança de compradores e vendedores.\n\nEtapa 1 — Acordo entre as partes: comprador e vendedor negociam os termos da transferência através do chat da plataforma. Quando chegam a um acordo sobre preço e condições, o vendedor envia uma "proposta formal" que detalha exatamente o que será transferido, o valor acordado e o prazo para conclusão da transferência.\n\nEtapa 2 — Pagamento pelo comprador: o comprador aceita a proposta e realiza o pagamento através dos métodos disponíveis na plataforma (PIX, cartão de crédito ou boleto bancário). O valor é processado e depositado na conta escrow do EventSwap, uma conta segregada que não se mistura com os recursos operacionais da empresa. Neste momento, o vendedor é notificado de que o pagamento foi recebido e está garantido.\n\nEtapa 3 — Transferência da reserva: com o pagamento assegurado, vendedor e comprador procedem à transferência formal da reserva junto ao fornecedor. O EventSwap fornece toda a documentação necessária (termo de cessão de direitos, notificação ao fornecedor) e oferece suporte durante o processo. O prazo padrão para essa etapa é de 14 dias, podendo ser estendido em casos justificados.\n\nEtapa 4 — Confirmação pelo comprador: após a conclusão da transferência junto ao fornecedor, o comprador confirma na plataforma que tudo foi realizado conforme acordado. Essa confirmação é o gatilho para a liberação do pagamento.\n\nEtapa 5 — Liberação do pagamento ao vendedor: com a confirmação do comprador, o EventSwap libera o valor (descontada a taxa da plataforma) para a conta bancária cadastrada do vendedor. A transferência é processada em até 3 dias úteis.',
      },
      {
        id: 'resolucao-disputas',
        title: 'Resolução de Disputas: O que Acontece Quando Há Problemas',
        content:
          'Embora a grande maioria das transações no EventSwap seja concluída sem problemas, situações imprevistas podem surgir. O sistema de escrow inclui um mecanismo robusto de resolução de disputas que garante um tratamento justo para ambas as partes em qualquer cenário.\n\nSe o comprador não confirmar a transferência dentro do prazo estipulado, o vendedor pode abrir uma "solicitação de liberação", apresentando evidências de que a transferência foi realizada (e-mail de confirmação do fornecedor, aditivo contratual assinado, etc.). A equipe de mediação do EventSwap analisa as evidências e, se comprovada a conclusão da transferência, libera o pagamento para o vendedor mesmo sem a confirmação manual do comprador.\n\nSe o vendedor não conseguir concluir a transferência dentro do prazo — porque o fornecedor recusou, houve problema documental ou qualquer outra razão — o comprador pode solicitar o reembolso integral. A equipe do EventSwap verifica a situação e, confirmada a impossibilidade de transferência, o valor é devolvido ao comprador em até 5 dias úteis.\n\nPara situações mais complexas — como discordâncias sobre as condições da reserva, transferências parciais ou problemas com o fornecedor — o EventSwap atua como mediador imparcial. A equipe de mediação analisa toda a documentação, o histórico de mensagens e as evidências apresentadas por ambas as partes antes de tomar uma decisão. Em casos extremos, quando a mediação não resolve, a plataforma pode envolver seu departamento jurídico para orientar as partes sobre seus direitos e possíveis caminhos de resolução.\n\nEsse mecanismo de disputas é transparente: ambas as partes têm acesso a todas as etapas do processo e podem apresentar documentos e argumentos a qualquer momento. A imparcialidade é o pilar fundamental — o EventSwap não favorece compradores ou vendedores, mas sim a parte que demonstra ter razão com base nas evidências.',
      },
      {
        id: 'verificacao-kyc',
        title: 'Verificação de Identidade (KYC): Mais uma Camada de Segurança',
        content:
          'Além do escrow, o EventSwap implementa um rigoroso processo de verificação de identidade conhecido como KYC (Know Your Customer, ou "Conheça Seu Cliente"). Esse processo é uma exigência regulatória para plataformas financeiras e um componente essencial da estratégia de prevenção a fraudes do EventSwap.\n\nPara realizar transações na plataforma, tanto compradores quanto vendedores precisam completar a verificação de identidade. O processo inclui: envio de documento de identificação com foto (RG ou CNH), selfie de confirmação (para garantir que a pessoa que está cadastrando é a mesma do documento), e validação de dados pessoais (CPF e data de nascimento). Para vendedores, a verificação também inclui a confirmação da titularidade da conta bancária onde receberá os pagamentos.\n\nEsse processo pode parecer burocrático, mas é fundamental para a segurança de todos. A verificação KYC impede que golpistas criem contas falsas para publicar anúncios fraudulentos ou realizem compras com documentos de terceiros. Desde a implementação do KYC completo, a taxa de fraudes no EventSwap caiu para praticamente zero, tornando a plataforma um dos ambientes mais seguros do Brasil para transações de alto valor entre pessoas físicas.\n\nAlém do KYC de usuários, o EventSwap também realiza verificação dos anúncios. Antes de um anúncio ser publicado, a equipe de moderação analisa os documentos da reserva (contrato, comprovantes de pagamento) e, em muitos casos, entra em contato diretamente com o fornecedor para confirmar a existência e as condições da reserva. Anúncios que não passam nessa verificação são rejeitados. Esse duplo controle — verificação de usuário e verificação de anúncio — cria um ambiente de confiança onde compradores podem navegar e comprar com tranquilidade.',
      },
      {
        id: 'por-que-mais-seguro',
        title: 'Por que o Escrow é Mais Seguro que Transferência Direta',
        content:
          'Para quem está acostumado a negociar diretamente — via grupos de WhatsApp, Facebook ou classificados online — pode surgir a dúvida: "Por que não combino direto com a pessoa e economizo a taxa da plataforma?" Embora essa lógica pareça fazer sentido financeiro, os riscos da negociação direta são significativamente maiores, e os custos de uma fraude ou problema superam em muito qualquer economia de taxa.\n\nNa negociação direta, os riscos para o comprador incluem: pagar e o vendedor sumir (golpe clássico), descobrir que a reserva não existe ou já foi vendida para outra pessoa, encontrar condições diferentes das anunciadas (data errada, pacote inferior, parcelas em aberto), e não ter recurso em caso de problema. Para o vendedor, os riscos incluem: transferir a reserva e não receber o pagamento, receber pagamento fraudulento (PIX com contestação, cheque sem fundos), e enfrentar compradores que desistem após a negociação.\n\nEstimativas do mercado indicam que entre 5% e 15% das negociações diretas de reservas de eventos resultam em algum tipo de problema — desde inconveniências menores até prejuízos financeiros significativos. Com valores médios de R$ 15.000 a R$ 30.000 por transação, mesmo uma taxa percentual relativamente modesta paga uma "apólice de seguro" que protege contra perdas potenciais muito maiores.\n\nAlém da segurança financeira do escrow, o EventSwap oferece benefícios que a negociação direta não pode proporcionar: documentação legal profissional para a transferência, suporte especializado durante todo o processo, mediação imparcial em caso de disputas, registro completo da transação para fins legais, e verificação prévia tanto do vendedor quanto da reserva. Quando somamos todos esses benefícios, a taxa da plataforma se torna um investimento em tranquilidade que vale cada centavo.\n\nA segurança deve ser sempre prioridade quando estamos lidando com valores significativos. O escrow do EventSwap foi projetado para que você possa comprar ou vender reservas de eventos com a mesma confiança com que faria uma compra em uma loja física — sabendo que seu dinheiro está protegido e que existe um processo claro e justo para cada etapa da transação.',
      },
    ],
  },
]

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getAllArticles(): Article[] {
  return articles
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug)
}

export function getRelatedArticles(slug: string, limit: number = 3): Article[] {
  const currentArticle = getArticleBySlug(slug)
  if (!currentArticle) return []

  // Score articles by relevance: same category gets higher priority,
  // then by keyword overlap
  const scored = articles
    .filter((article) => article.slug !== slug)
    .map((article) => {
      let score = 0

      // Same category = +10 points
      if (article.category === currentArticle.category) {
        score += 10
      }

      // Keyword overlap = +3 points per shared keyword
      const sharedKeywords = article.keywords.filter((keyword) =>
        currentArticle.keywords.some(
          (ck) => ck.includes(keyword) || keyword.includes(ck)
        )
      )
      score += sharedKeywords.length * 3

      // Keyword word overlap (partial matches) = +1 point per shared word
      const currentWords = new Set(
        currentArticle.keywords.flatMap((k) => k.toLowerCase().split(' '))
      )
      const articleWords = article.keywords.flatMap((k) =>
        k.toLowerCase().split(' ')
      )
      const sharedWords = articleWords.filter((w) => currentWords.has(w))
      score += sharedWords.length

      return { article, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.article)
}
