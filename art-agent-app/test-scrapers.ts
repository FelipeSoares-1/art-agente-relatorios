// Script de teste para os scrapers específicos
import { scrapePropmark, scrapeMeioMensagem, scrapeAdNews } from './src/lib/scrapers-especificos';

async function testarScrapers() {
  console.log('\n=== TESTE DE SCRAPERS ESPECÍFICOS ===\n');
  
  const startDate = new Date('2025-01-01');
  
  // Testar Propmark
  console.log('1. Testando Propmark...');
  try {
    const propmarkArticles = await scrapePropmark(startDate, 2); // Apenas 2 páginas para teste
    console.log(`✅ Propmark: ${propmarkArticles.length} artigos coletados`);
    if (propmarkArticles.length > 0) {
      console.log('   Exemplo:', propmarkArticles[0].title.substring(0, 60) + '...');
    }
  } catch (error) {
    console.error('❌ Erro no Propmark:', error);
  }
  
  console.log('\n2. Testando Meio & Mensagem...');
  try {
    const mmArticles = await scrapeMeioMensagem(startDate, 2);
    console.log(`✅ Meio & Mensagem: ${mmArticles.length} artigos coletados`);
    if (mmArticles.length > 0) {
      console.log('   Exemplo:', mmArticles[0].title.substring(0, 60) + '...');
    }
  } catch (error) {
    console.error('❌ Erro no M&M:', error);
  }
  
  console.log('\n3. Testando AdNews...');
  try {
    const adnewsArticles = await scrapeAdNews(startDate, 2);
    console.log(`✅ AdNews: ${adnewsArticles.length} artigos coletados`);
    if (adnewsArticles.length > 0) {
      console.log('   Exemplo:', adnewsArticles[0].title.substring(0, 60) + '...');
    }
  } catch (error) {
    console.error('❌ Erro no AdNews:', error);
  }
  
  console.log('\n=== TESTE CONCLUÍDO ===\n');
}

testarScrapers().catch(console.error);
