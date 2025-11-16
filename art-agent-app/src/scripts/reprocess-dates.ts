import { prisma } from '@/lib/db';
import type { NewsArticle, RSSFeed } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const BATCH_SIZE = 100;
const DELAY_MS = 1500;

/**
 * Extrai a data de publicação de uma URL de notícia.
 * Esta é uma versão simplificada da lógica do news-scraper.ts.
 */
async function extractDateFromUrl(url: string): Promise<Date | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Tenta múltiplos seletores para encontrar a data
    const dateText =
      $('time').first().attr('datetime') ||
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[property="og:published_time"]').attr('content') ||
      $('.entry-date, .post-date, .date, .published, .posted-on, .byline, .article-date').first().text().trim();

    if (dateText) {
      const parsedDate = new Date(dateText);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    return null;
  } catch (error) {
    console.error(`   - ❗️ Erro ao buscar URL ${url}:`, error instanceof Error ? error.message : 'Erro desconhecido');
    return null;
  }
}

/**
 * Encontra e corrige as datas de artigos salvos pelo scraper.
 */
async function findAndFixScrapedDates() {
  console.log('--- REPROCESSAMENTO DE DATAS DE ARTIGOS SCRAPED ---');
  
  let totalChecked = 0;
  let totalSuspicious = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  let cursor: number | undefined = undefined;

  while (true) {
    console.log(`\n🔎 Buscando lote de artigos... (Cursor: ${cursor || 'início'})`);
    
    const articles: (NewsArticle & { feed: RSSFeed })[] = await prisma.newsArticle.findMany({
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
      include: { feed: true },
    });

    if (articles.length === 0) {
      console.log('🏁 Nenhum artigo restante para verificar.');
      break;
    }

    totalChecked += articles.length;
    cursor = articles[articles.length - 1].id;

    // Filtra por artigos suspeitos (newsDate muito próxima de insertedAt)
    const suspiciousArticles = articles.filter(article => {
      // Focar apenas em artigos de feeds de scraper
      if (!article.feed.name.endsWith('(Scraper)')) {
        return false;
      }
      const diffMs = Math.abs(article.newsDate.getTime() - article.insertedAt.getTime());
      const diffMinutes = diffMs / (1000 * 60);
      // Se a diferença for menor que 60 minutos, é suspeito.
      return diffMinutes < 60;
    });

    if (suspiciousArticles.length === 0) {
      console.log(`✅ Nenhum artigo suspeito neste lote.`);
      continue;
    }

    totalSuspicious += suspiciousArticles.length;
    console.log(`⚠️ ${suspiciousArticles.length} artigos suspeitos encontrados neste lote. Iniciando verificação...`);

    for (const article of suspiciousArticles) {
      console.log(`\n🔄 Processando: "${article.title.substring(0, 50)}"...`);
      console.log(`   - Link: ${article.link}`);
      console.log(`   - Data atual: ${article.newsDate.toISOString()}`);

      const correctDate = await extractDateFromUrl(article.link);

      if (correctDate) {
        const diffHours = Math.abs(correctDate.getTime() - article.newsDate.getTime()) / (1000 * 60 * 60);

        // Apenas atualiza se a diferença for maior que 1 hora
        if (diffHours > 1) {
          console.log(`   - 📅 Data correta encontrada: ${correctDate.toISOString()}`);
          await prisma.newsArticle.update({
            where: { id: article.id },
            data: { newsDate: correctDate },
          });
          totalUpdated++;
          console.log('   - ✅ ATUALIZADO NO BANCO DE DADOS.');
        } else {
          console.log('   - ✔️ Data atual já parece correta. Nenhuma ação necessária.');
        }
      } else {
        totalErrors++;
        console.log('   - ❌ Não foi possível extrair uma data válida da página.');
      }
      
      // Pausa para não sobrecarregar os servidores
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('\n\n--- RESUMO DO REPROCESSAMENTO ---');
  console.log(`- 📊 Total de artigos verificados: ${totalChecked}`);
  console.log(`- ⚠️ Total de artigos suspeitos: ${totalSuspicious}`);
  console.log(`- ✅ Total de artigos corrigidos: ${totalUpdated}`);
  console.log(`- ❌ Total de artigos que falharam na extração: ${totalErrors}`);
  console.log('--- FIM ---');
}

async function main() {
  try {
    await findAndFixScrapedDates();
  } catch (error) {
    console.error('🚨 Erro fatal durante o reprocessamento:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão com o banco de dados encerrada.');
  }
}

main();
