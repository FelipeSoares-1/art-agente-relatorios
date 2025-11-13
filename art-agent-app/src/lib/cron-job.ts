import cron from 'node-cron';
import { runFeedUpdate } from './feed-updater';

let isSchedulerStarted = false;

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
      await runFeedUpdate();
    } catch (error) {
      console.error('Erro na tarefa agendada de atualização de feeds:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo" // Ajuste para o fuso horário desejado
  });

  isSchedulerStarted = true;
  console.log('Scheduler de atualização de feeds iniciado (a cada 30 minutos).');
}
