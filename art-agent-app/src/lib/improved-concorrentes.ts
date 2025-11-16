// VERSÃO FINAL - Correção da detecção 'vt' em textos ingleses

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

// Função auxiliar: verifica se é contexto português
function isPortugueseContext(text: string): boolean {
  const portugueseIndicators = [
    'em ', 'da ', 'do ', 'na ', 'no ', 'para ', 'com ', 'por ',
    'brasil', 'brasileiro', 'brasileira', 'são paulo', 'rio de janeiro'
  ];
  return portugueseIndicators.some(indicator => text.includes(indicator));
}

// Função auxiliar: verifica se agência está em contexto publicitário
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

// Exportar também uma versão melhorada da função detectarConcorrentes original
export function detectarConcorrentesAprimorado(texto: string, feedName: string): Array<{ nome: string; nivel: string; ranking: number; isRelevant: boolean }> {
  // Lista de concorrentes (mantemos a original)
  const CONCORRENTES_ARTPLAN = [
    { nome: 'WMcCann', nivel: 'ALTO', ranking: 1, grupo: 'Holding IPG' },
    { nome: 'VMLY&R', nivel: 'ALTO', ranking: 2, grupo: 'Holding WPP' },
    { nome: 'AlmapBBDO', nivel: 'ALTO', ranking: 3, grupo: 'Holding Omnicom' },
    // ... (lista completa conforme original)
  ];

  const textoLower = texto.toLowerCase();
  const concorrentesEncontrados: Array<{ nome: string; nivel: string; ranking: number; isRelevant: boolean }> = [];
  
  for (const concorrente of CONCORRENTES_ARTPLAN) {
    const nomeLower = concorrente.nome.toLowerCase();
    let encontrado = false;
    
    // Verifica nome principal
    if (textoLower.includes(nomeLower)) {
      encontrado = true;
    }
    
    // Verifica alias se existir
    if (!encontrado && 'alias' in concorrente) {
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
      const relevanceCheck = isRelevantPublicityNews(texto, '', feedName, concorrente.nome);
      
      concorrentesEncontrados.push({
        nome: concorrente.nome,
        nivel: concorrente.nivel,
        ranking: concorrente.ranking,
        isRelevant: relevanceCheck.isRelevant
      });
    }
  }
  
  // Retorna ordenado por ranking, mas com flag de relevância
  return concorrentesEncontrados.sort((a, b) => a.ranking - b.ranking);
}