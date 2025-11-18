// src/scripts/check-tags.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const articlesWithTags = await prisma.newsArticle.findMany({
    where: {
      tags: {
        not: null,
        not: "[]"
      },
    },
    select: {
      id: true,
      title: true,
      tags: true,
      status: true, // Adicionado para análise
    },
  });

  console.log(`Total de artigos com tags não vazias: ${articlesWithTags.length}`);

  // Estrutura para contar tags por status
  const tagCountsByStatus: Record<string, Record<string, number>> = {};

  articlesWithTags.forEach((article) => {
    if (article.tags && article.status) {
      try {
        const tags = JSON.parse(article.tags);
        if (Array.isArray(tags) && tags.length > 0) {
          // Inicializa o objeto de status se não existir
          if (!tagCountsByStatus[article.status]) {
            tagCountsByStatus[article.status] = {};
          }

          tags.forEach((tag) => {
            tagCountsByStatus[article.status][tag] = (tagCountsByStatus[article.status][tag] || 0) + 1;
          });
        }
      } catch (_error) {
        console.error(`Erro ao parsear tags do artigo ${article.id}:`, article.tags);
      }
    }
  });

  console.log('Contagem de cada tag por status:');
  console.log(JSON.stringify(tagCountsByStatus, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });