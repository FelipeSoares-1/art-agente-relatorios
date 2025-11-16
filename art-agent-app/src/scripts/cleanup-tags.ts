import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupProblematicTags() {
  console.log('🧹 LIMPEZA DE TAGS PROBLEMÁTICAS\n');

  const problematicTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  
  console.log('❌ Tags a serem removidas:');
  problematicTags.forEach(tag => console.log(`  • ${tag}`));
  console.log('');

  // Buscar todos os artigos que têm tags
  const articlesWithTags = await prisma.newsArticle.findMany({
    where: {
      tags: {
        not: null
      }
    },
    select: {
      id: true,
      title: true,
      tags: true
    }
  });

  console.log(`📊 Total de artigos com tags: ${articlesWithTags.length}`);
  
  let updatedCount = 0;
  let removedTagsCount = 0;
  
  for (const article of articlesWithTags) {
    if (!article.tags) continue;

    // Limpar e processar tags
    const originalTags = article.tags
      .replace(/[\[\]"]/g, '') // Remove colchetes e aspas
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && tag !== '');

    // Filtrar tags problemáticas
    const filteredTags = originalTags.filter(tag => !problematicTags.includes(tag));
    
    // Contar tags removidas
    const removedFromThisArticle = originalTags.length - filteredTags.length;
    removedTagsCount += removedFromThisArticle;

    // Se houve mudança, atualizar
    if (removedFromThisArticle > 0) {
      const newTagsString = filteredTags.length > 0 ? filteredTags.join(', ') : '';
      
      await prisma.newsArticle.update({
        where: { id: article.id },
        data: { tags: newTagsString || null }
      });

      updatedCount++;
      
      // Log detalhado para os primeiros casos
      if (updatedCount <= 10) {
        console.log(`\n📝 Artigo ${updatedCount}:`);
        console.log(`   Título: "${article.title.substring(0, 60)}..."`);
        console.log(`   Tags originais: [${originalTags.join(', ')}]`);
        console.log(`   Tags mantidas: [${filteredTags.join(', ')}]`);
        console.log(`   Removidas: ${removedFromThisArticle} tag(s)`);
      }
    }

    // Log de progresso a cada 1000 artigos
    if (updatedCount > 0 && updatedCount % 1000 === 0) {
      console.log(`\n⏳ Progresso: ${updatedCount} artigos processados...`);
    }
  }

  console.log('\n✅ LIMPEZA CONCLUÍDA!\n');
  console.log(`📊 Estatísticas finais:`);
  console.log(`  • Artigos analisados: ${articlesWithTags.length}`);
  console.log(`  • Artigos modificados: ${updatedCount}`);
  console.log(`  • Total de tags removidas: ${removedTagsCount}`);
  console.log(`  • Artigos que ficaram sem tags: ${await countArticlesWithoutTags()}`);

  // Verificar contagem final por tag
  console.log('\n🔍 Verificação final - contagem de tags restantes:');
  await verifyRemainingTags();

  await prisma.$disconnect();
}

async function countArticlesWithoutTags(): Promise<number> {
  return await prisma.newsArticle.count({
    where: {
      OR: [
        { tags: null },
        { tags: '' }
      ]
    }
  });
}

async function verifyRemainingTags() {
  const articlesWithTags = await prisma.newsArticle.findMany({
    where: {
      tags: {
        not: null,
        not: ''
      }
    },
    select: {
      tags: true
    }
  });

  const tagCounts: { [key: string]: number } = {};

  articlesWithTags.forEach(article => {
    if (!article.tags) return;

    const tags = article.tags
      .replace(/[\[\]"]/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && tag !== '');

    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts).sort(([,a], [,b]) => b - a);
  
  sortedTags.slice(0, 10).forEach(([tag, count]) => {
    console.log(`  ✅ ${tag}: ${count} artigos`);
  });

  // Verificar se alguma tag problemática ainda existe
  const problematicTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  const remainingProblematic = sortedTags.filter(([tag]) => problematicTags.includes(tag));
  
  if (remainingProblematic.length > 0) {
    console.log('\n⚠️ ATENÇÃO - Tags problemáticas ainda encontradas:');
    remainingProblematic.forEach(([tag, count]) => {
      console.log(`  ❌ ${tag}: ${count} artigos`);
    });
  } else {
    console.log('\n🎉 SUCESSO - Todas as tags problemáticas foram removidas!');
  }
}

cleanupProblematicTags().catch(console.error);