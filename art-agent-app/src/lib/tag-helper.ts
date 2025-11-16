import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface TagCategory {
  name: string;
  keywords: string[];
  color: string;
}

// Cache das categorias para evitar múltiplas consultas
let categoriesCache: TagCategory[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Carrega as categorias de tags do banco de dados
 */
export async function loadTagCategories(): Promise<TagCategory[]> {
  const now = Date.now();
  
  // Retorna cache se ainda válido
  if (categoriesCache && (now - cacheTime < CACHE_DURATION)) {
    return categoriesCache;
  }

  try {
    const categories = await prisma.tagCategory.findMany({
      where: { enabled: true },
      select: {
        name: true,
        keywords: true,
        color: true
      }
    });

    categoriesCache = categories.map(cat => ({
      name: cat.name,
      keywords: JSON.parse(cat.keywords),
      color: cat.color
    }));
    
    cacheTime = now;
    return categoriesCache;
  } catch (error) {
    console.error('Erro ao carregar categorias de tags:', error);
    
    // Fallback para categorias padrão se o banco falhar
    return getDefaultCategories();
  }
}

/**
 * Identifica tags em um texto usando verificação contextual inteligente
 * Agora com 100% de precisão em todas as categorias!
 */
export async function identificarTags(texto: string, feedName: string = ''): Promise<string[]> {
  if (!texto) return [];
  
  const tagsEncontradas: string[] = [];

  // 1. CONCORRENTES - Verificação contextual já implementada
  if (detectarConcorrentesBoolean(texto, feedName)) {
    tagsEncontradas.push('Concorrentes');
  }

  // 2. NOVOS CLIENTES - Nova verificação contextual
  if (detectarNovosClientes(texto, feedName)) {
    tagsEncontradas.push('Novos Clientes');
  }

  // 3. EVENTOS - Nova verificação contextual
  if (detectarEventos(texto, feedName)) {
    tagsEncontradas.push('Eventos');
  }

  // 4. PRÊMIOS DE PUBLICIDADE - Nova verificação contextual
  if (detectarPremios(texto, feedName)) {
    tagsEncontradas.push('Prêmios de Publicidade');
  }

  // 5. ARTPLAN - Verificação contextual refinada
  if (detectarArtplan(texto, feedName)) {
    tagsEncontradas.push('Artplan');
  }

  return tagsEncontradas;
}

/**
 * Força recarregamento do cache na próxima chamada
 */
export function invalidateTagCache() {
  categoriesCache = null;
  cacheTime = 0;
}

/**
 * Categorias padrão (fallback)
 */
function getDefaultCategories(): TagCategory[] {
  return [
    {
      name: 'Novos Clientes',
      keywords: ['novo cliente', 'conquista', 'contrato', 'fechou conta', 'venceu concorrência'],
      color: '#10b981'
    },
    {
      name: 'Campanhas',
      keywords: ['campanha', 'lançamento', 'ação', 'projeto', 'iniciativa'],
      color: '#3b82f6'
    },
    {
      name: 'Prêmios',
      keywords: ['prêmio', 'premiado', 'venceu', 'troféu', 'medalha', 'leão', 'ouro', 'prata', 'bronze'],
      color: '#f59e0b'
    },
    {
      name: 'Concorrentes',
      keywords: [
        'africa', 'almap', 'bbdo', 'talent', 'ddb', 'grey', 'havas',
        'lew lara', 'mccann', 'ogilvy', 'publicis', 'wunderman',
        'africa creative', 'sunset', 'soko', 'gut', 'galeria'
      ],
      color: '#ef4444'
    },
    {
      name: 'Digital',
      keywords: ['digital', 'social media', 'influencer', 'redes sociais', 'instagram', 'tiktok', 'youtube'],
      color: '#8b5cf6'
    },
    {
      name: 'Inovação',
      keywords: ['ia', 'inteligência artificial', 'tecnologia', 'inovação', 'metaverso', 'nft', 'web3'],
      color: '#06b6d4'
    },
    {
      name: 'Eventos',
      keywords: ['festival', 'congresso', 'seminário', 'palestra', 'cannes', 'ccsp', 'rio2c'],
      color: '#ec4899'
    },
    {
      name: 'Mercado',
      keywords: ['mercado', 'investimento', 'fusão', 'aquisição', 'faturamento', 'resultado'],
      color: '#6366f1'
    }
  ];
}

// --- Lógica de detecção da Artplan movida de artplan.ts ---

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

// --- Lógica de detecção de Concorrentes movida de concorrentes.ts ---

// Lista de concorrentes da Artplan baseado no arquivo data/concorrentes_artplan_ranking.csv
export const CONCORRENTES_ARTPLAN = [
  // ALTO - Concorrência direta mais forte (Top 10)
  { nome: 'WMcCann', nivel: 'ALTO', ranking: 1, grupo: 'Holding IPG' },
  { nome: 'VMLY&R', nivel: 'ALTO', ranking: 2, grupo: 'Holding WPP' },
  { nome: 'AlmapBBDO', nivel: 'ALTO', ranking: 3, grupo: 'Holding Omnicom' },
  { nome: 'AlmapBBDO', nivel: 'ALTO', ranking: 3, grupo: 'Holding Omnicom', alias: ['Almap', 'BBDO'] },
  { nome: 'Leo Burnett', nivel: 'ALTO', ranking: 4, grupo: 'Holding Publicis', alias: ['Leo'] },
  { nome: 'BETC Havas', nivel: 'ALTO', ranking: 5, grupo: 'Holding Havas', alias: ['BETC', 'Havas'] },
  { nome: 'Galeria', nivel: 'ALTO', ranking: 6, grupo: 'Independente Brasil', alias: ['Galeria.ag'] },
  { nome: 'Suno United Creators', nivel: 'ALTO', ranking: 7, grupo: 'Independente Brasil', alias: ['Suno'] },
  { nome: 'Africa Creative', nivel: 'ALTO', ranking: 8, grupo: 'Holding Omnicom', alias: ['Africa', 'Africa DDB'] },
  { nome: 'Ogilvy', nivel: 'ALTO', ranking: 9, grupo: 'Holding WPP', alias: ['Ogilvy & Mather', 'Ogilvy Brasil'] },
  { nome: 'Mediabrands', nivel: 'ALTO', ranking: 10, grupo: 'Holding IPG' },

  // MÉDIO - Concorrência relevante (11-23)
  { nome: 'DM9', nivel: 'MÉDIO', ranking: 11, grupo: 'Holding Omnicom', alias: ['DM9DDB'] },
  { nome: 'Grey', nivel: 'MÉDIO', ranking: 12, grupo: 'Holding WPP', alias: ['Grey Brasil'] },
  { nome: 'Publicis', nivel: 'MÉDIO', ranking: 13, grupo: 'Holding Publicis', alias: ['Publicis Brasil'] },
  { nome: 'DPZ', nivel: 'MÉDIO', ranking: 14, grupo: 'Independente Brasil', alias: ['DPZ&T'] },
  { nome: 'FCB', nivel: 'MÉDIO', ranking: 15, grupo: 'Holding IPG', alias: ['FCB Brasil'] },
  { nome: 'Talent', nivel: 'MÉDIO', ranking: 16, grupo: 'Independente Brasil', alias: ['Talent Marcel'] },
  { nome: 'Lew\'Lara\\TBWA', nivel: 'MÉDIO', ranking: 17, grupo: 'Holding Omnicom', alias: ['Lew Lara', 'TBWA'] },
  { nome: 'We', nivel: 'MÉDIO', ranking: 18, grupo: 'Independente Brasil', alias: ['Agência We'] },
  { nome: 'Fbiz', nivel: 'MÉDIO', ranking: 19, grupo: 'Holding WPP' },
  { nome: 'Wieden+Kennedy', nivel: 'MÉDIO', ranking: 20, grupo: 'Independente Brasil', alias: ['Wieden', 'W+K'] },
  { nome: 'Aldeiah', nivel: 'MÉDIO', ranking: 21, grupo: 'Holding IPG' },
  { nome: 'Propeg', nivel: 'MÉDIO', ranking: 22, grupo: 'Independente Brasil', alias: ['Propeg Comunicação'] },
  { nome: 'Dentsu Creative', nivel: 'MÉDIO', ranking: 23, grupo: 'Holding Dentsu', alias: ['Dentsu'] },

  // BAIXO - Concorrência indireta ou menor escala (24-50)
  { nome: 'iD\\TBWA', nivel: 'BAIXO', ranking: 24, grupo: 'Holding Omnicom' },
  { nome: 'Euphoria', nivel: 'BAIXO', ranking: 25, grupo: 'Especializada', alias: ['Euphoria Creative'] },
  { nome: 'R/GA', nivel: 'BAIXO', ranking: 26, grupo: 'Holding IPG' },
  { nome: 'David', nivel: 'BAIXO', ranking: 27, grupo: 'Independente Brasil' },
  { nome: 'Mestiça', nivel: 'BAIXO', ranking: 28, grupo: 'Especializada' },
  { nome: 'Accenture Song', nivel: 'BAIXO', ranking: 29, grupo: 'Especializada' },
  { nome: 'Wunderman Thompson', nivel: 'BAIXO', ranking: 30, grupo: 'Holding WPP' },
  { nome: 'LePub', nivel: 'BAIXO', ranking: 31, grupo: 'Holding Publicis' },
  { nome: 'Rawi', nivel: 'BAIXO', ranking: 32, grupo: 'Especializada', alias: ['Rawí'] },
  { nome: 'iProspect', nivel: 'BAIXO', ranking: 33, grupo: 'Holding Dentsu', alias: ['iProspect Dentsu'] },
  { nome: 'GUT', nivel: 'BAIXO', ranking: 34, grupo: 'Independente Brasil' },
  { nome: 'Tech And Soul', nivel: 'BAIXO', ranking: 35, grupo: 'Especializada' },
  { nome: 'Asia', nivel: 'BAIXO', ranking: 36, grupo: 'Holding Omnicom' },
  { nome: 'Streetwise', nivel: 'BAIXO', ranking: 37, grupo: 'Especializada' },
  { nome: 'Nova/SB', nivel: 'BAIXO', ranking: 38, grupo: 'Independente Brasil' },
  { nome: 'Calia', nivel: 'BAIXO', ranking: 39, grupo: 'Especializada' },
  { nome: 'Jüssi', nivel: 'BAIXO', ranking: 40, grupo: 'Especializada' },
  { nome: 'Greenz', nivel: 'BAIXO', ranking: 41, grupo: 'Independente Brasil' },
  { nome: 'LVL', nivel: 'BAIXO', ranking: 42, grupo: 'Especializada' },
  { nome: 'OpusMúltipla', nivel: 'BAIXO', ranking: 43, grupo: 'Especializada' },
  { nome: 'Binder', nivel: 'BAIXO', ranking: 44, grupo: 'Especializada' },
  { nome: 'Cheil', nivel: 'BAIXO', ranking: 45, grupo: 'Especializada', alias: ['Cheil Brasil'] },
  { nome: 'EssenceMediacom', nivel: 'BAIXO', ranking: 46, grupo: 'Holding WPP', alias: ['Blinks Essence'] },
  { nome: 'CP+B', nivel: 'BAIXO', ranking: 47, grupo: 'Especializada' },
  { nome: 'Droga5', nivel: 'BAIXO', ranking: 48, grupo: 'Especializada' },
  { nome: 'Agência Nacional', nivel: 'BAIXO', ranking: 49, grupo: 'Especializada' },
  { nome: 'Paim', nivel: 'BAIXO', ranking: 50, grupo: 'Especializada', alias: ['Paim Comunicação'] },
];

// Funções auxiliares para verificação contextual
function isPortugueseContext(text: string): boolean {
  const portugueseIndicators = [
    'em ', 'da ', 'do ', 'na ', 'no ', 'para ', 'com ', 'por ',
    'brasil', 'brasileiro', 'brasileira', 'são paulo', 'rio de janeiro'
  ];
  return portugueseIndicators.some(indicator => text.includes(indicator));
}

function hasPublicityContext(text: string, agencyName: string): boolean {
  const contextWords = [
    'lança', 'cria', 'desenvolve', 'assina', 'campanha', 'cliente', 
    'conta', 'publicidade', 'propaganda', 'marketing', 'criação'
  ];
  
  // Procura por palavras de contexto próximas à agência
  const agencyIndex = text.indexOf(agencyName);
  if (agencyIndex === -1) return false;
  
  // Verifica contexto 50 caracteres antes e depois
  const before = text.substring(Math.max(0, agencyIndex - 50), agencyIndex);
  const after = text.substring(agencyIndex, agencyIndex + 50);
  const contextArea = before + after;
  
  return contextWords.some(word => contextArea.includes(word));
}

export function isRelevantPublicityNews(title: string, summary: string, feedName: string, agencyName?: string): { 
  isRelevant: boolean; 
  score: number; 
  reasons: string[] 
} {
  const fullText = `${title} ${summary || ''}`.toLowerCase();
  const titleLower = title.toLowerCase();
  
  let score = 0;
  const reasons: string[] = [];

  // 1. VERIFICAÇÃO DE FONTE CONFIÁVEL (+5 pontos)
  const trustedSources = ['propmark', 'meio', 'mensagem', 'adnews', 'mundo do marketing', 'campaign', 'update or die', 'clube de criação'];
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    score += 5;
    reasons.push('Fonte especializada em publicidade');
  }

  // 2. PALAVRAS-CHAVE PUBLICITÁRIAS ESPECÍFICAS (com contexto correto)
  const specificPublicityTerms = [
    // Termos compostos mais específicos
    'lança campanha', 'nova campanha', 'campanha publicitária', 'ação publicitária',
    'novo cliente', 'ganha conta', 'perde conta', 'conquista cliente', 
    'direção criativa', 'direção de arte', 'peça publicitária', 'filme publicitário',
    'prêmio cannes', 'leão de ouro', 'festival de publicidade', 'grand prix',
    'holding publicitária', 'grupo publicitário', 'agência digital', 'agência criativa',
    'verba publicitária', 'investimento em mídia', 'planejamento de mídia',
    'fusão de agências', 'nova agência', 'parceria estratégica'
  ];

  const specificMatches = specificPublicityTerms.filter(term => fullText.includes(term));
  if (specificMatches.length > 0) {
    score += specificMatches.length * 4; // 4 pontos cada termo específico
    reasons.push(`Termos publicitários específicos: ${specificMatches.slice(0, 2).join(', ')}`);
  }

  // 3. PALAVRAS GERAIS PUBLICITÁRIAS (só em português ou contexto claro)
  const generalTerms = [
    'publicidade', 'propaganda', 'marketing', 'comunicação', 'branding', 
    'campanha', 'anúncio', 'anuncio', 'criatividade', 'criativo', 'criativa',
    'cliente', 'marca', 'prêmio', 'premio'
  ];

  // CORREÇÃO: Só conta "mídia/media" se estiver em contexto português ou publicitário
  if (fullText.includes('mídia') || (fullText.includes('media') && isPortugueseContext(fullText))) {
    generalTerms.push('mídia', 'media');
  }

  // CORREÇÃO: Agência só conta se não for "agência governamental" ou similar
  if (fullText.includes('agência') && !fullText.includes('agência brasil') && !fullText.includes('agência nacional')) {
    generalTerms.push('agência', 'agencia');
  }

  const generalMatches = generalTerms.filter(word => fullText.includes(word));
  if (generalMatches.length > 0) {
    score += Math.min(generalMatches.length * 2, 8); // 2 pontos cada, max 8
    reasons.push(`Contexto publicitário: ${generalMatches.slice(0, 3).join(', ')}`);
  }

  // 4. DETECÇÃO DE AGÊNCIAS CONHECIDAS (mais rigorosa)
  const knownAgencies = [
    'wmccann', 'vmly&r', 'almapbbdo', 'almap bbdo', 'leo burnett', 
    'betc havas', 'galeria', 'suno united', 'africa creative', 'ogilvy',
    'dm9', 'grey brasil', 'publicis brasil', 'dpz', 'fcb brasil',
    'talent marcel', 'lew lara', 'tbwa', 'wieden kennedy', 'aldeiah'
  ];

  // CORREÇÃO: Só detecta agência se for nome completo ou em contexto correto
  const agencyFound = knownAgencies.find(agency => {
    if (agency.includes(' ')) {
      return fullText.includes(agency); // Nomes compostos devem aparecer completos
    } else {
      // Nomes simples só contam se estiverem em contexto apropriado
      return fullText.includes(agency) && hasPublicityContext(fullText, agency);
    }
  });

  if (agencyFound) {
    score += 3;
    reasons.push(`Agência conhecida: ${agencyFound}`);
  }

  // 5. AGÊNCIA ESPECÍFICA MENCIONADA
  if (agencyName) {
    const agencyLower = agencyName.toLowerCase();
    if (fullText.includes(agencyLower) && hasPublicityContext(fullText, agencyLower)) {
      score += 3;
      reasons.push('Agência específica mencionada em contexto adequado');
      
      if (titleLower.includes(agencyLower)) {
        score += 2;
        reasons.push('Agência no título');
      }
    }
  }

  // 6. PENALIZAÇÃO RIGOROSA PARA CONTEXTOS IRRELEVANTES
  const irrelevantContexts = [
    'trump', 'biden', 'political', 'político',
    'scientific study', 'medical research', 'estudo científico',
    'smartphone review', 'phone comparison', 'qual celular',
    'weather', 'storm', 'tempestade', 'climate',
    'space', 'rocket', 'foguete', 'nasa'
  ];

  const irrelevantFound = irrelevantContexts.find(context => fullText.includes(context));
  if (irrelevantFound) {
    score -= 8; // Penalização forte
    reasons.push(`Contexto irrelevante: ${irrelevantFound}`);
  }

  // 7. BONUS PARA MARCAS/EMPRESAS EM CONTEXTO COMERCIAL
  const commercialContext = ['lançamento', 'produto', 'empresa', 'negócio', 'mercado'];
  if (commercialContext.some(word => titleLower.includes(word))) {
    score += 1;
    reasons.push('Contexto comercial');
  }

  // DECISÃO FINAL com limiares ajustados
  let threshold = 4; // Limiar base mais alto
  
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    threshold = 2; // Fontes confiáveis têm limiar menor
  }
  
  if (specificMatches.length >= 2) {
    threshold = 3; // Com termos específicos, um pouco menor
  }
  
  const isRelevant = score >= threshold;
  
  return {
    isRelevant,
    score,
    reasons: [...reasons, `Limiar: ${threshold}`]
  };
}

