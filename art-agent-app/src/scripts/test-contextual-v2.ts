import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Versão APRIMORADA da verificação contextual
function isRelevantPublicityNewsV2(title: string, summary: string, feedName: string, agencyName?: string): { 
  isRelevant: boolean; 
  score: number; 
  reasons: string[] 
} {
  const fullText = `${title} ${summary || ''}`.toLowerCase();
  const titleLower = title.toLowerCase();
  
  let score = 0;
  const reasons: string[] = [];

  // 1. VERIFICAÇÃO DE FONTE CONFIÁVEL (+5 pontos) - AUMENTEI O PESO
  const trustedSources = ['propmark', 'meio', 'mensagem', 'adnews', 'mundo do marketing', 'campaign', 'update or die', 'clube de criação'];
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    score += 5;
    reasons.push('Fonte especializada em publicidade');
  }

  // 2. PALAVRAS-CHAVE PUBLICITÁRIAS EXPANDIDAS (+2 pontos cada)
  const publicityKeywords = [
    // Ações principais de agências
    'lança campanha', 'cria campanha', 'desenvolve campanha', 'assina campanha',
    'nova campanha', 'campanha publicitária', 'ação publicitária',
    
    // Relacionamento comercial 
    'novo cliente', 'ganha conta', 'perde conta', 'conquista cliente', 'atende cliente',
    'cliente da', 'conta da', 'briefing', 'pitch', 'concorrência',
    
    // Criatividade e produção
    'direção criativa', 'direção de arte', 'criação publicitária', 'peça publicitária',
    'filme publicitário', 'comercial', 'spot', 'jingle', 'vt', 'anúncio impresso',
    
    // Prêmios e festivais
    'prêmio cannes', 'leão de ouro', 'festival de publicidade', 'prêmio criatividade',
    'grand prix', 'one show', 'clio awards', 'effie', 'wave festival',
    
    // Mercado publicitário
    'holding publicitária', 'grupo publicitário', 'network de agências', 'filial',
    'agência digital', 'agência criativa', 'agência full service',
    
    // Mídia e investimento
    'verba publicitária', 'investimento em mídia', 'planejamento de mídia',
    'compra de mídia', 'veiculação', 'media planning',
    
    // Movimentação de mercado
    'fusão de agências', 'aquisição', 'nova agência', 'parceria estratégica',
    'contratação', 'saída', 'promoção', 'novo cargo'
  ];

  const keywordMatches = publicityKeywords.filter(keyword => fullText.includes(keyword));
  if (keywordMatches.length > 0) {
    score += Math.min(keywordMatches.length * 3, 15); // Aumentei para 3 pontos cada
    reasons.push(`Palavras-chave publicitárias: ${keywordMatches.slice(0, 2).join(', ')}`);
  }

  // 3. CONTEXTO PUBLICITÁRIO GERAL (+1 ponto cada)
  const generalContext = [
    'publicidade', 'propaganda', 'marketing', 'comunicação', 'branding', 'brand',
    'agência', 'agencia', 'campanha', 'anúncio', 'anuncio', 'mídia', 'media',
    'criatividade', 'criativo', 'criativa', 'cliente', 'marca', 'prêmio', 'premio'
  ];

  const generalMatches = generalContext.filter(word => fullText.includes(word));
  if (generalMatches.length > 0) {
    score += Math.min(generalMatches.length, 8); // Max 8 pontos
    reasons.push(`Contexto publicitário geral: ${generalMatches.slice(0, 3).join(', ')}`);
  }

  // 4. AGÊNCIA MENCIONADA (+3 pontos)
  if (agencyName) {
    const agencyLower = agencyName.toLowerCase();
    if (fullText.includes(agencyLower)) {
      score += 3;
      reasons.push('Agência específica mencionada');
      
      // BONUS: Agência no título (+2 pontos extras)
      if (titleLower.includes(agencyLower)) {
        score += 2;
        reasons.push('Agência mencionada no título');
      }
    }
  }

  // 5. DETECÇÃO DE QUALQUER AGÊNCIA CONHECIDA (+2 pontos)
  const knownAgencies = [
    'wmccann', 'vmly&r', 'almapbbdo', 'almap', 'bbdo', 'leo burnett', 'leo',
    'betc', 'havas', 'galeria', 'suno', 'africa', 'ddb', 'ogilvy', 'mediabrands',
    'dm9', 'grey', 'publicis', 'dpz', 'fcb', 'talent', 'lew lara', 'tbwa',
    'wieden kennedy', 'aldeiah', 'propeg', 'dentsu', 'euphoria', 'david',
    'mestiça', 'accenture song', 'wunderman', 'lepub', 'rawi', 'iprospect'
  ];

  const agencyFound = knownAgencies.find(agency => fullText.includes(agency));
  if (agencyFound) {
    score += 2;
    reasons.push(`Agência conhecida encontrada: ${agencyFound}`);
  }

  // 6. PENALIZAÇÃO MAIS SELETIVA POR CONTEXTOS IRRELEVANTES (-6 pontos)
  const strongIrrelevantContexts = [
    'trump', 'biden', 'eleição presidencial', 'congresso americano',
    'pesquisa científica médica', 'estudo médico', 'câncer sem relação',
    'smartphone vale a pena', 'qual celular comprar', 'review de celular',
    'tempestade', 'furacão', 'terremoto', 'foguete espacial', 'nasa'
  ];

  const strongIrrelevantFound = strongIrrelevantContexts.find(context => fullText.includes(context.split(' ')[0]));
  if (strongIrrelevantFound && !generalMatches.length) { // Só penaliza se não tem contexto publicitário
    score -= 6;
    reasons.push(`Contexto fortemente irrelevante: ${strongIrrelevantFound.split(' ')[0]}`);
  }

  // 7. BONUS PARA TÍTULOS QUE FALAM DE EMPRESAS/MARCAS (+1 ponto)
  const brandKeywords = ['empresa', 'marca', 'produto', 'lançamento', 'novidade'];
  if (brandKeywords.some(keyword => titleLower.includes(keyword))) {
    score += 1;
    reasons.push('Título relacionado a empresas/marcas');
  }

  // DECISÃO FINAL: Limiar mais baixo e flexível
  let threshold = 3; // Limiar base
  
  // Se é fonte confiável, limiar mais baixo
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    threshold = 2;
  }
  
  // Se tem muito contexto publicitário, limiar ainda menor
  if (generalMatches.length >= 3) {
    threshold = 1;
  }
  
  const isRelevant = score >= threshold;
  
  return {
    isRelevant,
    score,
    reasons: [...reasons, `Threshold usado: ${threshold}`]
  };
}

