import cron from 'node-cron';
import { scrapePropmark, scrapeMeioMensagem, scrapeAdNews, scrapeGoogleNews } from './scrapers-especificos';
import { prisma } from './db';
import { identificarTags } from './tag-helper';

interface ScrapingLog {
  timestamp: Date;
  site: string;
  scraped: number;
  saved: number;
  errors: string[];
}

const logs: ScrapingLog[] = [];

async function executarScrapingCompleto() {
  console.log('\n🤖 [CRON] Iniciando scraping automático...');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`);
  
  const startDate = new Date('2025-01-01');
  const results = {
    propmark: { scraped: 0, saved: 0, errors: [] as string[] },
    meioMensagem: { scraped: 0, saved: 0, errors: [] as string[] },
    adnews: { scraped: 0, saved: 0, errors: [] as string[] },
    googleNews: { scraped: 0, saved: 0, errors: [] as string[] },
  };
  
  try {
    // 1. Criar/buscar feeds
    const propmarkFeed = await prisma.rSSFeed.upsert({
      where: { url: 'https://propmark.com.br' },
      update: {},
      create: { name: 'Propmark (Scraping)', url: 'https://propmark.com.br' },
    });
    
    const mmFeed = await prisma.rSSFeed.upsert({
      where: { url: 'https://meioemensagem.com.br/comunicacao' },
      update: {},
      create: { name: 'Meio & Mensagem (Scraping)', url: 'https://meioemensagem.com.br/comunicacao' },
    });
    
    const adnewsFeed = await prisma.rSSFeed.upsert({
      where: { url: 'https://adnews.com.br' },
      update: {},
      create: { name: 'AdNews (Scraping)', url: 'https://adnews.com.br' },
    });
    
    // 2. Propmark
    try {
      const propmarkArticles = await scrapePropmark(startDate, 3);
      results.propmark.scraped = propmarkArticles.length;
      
      for (const article of propmarkArticles) {
        try {
          const tags = await identificarTags(`${article.title} ${article.summary}`);
          await prisma.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              publishedDate: article.publishedDate,
              feedId: propmarkFeed.id,
              tags: tags.length > 0 ? JSON.stringify(tags) : null,
            },
          });
          results.propmark.saved++;
        } catch {
          // Duplicado
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      results.propmark.errors.push(msg);
      console.error('❌ Erro no Propmark:', msg);
    }
    
    // 3. Meio & Mensagem
    try {
      const mmArticles = await scrapeMeioMensagem(startDate, 3);
      results.meioMensagem.scraped = mmArticles.length;
      
      for (const article of mmArticles) {
        try {
          const tags = await identificarTags(`${article.title} ${article.summary}`);
          await prisma.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              publishedDate: article.publishedDate,
              feedId: mmFeed.id,
              tags: tags.length > 0 ? JSON.stringify(tags) : null,
            },
          });
          results.meioMensagem.saved++;
        } catch {
          // Duplicado
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      results.meioMensagem.errors.push(msg);
      console.error('❌ Erro no Meio & Mensagem:', msg);
    }
    
    // 4. AdNews
    try {
      const adnewsArticles = await scrapeAdNews(startDate, 3);
      results.adnews.scraped = adnewsArticles.length;
      
      for (const article of adnewsArticles) {
        try {
          const tags = await identificarTags(`${article.title} ${article.summary}`);
          await prisma.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              publishedDate: article.publishedDate,
              feedId: adnewsFeed.id,
              tags: tags.length > 0 ? JSON.stringify(tags) : null,
            },
          });
          results.adnews.saved++;
        } catch {
          // Duplicado
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      results.adnews.errors.push(msg);
      console.error('❌ Erro no AdNews:', msg);
    }
    
    // 5. Google Notícias
    try {
      const googleFeed = await prisma.rSSFeed.upsert({
        where: { url: 'https://news.google.com' },
        update: {},
        create: { name: 'Google Notícias (Scraping)', url: 'https://news.google.com' },
      });
      
      const keywords = ['publicidade brasil', 'marketing brasil', 'agências publicidade'];
      const googleArticles = await scrapeGoogleNews(keywords, 30);
      results.googleNews.scraped = googleArticles.length;
      
      for (const article of googleArticles) {
        try {
          const tags = await identificarTags(`${article.title} ${article.summary}`);
          await prisma.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              publishedDate: article.publishedDate,
              feedId: googleFeed.id,
              tags: tags.length > 0 ? JSON.stringify(tags) : null,
            },
          });
          results.googleNews.saved++;
        } catch {
          // Duplicado
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      results.googleNews.errors.push(msg);
      console.error('❌ Erro no Google Notícias:', msg);
    }
    
    // 6. Resumo
    const totalScraped = results.propmark.scraped + results.meioMensagem.scraped + results.adnews.scraped + results.googleNews.scraped;
    const totalSaved = results.propmark.saved + results.meioMensagem.saved + results.adnews.saved + results.googleNews.saved;
    const totalErrors = results.propmark.errors.length + results.meioMensagem.errors.length + results.adnews.errors.length + results.googleNews.errors.length;
    
    console.log('\n✅ [CRON] Scraping concluído!');
    console.log(`📊 Coletados: ${totalScraped} | Salvos: ${totalSaved} | Erros: ${totalErrors}`);
    console.log(`   - Propmark: ${results.propmark.scraped}→${results.propmark.saved}`);
    console.log(`   - M&M: ${results.meioMensagem.scraped}→${results.meioMensagem.saved}`);
    console.log(`   - AdNews: ${results.adnews.scraped}→${results.adnews.saved}`);
    console.log(`   - Google News: ${results.googleNews.scraped}→${results.googleNews.saved}\n`);
    
    // Salvar log
    logs.push({
      timestamp: new Date(),
      site: 'TODOS',
      scraped: totalScraped,
      saved: totalSaved,
      errors: [
        ...results.propmark.errors.map(e => `Propmark: ${e}`),
        ...results.meioMensagem.errors.map(e => `M&M: ${e}`),
        ...results.adnews.errors.map(e => `AdNews: ${e}`),
        ...results.googleNews.errors.map(e => `Google News: ${e}`),
      ],
    });
    
    // Manter apenas últimos 50 logs
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
  } catch (error) {
    console.error('❌ [CRON] Erro fatal:', error);
  }
}

// Função para obter logs
export function getScrapingLogs(limit: number = 10): ScrapingLog[] {
  return logs.slice(-limit).reverse();
}

// Função para iniciar cron
export function iniciarCronScraping() {
  console.log('🤖 Iniciando sistema de scraping automático...');
  console.log('⏰ Configuração: A cada 4 horas');
  console.log('📅 Próxima execução:', getNextCronExecution());
  
  // Executar a cada 4 horas: 0 */4 * * *
  // Para testes, pode usar: */5 * * * * (a cada 5 minutos)
  const schedule = '0 */4 * * *'; // A cada 4 horas
  
  cron.schedule(schedule, () => {
    executarScrapingCompleto();
  });
  
  console.log('✅ Cron job ativado!\n');
}

// Função para obter próxima execução
function getNextCronExecution(): string {
  const now = new Date();
  const next = new Date(now);
  
  // Próximo múltiplo de 4 horas
  const hours = now.getHours();
  const nextHour = Math.ceil((hours + 1) / 4) * 4;
  
  if (nextHour >= 24) {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(nextHour, 0, 0, 0);
  }
  
  return next.toLocaleString('pt-BR');
}

// Função para executar manualmente
export async function executarScrapingManual() {
  await executarScrapingCompleto();
}
