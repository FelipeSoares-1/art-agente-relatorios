/**
 * Script para executar busca ativa para Top 3 Concorrentes
 * WMcCann, VMLY&R e AlmapBBDO
 */

import { performActiveSearch, saveSearchResults } from './src/lib/active-search-service';

async function main() {
  console.log('\n🚀 ========================================');
  console.log('   BUSCA ATIVA - TOP 3 CONCORRENTES');
  console.log('========================================\n');
  
  let totalFound = 0;
  let totalSaved = 0;
  let totalSkipped = 0;
  
  // 1. WMcCann
  console.log('\n📍 BUSCA 1/3: WMcCann');
  console.log('=====================================\n');
  
  const wmcResults = await performActiveSearch('wmccann');
  const wmcStats = await saveSearchResults(wmcResults);
  
  console.log('\n📊 Estatísticas WMcCann:');
  console.log(`   Encontrados: ${wmcResults.length}`);
  console.log(`   Salvos: ${wmcStats.saved}`);
  console.log(`   Duplicatas: ${wmcStats.skipped}`);
  
  totalFound += wmcResults.length;
  totalSaved += wmcStats.saved;
  totalSkipped += wmcStats.skipped;
  
  console.log('\n⏳ Aguardando 5 segundos antes do próximo...\n');
  await sleep(5000);
  
  // 2. VMLY&R
  console.log('\n📍 BUSCA 2/3: VMLY&R');
  console.log('=====================================\n');
  
  const vmlyResults = await performActiveSearch('vmlyr');
  const vmlyStats = await saveSearchResults(vmlyResults);
  
  console.log('\n📊 Estatísticas VMLY&R:');
  console.log(`   Encontrados: ${vmlyResults.length}`);
  console.log(`   Salvos: ${vmlyStats.saved}`);
  console.log(`   Duplicatas: ${vmlyStats.skipped}`);
  
  totalFound += vmlyResults.length;
  totalSaved += vmlyStats.saved;
  totalSkipped += vmlyStats.skipped;
  
  console.log('\n⏳ Aguardando 5 segundos antes do próximo...\n');
  await sleep(5000);
  
  // 3. AlmapBBDO
  console.log('\n📍 BUSCA 3/3: AlmapBBDO');
  console.log('=====================================\n');
  
  const almapResults = await performActiveSearch('almapbbdo');
  const almapStats = await saveSearchResults(almapResults);
  
  console.log('\n📊 Estatísticas AlmapBBDO:');
  console.log(`   Encontrados: ${almapResults.length}`);
  console.log(`   Salvos: ${almapStats.saved}`);
  console.log(`   Duplicatas: ${almapStats.skipped}`);
  
  totalFound += almapResults.length;
  totalSaved += almapStats.saved;
  totalSkipped += almapStats.skipped;
  
  // Resumo final
  console.log('\n\n🎉 ========================================');
  console.log('   BUSCA COMPLETA - RESUMO FINAL');
  console.log('========================================\n');
  
  console.log('📊 TOTAIS:');
  console.log(`   Artigos encontrados: ${totalFound}`);
  console.log(`   Artigos salvos: ${totalSaved}`);
  console.log(`   Duplicatas ignoradas: ${totalSkipped}`);
  
  console.log('\n📈 DISTRIBUIÇÃO:');
  console.log(`   WMcCann: ${wmcStats.saved} artigos`);
  console.log(`   VMLY&R: ${vmlyStats.saved} artigos`);
  console.log(`   AlmapBBDO: ${almapStats.saved} artigos`);
  
  console.log('\n✅ ========================================');
  console.log('   MISSÃO CUMPRIDA!');
  console.log('========================================\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
