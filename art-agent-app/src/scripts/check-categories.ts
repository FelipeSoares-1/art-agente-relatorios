import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndCreateCategories() {
  console.log('🔍 VERIFICANDO ESTADO ATUAL DO BANCO\n');

  // Listar todas as categorias
  const allCategories = await prisma.tagCategory.findMany();
  console.log('📊 Todas as categorias no banco:');
  allCategories.forEach(cat => {
    console.log(`  ${cat.enabled ? '✅' : '❌'} ${cat.name} (ID: ${cat.id})`);
  });

  // Verificar especificamente as que faltam
  const neededCategories = ['Novos Clientes', 'Eventos'];
  
  console.log('\n🔍 Verificando categorias necessárias:');
  for (const categoryName of neededCategories) {
    const exists = allCategories.find(cat => cat.name === categoryName);
    console.log(`  ${exists ? '✅' : '❌'} ${categoryName}: ${exists ? 'Existe' : 'NÃO EXISTE'}`);
  }

  // Criar as categorias que faltam
  console.log('\n➕ Criando categorias faltantes:');
  
  const categoriesToCreate = [
    {
      name: 'Novos Clientes',
      keywords: JSON.stringify(['novo cliente', 'nova conta', 'conquista', 'vence', 'venceu', 'contrato', 'pitch']),
      color: '#10b981'
    },
    {
      name: 'Eventos',
      keywords: JSON.stringify(['festival', 'evento', 'congresso', 'seminário', 'ccsp', 'cannes', 'conferência']),
      color: '#ec4899'
    }
  ];

  for (const category of categoriesToCreate) {
    const exists = allCategories.find(cat => cat.name === category.name);
    
    if (!exists) {
      try {
        await prisma.tagCategory.create({ data: category });
        console.log(`  ✅ Criada: ${category.name}`);
      } catch (error) {
        console.error(`  ❌ Erro ao criar ${category.name}:`, error);
      }
    } else {
      console.log(`  ⚪ ${category.name} já existe`);
    }
  }

  // Verificação final
  console.log('\n📊 Estado final:');
  const finalCategories = await prisma.tagCategory.findMany({ 
    where: { enabled: true },
    select: { name: true, keywords: true }
  });
  
  finalCategories.forEach(cat => {
    const keywords = JSON.parse(cat.keywords);
    console.log(`  ✅ ${cat.name}: ${keywords.slice(0, 3).join(', ')}...`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Verificação completa!');
}

checkAndCreateCategories().catch(console.error);