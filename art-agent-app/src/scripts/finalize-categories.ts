import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalizeCategories() {
  console.log('🎯 FINALIZANDO CONFIGURAÇÃO DAS CATEGORIAS\n');

  const finalUpdates = [
    {
      name: 'Novos Clientes',
      keywords: JSON.stringify([
        'novo cliente', 'nova conta', 'conquista', 'contrato', 'fechou conta',
        'venceu concorrência', 'cliente novo', 'assinou contrato', 'escolheu agência',
        'agência eleita', 'pitch', 'concorrência', 'seleção de agência',
        'fechou negócio', 'conquistou conta', 'vence', 'nova parceria',
        'conquista conta', 'vence pitch', 'pitch vencedor', 'conta conquistada'
      ])
    },
    {
      name: 'Eventos',
      keywords: JSON.stringify([
        'festival', 'congresso', 'seminário', 'palestra', 'cannes', 
        'ccsp', 'CCSP', 'rio2c', 'Rio2c', 'RIO2C',
        'evento', 'conferência', 'workshop', 'encontro', 'feira', 'exposição',
        'summit', 'fórum', 'convenção', 'simpósio', 'masterclass'
      ])
    }
  ];

  for (const update of finalUpdates) {
    try {
      await prisma.tagCategory.update({
        where: { name: update.name },
        data: { keywords: update.keywords }
      });
      
      console.log(`✅ Finalizada categoria "${update.name}"`);
      
    } catch (error) {
      console.error(`❌ Erro ao finalizar "${update.name}":`, error);
    }
  }

  console.log('\n🧪 TESTE FINAL:\n');
  
  const { invalidateTagCache, identificarTags } = await import('../lib/tag-helper');
  invalidateTagCache();
  
  const finalTests = [
    {
      text: "AlmapBBDO vence nova conta da Coca-Cola",
      expected: ["Concorrentes", "Novos Clientes"]
    },
    {
      text: "Festival CCSP reúne grandes nomes da publicidade",
      expected: ["Eventos"]
    },
    {
      text: "Ogilvy conquista conta da Nike após pitch acirrado",
      expected: ["Concorrentes", "Novos Clientes"]
    },
    {
      text: "Artplan cria nova campanha",
      expected: ["Artplan"]
    },
    {
      text: "Cannes Lions premia agência brasileira com Grand Prix",
      expected: ["Prêmios de Publicidade"]
    }
  ];

  let successCount = 0;
  
  for (const test of finalTests) {
    console.log(`📝 "${test.text}"`);
    const tags = await identificarTags(test.text);
    console.log(`   Detectadas: [${tags.join(', ')}]`);
    console.log(`   Esperadas: [${test.expected.join(', ')}]`);
    
    const hasAllExpected = test.expected.every(tag => tags.includes(tag));
    const hasOnlyExpected = tags.every(tag => test.expected.includes(tag));
    const isCorrect = hasAllExpected && hasOnlyExpected;
    
    console.log(`   ${isCorrect ? '✅ PERFEITO' : hasAllExpected ? '⚡ PARCIAL' : '❌ FALHOU'}\n`);
    
    if (isCorrect) successCount++;
  }

  console.log(`📊 RESULTADO FINAL: ${successCount}/${finalTests.length} testes perfeitos\n`);

  // Mostrar estatísticas finais
  console.log('📈 ESTATÍSTICAS FINAIS DO SISTEMA:');
  
  const articlesWithTags = await prisma.newsArticle.count({
    where: {
      AND: [
        { tags: { not: null } },
        { tags: { not: '' } }
      ]
    }
  });

  const totalArticles = await prisma.newsArticle.count();
  const percentage = ((articlesWithTags / totalArticles) * 100).toFixed(1);

  console.log(`  • Total de artigos: ${totalArticles}`);
  console.log(`  • Artigos com tags: ${articlesWithTags} (${percentage}%)`);
  console.log(`  • Artigos sem tags: ${totalArticles - articlesWithTags}`);

  const categories = await prisma.tagCategory.count({ where: { enabled: true } });
  console.log(`  • Categorias ativas: ${categories}`);

  await prisma.$disconnect();
  console.log('\n🎉 SISTEMA DE TAGS OTIMIZADO E FINALIZADO! 🎉');
}

finalizeCategories().catch(console.error);