async function testImprovedDetection() {
  console.log('🧪 TESTANDO VERIFICAÇÃO CONTEXTUAL APRIMORADA V2\n');
  
  const concorrentes = await prisma.newsArticle.findMany({
    where: {
      tags: { contains: 'Concorrentes' }
    },
    select: {
      title: true,
      summary: true,
      tags: true,
      newsDate: true,
      link: true,
      feed: {
        select: {
          name: true
        }
      }
    },
    orderBy: { newsDate: 'desc' },
    take: 20
  });

  console.log('📊 COMPARAÇÃO: V1 vs V2\n');
  console.log('='.repeat(100));

  const v1Relevant = 2; // Do teste anterior
  let v2Relevant = 0;
  let improvedCases = 0;

  for (let i = 0; i < concorrentes.length; i++) {
    const article = concorrentes[i];
    
    console.log(`\n${i + 1}. ${article.title.substring(0, 70)}...`);
    console.log(`   📰 Feed: ${article.feed.name}`);
    
    // Teste V2
    const v2Result = isRelevantPublicityNewsV2(
      article.title, 
      article.summary || '', 
      article.feed.name
    );

    console.log(`   🧠 V2 CONTEXTUAL: ${v2Result.isRelevant ? '✅ RELEVANTE' : '❌ IRRELEVANTE'}`);
    console.log(`   📊 Score: ${v2Result.score}`);
    console.log(`   💡 Motivos: ${v2Result.reasons.join(' | ')}`);
    
    if (v2Result.isRelevant) {
      v2Relevant++;
    }

    // Verificação manual
    const shouldBeRelevant = manualCheck(article.title, article.summary || '');
    if (shouldBeRelevant && v2Result.isRelevant) {
      console.log(`   ✅ ACERTO CORRETO`);
    } else if (!shouldBeRelevant && !v2Result.isRelevant) {
      console.log(`   🎯 REJEIÇÃO CORRETA`);
      improvedCases++;
    } else if (shouldBeRelevant && !v2Result.isRelevant) {
      console.log(`   ⚠️  PERDEU RELEVANTE`);
    } else {
      console.log(`   ⚠️  FALSO POSITIVO`);
    }

    console.log('   ' + '─'.repeat(80));
  }

  console.log(`\n📈 COMPARAÇÃO DE RESULTADOS:`);
  console.log(`🧪 V1 Contextual: ${v1Relevant}/20 (${(v1Relevant/20*100).toFixed(1)}%)`);
  console.log(`🚀 V2 Aprimorada: ${v2Relevant}/20 (${(v2Relevant/20*100).toFixed(1)}%)`);
  console.log(`🎯 Casos melhorados: ${improvedCases}`);
  
  const efficiency = v2Relevant > 5 && v2Relevant < 15 ? '👍 BALANCEADA' : 
                   v2Relevant <= 5 ? '⚠️ MUITO RESTRITIVA' : '⚠️ MUITO PERMISSIVA';
  console.log(`🎪 Avaliação: ${efficiency}`);
}

function manualCheck(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Definitivamente relevantes
  const definitelyRelevant = [
    'campanha publicitária', 'agência', 'publicidade', 'marketing',
    'novo cliente', 'prêmio cannes', 'festival de publicidade'
  ];
  
  // Definitivamente irrelevantes  
  const definitelyIrrelevant = [
    'trump', 'biden', 'científico', 'médico', 'foguete', 
    'iphone vs', 'smartphone', 'tempestade'
  ];
  
  if (definitelyIrrelevant.some(word => text.includes(word))) {
    return false;
  }
  
  if (definitelyRelevant.some(word => text.includes(word))) {
    return true;
  }
  
  // Casos ambíguos - decidir por contexto geral
  return text.includes('marca') || text.includes('empresa') || text.includes('comunicação');
}

testImprovedDetection()
  .then(() => {
    console.log('\n✅ Teste V2 concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no teste V2:', error);
    process.exit(1);
  });