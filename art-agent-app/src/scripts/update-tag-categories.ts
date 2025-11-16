import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTagCategories() {
  console.log('🔧 ATUALIZANDO CATEGORIAS DE TAGS NO BANCO\n');

  const problematicTags = ['Inovação', 'Campanhas', 'Mercado', 'Digital', 'Prêmios'];
  
  console.log('❌ Removendo categorias problemáticas:');
  
  for (const tagName of problematicTags) {
    try {
      const result = await prisma.tagCategory.deleteMany({
        where: {
          name: tagName
        }
      });
      
      if (result.count > 0) {
        console.log(`  ✅ Removida: "${tagName}" (${result.count} registro(s))`);
      } else {
        console.log(`  ⚪ Não encontrada: "${tagName}"`);
      }
    } catch (error) {
      console.error(`  ❌ Erro ao remover "${tagName}":`, error);
    }
  }

  console.log('\n🔍 Categorias restantes no banco:');
  const remainingCategories = await prisma.tagCategory.findMany({
    where: { enabled: true },
    select: {
      name: true,
      keywords: true,
      enabled: true
    },
    orderBy: { name: 'asc' }
  });

  if (remainingCategories.length === 0) {
    console.log('⚠️ Nenhuma categoria encontrada! Criando categorias específicas...');
    
    // Criar categorias específicas e úteis
    const specificCategories = [
      {
        name: 'Concorrentes',
        keywords: JSON.stringify([
          'africa', 'almap', 'bbdo', 'talent', 'ddb', 'grey', 'havas',
          'lew lara', 'mccann', 'ogilvy', 'publicis', 'wunderman',
          'africa creative', 'sunset', 'soko', 'gut', 'galeria',
          'agência', 'holding publicitária', 'grupo publicitário'
        ]),
        color: '#ef4444'
      },
      {
        name: 'Novos Clientes',
        keywords: JSON.stringify([
          'novo cliente', 'conquista', 'contrato', 'fechou conta', 
          'venceu concorrência', 'nova conta', 'cliente novo'
        ]),
        color: '#10b981'
      },
      {
        name: 'Eventos',
        keywords: JSON.stringify([
          'festival', 'congresso', 'seminário', 'palestra', 'cannes', 
          'ccsp', 'rio2c', 'evento', 'conferência'
        ]),
        color: '#ec4899'
      },
      {
        name: 'Artplan',
        keywords: JSON.stringify([
          'artplan', 'art plan'
        ]),
        color: '#f97316'
      }
    ];

    for (const category of specificCategories) {
      try {
        await prisma.tagCategory.create({
          data: category
        });
        console.log(`  ✅ Criada categoria: "${category.name}"`);
      } catch (error) {
        console.error(`  ❌ Erro ao criar categoria "${category.name}":`, error);
      }
    }
  } else {
    remainingCategories.forEach(category => {
      const keywords = JSON.parse(category.keywords);
      console.log(`  ✅ ${category.name}: ${keywords.slice(0, 3).join(', ')}${keywords.length > 3 ? '...' : ''}`);
    });
  }

  console.log('\n🎯 RESULTADO FINAL:');
  const finalCategories = await prisma.tagCategory.findMany({
    where: { enabled: true },
    select: { name: true }
  });
  
  console.log(`Total de categorias ativas: ${finalCategories.length}`);
  finalCategories.forEach(cat => console.log(`  • ${cat.name}`));

  // Invalidar cache do tag-helper
  console.log('\n🔄 Limpando cache de categorias...');
  
  await prisma.$disconnect();
  console.log('\n✅ Atualização das categorias concluída!');
}

updateTagCategories().catch(console.error);