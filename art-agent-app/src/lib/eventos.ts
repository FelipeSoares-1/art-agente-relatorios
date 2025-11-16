// Verificação contextual inteligente para tag "Eventos"
// Baseado no modelo de sucesso da tag "Concorrentes"

/**
 * Verifica se uma notícia realmente trata de eventos relevantes para publicidade
 * usando sistema de scoring contextual
 */
export function isRelevantEventNews(text: string, feedName: string): boolean {
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

  // 2. EVENTOS ESPECÍFICOS DA PUBLICIDADE (+4 pontos cada)
  const specificEvents = [
    'cannes lions', 'festival de cannes', 'ccsp', 'congresso de comunicação',
    'rio2c', 'festival rio2c', 'intercom', 'abrapcorp', 'festival de creatividad',
    'effie awards', 'one show', 'clio awards', 'festival el ojo', 'young lions',
    'semana de arte moderna', 'propmark experience', 'digitalks', 'conecta',
    'festival path', 'fenapro', 'congresso brasileiro de publicidade'
  ];

  specificEvents.forEach(event => {
    if (textLower.includes(event)) {
      score += 4;
    }
  });

  // 3. TERMOS DE EVENTOS PUBLICITÁRIOS (+3 pontos cada)
  const eventTerms = [
    'festival publicitário', 'congresso de publicidade', 'seminário de marketing',
    'conference publicidade', 'workshop criativo', 'masterclass publicitária',
    'palestra marketing', 'encontro publicitário', 'summit marketing',
    'fórum criatividade', 'convenção publicitária'
  ];

  eventTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 3;
    }
  });

  // 4. TERMOS GERAIS DE EVENTOS (+2 pontos cada)
  const generalEventTerms = [
    'festival', 'congresso', 'seminário', 'palestra', 'conferência',
    'workshop', 'evento', 'encontro', 'summit', 'fórum',
    'convenção', 'simpósio', 'masterclass', 'webinar', 'live',
    'feira', 'exposição', 'mostra'
  ];

  generalEventTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 2;
    }
  });

  // 5. CONTEXTO PUBLICITÁRIO (+2 pontos cada)
  const advertisingContext = [
    'publicidade', 'marketing', 'propaganda', 'comunicação', 'criatividade',
    'branding', 'agência', 'mídia', 'digital', 'social media',
    'influencer', 'branded content', 'experiência de marca'
  ];

  advertisingContext.forEach(context => {
    if (textLower.includes(context)) {
      score += 2;
    }
  });

  // 6. CONTEXTOS IRRELEVANTES (-8 pontos cada)
  const irrelevantContexts = [
    // Eventos esportivos
    'campeonato de futebol', 'copa do mundo', 'olimpíadas', 'competição esportiva',
    'torneio de tênis', 'jogo de basquete', 'partida de vôlei',
    
    // Eventos políticos
    'convenção política', 'congresso nacional', 'eleições', 'debate político',
    'assembleia legislativa', 'câmara dos deputados',
    
    // Eventos médicos/acadêmicos não relacionados
    'congresso médico', 'simpósio de medicina', 'encontro científico',
    'conferência de física', 'seminário de biologia',
    
    // Eventos musicais/culturais gerais
    'festival de música', 'show musical', 'concerto sinfônico',
    'festival de cinema não publicitário', 'mostra de teatro',
    
    // Eventos religiosos
    'congresso religioso', 'encontro católico', 'conferência evangélica',
    'seminário teológico'
  ];

  irrelevantContexts.forEach(context => {
    if (textLower.includes(context)) {
      score -= 8;
    }
  });

  // 7. BONUS POR PALESTRANTES/PERSONALIDADES DA PUBLICIDADE (+3 pontos)
  const advertisingPersonalities = [
    'washington olivetto', 'nizan guanaes', 'marcello serpa', 'bob isherwood',
    'david droga', 'alex gama', 'sergio gordilho', 'giovanni bianco',
    'rafael urenha', 'eduardo lima', 'pernil', 'dulcidio caldeira'
  ];

  advertisingPersonalities.forEach(person => {
    if (textLower.includes(person)) {
      score += 3;
    }
  });

  // 8. BONUS POR AGÊNCIAS PARTICIPANTES (+2 pontos)
  const agencies = [
    'almapbbdo', 'wmccann', 'ogilvy', 'ddb', 'publicis', 'artplan'
  ];

  agencies.forEach(agency => {
    if (textLower.includes(agency)) {
      score += 2;
    }
  });

  // Threshold: precisa de pelo menos 3 pontos para ser considerado relevante
  return score > 3;
}

/**
 * Detecta se texto é sobre eventos relevantes para publicidade
 * com verificação contextual inteligente
 */
export function detectarEventos(text: string, feedName: string = ''): boolean {
  if (!text) return false;

  const textLower = text.toLowerCase();

  // Primeiro, verifica se contém palavras-chave básicas de eventos
  const basicEventKeywords = [
    'festival', 'congresso', 'seminário', 'palestra', 'evento',
    'conferência', 'workshop', 'encontro', 'cannes', 'ccsp', 'rio2c'
  ];

  const hasBasicKeywords = basicEventKeywords.some(keyword => 
    textLower.includes(keyword.toLowerCase())
  );

  if (!hasBasicKeywords) {
    return false;
  }

  // Se tem palavras-chave, aplica verificação contextual
  return isRelevantEventNews(text, feedName);
}

/**
 * Função para debug - mostra scoring detalhado
 */
export function debugEventScoring(text: string, feedName: string): { score: number; details: string[] } {
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

  const specificEvents = [
    'cannes lions', 'ccsp', 'rio2c', 'festival de cannes'
  ];

  specificEvents.forEach(event => {
    if (textLower.includes(event)) {
      score += 4;
      details.push(`+4: Evento específico ("${event}")`);
    }
  });

  return { score, details };
}