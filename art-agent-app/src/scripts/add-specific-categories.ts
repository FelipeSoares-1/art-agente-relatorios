import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSpecificCategories() {
  console.log('➕ ADICIONANDO CATEGORIAS ESPECÍFICAS\n');

  const newCategories = [
    {
      name: 'Novos Clientes',
      keywords: JSON.stringify([
        'novo cliente', 'conquista', 'contrato', 'fechou conta', 
        'venceu concorrência', 'nova conta', 'cliente novo',
        'assinou contrato', 'escolheu agência', 'agência eleita'
      ]),
      color: '#10b981'
    },
    {
      name: 'Eventos',
      keywords: JSON.stringify([
        'festival', 'congresso', 'seminário', 'palestra', 'cannes', 
        'ccsp', 'rio2c', 'evento', 'conferência', 'workshop',
        'encontro', 'feira', 'exposição'
      ]),
      color: '#ec4899'
    },
    {
      name: 'Prêmios de Publicidade',
      keywords: JSON.stringify([
        'prêmio publicitário', 'cannes lions', 'festival de cannes',
        'gran prix', 'leão de ouro', 'leão de prata', 'leão de bronze',
        'effie', 'colunistas', 'profissionais do ano', 'award',
        'premiação publicitária', 'reconhecimento publicitário'
      ]),
      color: '#f59e0b'
    }
  ];

  for (const category of newCategories) {
    try {
      // Verifica se já existe
      const existing = await prisma.tagCategory.findUnique({
        where: { name: category.name }
      });

      if (existing) {
        console.log(`⚪ Categoria "${category.name}" já existe`);
      } else {
        await prisma.tagCategory.create({
          data: category
        });
        console.log(`✅ Criada categoria: "${category.name}"`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar categoria "${category.name}":`, error);
    }
  }

  console.log('\n🎯 CATEGORIAS FINAIS NO SISTEMA:');
  const allCategories = await prisma.tagCategory.findMany({
    where: { enabled: true },
    select: { 
      name: true,
      keywords: true 
    },
    orderBy: { name: 'asc' }
  });

  allCategories.forEach(category => {
    const keywords = JSON.parse(category.keywords);
    console.log(`  ✅ ${category.name}: ${keywords.slice(0, 3).join(', ')}${keywords.length > 3 ? ` + ${keywords.length - 3} mais` : ''}`);
  });

  console.log(`\n📊 Total: ${allCategories.length} categorias ativas`);

  await prisma.$disconnect();
  console.log('\n✅ Configuração das categorias concluída!');
}

addSpecificCategories().catch(console.error);