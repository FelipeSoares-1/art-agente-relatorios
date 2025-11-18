// src/scripts/check-concorrentes-news.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.newsArticle.findMany({
    where: {
      tags: {
        contains: '"Concorrentes"',
      },
    },
  });

  console.log(`Total de notícias com a tag "Concorrentes": ${articles.length}`);
  console.log('Artigos encontrados:');
  console.log(articles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
