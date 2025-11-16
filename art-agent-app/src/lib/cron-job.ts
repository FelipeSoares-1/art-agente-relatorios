import cron from 'node-cron';
import { newsService } from '@/services/NewsService';
import { runHighPrioritySearch } from './active-search-service';

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

  // Executa às 8h da manhã
  cron.schedule('0 8 * * *', async () => {
    console.log('\n🌅 [8h] Executando Busca Ativa matinal...');
    try {
      await runHighPrioritySearch();
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
      await runHighPrioritySearch();
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
