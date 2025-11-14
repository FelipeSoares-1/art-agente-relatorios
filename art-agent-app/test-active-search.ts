/**
 * Script para testar o serviço de Busca Ativa
 * 
 * Executa busca para Artplan e Top 3 concorrentes
 */

import { performActiveSearch, saveSearchResults, SEARCH_TARGETS } from './src/lib/active-search-service';

async function main() {
  console.log('\n🚀 ========================================');
  console.log('   TESTE: BUSCA ATIVA - FASE 1');
  console.log('========================================\n');
  
  console.log('Alvos configurados:');
  Object.entries(SEARCH_TARGETS).forEach(([, target]) => {
    console.log(`  - ${target.name} (${target.priority}): ${target.keywords.join(', ')}`);
  });
  
  console.log('\n⏳ Iniciando busca ativa...\n');
  
  // Teste com Artplan primeiro
  console.log('\n📍 TESTE 1: Busca para ARTPLAN');
  console.log('=====================================\n');
  
  const artplanResults = await performActiveSearch('artplan');
  const artplanStats = await saveSearchResults(artplanResults);
  
  console.log('\n📊 Estatísticas Artplan:');
  console.log(`   Encontrados: ${artplanResults.length}`);
  console.log(`   Salvos: ${artplanStats.saved}`);
  console.log(`   Duplicatas: ${artplanStats.skipped}`);
  
  // Se quiser testar os 3 concorrentes também, descomente:
  /*
  console.log('\n📍 TESTE 2: Busca para WMCCANN');
  console.log('=====================================\n');
  const wmcResults = await performActiveSearch('wmccann');
  const wmcStats = await saveSearchResults(wmcResults);
  console.log(`   Salvos: ${wmcStats.saved}, Duplicatas: ${wmcStats.skipped}`);
  
  console.log('\n📍 TESTE 3: Busca para VMLY&R');
  console.log('=====================================\n');
  const vmlyResults = await performActiveSearch('vmlyr');
  const vmlyStats = await saveSearchResults(vmlyResults);
  console.log(`   Salvos: ${vmlyStats.saved}, Duplicatas: ${vmlyStats.skipped}`);
  
  console.log('\n📍 TESTE 4: Busca para ALMAPBBDO');
  console.log('=====================================\n');
  const almapResults = await performActiveSearch('almapbbdo');
  const almapStats = await saveSearchResults(almapResults);
  console.log(`   Salvos: ${almapStats.saved}, Duplicatas: ${almapStats.skipped}`);
  */
  
  console.log('\n✅ ========================================');
  console.log('   TESTE CONCLUÍDO!');
  console.log('========================================\n');
}

main().catch(console.error);
