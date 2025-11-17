import cron from 'node-cron';
import { newsService } from '@/services/NewsService';
import { scraperService, SearchConfig } from '@/services/ScraperService';

let isSchedulerStarted = false;
let isActiveSearchStarted = false;
let isCronScrapingStarted = false;
let isEnrichmentWorkerStarted = false;

export function startFeedUpdateScheduler() {
  if (isSchedulerStarted) {
    console.log('Scheduler já está rodando.');
    return;
  }

  // Agenda a tarefa para rodar a cada 30 minutos
  // No formato cron: '*/30 * * * *' significa a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log('Executando tarefa agendada: atualização de feeds...');
    try {
      await newsService.updateFromRssFeeds();
    } catch (error) {
      console.error('Erro na tarefa agendada de atualização de feeds:', error);
    }
  }, {
    timezone: "America/Sao_Paulo" // Ajuste para o fuso horário desejado
  });

  isSchedulerStarted = true;
  console.log('Scheduler de atualização de feeds iniciado (a cada 30 minutos).');
}

/**
 * Scheduler para Busca Ativa
 * Executa 2x ao dia (8h e 18h) para Artplan + Top 3 concorrentes
 */
export function startActiveSearchScheduler() {
  if (isActiveSearchStarted) {
    console.log('Scheduler de Busca Ativa já está rodando.');
    return;
  }

  const config: SearchConfig = {
    useWebScraping: false, // Por padrão, usa RSS para o cron job
    maxArticlesPerQuery: 10
  };

  // Executa às 8h da manhã
  cron.schedule('0 8 * * *', async () => {
    console.log('\n🌅 [8h] Executando Busca Ativa matinal...');
    try {
      const results = await scraperService.runHighPriorityActiveSearch(config);
      await newsService.saveActiveSearchResults(results);
      console.log('✅ Busca Ativa matinal concluída!');
    } catch (error) {
      console.error('❌ Erro na Busca Ativa matinal:', error);
    }
  }, {
    timezone: "America/Sao_Paulo"
  });

  // Executa às 18h (6pm)
  cron.schedule('0 18 * * *', async () => {
    console.log('\n🌆 [18h] Executando Busca Ativa noturna...');
    try {
      const results = await scraperService.runHighPriorityActiveSearch(config);
      await newsService.saveActiveSearchResults(results);
      console.log('✅ Busca Ativa noturna concluída!');
    } catch (error) {
      console.error('❌ Erro na Busca Ativa noturna:', error);
    }
  }, {
    timezone: "America/Sao_Paulo"
  });

  isActiveSearchStarted = true;
  console.log('✅ Scheduler de Busca Ativa iniciado (8h e 18h diariamente).');
}

/**
 * Scheduler para o Worker de Enriquecimento de Artigos.
 * Executa a cada hora para processar artigos com datas suspeitas.
 */
export function startEnrichmentWorkerScheduler() {
  if (isEnrichmentWorkerStarted) {
    console.log('Scheduler do Worker de Enriquecimento já está rodando.');
    return;
  }

  // Executa no início de cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('\n🧩 [Worker] Executando worker de enriquecimento de artigos...');
    try {
      // A URL base deve ser configurada via variável de ambiente em produção
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/enrich-articles`);
      
      if (!response.ok) {
        throw new Error(`A resposta da API não foi OK: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Worker de enriquecimento concluído. ${result.message}`);

    } catch (error) {
      console.error('❌ Erro no worker de enriquecimento de artigos:', error);
    }
  }, {
    timezone: "America/Sao_Paulo"
  });

  isEnrichmentWorkerStarted = true;
  console.log('✅ Scheduler do Worker de Enriquecimento iniciado (a cada hora).');
}

/**
 * Scheduler para Scraping de Cron
 * Executa 1x ao dia (0h)
 */
export function startCronScrapingScheduler() {
  if (isCronScrapingStarted) {
    console.log('Scheduler de Cron Scraping já está rodando.');
    return;
  }

  cron.schedule('0 0 * * *', async () => { // Meia-noite (0h)
    console.log('\n🌙 [0h] Executando Cron Scraping diário...');
    try {
      const scrapedArticles = await scraperService.runCronScraping();
      await newsService.saveArticles(scrapedArticles);
      console.log('✅ Cron Scraping diário concluído!');
    } catch (error) {
      console.error('❌ Erro no Cron Scraping diário:', error);
    }
  }, {
    timezone: "America/Sao_Paulo"
  });

  isCronScrapingStarted = true;
  console.log('✅ Scheduler de Cron Scraping iniciado (0h diariamente).');
}

