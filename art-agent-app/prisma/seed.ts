import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seeding do banco de dados...');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvFilePath = path.resolve(__dirname, '../data/rss_feeds_completo_atualizado.csv');
  
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  const parser = parse(fileContent, {
    delimiter: ',',
    columns: true,
  });

  let count = 0;
  for await (const record of parser) {
    const feedName = record['Portal/Fonte'];
    const feedUrl = record['RSS Feed URL'];

    // Validar se a URL é uma string e começa com http
    if (typeof feedUrl === 'string' && feedUrl.startsWith('http')) {
      try {
        // Usar 'upsert' para criar o feed se ele não existir (baseado na URL única)
        // ou atualizar o nome se ele já existir.
        await prisma.rSSFeed.upsert({
          where: { url: feedUrl },
          update: { name: feedName },
          create: {
            name: feedName,
            url: feedUrl,
          },
        });
        count++;
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Erro ao processar o feed '${feedName}': ${error.message}`);
        } else {
          console.error(`Erro desconhecido ao processar o feed '${feedName}'.`);
        }
      }
    }
  }

  console.log(`Seeding concluído. ${count} feeds foram processados e inseridos/atualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
