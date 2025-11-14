import { identificarTags, loadTagCategories } from './src/lib/tag-helper';

async function testDynamicTags() {
  console.log('🧪 Testando sistema de tags dinâmicas\n');
  
  // 1. Carregar categorias
  console.log('📋 Categorias disponíveis:');
  const categories = await loadTagCategories();
  categories.forEach(cat => {
    console.log(`  🏷️  ${cat.name} (${cat.color})`);
    console.log(`      Keywords: ${cat.keywords.join(', ')}\n`);
  });
  
  // 2. Testar identificação de tags
  const testCases = [
    {
      title: 'Africa conquista nova conta da Coca-Cola',
      description: 'Agência Africa vence pitch e se torna a nova agência da marca'
    },
    {
      title: 'Campanha da Artplan ganha prêmio no Festival de Cannes',
      description: 'Filme publicitário leva Leão de Ouro na categoria inovação'
    },
    {
      title: 'AlmapBBDO lança ação de marketing digital no Instagram',
      description: 'Campanha utiliza influencers e redes sociais para engajar público'
    },
    {
      title: 'Festival CCSP reúne maiores nomes da publicidade brasileira',
      description: 'Evento acontece em São Paulo com palestras e seminários'
    },
    {
      title: 'IA transforma mercado publicitário com novas tecnologias',
      description: 'Inteligência artificial e metaverso prometem revolucionar o setor'
    }
  ];
  
  console.log('\n🎯 Testando identificação de tags:\n');
  for (const testCase of testCases) {
    const texto = `${testCase.title} ${testCase.description}`;
    const tags = await identificarTags(texto);
    
    console.log(`📰 "${testCase.title}"`);
    console.log(`   Tags: ${tags.length > 0 ? tags.join(', ') : 'Nenhuma tag identificada'}`);
    console.log('');
  }
  
  console.log('✅ Teste concluído!');
}

testDynamicTags()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
