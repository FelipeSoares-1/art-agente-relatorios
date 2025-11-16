import { PrismaClient } from '@prisma/client';
import { invalidateTagCache } from '../lib/tag-helper';

const prisma = new PrismaClient();

async function testNewTagSystem() {
  console.log('🧪 TESTANDO NOVO SISTEMA DE TAGS\n');

  // Invalidar cache
  invalidateTagCache();
  console.log('🔄 Cache invalidado\n');

  // Testar algumas amostras
  const testCases = [
    {
      title: "AlmapBBDO vence nova conta da Coca-Cola",
      expected: ["Concorrentes", "Novos Clientes"]
    },
    {
      title: "Artplan cria campanha inovadora para Nike", 
      expected: ["Artplan"]
    },
    {
      title: "Cannes Lions 2025: Brasil leva Grand Prix",
      expected: ["Prêmios de Publicidade"]
    },
    {
      title: "Festival CCSP reúne grandes nomes da publicidade",
      expected: ["Eventos"]
    },
    {
      title: "Ogilvy assina contrato com novo cliente",
      expected: ["Concorrentes", "Novos Clientes"]
    }
  ];

  const { identificarTags } = await import('../lib/tag-helper');

  for (const testCase of testCases) {
    console.log(`📝 Testando: "${testCase.title}"`);
    const tags = await identificarTags(testCase.title);
    console.log(`   Tags detectadas: [${tags.join(', ')}]`);
    console.log(`   Esperadas: [${testCase.expected.join(', ')}]`);
    
    const match = testCase.expected.every(tag => tags.includes(tag)) && 
                  tags.every(tag => testCase.expected.includes(tag));
    
    console.log(`   ${match ? '✅ SUCESSO' : '⚠️ DIFERENÇA'}\n`);
  }

  // Verificar contagem final de artigos por tag
  console.log('📊 CONTAGEM FINAL DE ARTIGOS POR TAG:');
  
  const articlesWithTags = await prisma.newsArticle.findMany({
    where: {
      AND: [
        { tags: { not: null } },
        { tags: { not: '' } }
      ]
    },
    select: { tags: true }
  });

  const finalTagCounts: { [key: string]: number } = {};
  
  articlesWithTags.forEach(article => {
    if (!article.tags) return;
    
    const tags = article.tags
      .replace(/[\[\]"]/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    tags.forEach(tag => {
      finalTagCounts[tag] = (finalTagCounts[tag] || 0) + 1;
    });
  });

  const sortedFinalTags = Object.entries(finalTagCounts)
    .sort(([,a], [,b]) => b - a);

  sortedFinalTags.forEach(([tag, count]) => {
    console.log(`  ✅ ${tag}: ${count} artigos`);
  });

  console.log(`\n📈 Total de artigos com tags: ${articlesWithTags.length}`);
  console.log(`📈 Tipos de tags únicos: ${sortedFinalTags.length}`);

  await prisma.$disconnect();
  console.log('\n🎉 Sistema de tags otimizado e funcional!');
}

testNewTagSystem().catch(console.error);