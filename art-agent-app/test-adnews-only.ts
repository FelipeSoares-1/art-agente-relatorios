/**
 * Teste focado no scraper do AdNews
 */

import { searchAdNews } from './src/lib/active-search-service';

async function testAdNewsOnly() {
  console.log('\n🧪 TESTE FOCADO: AdNews Scraper\n');
  console.log('='.repeat(60));
  
  console.log('\n🔍 Buscando "artplan" no AdNews...\n');
  
  const results = await searchAdNews('artplan');
  
  console.log('\n📊 RESULTADOS:\n');
  console.log(`Total encontrado: ${results.length}`);
  
  if (results.length > 0) {
    console.log('\n📋 Primeiros 5 artigos:\n');
    results.slice(0, 5).forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   Link: ${result.link}`);
      console.log(`   Data: ${result.pubDate.toLocaleDateString('pt-BR')}`);
      console.log(`   Resumo: ${result.summary.substring(0, 100)}...\n`);
    });
  } else {
    console.log('\n❌ Nenhum resultado encontrado. Scrapers precisam de ajuste.\n');
  }
  
  console.log('='.repeat(60));
  console.log('\n✅ Teste concluído!\n');
}

testAdNewsOnly();
