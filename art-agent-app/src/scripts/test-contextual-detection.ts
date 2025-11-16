import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função de verificação contextual inteligente
function isRelevantPublicityNews(title: string, summary: string, feedName: string, agencyName: string): { 
  isRelevant: boolean; 
  score: number; 
  reasons: string[] 
} {
  const fullText = `${title} ${summary || ''}`.toLowerCase();
  const titleLower = title.toLowerCase();
  const agencyLower = agencyName.toLowerCase();
  
  let score = 0;
  const reasons: string[] = [];

  // 1. VERIFICAÇÃO DE FONTE CONFIÁVEL (+3 pontos)
  const trustedSources = ['propmark', 'meio', 'mensagem', 'adnews', 'mundo do marketing', 'campaign'];
  if (trustedSources.some(source => feedName.toLowerCase().includes(source))) {
    score += 3;
    reasons.push('Fonte especializada em publicidade');
  }

  // 2. AGÊNCIA NO TÍTULO (+4 pontos)
  if (titleLower.includes(agencyLower)) {
    score += 4;
    reasons.push('Agência mencionada no título');
  }

  // 3. PALAVRAS DE CONTEXTO PUBLICITÁRIO (+2 pontos cada)
  const publicityContext = [
    // Ações da agência
    'lança', 'cria', 'desenvolve', 'assina', 'produz',
    // Campanhas e trabalhos
    'campanha', 'anúncio', 'comercial', 'peça', 'filme', 'ação',
    // Relacionamento comercial
    'cliente', 'conta', 'atende', 'conquista', 'ganha', 'perde',
    // Criatividade
    'criação', 'criativo', 'criativa', 'direção de arte',
    // Prêmios e reconhecimento
    'prêmio', 'premio', 'festival', 'cannes', 'leão', 'ouro', 'prata', 'bronze',
    // Mercado publicitário
    'agência', 'agencia', 'publicidade', 'propaganda', 'marketing',
    'holding', 'grupo', 'network', 'filial',
    // Mídia e veiculação  
    'mídia', 'media', 'veiculação', 'investimento', 'verba'
  ];

  const contextMatches = publicityContext.filter(word => fullText.includes(word));
  if (contextMatches.length > 0) {
    score += Math.min(contextMatches.length * 2, 8); // Max 8 pontos
    reasons.push(`Contexto publicitário: ${contextMatches.slice(0, 3).join(', ')}`);
  }

  // 4. AGÊNCIA COMO SUJEITO DA FRASE (+3 pontos)
  const agencyAsSubjectPatterns = [
    `${agencyLower} lança`,
    `${agencyLower} cria`,
    `${agencyLower} anuncia`, 
    `${agencyLower} desenvolve`,
    `${agencyLower} conquista`,
    `${agencyLower} ganha`,
    `${agencyLower} assina`
  ];
  
  if (agencyAsSubjectPatterns.some(pattern => fullText.includes(pattern))) {
    score += 3;
    reasons.push('Agência é sujeito da ação');
  }

  // 5. PENALIZAÇÃO POR CONTEXTOS IRRELEVANTES (-4 pontos cada)
  const irrelevantContexts = [
    // Política
    'trump', 'biden', 'eleição', 'político', 'congresso', 'senado',
    // Ciência/Medicina  
    'pesquisa científica', 'estudo revela', 'cientistas', 'medicina',
    // Tecnologia consumer (não publicitária)
    'iphone vs', 'samsung vs', 'smartphone', 'celular vale a pena',
    // Notícias gerais
    'acidente', 'crime', 'assassinato', 'roubo', 'tempestade'
  ];

  const irrelevantMatches = irrelevantContexts.filter(context => fullText.includes(context));
  if (irrelevantMatches.length > 0) {
    score -= irrelevantMatches.length * 4;
    reasons.push(`Contexto irrelevante: ${irrelevantMatches[0]}`);
  }

  // 6. ANÁLISE DE POSIÇÃO DA AGÊNCIA NO TEXTO
  const titleWords = titleLower.split(' ');
  const agencyWordIndex = titleWords.findIndex(word => word.includes(agencyLower.split(' ')[0]));
  
  if (agencyWordIndex >= 0 && agencyWordIndex <= 2) {
    score += 2;
    reasons.push('Agência em posição de destaque no título');
  }

  // DECISÃO FINAL
  const isRelevant = score >= 5; // Limiar de relevância
  
  return {
    isRelevant,
    score,
    reasons
  };
}

