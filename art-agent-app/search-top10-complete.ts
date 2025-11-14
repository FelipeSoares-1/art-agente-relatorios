/**
 * Script para executar busca ativa para o TOP 10 de agências brasileiras.
 * 
 * Ordem baseada no ranking fornecido:
 * 1. Mediabrands
 * 2. BETC Havas
 * 3. Galeria
 * 4. WMcCann
 * 5. Africa
 * 6. AlmapBBDO
 * 7. Publicis
 * 8. Artplan
 * 9. Ogilvy
 * 10. EssenceMediacom
 */

import { performActiveSearch, saveSearchResults, SEARCH_TARGETS } from './src/lib/active-search-service';

type TargetKey = keyof typeof SEARCH_TARGETS;

type TargetRun = {
  key: TargetKey;
  name: string;
};

type TargetSummary = {
  key: TargetKey;
  name: string;
  found: number;
  saved: number;
  skipped: number;
};

const TARGETS: TargetRun[] = [
  { key: 'mediabrands', name: 'Mediabrands' },
  { key: 'betchavas', name: 'BETC Havas' },
  { key: 'galeria', name: 'Galeria' },
  { key: 'wmccann', name: 'WMcCann' },
  { key: 'africa', name: 'Africa' },
  { key: 'almapbbdo', name: 'AlmapBBDO' },
  { key: 'publicis', name: 'Publicis' },
  { key: 'artplan', name: 'Artplan' },
  { key: 'ogilvy', name: 'Ogilvy' },
  { key: 'essencemediacom', name: 'EssenceMediacom' }
];

const DELAY_BETWEEN_TARGETS_MS = 5000;

async function main(): Promise<void> {
  console.log('\n🚀 ========================================');
  console.log('   BUSCA ATIVA - TOP 10 AGÊNCIAS DO BRASIL');
  console.log('=========================================\n');

  const summaries: TargetSummary[] = [];
  let totalFound = 0;
  let totalSaved = 0;
  let totalSkipped = 0;

  const startedAt = Date.now();

  for (let index = 0; index < TARGETS.length; index++) {
    const target = TARGETS[index];
    const position = index + 1;

    console.log(`\n📍 BUSCA ${position}/${TARGETS.length}: ${target.name}`);
    console.log('=====================================\n');

    const results = await performActiveSearch(target.key);
    const stats = await saveSearchResults(results);

    console.log(`\n📊 Estatísticas ${target.name}:`);
    console.log(`   Encontrados: ${results.length}`);
    console.log(`   Salvos: ${stats.saved}`);
    console.log(`   Duplicatas: ${stats.skipped}`);

    summaries.push({
      key: target.key,
      name: target.name,
      found: results.length,
      saved: stats.saved,
      skipped: stats.skipped
    });

    totalFound += results.length;
    totalSaved += stats.saved;
    totalSkipped += stats.skipped;

    if (position < TARGETS.length) {
      console.log('\n⏳ Aguardando 5 segundos antes do próximo...\n');
      await sleep(DELAY_BETWEEN_TARGETS_MS);
    }
  }

  const totalMinutes = ((Date.now() - startedAt) / 60000).toFixed(1);

  console.log('\n\n🎉 ========================================');
  console.log('   TOP 10 COMPLETO - RESUMO FINAL');
  console.log('=========================================\n');

  console.log('📊 TOTAIS GERAIS:');
  console.log(`   Artigos encontrados: ${totalFound}`);
  console.log(`   Artigos salvos: ${totalSaved}`);
  console.log(`   Duplicatas ignoradas: ${totalSkipped}`);
  console.log(`   Tempo total: ~${totalMinutes} minutos`);

  console.log('\n🏁 RESUMO POR AGÊNCIA:');
  summaries.forEach(summary => {
    console.log(`   • ${summary.name}: ${summary.saved} salvos (encontrados ${summary.found}, duplicatas ${summary.skipped})`);
  });

  console.log('\n✅ ========================================');
  console.log('   MISSÃO TOP 10 CONCLUÍDA!');
  console.log('=========================================\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
  console.error('\n❌ Erro ao executar busca ativa Top 10:', error);
  process.exit(1);
});
