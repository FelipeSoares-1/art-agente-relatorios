// Verificação contextual inteligente para tag "Prêmios de Publicidade"
// Baseado no modelo de sucesso da tag "Concorrentes"

/**
 * Verifica se uma notícia realmente trata de prêmios específicos da área publicitária
 * usando sistema de scoring contextual
 */
export function isRelevantAwardNews(text: string, feedName: string): boolean {
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

  // 2. PRÊMIOS ESPECÍFICOS DA PUBLICIDADE (+4 pontos cada)
  const specificAwards = [
    'cannes lions', 'leão de cannes', 'leão de ouro', 'leão de prata', 'leão de bronze',
    'grand prix', 'effie awards', 'effie brasil', 'one show', 'clio awards',
    'festival el ojo', 'young lions', 'prêmio colunistas', 'profissionais do ano',
    'prêmio aberje', 'festival de criatividade', 'wave festival', 'festival ccsp',
    'prêmio propmark', 'prêmio meio & mensagem', 'festival path', 'adfest',
    'spikes asia', 'epica awards', 'webby awards', 'lápis de ouro',
    'prêmio comunique-se', 'prêmio marketing best'
  ];

  specificAwards.forEach(award => {
    if (textLower.includes(award)) {
      score += 4;
    }
  });

  // 3. TERMOS DE PREMIAÇÃO PUBLICITÁRIA (+3 pontos cada)
  const awardTerms = [
    'prêmio publicitário', 'premiação publicitária', 'troféu publicitário',
    'reconhecimento publicitário', 'festival publicitário', 'concurso criativo',
    'competição publicitária', 'prêmio de criatividade', 'award publicitário',
    'medalha publicitária', 'honraria publicitária'
  ];

  awardTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 3;
    }
  });

  // 4. TERMOS GERAIS DE PREMIAÇÃO (+2 pontos cada)
  const generalAwardTerms = [
    'prêmio', 'premiado', 'premiação', 'venceu', 'vencedor', 'ganhou',
    'troféu', 'medalha', 'reconhecimento', 'homenagem', 'distinção',
    'honraria', 'láurea', 'galardão', 'condecoração', 'certificado',
    'ouro', 'prata', 'bronze', 'primeiro lugar', 'finalista'
  ];

  generalAwardTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 2;
    }
  });

  // 5. CONTEXTO PUBLICITÁRIO/CRIATIVO (+2 pontos cada)
  const advertisingContext = [
    'publicidade', 'propaganda', 'marketing', 'criatividade', 'comunicação',
    'campanha', 'peça publicitária', 'filme publicitário', 'anúncio',
    'agência', 'cliente', 'marca', 'branding', 'criação', 'direção de arte',
    'redação', 'planejamento', 'estratégia', 'mídia', 'digital'
  ];

  advertisingContext.forEach(context => {
    if (textLower.includes(context)) {
      score += 2;
    }
  });

  // 6. CONTEXTOS IRRELEVANTES (-8 pontos cada)
  const irrelevantContexts = [
    // Prêmios esportivos
    'prêmio esportivo', 'troféu esportivo', 'medalha olímpica', 'copa do mundo',
    'prêmio fifa', 'ballon d\'or', 'melhor jogador', 'campeonato',
    
    // Prêmios de entretenimento não publicitários
    'oscar', 'emmy', 'grammy', 'golden globe', 'prêmio da música',
    'prêmio literário', 'prêmio de cinema', 'festival de cannes filme',
    
    // Prêmios acadêmicos/científicos
    'prêmio nobel', 'prêmio científico', 'reconhecimento acadêmico',
    'medalha de honra', 'prêmio de pesquisa',
    
    // Prêmios políticos/sociais
    'prêmio político', 'reconhecimento político', 'medalha militar',
    'ordem do mérito', 'título honorífico',
    
    // Concursos não relacionados
    'concurso de beleza', 'prêmio de culinária', 'competição de dança',
    'prêmio jornalístico geral', 'prêmio de arquitetura'
  ];

  irrelevantContexts.forEach(context => {
    if (textLower.includes(context)) {
      score -= 8;
    }
  });

  // 7. BONUS POR AGÊNCIAS MENCIONADAS (+3 pontos)
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

  // 8. BONUS POR MARCAS/CLIENTES (+2 pontos)
  const brands = [
    'coca-cola', 'pepsi', 'nike', 'adidas', 'samsung', 'apple', 'volkswagen',
    'fiat', 'bradesco', 'itaú', 'banco do brasil', 'natura', 'magazine luiza'
  ];

  brands.forEach(brand => {
    if (textLower.includes(brand)) {
      score += 2;
    }
  });

  // 9. BONUS POR CATEGORIAS DE PRÊMIOS (+2 pontos)
  const categories = [
    'outdoor', 'digital', 'filme', 'rádio', 'mídia impressa', 'inovação',
    'branded content', 'social media', 'mobile', 'direct', 'promo',
    'design', 'integrated', 'effectiveness', 'titanium', 'cyber'
  ];

  categories.forEach(category => {
    if (textLower.includes(category)) {
      score += 2;
    }
  });

  // Threshold: precisa de pelo menos 4 pontos para ser considerado relevante
  // (um pouco mais alto para evitar falsos positivos com prêmios gerais)
  return score > 4;
}

/**
 * Detecta se texto é sobre prêmios específicos da publicidade
 * com verificação contextual inteligente
 */
export function detectarPremios(text: string, feedName: string = ''): boolean {
  if (!text) return false;

  const textLower = text.toLowerCase();

  // Primeiro, verifica se contém palavras-chave básicas de premiação
  const basicAwardKeywords = [
    'prêmio', 'premiado', 'premiação', 'troféu', 'medalha', 'venceu',
    'ganhou', 'reconhecimento', 'cannes', 'leão', 'effie', 'award'
  ];

  const hasBasicKeywords = basicAwardKeywords.some(keyword => 
    textLower.includes(keyword.toLowerCase())
  );

  if (!hasBasicKeywords) {
    return false;
  }

  // Se tem palavras-chave, aplica verificação contextual
  return isRelevantAwardNews(text, feedName);
}

/**
 * Função para debug - mostra scoring detalhado
 */
export function debugAwardScoring(text: string, feedName: string): { score: number; details: string[] } {
  const textLower = text.toLowerCase();
  let score = 0;
  const details: string[] = [];

  // Análise detalhada para debug
  const advertisingFeeds = [
    'meio & mensagem', 'propmark', 'adnews', 'marcas pelo mundo'
  ];
  
  if (advertisingFeeds.some(feed => feedName.toLowerCase().includes(feed))) {
    score += 5;
    details.push(`+5: Fonte confiável (${feedName})`);
  }

  const specificAwards = [
    'cannes lions', 'leão de ouro', 'effie awards', 'grand prix'
  ];

  specificAwards.forEach(award => {
    if (textLower.includes(award)) {
      score += 4;
      details.push(`+4: Prêmio específico ("${award}")`);
    }
  });

  return { score, details };
}