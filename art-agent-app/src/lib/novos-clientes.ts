// Verificação contextual inteligente para tag "Novos Clientes"
// Baseado no modelo de sucesso da tag "Concorrentes"

/**
 * Verifica se uma notícia realmente trata de agências conquistando novos clientes
 * usando sistema de scoring contextual
 */
export function isRelevantNewClientNews(text: string, feedName: string): boolean {
  if (!text) return false;

  const textLower = text.toLowerCase();
  let score = 0;

  // 1. FONTE CONFIÁVEL (+5 pontos)
  const advertisingFeeds = [
    'meio & mensagem', 'propmark', 'adnews', 'marcas pelo mundo',
    'mundo do marketing', 'b9', 'agência brasília'
  ];
  
  if (advertisingFeeds.some(feed => feedName.toLowerCase().includes(feed))) {
    score += 5;
  }

  // 2. TERMOS ESPECÍFICOS DE CONQUISTA DE CONTAS (+4 pontos cada)
  const specificTerms = [
    'venceu concorrência', 'venceu pitch', 'conquistou conta', 'fechou conta',
    'agência eleita', 'escolheu agência', 'selecionou agência', 'novo cliente',
    'nova conta', 'assinou contrato', 'fechou contrato', 'conquista conta',
    'vence pitch', 'pitch vencedor', 'conta conquistada', 'cliente conquistado'
  ];

  specificTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 4;
    }
  });

  // 3. TERMOS GERAIS RELACIONADOS (+2 pontos cada)
  const generalTerms = [
    'conquista', 'vence', 'venceu', 'ganhou', 'contrato', 'pitch',
    'concorrência', 'seleção', 'cliente', 'conta', 'agência',
    'parceria', 'negócio', 'acordo'
  ];

  generalTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 2;
    }
  });

  // 4. CONTEXTOS IRRELEVANTES (-8 pontos cada)
  const irrelevantContexts = [
    // Contextos financeiros não relacionados a agências
    'conta bancária', 'conta corrente', 'conta poupança', 'investimento',
    'ações', 'bolsa de valores', 'mercado financeiro',
    
    // Contextos esportivos
    'conquista título', 'venceu partida', 'ganhou jogo', 'campeonato',
    'torneio', 'competição esportiva',
    
    // Contextos políticos/jurídicos
    'conquista eleitoral', 'venceu eleição', 'processo judicial',
    'contrato de trabalho', 'acordo trabalhista',
    
    // Contextos pessoais não empresariais
    'cliente de banco', 'conta de energia', 'conta de água',
    'conquista pessoal', 'relacionamento pessoal'
  ];

  irrelevantContexts.forEach(context => {
    if (textLower.includes(context)) {
      score -= 8;
    }
  });

  // 5. BONUS POR AGÊNCIAS MENCIONADAS (+3 pontos)
  const agencies = [
    'almapbbdo', 'wmccann', 'ogilvy', 'ddb', 'publicis', 'vmly&r',
    'grey', 'havas', 'lew lara', 'wunderman', 'africa creative',
    'sunset', 'soko', 'gut', 'galeria', 'talent marcel', 'artplan'
  ];

  agencies.forEach(agency => {
    if (textLower.includes(agency)) {
      score += 3;
    }
  });

  // Threshold: precisa de pelo menos 3 pontos para ser considerado relevante
  return score > 3;
}

/**
 * Detecta se texto é sobre novos clientes de agências
 * com verificação contextual inteligente
 */
export function detectarNovosClientes(text: string, feedName: string = ''): boolean {
  if (!text) return false;

  const textLower = text.toLowerCase();

  // Primeiro, verifica se contém palavras-chave básicas
  const basicKeywords = [
    'novo cliente', 'nova conta', 'conquista', 'vence', 'venceu',
    'contrato', 'pitch', 'concorrência', 'agência eleita'
  ];

  const hasBasicKeywords = basicKeywords.some(keyword => 
    textLower.includes(keyword.toLowerCase())
  );

  if (!hasBasicKeywords) {
    return false;
  }

  // Se tem palavras-chave, aplica verificação contextual
  return isRelevantNewClientNews(text, feedName);
}

/**
 * Função para debug - mostra scoring detalhado
 */
export function debugNewClientScoring(text: string, feedName: string): { score: number; details: string[] } {
  const textLower = text.toLowerCase();
  let score = 0;
  const details: string[] = [];

  // Análise detalhada para debug
  const advertisingFeeds = [
    'meio & mensagem', 'propmark', 'adnews', 'marcas pelo mundo',
    'mundo do marketing', 'b9', 'agência brasília'
  ];
  
  if (advertisingFeeds.some(feed => feedName.toLowerCase().includes(feed))) {
    score += 5;
    details.push(`+5: Fonte confiável (${feedName})`);
  }

  const specificTerms = [
    'venceu concorrência', 'venceu pitch', 'conquistou conta', 'fechou conta',
    'agência eleita', 'escolheu agência', 'nova conta', 'novo cliente'
  ];

  specificTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 4;
      details.push(`+4: Termo específico ("${term}")`);
    }
  });

  return { score, details };
}