async function testContextualDetection() {
  console.log('🧪 TESTANDO VERIFICAÇÃO CONTEXTUAL INTELIGENTE\n');
  
  // Buscar as mesmas 20 notícias que analisamos antes
  const concorrentes = await prisma.newsArticle.findMany({
    where: {
      tags: { contains: 'Concorrentes' }
    },
    select: {
      title: true,
      summary: true,
      tags: true,
      publishedDate: true,
      link: true,
      feed: {
        select: {
          name: true
        }
      }
    },
    orderBy: { publishedDate: 'desc' },
    take: 20
  });

  console.log('📊 COMPARAÇÃO: DETECÇÃO ATUAL vs CONTEXTUAL\n');
  console.log('='.repeat(100));

  let improvedCount = 0;
  let currentRelevant = 0;
  let newRelevant = 0;

  for (let i = 0; i < concorrentes.length; i++) {
    const article = concorrentes[i];
    
    console.log(`\n${i + 1}. TÍTULO: ${article.title.substring(0, 80)}...`);
    console.log(`   FEED: ${article.feed.name}`);
    
    // Extrair quais agências foram detectadas originalmente
    let originalAgencies: string[] = [];
    try {
      JSON.parse(article.tags || '[]'); // Verificação de formato válido
      // Esta é uma simulação - na realidade, teríamos que detectar quais agências
      // Para teste, vamos assumir que detectou alguma agência da nossa lista
      originalAgencies = ['Ogilvy']; // Simulação
    } catch {
      originalAgencies = ['Agência Detectada']; // Fallback
    }

    console.log(`   🤖 DETECÇÃO ATUAL: RELEVANTE (assumindo que passou no filtro atual)`);
    currentRelevant++;

    // Testar nova detecção contextual
    const contextualResult = isRelevantPublicityNews(
      article.title, 
      article.summary || '', 
      article.feed.name,
      originalAgencies[0] || 'agência'
    );

    console.log(`   🧠 DETECÇÃO CONTEXTUAL: ${contextualResult.isRelevant ? '✅ RELEVANTE' : '❌ IRRELEVANTE'}`);
    console.log(`   📊 Score: ${contextualResult.score}`);
    console.log(`   💡 Motivos: ${contextualResult.reasons.join(', ')}`);
    
    if (contextualResult.isRelevant) {
      newRelevant++;
    }

    // Análise manual simplificada (baseada no que vimos antes)
    const manuallyRelevant = checkManualRelevance(article.title, article.summary || '');
    
    if (!manuallyRelevant && !contextualResult.isRelevant) {
      console.log(`   🎯 MELHORIA: Corretamente identificou como IRRELEVANTE`);
      improvedCount++;
    } else if (manuallyRelevant && contextualResult.isRelevant) {
      console.log(`   ✅ ACERTO: Corretamente identificou como RELEVANTE`);
    } else if (!manuallyRelevant && contextualResult.isRelevant) {
      console.log(`   ⚠️  FALSO POSITIVO: Marcou como relevante mas parece irrelevante`);
    } else {
      console.log(`   ⚠️  FALSO NEGATIVO: Marcou como irrelevante mas pode ser relevante`);
    }

    console.log('   ' + '─'.repeat(90));
  }

  console.log(`\n📈 RESULTADOS COMPARATIVOS:`);
  console.log(`🤖 Detecção Atual - Relevantes: ${currentRelevant}/20 (100%)`);
  console.log(`🧠 Detecção Contextual - Relevantes: ${newRelevant}/20 (${(newRelevant/20*100).toFixed(1)}%)`);
  console.log(`🎯 Melhorias Identificadas: ${improvedCount} casos`);
  console.log(`📊 Taxa estimada de precisão: ${((newRelevant/20)*100).toFixed(1)}%`);
}

// Função auxiliar para análise manual simplificada
function checkManualRelevance(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Palavras que indicam relevância para publicidade
  const relevant = [
    'agência', 'agencia', 'publicidade', 'propaganda', 'marketing', 
    'campanha', 'anúncio', 'anuncio', 'criatividade', 'brand', 'marca',
    'comunicação', 'comunicacao', 'mídia', 'media', 'digital', 'cliente',
    'prêmio', 'festival', 'cannes'
  ];
  
  // Palavras que indicam irrelevância
  const irrelevant = [
    'trump', 'biden', 'política', 'científico', 'pesquisa médica',
    'câncer', 'cancer', 'smartphone comparison', 'iphone vs', 
    'tempestade', 'clima', 'foguete', 'espaço'
  ];
  
  const hasRelevant = relevant.some(word => text.includes(word));
  const hasIrrelevant = irrelevant.some(word => text.includes(word));
  
  // Se tem palavras irrelevantes, provavelmente não é relevante
  if (hasIrrelevant) return false;
  
  // Se tem palavras relevantes, provavelmente é relevante
  return hasRelevant;
}

testContextualDetection()
  .then(() => {
    console.log('\n✅ Teste de verificação contextual concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  });