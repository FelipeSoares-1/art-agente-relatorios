import { prisma } from '../lib/db.js';

async function showRecentNews() {
  console.log('--- MOSTRANDO OS 20 ARTIGOS MAIS RECENTES ---');
  
  try {
    const recentArticles = await prisma.newsArticle.findMany({
      take: 20,
      orderBy: {
        insertedAt: 'desc', // Ordenar pelos mais recentemente inseridos
      },
      include: {
        feed: {
          select: {
            name: true,
          },
        },
      },
    });

    if (recentArticles.length === 0) {
      console.log('Nenhum artigo encontrado no banco de dados.');
      return;
    }

    console.log(`
Exibindo ${recentArticles.length} artigos:
`);

    recentArticles.forEach((article, index) => {
      console.log(`${'='.repeat(80)}`);
      console.log(`[${index + 1}] Título: ${article.title}`);
      console.log(`    Fonte: ${article.feed.name}`);
      console.log(`    Data da Notícia: ${article.newsDate.toISOString()} (${new Date(article.newsDate).toLocaleString('pt-BR')})`);
      console.log(`    Data da Coleta:  ${article.insertedAt.toISOString()} (${new Date(article.insertedAt).toLocaleString('pt-BR')})`);
    });

    console.log(`
${'='.repeat(80)}`);

  } catch (error) {
    console.error('🚨 Erro ao buscar notícias recentes:', error);
  }
}

async function main() {
  try {
    await showRecentNews();
  } catch (error) {
    console.error('Erro fatal:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão com o banco de dados encerrada.');
  }
}

main();
