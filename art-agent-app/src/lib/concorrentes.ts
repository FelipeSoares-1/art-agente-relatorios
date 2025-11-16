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

function isRelevantPublicityNews(title: string, summary: string, feedName: string): { 
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
    reasons.push('Fonte especializada');
  }

  // 2. PALAVRAS-CHAVE PUBLICITÁRIAS ESPECÍFICAS
  const specificPublicityTerms = [
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
    score += specificMatches.length * 4;
    reasons.push(`Termos específicos: ${specificMatches.length}`);
  }

  // 3. PALAVRAS GERAIS PUBLICITÁRIAS (contextualizadas)
  const generalTerms = [
    'publicidade', 'propaganda', 'marketing', 'comunicação', 'branding', 
    'campanha', 'anúncio', 'anuncio', 'criatividade', 'criativo', 'criativa',
    'cliente', 'marca', 'prêmio', 'premio'
  ];

  // Mídia/media só em contexto português
  if (fullText.includes('mídia') || (fullText.includes('media') && isPortugueseContext(fullText))) {
    generalTerms.push('mídia', 'media');
  }

  // Agência só se não for governamental
  if (fullText.includes('agência') && !fullText.includes('agência brasil') && !fullText.includes('agência nacional')) {
    generalTerms.push('agência', 'agencia');
  }

  const generalMatches = generalTerms.filter(word => fullText.includes(word));
  if (generalMatches.length > 0) {
    score += Math.min(generalMatches.length * 2, 8);
    reasons.push(`Contexto geral: ${generalMatches.length}`);
  }

  // 4. PENALIZAÇÃO PARA CONTEXTOS IRRELEVANTES
  const irrelevantContexts = [
    'trump', 'biden', 'political', 'político',
    'scientific study', 'medical research', 'estudo científico',
    'smartphone review', 'phone comparison', 'qual celular',
    'weather', 'storm', 'tempestade', 'climate',
    'space', 'rocket', 'foguete', 'nasa'
  ];

  const irrelevantFound = irrelevantContexts.find(context => fullText.includes(context));
  if (irrelevantFound) {
    score -= 8;
    reasons.push(`Irrelevante: ${irrelevantFound}`);
  }

  // 5. BONUS COMERCIAL
  const commercialContext = ['lançamento', 'produto', 'empresa', 'negócio', 'mercado'];
  if (commercialContext.some(word => titleLower.includes(word))) {
    score += 1;
    reasons.push('Contexto comercial');
  }

  // DECISÃO FINAL - Thresholds mais restritivos para evitar falsos positivos
  let threshold = 6; // Aumentado de 4 para 6
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    threshold = 4; // Aumentado de 2 para 4
  }
  if (specificMatches.length >= 2) {
    threshold = 5; // Aumentado de 3 para 5
  }
  
  const isRelevant = score >= threshold;
  
  return {
    isRelevant,
    score,
    reasons: [...reasons, `Limiar: ${threshold}`]
  };
}

// Função aprimorada para detectar concorrentes com verificação contextual
export function detectarConcorrentes(texto: string, feedName?: string): Array<{ nome: string; nivel: string; ranking: number }> {
  const textoLower = texto.toLowerCase();
  const concorrentesEncontrados: Array<{ nome: string; nivel: string; ranking: number }> = [];
  
  for (const concorrente of CONCORRENTES_ARTPLAN) {
    const nomeLower = concorrente.nome.toLowerCase();
    let encontrado = false;
    
    // Verifica nome principal
    if (textoLower.includes(nomeLower)) {
      // Verificar se nome composto aparece completo ou tem contexto adequado
      if (nomeLower.includes(' ')) {
        // Nomes compostos devem aparecer completos
        encontrado = true;
      } else {
        // Nomes simples precisam ter contexto publicitário próximo
        encontrado = feedName ? hasPublicityContext(textoLower, nomeLower) : true;
      }
    }
    
    // Verifica alias
    if (!encontrado && (concorrente as any).alias) {
      const aliases = (concorrente as any).alias;
      if (Array.isArray(aliases)) {
        for (const alias of aliases) {
          if (textoLower.includes(alias.toLowerCase())) {
            encontrado = true;
            break;
          }
        }
      }
    }
    
    if (encontrado) {
      // APLICAR VERIFICAÇÃO CONTEXTUAL
      if (feedName) {
        const relevanceCheck = isRelevantPublicityNews(texto, '', feedName);
        
        // Só adiciona se for contextualmente relevante
        if (relevanceCheck.isRelevant) {
          if (!concorrentesEncontrados.find(c => c.nome === concorrente.nome)) {
            concorrentesEncontrados.push({
              nome: concorrente.nome,
              nivel: concorrente.nivel,
              ranking: concorrente.ranking
            });
          }
        }
      } else {
        // Fallback para compatibilidade - sem feedName usa lógica antiga
        if (!concorrentesEncontrados.find(c => c.nome === concorrente.nome)) {
          concorrentesEncontrados.push({
            nome: concorrente.nome,
            nivel: concorrente.nivel,
            ranking: concorrente.ranking
          });
        }
      }
    }
  }
  
  // Ordenar por ranking (menor é mais importante)
  return concorrentesEncontrados.sort((a, b) => a.ranking - b.ranking);
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

// Função para gerar relatório de concorrentes (atualizada para usar verificação contextual)
export function gerarRelatorioConcorrentes(noticias: Array<{ title: string; summary?: string | null; feedName?: string }>) {
  const mencoesPorConcorrente: Record<string, { count: number; nivel: string; ranking: number }> = {};
  
  for (const noticia of noticias) {
    const texto = `${noticia.title} ${noticia.summary || ''}`;
    const feedName = noticia.feedName || 'Unknown';
    const concorrentes = detectarConcorrentes(texto, feedName);
    
    for (const concorrente of concorrentes) {
      if (!mencoesPorConcorrente[concorrente.nome]) {
        mencoesPorConcorrente[concorrente.nome] = {
          count: 0,
          nivel: concorrente.nivel,
          ranking: concorrente.ranking
        };
      }
      mencoesPorConcorrente[concorrente.nome].count++;
    }
  }
  
  // Converter para array e ordenar por número de menções
  const relatorio = Object.entries(mencoesPorConcorrente)
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.count - a.count);
  
  return relatorio;
}
