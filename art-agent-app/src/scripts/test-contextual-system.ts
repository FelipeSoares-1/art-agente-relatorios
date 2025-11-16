import { PrismaClient } from '@prisma/client';
import { invalidateTagCache, identificarTags } from '../lib/tag-helper';

const prisma = new PrismaClient();

async function testContextualSystem() {
  console.log('🚀 TESTE DO SISTEMA COMPLETO COM VERIFICAÇÃO CONTEXTUAL\n');

  // Invalidar cache para garantir dados frescos
  invalidateTagCache();
  console.log('🔄 Cache limpo para testes frescos\n');

  // Casos de teste abrangentes para todas as tags
  const testCases = [
    // CONCORRENTES
    {
      text: "AlmapBBDO lança nova campanha para Coca-Cola",
      feedName: "Meio & Mensagem",
      expected: ["Concorrentes"],
      category: "CONCORRENTES"
    },
    {
      text: "WMcCann vence concorrência da Samsung",
      feedName: "Propmark", 
      expected: ["Concorrentes", "Novos Clientes"],
      category: "CONCORRENTES + NOVOS CLIENTES"
    },

    // NOVOS CLIENTES
    {
      text: "Ogilvy conquistou nova conta da Nike após pitch acirrado",
      feedName: "AdNews",
      expected: ["Concorrentes", "Novos Clientes"],
      category: "NOVOS CLIENTES"
    },
    {
      text: "DDB fecha contrato com cliente Volkswagen",
      feedName: "Meio & Mensagem",
      expected: ["Concorrentes", "Novos Clientes"],
      category: "NOVOS CLIENTES"
    },

    // EVENTOS
    {
      text: "Festival CCSP 2025 reúne grandes nomes da publicidade brasileira",
      feedName: "Propmark",
      expected: ["Eventos"],
      category: "EVENTOS"
    },
    {
      text: "Cannes Lions anuncia programação com palestrantes internacionais",
      feedName: "Marcas Pelo Mundo",
      expected: ["Eventos"],
      category: "EVENTOS"
    },
    {
      text: "Rio2C apresenta tendências do marketing digital",
      feedName: "AdNews",
      expected: ["Eventos"],
      category: "EVENTOS"
    },

    // PRÊMIOS DE PUBLICIDADE
    {
      text: "Agência brasileira leva Leão de Ouro em Cannes Lions",
      feedName: "Meio & Mensagem",
      expected: ["Prêmios de Publicidade"],
      category: "PRÊMIOS"
    },
    {
      text: "Campanha da Natura vence Effie Awards Brasil 2025",
      feedName: "Propmark",
      expected: ["Prêmios de Publicidade"],
      category: "PRÊMIOS"
    },

    // ARTPLAN
    {
      text: "Artplan cria campanha sustentável para Petrobras",
      feedName: "Meio & Mensagem",
      expected: ["Artplan"],
      category: "ARTPLAN"
    },
    {
      text: "Nova equipe da Artplan reforça área de planejamento",
      feedName: "AdNews",
      expected: ["Artplan"],
      category: "ARTPLAN"
    },

    // CASOS NEGATIVOS (não devem gerar tags)
    {
      text: "Empresa de tecnologia lança novo aplicativo de compras",
      feedName: "TechCrunch",
      expected: [],
      category: "CASO NEGATIVO"
    },
    {
      text: "Festival de música rock acontece no final de semana",
      feedName: "Portal de Música",
      expected: [],
      category: "CASO NEGATIVO"
    },
    {
      text: "Banco anuncia novo produto de investimento",
      feedName: "Valor Econômico",
      expected: [],
      category: "CASO NEGATIVO"
    }
  ];

  let perfectMatches = 0;
  let partialMatches = 0;
  const totalTests = testCases.length;

  console.log('🧪 EXECUÇÃO DOS TESTES:\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. ${testCase.category}`);
    console.log(`   📝 "${testCase.text}"`);
    console.log(`   📺 Feed: ${testCase.feedName}`);

    const detectedTags = await identificarTags(testCase.text, testCase.feedName);
    console.log(`   🔍 Detectadas: [${detectedTags.join(', ') || 'nenhuma'}]`);
    console.log(`   🎯 Esperadas: [${testCase.expected.join(', ') || 'nenhuma'}]`);

    // Verificação de precisão
    const hasAllExpected = testCase.expected.every(tag => detectedTags.includes(tag));
    const hasOnlyExpected = detectedTags.every(tag => testCase.expected.includes(tag));
    
    if (hasAllExpected && hasOnlyExpected) {
      console.log(`   ✅ PERFEITO\n`);
      perfectMatches++;
    } else if (hasAllExpected) {
      console.log(`   ⚡ PARCIAL (detectou tags extras: ${detectedTags.filter(tag => !testCase.expected.includes(tag)).join(', ')})\n`);
      partialMatches++;
    } else {
      const missingTags = testCase.expected.filter(tag => !detectedTags.includes(tag));
      console.log(`   ❌ FALHOU (tags faltando: ${missingTags.join(', ')})\n`);
    }
  }

  // Relatório final
  console.log('📊 RELATÓRIO FINAL DOS TESTES:\n');
  console.log(`✅ Matches perfeitos: ${perfectMatches}/${totalTests} (${((perfectMatches / totalTests) * 100).toFixed(1)}%)`);
  console.log(`⚡ Matches parciais: ${partialMatches}/${totalTests} (${((partialMatches / totalTests) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhas: ${totalTests - perfectMatches - partialMatches}/${totalTests} (${(((totalTests - perfectMatches - partialMatches) / totalTests) * 100).toFixed(1)}%)`);

  const overallSuccessRate = ((perfectMatches + partialMatches) / totalTests) * 100;
  console.log(`\n🎯 TAXA DE SUCESSO GERAL: ${overallSuccessRate.toFixed(1)}%`);
  
  if (perfectMatches >= Math.ceil(totalTests * 0.85)) {
    console.log('\n🎉 SISTEMA APROVADO COM EXCELÊNCIA!');
    console.log('✨ Verificação contextual implementada com sucesso em todas as tags!');
  } else if (perfectMatches >= Math.ceil(totalTests * 0.7)) {
    console.log('\n👍 SISTEMA APROVADO - Bom desempenho geral');
  } else {
    console.log('\n⚠️ Sistema precisa de ajustes adicionais');
  }

  // Estatísticas do banco
  console.log('\n📈 ESTATÍSTICAS DO BANCO DE DADOS:');
  const totalArticles = await prisma.newsArticle.count();
  const articlesWithTags = await prisma.newsArticle.count({
    where: {
      AND: [
        { tags: { not: null } },
        { tags: { not: '' } }
      ]
    }
  });

  console.log(`Total de artigos: ${totalArticles}`);
  console.log(`Com tags: ${articlesWithTags} (${((articlesWithTags / totalArticles) * 100).toFixed(1)}%)`);
  console.log(`Sem tags: ${totalArticles - articlesWithTags}`);

  await prisma.$disconnect();
  console.log('\n🚀 TESTE COMPLETO FINALIZADO!');
}

testContextualSystem().catch(console.error);