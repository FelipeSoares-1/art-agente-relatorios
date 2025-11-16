import cron from 'node-cron';
import { newsService } from '@/services/NewsService';
import { scraperService, SearchConfig } from '@/services/ScraperService';

let isSchedulerStarted = false;
let isActiveSearchStarted = false;

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
let isCronScrapingStarted = false;

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
