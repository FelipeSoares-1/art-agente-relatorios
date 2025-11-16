import { PrismaClient } from '@prisma/client';
import { invalidateTagCache, identificarTags } from '../lib/tag-helper';

const prisma = new PrismaClient();

async function finalValidation() {
  console.log('🏁 VALIDAÇÃO FINAL DO SISTEMA OTIMIZADO\n');

  // Invalidar cache para garantir dados atuais
  invalidateTagCache();
  console.log('🔄 Cache invalidado\n');

  // Teste completo com cenários reais
  const testCases = [
    {
      text: "AlmapBBDO vence nova conta da Coca-Cola após pitch acirrado",
      expected: ["Concorrentes", "Novos Clientes"],
      description: "Agência conquistando novo cliente"
    },
    {
      text: "Artplan assina campanha de fim de ano para Natura",
      expected: ["Artplan"],
      description: "Campanha da Artplan"
    },
    {
      text: "Festival CCSP 2025 reúne grandes nomes da publicidade",
      expected: ["Eventos"],
      description: "Evento publicitário"
    },
    {
      text: "Cannes Lions premia agência brasileira com Grand Prix",
      expected: ["Prêmios de Publicidade"],
      description: "Premiação publicitária"
    },
    {
      text: "Ogilvy conquista conta da Nike em concorrência acirrada",
      expected: ["Concorrentes", "Novos Clientes"],
      description: "Concorrente ganhando nova conta"
    },
    {
      text: "WMcCann apresenta nova campanha no Rio2C",
      expected: ["Concorrentes", "Eventos"],
      description: "Agência apresentando em evento"
    }
  ];

  let perfectMatches = 0;
  let partialMatches = 0;

  console.log('🧪 TESTES DE DETECÇÃO:\n');
  
  for (const testCase of testCases) {
    console.log(`📝 ${testCase.description}`);
    console.log(`   Texto: "${testCase.text}"`);
    
    const detectedTags = await identificarTags(testCase.text);
    console.log(`   Detectadas: [${detectedTags.join(', ') || 'nenhuma'}]`);
    console.log(`   Esperadas: [${testCase.expected.join(', ')}]`);
    
    const hasAllExpected = testCase.expected.every(tag => detectedTags.includes(tag));
    const hasOnlyExpected = detectedTags.every(tag => testCase.expected.includes(tag));
    
    if (hasAllExpected && hasOnlyExpected) {
      console.log(`   🎯 PERFEITO\n`);
      perfectMatches++;
    } else if (hasAllExpected) {
      console.log(`   ⚡ PARCIAL (detectou tags extras)\n`);
      partialMatches++;
    } else {
      console.log(`   ❌ FALHOU (tags faltando)\n`);
    }
  }

  // Estatísticas finais do sistema
  console.log('📊 ESTATÍSTICAS FINAIS DO SISTEMA:\n');

  const totalArticles = await prisma.newsArticle.count();
  const articlesWithTags = await prisma.newsArticle.count({
    where: {
      AND: [
        { tags: { not: null } },
        { tags: { not: '' } }
      ]
    }
  });

  const articlesWithoutTags = totalArticles - articlesWithTags;
  const coveragePercentage = ((articlesWithTags / totalArticles) * 100).toFixed(1);

  console.log(`📈 Total de artigos: ${totalArticles}`);
  console.log(`📈 Com tags: ${articlesWithTags} (${coveragePercentage}%)`);
  console.log(`📈 Sem tags: ${articlesWithoutTags} (${(100 - parseFloat(coveragePercentage)).toFixed(1)}%)`);

  // Contagem por categoria ativa
  console.log('\n🏷️ DISTRIBUIÇÃO POR CATEGORIA:');
  
  const articlesWithTags2 = await prisma.newsArticle.findMany({
    where: {
      AND: [
        { tags: { not: null } },
        { tags: { not: '' } }
      ]
    },
    select: { tags: true }
  });

  const tagCounts: { [key: string]: number } = {};
  
  articlesWithTags2.forEach(article => {
    if (!article.tags) return;
    
    const tags = article.tags
      .replace(/[\[\]"]/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTagCounts = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a);

  sortedTagCounts.forEach(([tag, count]) => {
    const percentage = ((count / articlesWithTags) * 100).toFixed(1);
    console.log(`  • ${tag}: ${count} artigos (${percentage}%)`);
  });

  // Resultados dos testes
  console.log('\n🎯 RESULTADOS DOS TESTES:');
  console.log(`✅ Matches perfeitos: ${perfectMatches}/${testCases.length}`);
  console.log(`⚡ Matches parciais: ${partialMatches}/${testCases.length}`);
  console.log(`❌ Falhas: ${testCases.length - perfectMatches - partialMatches}/${testCases.length}`);

  const successRate = ((perfectMatches / testCases.length) * 100).toFixed(1);
  console.log(`📊 Taxa de sucesso: ${successRate}%`);

  if (perfectMatches >= Math.ceil(testCases.length * 0.8)) {
    console.log('\n🎉 SISTEMA VALIDADO COM SUCESSO! 🎉');
    console.log('✅ O sistema de tags foi otimizado e está funcionando corretamente!');
  } else {
    console.log('\n⚠️ Sistema precisa de ajustes adicionais');
  }

  await prisma.$disconnect();
}

finalValidation().catch(console.error);