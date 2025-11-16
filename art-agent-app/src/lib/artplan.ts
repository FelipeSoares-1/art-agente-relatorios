// Verificação contextual inteligente para tag "Artplan"
// Refinamento da detecção já funcional

/**
 * Verifica se uma notícia realmente trata da agência Artplan
 * usando sistema de scoring contextual refinado
 */
export function isRelevantArtplanNews(text: string, feedName: string): boolean {
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

  // 2. MENÇÃO DIRETA À ARTPLAN (+6 pontos - peso alto por ser específica)
  const artplanTerms = [
    'artplan', 'art plan', 'agência artplan'
  ];

  artplanTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 6;
    }
  });

  // 3. CONTEXTO PUBLICITÁRIO ESPECÍFICO (+3 pontos cada)
  const specificContext = [
    'campanha artplan', 'criação artplan', 'agência artplan',
    'equipe artplan', 'cliente artplan', 'conta artplan',
    'trabalho artplan', 'projeto artplan'
  ];

  specificContext.forEach(context => {
    if (textLower.includes(context)) {
      score += 3;
    }
  });

  // 4. ATIVIDADES DE AGÊNCIA (+2 pontos cada)
  const agencyActivities = [
    'campanha', 'criação', 'cliente', 'conta', 'projeto', 'trabalho',
    'comunicação', 'estratégia', 'planejamento', 'mídia', 'digital',
    'branding', 'marca', 'propaganda', 'publicidade', 'marketing'
  ];

  agencyActivities.forEach(activity => {
    if (textLower.includes(activity)) {
      score += 2;
    }
  });

  // 5. CONTEXTOS IRRELEVANTES (-8 pontos cada)
  const irrelevantContexts = [
    // Outras empresas com nomes similares
    'art plan imóveis', 'art plan consultoria', 'art plan eventos',
    'art plan arquitetura', 'artplan investimentos',
    
    // Contextos não publicitários
    'plano de arte', 'planejamento artístico', 'plano artístico',
    'arte planejada', 'planejamento de arte',
    
    // Menções casuais não relacionadas
    'arte em geral', 'plano geral', 'planejamento geral'
  ];

  irrelevantContexts.forEach(context => {
    if (textLower.includes(context)) {
      score -= 8;
    }
  });

  // 6. BONUS POR EXECUTIVOS/PESSOAS DA ARTPLAN (+4 pontos)
  const artplanPeople = [
    'marcello serpa', 'luiz sanches', 'sergio amado', 'ricardo ribeiro',
    'juliana chalita', 'patricia weiss', 'fabio monjardim'
  ];

  artplanPeople.forEach(person => {
    if (textLower.includes(person)) {
      score += 4;
    }
  });

  // 7. BONUS POR CLIENTES CONHECIDOS DA ARTPLAN (+3 pontos)
  const artplanClients = [
    'fiat', 'volkswagen', 'telebras', 'petrobras', 'caixa econômica',
    'banco do brasil', 'correios', 'infraero'
  ];

  artplanClients.forEach(client => {
    if (textLower.includes(client)) {
      score += 3;
    }
  });

  // Threshold: precisa de pelo menos 2 pontos (mais baixo que outras tags 
  // porque Artplan já é bem específica)
  return score > 2;
}

/**
 * Detecta se texto é sobre a agência Artplan
 * com verificação contextual refinada
 */
export function detectarArtplan(text: string, feedName: string = ''): boolean {
  if (!text) return false;

  // Verificação mais específica para Artplan - deve ser uma palavra completa
  const artplanKeywords = [
    'artplan', 'art plan', 'agência artplan'
  ];

  // Verificar se menciona Artplan como palavra completa (não como parte de outra palavra)
  const hasArtplanMention = artplanKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return regex.test(text);
  });

  if (!hasArtplanMention) {
    return false;
  }

  // Se menciona Artplan especificamente, aplica verificação contextual mais permissiva
  return isRelevantArtplanNews(text, feedName);
}

/**
 * Função para debug - mostra scoring detalhado
 */
export function debugArtplanScoring(text: string, feedName: string): { score: number; details: string[] } {
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

  const artplanTerms = ['artplan', 'art plan'];
  artplanTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 6;
      details.push(`+6: Menção direta à Artplan ("${term}")`);
    }
  });

  const agencyActivities = ['campanha', 'cliente', 'projeto', 'trabalho'];
  agencyActivities.forEach(activity => {
    if (textLower.includes(activity)) {
      score += 2;
      details.push(`+2: Atividade de agência ("${activity}")`);
    }
  });

  return { score, details };
}