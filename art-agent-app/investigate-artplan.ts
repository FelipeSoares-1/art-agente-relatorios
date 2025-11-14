import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateArtplan() {
  console.log('🔍 Investigando artigos sobre Artplan...\n');

  try {
    // 1. Buscar artigos com "artplan" no título ou resumo
    const allArticles = await prisma.newsArticle.findMany({
      orderBy: { publishedDate: 'desc' }
    });
    
    const articlesWithArtplan = allArticles.filter(article => 
      article.title.toLowerCase().includes('artplan') ||
      (article.summary && article.summary.toLowerCase().includes('artplan'))
    );

    console.log(`📊 Total de artigos mencionando "artplan": ${articlesWithArtplan.length}\n`);

    // Mostrar alguns exemplos
    console.log('📰 Últimos 10 artigos:\n');
    articlesWithArtplan.slice(0, 10).forEach((article, idx) => {
      const date = new Date(article.publishedDate).toLocaleDateString('pt-BR');
      console.log(`${idx + 1}. ${article.title}`);
      console.log(`   Data: ${date}`);
      console.log(`   Link: ${article.link}`);
      console.log('');
    });

    // 2. Estatísticas por fonte
    const feedCounts: Record<number, { name: string; count: number }> = {};
    
    for (const article of articlesWithArtplan) {
      if (!feedCounts[article.feedId]) {
        const feed = await prisma.rSSFeed.findUnique({
          where: { id: article.feedId }
        });
        feedCounts[article.feedId] = {
          name: feed?.name || 'Desconhecido',
          count: 0
        };
      }
      feedCounts[article.feedId].count++;
    }

    console.log('\n📊 Artigos por Fonte:\n');
    Object.values(feedCounts)
      .sort((a, b) => b.count - a.count)
      .forEach((feed, idx) => {
        console.log(`${idx + 1}. ${feed.name}: ${feed.count} artigos`);
      });

    // 3. Verificar total de artigos e período
    const totalArticles = await prisma.newsArticle.count();
    const oldestArticle = await prisma.newsArticle.findFirst({
      orderBy: { publishedDate: 'asc' }
    });
    const newestArticle = await prisma.newsArticle.findFirst({
      orderBy: { publishedDate: 'desc' }
    });

    console.log('\n📈 Estatísticas Gerais:\n');
    console.log(`Total de artigos no banco: ${totalArticles}`);
    console.log(`Período coberto:`);
    if (oldestArticle && newestArticle) {
      console.log(`  De: ${new Date(oldestArticle.publishedDate).toLocaleDateString('pt-BR')}`);
      console.log(`  Até: ${new Date(newestArticle.publishedDate).toLocaleDateString('pt-BR')}`);
    }

    // 4. Artigos recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTotal = await prisma.newsArticle.count({
      where: {
        publishedDate: { gte: sevenDaysAgo }
      }
    });

    const recentArticles = allArticles.filter(article =>
      new Date(article.publishedDate) >= sevenDaysAgo
    );
    
    const recentArtplan = recentArticles.filter(article =>
      article.title.toLowerCase().includes('artplan') ||
      (article.summary && article.summary.toLowerCase().includes('artplan'))
    ).length;

    console.log(`\n📅 Últimos 7 dias:`);
    console.log(`  Total de artigos novos: ${recentTotal}`);
    console.log(`  Artigos sobre Artplan: ${recentArtplan}`);

    // 5. Verificar feeds ativos
    const feeds = await prisma.rSSFeed.findMany();
    console.log(`\n🌐 Total de Feeds cadastrados: ${feeds.length}\n`);
    
    console.log('📋 Feeds cadastrados:');
    feeds.slice(0, 10).forEach((feed, idx) => {
      console.log(`${idx + 1}. ${feed.name}`);
    });
    if (feeds.length > 10) {
      console.log(`... e mais ${feeds.length - 10} feeds`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateArtplan();