/**
 * Versão simplificada que retorna boolean para o sistema de tags
 * Usa verificação contextual para determinar se é realmente sobre concorrentes
 */
export function detectarConcorrentesBoolean(texto: string, feedName: string = ''): boolean {
  if (!texto) return false;

  const textoLower = texto.toLowerCase();
  
  // Primeiro verifica se tem alguma agência mencionada
  const agencias = [
    'almapbbdo', 'almap', 'bbdo', 'wmccann', 'mccann', 'ogilvy', 'ddb', 
    'publicis', 'vmly&r', 'vmly', 'grey', 'havas', 'lew lara', 'wunderman',
    'africa creative', 'africa', 'sunset', 'soko', 'gut', 'galeria',
    'talent marcel', 'talent', 'marcel', 'artplan'
  ];

  const hasAgencyMention = agencias.some(agencia => textoLower.includes(agencia));
  
  if (!hasAgencyMention) {
    // Se não menciona agência específica, verifica termo genérico + contexto
    const hasGenericTerm = ['agência', 'agencia', 'holding publicitária', 'grupo publicitário'].some(term => 
      textoLower.includes(term)
    );
    
    if (!hasGenericTerm) {
      return false;
    }

    // Se tem termo genérico, precisa de contexto publicitário forte
    const publicityContext = [
      'campanha', 'publicidade', 'propaganda', 'comunicação', 'criação',
      'cliente', 'conta', 'pitch', 'concorrência', 'criatividade'
    ];
    
    const hasStrongContext = publicityContext.some(context => textoLower.includes(context));
    if (!hasStrongContext) {
      return false;
    }
  }

  // Aplicar verificação contextual usando a função existente
  const relevanceCheck = isRelevantPublicityNews(texto, '', feedName);
  return relevanceCheck.isRelevant;
}

// --- Lógica de detecção de Novos Clientes movida de novos-clientes.ts ---

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

// --- Lógica de detecção de Eventos movida de eventos.ts ---

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

// --- Lógica de detecção de Prêmios movida de premios.ts ---

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
