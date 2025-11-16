import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function improveCategories() {
  console.log('🔧 MELHORANDO PALAVRAS-CHAVE DAS CATEGORIAS\n');

  const categoryUpdates = [
    {
      name: 'Concorrentes',
      keywords: JSON.stringify([
        // Agências principais
        'AlmapBBDO', 'almap', 'bbdo', 'WMcCann', 'mccann', 'ogilvy', 'DDB', 'Publicis',
        'VMLY&R', 'vmly', 'Grey', 'Havas', 'Lew\'Lara', 'lew lara', 'Wunderman',
        'Africa Creative', 'africa', 'Sunset', 'Soko', 'Gut', 'Galeria',
        'Talent Marcel', 'talent', 'marcel',
        // Termos gerais
        'agência', 'agencia', 'holding publicitária', 'grupo publicitário',
        'agência digital', 'agência criativa', 'concorrente', 'competidor'
      ])
    },
    {
      name: 'Novos Clientes', 
      keywords: JSON.stringify([
        'novo cliente', 'nova conta', 'conquista', 'contrato', 'fechou conta',
        'venceu concorrência', 'cliente novo', 'assinou contrato', 'escolheu agência',
        'agência eleita', 'pitch', 'concorrência', 'seleção de agência',
        'fechou negócio', 'conquistou conta', 'vence', 'nova parceria'
      ])
    },
    {
      name: 'Eventos',
      keywords: JSON.stringify([
        'festival', 'congresso', 'seminário', 'palestra', 'cannes', 'ccsp', 'rio2c',
        'evento', 'conferência', 'workshop', 'encontro', 'feira', 'exposição',
        'summit', 'fórum', 'convenção', 'simpósio', 'masterclass'
      ])
    }
  ];

  for (const update of categoryUpdates) {
    try {
      const result = await prisma.tagCategory.update({
        where: { name: update.name },
        data: { keywords: update.keywords }
      });
      
      console.log(`✅ Atualizada categoria "${update.name}"`);
      const keywords = JSON.parse(update.keywords);
      console.log(`   Keywords: ${keywords.slice(0, 5).join(', ')} + ${keywords.length - 5} mais\n`);
      
    } catch (error) {
      console.error(`❌ Erro ao atualizar "${update.name}":`, error);
    }
  }

  console.log('🧪 Testando novamente...\n');
  
  // Invalidar cache
  const { invalidateTagCache, identificarTags } = await import('../lib/tag-helper');
  invalidateTagCache();
  
  const testCases = [
    "AlmapBBDO vence nova conta da Coca-Cola",
    "Festival CCSP reúne grandes nomes da publicidade", 
    "Ogilvy assina contrato com novo cliente",
    "WMcCann conquista pitch da Samsung"
  ];

  for (const testCase of testCases) {
    console.log(`📝 "${testCase}"`);
    const tags = await identificarTags(testCase);
    console.log(`   ✅ Tags: [${tags.join(', ')}]\n`);
  }

  await prisma.$disconnect();
  console.log('✅ Categorias aprimoradas!');
}

improveCategories().catch(console.error);