import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkArticleTags() {
  console.log('🔍 Verificando tags nos artigos...\n');

  try {
    // Buscar alguns artigos com tags
    const articlesWithTags = await prisma.newsArticle.findMany({
      where: {
        tags: {
          not: null
        }
      },
      take: 10,
      orderBy: {
        publishedDate: 'desc'
      }
    });

    console.log(`📊 Artigos com tags: ${articlesWithTags.length}\n`);

    // Mostrar exemplos
    articlesWithTags.forEach((article, idx) => {
      const tags = article.tags ? JSON.parse(article.tags) : [];
      console.log(`${idx + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`   Tags: ${tags.join(', ') || 'Nenhuma'}\n`);
    });

    // Estatísticas
    const totalArticles = await prisma.newsArticle.count();
    const articlesWithTagsCount = await prisma.newsArticle.count({
      where: { tags: { not: null } }
    });
    const articlesWithoutTags = totalArticles - articlesWithTagsCount;

    console.log('\n📈 Estatísticas Gerais:');
    console.log(`   Total de artigos: ${totalArticles}`);
    console.log(`   Com tags: ${articlesWithTagsCount} (${(articlesWithTagsCount/totalArticles*100).toFixed(1)}%)`);
    console.log(`   Sem tags: ${articlesWithoutTags} (${(articlesWithoutTags/totalArticles*100).toFixed(1)}%)`);

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

    console.log('\n🏷️  Tags Mais Usadas:');
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

checkArticleTags();
