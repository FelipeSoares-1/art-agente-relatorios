import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTagCategories() {
  console.log('🌱 Populando categorias de tags padrão...');

  const defaultCategories = [
    {
      name: 'Novos Clientes',
      keywords: ['novo cliente', 'conquista', 'contrato', 'fechou conta', 'venceu concorrência'],
      color: '#10b981', // green
    },
    {
      name: 'Campanhas',
      keywords: ['campanha', 'lançamento', 'ação', 'projeto', 'iniciativa'],
      color: '#3b82f6', // blue
    },
    {
      name: 'Prêmios',
      keywords: ['prêmio', 'premiado', 'venceu', 'troféu', 'medalha', 'leão', 'ouro', 'prata', 'bronze'],
      color: '#f59e0b', // amber
    },
    {
      name: 'Concorrentes',
      keywords: [
        'africa', 'almap', 'bbdo', 'talent', 'ddb', 'grey', 'havas',
        'lew lara', 'mccann', 'ogilvy', 'publicis', 'wunderman',
        'africa creative', 'sunset', 'soko', 'gut', 'galeria'
      ],
      color: '#ef4444', // red
    },
    {
      name: 'Digital',
      keywords: ['digital', 'social media', 'influencer', 'redes sociais', 'instagram', 'tiktok', 'youtube'],
      color: '#8b5cf6', // purple
    },
    {
      name: 'Inovação',
      keywords: ['ia', 'inteligência artificial', 'tecnologia', 'inovação', 'metaverso', 'nft', 'web3'],
      color: '#06b6d4', // cyan
    },
    {
      name: 'Eventos',
      keywords: ['festival', 'congresso', 'seminário', 'palestra', 'cannes', 'ccsp', 'rio2c'],
      color: '#ec4899', // pink
    },
    {
      name: 'Mercado',
      keywords: ['mercado', 'investimento', 'fusão', 'aquisição', 'faturamento', 'resultado'],
      color: '#6366f1', // indigo
    },
  ];

  for (const category of defaultCategories) {
    try {
      const existing = await prisma.tagCategory.findUnique({
        where: { name: category.name }
      });

      if (existing) {
        console.log(`  ⏭️  "${category.name}" já existe`);
        continue;
      }

      await prisma.tagCategory.create({
        data: {
          name: category.name,
          keywords: JSON.stringify(category.keywords),
          color: category.color,
          enabled: true
        }
      });

      console.log(`  ✅ "${category.name}" criada (${category.keywords.length} keywords)`);
    } catch (error) {
      console.error(`  ❌ Erro ao criar "${category.name}":`, error);
    }
  }

  console.log('\n✨ Seed de tags concluído!');
}

seedTagCategories()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Erro no seed:', error);
    prisma.$disconnect();
    process.exit(1);
  });
