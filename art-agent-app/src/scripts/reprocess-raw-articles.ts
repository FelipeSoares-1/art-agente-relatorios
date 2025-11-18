// src/scripts/reprocess-raw-articles.ts
import { PrismaClient } from '@prisma/client';
import { isDateSuspicious } from '../lib/date-validator';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando reprocessamento de artigos com status "RAW"...');

  const rawArticles = await prisma.newsArticle.findMany({
    where: {
      status: 'RAW',
    },
  });

  console.log(`Encontrados ${rawArticles.length} artigos para reprocessar.`);

  let processedCount = 0;
  let pendingCount = 0;

  for (const article of rawArticles) {
    const newStatus = isDateSuspicious(article.newsDate)
      ? 'PENDING_ENRICHMENT'
      : 'PROCESSED';

    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { status: newStatus },
    });

    if (newStatus === 'PROCESSED') {
      processedCount++;
    } else {
      pendingCount++;
    }
  }

  console.log('Reprocessamento concluído.');
  console.log(`- ${processedCount} artigos marcados como PROCESSED.`);
  console.log(`- ${pendingCount} artigos marcados como PENDING_ENRICHMENT.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
