import { identificarTags, invalidateTagCache } from './src/lib/tag-helper';

async function testConcorrentesTag() {
  console.log('🧪 Testando identificação de concorrentes atualizada\n');
  
  // Invalida cache para forçar reload
  invalidateTagCache();
  
  const testCases = [
    'WMcCann conquista conta da Coca-Cola',
    'VMLY&R lança campanha inovadora',
    'Galeria.ag ganha prêmio no Cannes',
    'Suno United Creators fecha contrato com Magazine Luiza',
    'Ogilvy & Mather vence pitch da Ambev',
    'DPZ&T cria ação para o Bradesco',
    'Talent Marcel é premiada no Festival',
    'Fbiz lança projeto digital para Natura',
    'GUT São Paulo abre nova operação',
    'Wieden+Kennedy Brasil ganha conta',
    'Aldeiah cria campanha para Itaú',
    'Dentsu Creative Brasil expande operação',
    'Euphoria Creative vence pitch',
    'LePub lança ação criativa',
    'Accenture Song transforma marca',
    'Tech And Soul fecha contrato digital',
    'Streetwise ganha conta de startup',
    'Cheil Brasil cria experiência conectada',
    'CP+B internacional chega ao Brasil',
    'Paim Comunicação expande no Sul',
  ];
  
  console.log('🎯 Testando identificação:\n');
  
  let identified = 0;
  let notIdentified = 0;
  
  for (const title of testCases) {
    const tags = await identificarTags(title);
    const hasConcorrentes = tags.includes('Concorrentes');
    
    if (hasConcorrentes) {
      console.log(`✅ "${title}"`);
      console.log(`   Tags: ${tags.join(', ')}\n`);
      identified++;
    } else {
      console.log(`❌ "${title}"`);
      console.log(`   Tags: ${tags.join(', ') || 'Nenhuma'}\n`);
      notIdentified++;
    }
  }
  
  console.log('\n📊 Resultado:');
  console.log(`   ✅ Identificados: ${identified}/${testCases.length}`);
  console.log(`   ❌ Não identificados: ${notIdentified}/${testCases.length}`);
  console.log(`   📈 Taxa de sucesso: ${(identified / testCases.length * 100).toFixed(1)}%`);
}

testConcorrentesTag()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
