import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableAllCategories() {
  console.log('⚡ HABILITANDO TODAS AS CATEGORIAS\n');

  // Habilitar todas as categorias
  const result = await prisma.tagCategory.updateMany({
    where: { enabled: false },
    data: { enabled: true }
  });
  
  console.log(`✅ Habilitadas ${result.count} categorias\n`);

  // Verificar estado final
  console.log('📊 Estado final das categorias:');
  const allCategories = await prisma.tagCategory.findMany({
    select: { name: true, enabled: true }
  });

  allCategories.forEach(cat => {
    console.log(`  ${cat.enabled ? '✅' : '❌'} ${cat.name}`);
  });

  await prisma.$disconnect();
  console.log('\n🎉 Todas as categorias habilitadas!');
}

enableAllCategories().catch(console.error);