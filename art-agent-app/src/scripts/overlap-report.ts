import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateOverlapReport() {
  console.log('🎯 RELATÓRIO DE ANÁLISE DE SOBREPOSIÇÃO DE TAGS\n');

  // Buscar todos os artigos para análise
  const allArticles = await prisma.newsArticle.findMany({
    where: {
      tags: {
        not: null
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

  // Contar artigos únicos por tag (sem duplicação de formatação JSON)
  const uniqueTagCounts: { [key: string]: number } = {};
  const combinationAnalysis: { [key: string]: { count: number; examples: string[] } } = {};

  allArticles.forEach(article => {
    if (!article.tags) return;

    // Limpar e normalizar tags
    const cleanTags = article.tags
      .replace(/[\[\]"]/g, '') // Remove colchetes e aspas
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && tag !== '');

    cleanTags.forEach(tag => {
      uniqueTagCounts[tag] = (uniqueTagCounts[tag] || 0) + 1;
    });

    // Analisar combinações
    if (cleanTags.length > 1) {
      const sortedTags = cleanTags.sort();
      const key = sortedTags.join(' + ');
      
      if (!combinationAnalysis[key]) {
        combinationAnalysis[key] = { count: 0, examples: [] };
      }
      combinationAnalysis[key].count++;
      if (combinationAnalysis[key].examples.length < 3) {
        combinationAnalysis[key].examples.push(article.title);
      }
    }
  });

  // Identificar tags problemáticas VS específicas
  const problematicTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  const specificTags = ['Concorrentes', 'Cases', 'Agências', 'Veículos', 'Eventos', 'Novos Clientes', 'Artplan'];

  console.log('📊 CONTAGEM LIMPA DE TAGS (sem duplicação de formato):');
  console.log('='.repeat(60));
  
  const sortedTags = Object.entries(uniqueTagCounts).sort(([,a], [,b]) => b - a);
  
  console.log('🔥 TAGS MAIS UTILIZADAS:');
  sortedTags.slice(0, 15).forEach(([tag, count], index) => {
    const isProblematic = problematicTags.includes(tag);
    const isSpecific = specificTags.includes(tag);
    let emoji = '📝';
    if (isProblematic) emoji = '⚠️';
    if (isSpecific) emoji = '✅';
    
    console.log(`${(index + 1).toString().padStart(2)}. ${emoji} ${tag}: ${count} artigos`);
  });

  console.log('\n🎯 ANÁLISE DETALHADA DE SOBREPOSIÇÃO:\n');
  
  // Análise específica para cada tag problemática
  for (const tag of problematicTags) {
    console.log(`--- TAG PROBLEMÁTICA: "${tag}" ---`);
    const tagCount = uniqueTagCounts[tag] || 0;
    
    if (tagCount === 0) {
      console.log('❌ Esta tag não foi encontrada no formato limpo');
      continue;
    }

    // Encontrar artigos que SÓ têm essa tag
    const articlesOnlyThisTag = allArticles.filter(article => {
      if (!article.tags) return false;
      
      const cleanTags = article.tags
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && tag !== '');
      
      return cleanTags.length === 1 && cleanTags[0] === tag;
    });

    // Encontrar artigos que têm essa tag + outras
    const articlesWithOthers = allArticles.filter(article => {
      if (!article.tags) return false;
      
      const cleanTags = article.tags
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && tag !== '');
      
      return cleanTags.includes(tag) && cleanTags.length > 1;
    });

    console.log(`📈 Total: ${tagCount} artigos`);
    console.log(`🎯 Apenas "${tag}": ${articlesOnlyThisTag.length} artigos`);
    console.log(`🔄 Com outras tags: ${articlesWithOthers.length} artigos`);
    
    const redundancyRate = ((articlesWithOthers.length / tagCount) * 100);
    console.log(`📊 Taxa de sobreposição: ${redundancyRate.toFixed(1)}%`);
    
    if (redundancyRate > 80) {
      console.log('⚠️  ALTA REDUNDÂNCIA - Candidata a eliminação');
    } else if (redundancyRate > 50) {
      console.log('⚡ MÉDIA REDUNDÂNCIA - Considerar refinamento');
    } else {
      console.log('✅ BAIXA REDUNDÂNCIA - Pode ser mantida');
    }

    console.log('');
  }

  console.log('\n🔍 COMBINAÇÕES MAIS COMUNS (top 10):\n');
  Object.entries(combinationAnalysis)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10)
    .forEach(([combination, data], index) => {
      console.log(`${index + 1}. ${combination}`);
      console.log(`   📈 ${data.count} artigos`);
      console.log(`   📰 Exemplos: ${data.examples.slice(0, 2).map(title => `"${title.substring(0, 50)}..."`).join(', ')}`);
      console.log('');
    });

  console.log('\n🎯 RECOMENDAÇÕES ESTRATÉGICAS:\n');
  
  console.log('✂️ TAGS PARA ELIMINAR (alta redundância):');
  problematicTags.forEach(tag => {
    const tagCount = uniqueTagCounts[tag] || 0;
    if (tagCount === 0) return;
    
    const articlesWithOthers = allArticles.filter(article => {
      if (!article.tags) return false;
      const cleanTags = article.tags.replace(/[\[\]"]/g, '').split(',').map(t => t.trim()).filter(t => t);
      return cleanTags.includes(tag) && cleanTags.length > 1;
    });
    
    const redundancyRate = ((articlesWithOthers.length / tagCount) * 100);
    
    if (redundancyRate > 80) {
      console.log(`  ❌ "${tag}" - ${redundancyRate.toFixed(1)}% redundante (${tagCount} artigos)`);
    }
  });

  console.log('\n🔧 TAGS PARA REFINAR (redundância média):');
  problematicTags.forEach(tag => {
    const tagCount = uniqueTagCounts[tag] || 0;
    if (tagCount === 0) return;
    
    const articlesWithOthers = allArticles.filter(article => {
      if (!article.tags) return false;
      const cleanTags = article.tags.replace(/[\[\]"]/g, '').split(',').map(t => t.trim()).filter(t => t);
      return cleanTags.includes(tag) && cleanTags.length > 1;
    });
    
    const redundancyRate = ((articlesWithOthers.length / tagCount) * 100);
    
    if (redundancyRate > 50 && redundancyRate <= 80) {
      console.log(`  ⚡ "${tag}" → tornar mais específica (${redundancyRate.toFixed(1)}% redundante)`);
    }
  });

  console.log('\n✅ TAGS ESPECÍFICAS FUNCIONAIS:');
  specificTags.forEach(tag => {
    const count = uniqueTagCounts[tag] || 0;
    if (count > 0) {
      console.log(`  • ${tag}: ${count} artigos`);
    }
  });

  await prisma.$disconnect();
}

generateOverlapReport().catch(console.error);