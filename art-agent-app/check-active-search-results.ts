import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResults() {
  try {
    console.log('\n📊 VERIFICAÇÃO DE RESULTADOS - BUSCA ATIVA\n');
    console.log('='.repeat(60));
    
    // Total de artigos
    const totalArticles = await prisma.newsArticle.count();
    console.log(`\n📰 Total de artigos no banco: ${totalArticles}`);
    
    // Artigos do feed "Busca Ativa"
    const activeSearchFeed = await prisma.rSSFeed.findFirst({
      where: { name: 'Busca Ativa' }
    });
    
    if (activeSearchFeed) {
      const activeSearchArticles = await prisma.newsArticle.count({
        where: { feedId: activeSearchFeed.id }
      });
      console.log(`🔍 Artigos da Busca Ativa: ${activeSearchArticles}`);
    }
    
    // Buscar artigos que mencionam "artplan" (case insensitive via JS)
    const allArticles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        tags: true,
        publishedDate: true,
        feed: {
          select: {
            name: true
          }
        }
      }
    });
    
    const artplanArticles = allArticles.filter(article => 
      article.title.toLowerCase().includes('artplan')
    );
    
    console.log(`\n🎯 Artigos que mencionam "Artplan": ${artplanArticles.length}`);
    
    // Análise de tags dos artigos sobre Artplan
    const tagsCount: { [key: string]: number } = {};
    
    artplanArticles.forEach(article => {
      if (article.tags) {
        try {
          const tags = JSON.parse(article.tags);
          tags.forEach((tag: string) => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
          });
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    });
    
    console.log('\n📊 Tags aplicadas aos artigos sobre Artplan:');
    Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count} artigos`);
      });
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de artigos sobre Artplan:\n');
    artplanArticles.slice(0, 10).forEach((article, index) => {
      const tags = article.tags ? JSON.parse(article.tags) : [];
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Fonte: ${article.feed.name}`);
      console.log(`   Tags: ${tags.join(', ') || 'Sem tags'}`);
      console.log(`   Data: ${article.publishedDate.toLocaleDateString('pt-BR')}\n`);
    });
    
    // Estatísticas por fonte
    const sourceCount: { [key: string]: number } = {};
    artplanArticles.forEach(article => {
      const source = article.feed.name;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    
    console.log('\n📡 Distribuição por fonte:');
    Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`   ${source}: ${count} artigos`);
      });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Verificação concluída!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResults();
