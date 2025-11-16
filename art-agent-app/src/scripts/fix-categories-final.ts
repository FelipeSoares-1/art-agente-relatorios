import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCategoriesFinal() {
  console.log('🔨 CORREÇÃO FINAL DAS CATEGORIAS\n');

  // 1. Primeiro, adicionar as categorias que estão faltando
  const missingCategories = [
    {
      name: 'Novos Clientes',
      keywords: JSON.stringify([
        'novo cliente', 'nova conta', 'conquista', 'vence', 'venceu',
        'contrato', 'fechou conta', 'conquistou conta', 'pitch'
      ]),
      color: '#10b981'
    },
    {
      name: 'Eventos', 
      keywords: JSON.stringify([
        'festival', 'congresso', 'seminário', 'palestra', 'cannes',
        'ccsp', 'CCSP', 'rio2c', 'evento', 'conferência'
      ]),
      color: '#ec4899'
    }
  ];

  console.log('➕ Adicionando categorias faltantes:');
  for (const category of missingCategories) {
    try {
      // Verificar se existe
      const existing = await prisma.tagCategory.findUnique({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.tagCategory.create({ data: category });
        console.log(`  ✅ Criada: ${category.name}`);
      } else {
        console.log(`  ⚪ Já existe: ${category.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Erro com ${category.name}:`, error);
    }
  }

  // 2. Corrigir Artplan para case insensitive  
  console.log('\n🔧 Atualizando Artplan:');
  try {
    await prisma.tagCategory.update({
      where: { name: 'Artplan' },
      data: { 
        keywords: JSON.stringify(['artplan', 'Artplan', 'ArtPlan', 'Art Plan'])
      }
    });
    console.log('  ✅ Artplan atualizada para case insensitive');
  } catch (error) {
    console.error('  ❌ Erro ao atualizar Artplan:', error);
  }

  // 3. Teste final completo
  console.log('\n🧪 TESTE FINAL COMPLETO:\n');
  
  const { invalidateTagCache, identificarTags } = await import('../lib/tag-helper');
  invalidateTagCache();

  const finalTests = [
    "AlmapBBDO vence nova conta da Coca-Cola",
    "Artplan cria campanha inovadora",
    "Festival CCSP reúne publicitários",
    "Ogilvy conquistou pitch da Nike", 
    "Cannes Lions premia agência brasileira"
  ];

  for (const test of finalTests) {
    console.log(`📝 "${test}"`);
    const tags = await identificarTags(test);
    console.log(`   ✅ Tags detectadas: [${tags.join(', ') || 'nenhuma'}]\n`);
  }

  // 4. Verificar todas as categorias
  console.log('📊 CATEGORIAS FINAIS:');
  const allCategories = await prisma.tagCategory.findMany({
    where: { enabled: true },
    select: { name: true }
  });

  allCategories.forEach(cat => {
    console.log(`  • ${cat.name}`);
  });

  console.log(`\nTotal: ${allCategories.length} categorias ativas`);

  await prisma.$disconnect();
  console.log('\n🎉 CORREÇÃO FINALIZADA!');
}

fixCategoriesFinal().catch(console.error);