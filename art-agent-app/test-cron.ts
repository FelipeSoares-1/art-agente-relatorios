import { executarScrapingManual } from './src/lib/cron-scraping';

console.log('🧪 Testando execução manual do cron de scraping...\n');

executarScrapingManual()
  .then(() => {
    console.log('\n✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  });
