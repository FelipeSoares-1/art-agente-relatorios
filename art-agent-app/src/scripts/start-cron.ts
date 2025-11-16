// src/scripts/start-cron.ts
import { startFeedUpdateScheduler, startActiveSearchScheduler, startCronScrapingScheduler } from '../lib/cron-job';

console.log('Iniciando todos os schedulers...');

startFeedUpdateScheduler();
startActiveSearchScheduler();
startCronScrapingScheduler();

console.log('Schedulers iniciados.');
