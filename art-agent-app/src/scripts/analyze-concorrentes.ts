import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeConcorrentes() {
  console.log('🔍 ANALISANDO NOTÍCIAS MARCADAS COMO "CONCORRENTES"...\n');
  
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
  
  console.log(`📊 Total de notícias marcadas como "Concorrentes": ${concorrentes.length}\n`);
  
  // Análise por feed
  const byFeed: Record<string, number> = {};
  concorrentes.forEach(article => {
    byFeed[article.feed.name] = (byFeed[article.feed.name] || 0) + 1;
  });
  
  console.log('📈 DISTRIBUIÇÃO POR FEED:');
  Object.entries(byFeed)
    .sort(([,a], [,b]) => b - a)
    .forEach(([feed, count]) => {
      console.log(`   ${feed}: ${count} notícias`);
    });
  
  console.log('\n' + '='.repeat(100) + '\n');
  console.log('🔍 ANÁLISE DETALHADA DAS PRIMEIRAS 20 NOTÍCIAS:\n');
  
  concorrentes.slice(0, 20).forEach((article, i) => {
    console.log(`${i+1}. TÍTULO: ${article.title}`);
    console.log(`   FEED: ${article.feed.name}`);
    console.log(`   DATA: ${article.publishedDate}`);
    console.log(`   URL: ${article.link}`);
    
    // Extrair tags individuais
    try {
      const tags = JSON.parse(article.tags || '[]');
      console.log(`   TAGS: ${tags.join(', ')}`);
    } catch {
      console.log(`   TAGS RAW: ${article.tags}`);
    }
    
    if(article.summary) {
      console.log(`   RESUMO: ${article.summary.substring(0, 300)}...`);
    }
    console.log('\n' + '='.repeat(100) + '\n');
  });

  // Análise de palavras-chave problemáticas
  console.log('🚨 POSSÍVEIS PROBLEMAS IDENTIFICADOS:\n');
  
  let problemCount = 0;
  const problemas: string[] = [];
  
  concorrentes.forEach(article => {
    const textoCompleto = `${article.title} ${article.summary || ''}`.toLowerCase();
    
    // Verificar se realmente fala de agências/publicidade
    const palavrasRelevantes = [
      'agência', 'agencia', 'publicidade', 'propaganda', 'marketing', 
      'campanha', 'anúncio', 'anuncio', 'criatividade', 'brand', 'marca',
      'comunicação', 'comunicacao', 'mídia', 'media', 'digital'
    ];
    
    const temPalavraRelevante = palavrasRelevantes.some(palavra => 
      textoCompleto.includes(palavra)
    );
    
    if (!temPalavraRelevante) {
      problemCount++;
      problemas.push(`❌ IRRELEVANTE: "${article.title}" (${article.feed.name})`);
    }
  });
  
  console.log(`🔍 Notícias analisadas: ${concorrentes.length}`);
  console.log(`❌ Notícias potencialmente irrelevantes: ${problemCount}`);
  console.log(`✅ Notícias aparentemente relevantes: ${concorrentes.length - problemCount}`);
  console.log(`📊 Taxa de relevância: ${((concorrentes.length - problemCount) / concorrentes.length * 100).toFixed(1)}%\n`);
  
  if (problemCount > 0) {
    console.log('🚨 NOTÍCIAS POTENCIALMENTE IRRELEVANTES:\n');
    problemas.slice(0, 10).forEach(problema => console.log(problema));
    if (problemas.length > 10) {
      console.log(`\n... e mais ${problemas.length - 10} notícias`);
    }
  }
}

analyzeConcorrentes()
  .then(() => {
    console.log('\n✅ Análise concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na análise:', error);
    process.exit(1);
  });