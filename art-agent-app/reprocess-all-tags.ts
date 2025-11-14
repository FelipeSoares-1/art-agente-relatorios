import { PrismaClient } from '@prisma/client';
import { identificarTags, invalidateTagCache } from './src/lib/tag-helper';

const prisma = new PrismaClient();

async function reprocessAllArticles() {
  console.log('🔄 Re-processando todos os artigos com novas tags...\n');
  
  // Invalida cache para garantir que está usando tags atualizadas
  invalidateTagCache();
  
  try {
    // Buscar todos os artigos
    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedDate: 'desc' }
    });
    
    console.log(`📊 Total de artigos: ${articles.length}\n`);
    console.log('⏳ Processando...\n');
    
    let updated = 0;
    let withNewTags = 0;
    let processedCount = 0;
    
    for (const article of articles) {
      processedCount++;
      
      // Mostrar progresso a cada 100 artigos
      if (processedCount % 100 === 0) {
        console.log(`   Processados: ${processedCount}/${articles.length}...`);
      }
      
      const texto = `${article.title} ${article.summary || ''}`;
      const newTags = await identificarTags(texto);
      
      // Comparar com tags antigas
      const oldTags = article.tags ? JSON.parse(article.tags) : [];
      const hasNewTags = newTags.length > oldTags.length || 
                        newTags.some(tag => !oldTags.includes(tag));
      
      if (hasNewTags) {
        withNewTags++;
      }
      
      // Atualizar apenas se houver mudança
      if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
        await prisma.newsArticle.update({
          where: { id: article.id },
          data: {
            tags: newTags.length > 0 ? JSON.stringify(newTags) : null
          }
        });
        updated++;
      }
    }
    
    console.log(`\n✅ Re-processamento concluído!\n`);
    console.log(`📈 Resultados:`);
    console.log(`   Total processados: ${articles.length}`);
    console.log(`   Artigos atualizados: ${updated}`);
    console.log(`   Com novas tags: ${withNewTags}`);
    
    // Estatísticas finais
    const articlesWithTags = await prisma.newsArticle.count({
      where: { tags: { not: null } }
    });
    
    const articlesWithoutTags = articles.length - articlesWithTags;
    
    console.log(`\n📊 Estatísticas Finais:`);
    console.log(`   Com tags: ${articlesWithTags} (${(articlesWithTags/articles.length*100).toFixed(1)}%)`);
    console.log(`   Sem tags: ${articlesWithoutTags} (${(articlesWithoutTags/articles.length*100).toFixed(1)}%)`);
    
    // Contar tags mais usadas
    const allArticles = await prisma.newsArticle.findMany({
      where: { tags: { not: null } }
    });

    const tagCount: Record<string, number> = {};
    allArticles.forEach(article => {
      if (article.tags) {
        const tags = JSON.parse(article.tags);
        tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    console.log('\n🏷️  Top 10 Tags:');
    Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count], idx) => {
        console.log(`   ${idx + 1}. ${tag}: ${count} artigos`);
      });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('⚠️  ATENÇÃO: Este processo pode demorar alguns minutos...');
console.log('⚠️  Processando aproximadamente 991 artigos...\n');

reprocessAllArticles();
