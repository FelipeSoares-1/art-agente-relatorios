import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeTagOverlap() {
  console.log('🔍 Analisando sobreposição de tags...\n');

  // Buscar artigos com múltiplas tags para analisar sobreposições
  const articlesWithMultipleTags = await prisma.newsArticle.findMany({
    where: {
      tags: {
        not: {
          equals: ''
        }
      }
    },
    include: {
      feed: {
        select: {
          name: true
        }
      }
    }
  });

  // Separar tags por artigo
  const tagCombinations: { [key: string]: string[] } = {};
  const tagCounts: { [key: string]: number } = {};
  
  articlesWithMultipleTags.forEach(article => {
    if (!article.tags) return;
    
    const articleTags = article.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    articleTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    if (articleTags.length > 1) {
      const sortedTags = articleTags.sort();
      const key = sortedTags.join(' + ');
      
      if (!tagCombinations[key]) {
        tagCombinations[key] = [];
      }
      tagCombinations[key].push(article.title);
    }
  });

  // Tags problemáticas identificadas anteriormente
  const problematicTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  
  console.log('📊 CONTAGEM TOTAL DE TAGS:');
  Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([tag, count]) => {
      const isProblematic = problematicTags.includes(tag);
      console.log(`${isProblematic ? '⚠️ ' : '✅ '}${tag}: ${count} artigos`);
    });

  console.log('\n🔄 COMBINAÇÕES MAIS COMUNS (artigos com múltiplas tags):');
  Object.entries(tagCombinations)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 20)
    .forEach(([combination, articles]) => {
      console.log(`${combination}: ${articles.length} artigos`);
    });

  // Analisar sobreposição específica das tags problemáticas
  console.log('\n🎯 ANÁLISE DE SOBREPOSIÇÃO DAS TAGS PROBLEMÁTICAS:\n');
  
  for (const problematicTag of problematicTags) {
    console.log(`--- TAG: "${problematicTag}" ---`);
    
    const articlesWithThisTag = await prisma.newsArticle.findMany({
      where: {
        tags: {
          contains: problematicTag
        }
      },
      include: {
        feed: {
          select: {
            name: true
          }
        }
      },
      take: 100 // Amostra para análise
    });

    const overlappingTags: { [key: string]: number } = {};
    let totalWithOtherTags = 0;
    
    articlesWithThisTag.forEach(article => {
      if (!article.tags) return;
      
      const allTags = article.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const otherTags = allTags.filter(tag => tag !== problematicTag);
      
      if (otherTags.length > 0) {
        totalWithOtherTags++;
        otherTags.forEach(tag => {
          overlappingTags[tag] = (overlappingTags[tag] || 0) + 1;
        });
      }
    });

    console.log(`Total de artigos: ${articlesWithThisTag.length}`);
    console.log(`Artigos com outras tags: ${totalWithOtherTags} (${((totalWithOtherTags / articlesWithThisTag.length) * 100).toFixed(1)}%)`);
    console.log(`Artigos APENAS com "${problematicTag}": ${articlesWithThisTag.length - totalWithOtherTags}`);
    
    if (Object.keys(overlappingTags).length > 0) {
      console.log('📋 Tags que aparecem junto com esta:');
      Object.entries(overlappingTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([tag, count]) => {
          const percentage = ((count / articlesWithThisTag.length) * 100).toFixed(1);
          console.log(`  • ${tag}: ${count} (${percentage}%)`);
        });
    }
    
    console.log('📰 Exemplos de títulos:');
    articlesWithThisTag.slice(0, 5).forEach(article => {
      if (!article.tags) return;
      
      const otherTags = article.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== problematicTag);
      console.log(`  • "${article.title}"`);
      console.log(`    Feed: ${article.feed.name}`);
      if (otherTags.length > 0) {
        console.log(`    Outras tags: ${otherTags.join(', ')}`);
      } else {
        console.log(`    ⚠️ APENAS tag "${problematicTag}"`);
      }
    });
    
    console.log('');
  }

  // Análise de tags específicas vs genéricas
  console.log('🎯 RECOMENDAÇÕES BASEADAS NA ANÁLISE:\n');
  
  const specificTags = ['Concorrentes', 'Cases', 'Agências', 'Veículos', 'Campanhas Publicitárias', 'Prêmios de Publicidade'];
  const genericTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  
  console.log('✅ TAGS ESPECÍFICAS E EFICAZES:');
  for (const tag of specificTags) {
    const count = tagCounts[tag] || 0;
    console.log(`  • ${tag}: ${count} artigos`);
  }
  
  console.log('\n⚠️ TAGS GENÉRICAS PROBLEMÁTICAS:');
  for (const tag of genericTags) {
    const count = tagCounts[tag] || 0;
    console.log(`  • ${tag}: ${count} artigos`);
  }

  await prisma.$disconnect();
}

analyzeTagOverlap().catch(console.error);