import { PrismaClient } from '@prisma/client';
import { detectarConcorrentes } from '../lib/concorrentes';

const prisma = new PrismaClient();

async function testIntegratedImprovement() {
  console.log('🚀 TESTANDO SISTEMA INTEGRADO APRIMORADO\n');
  
  // Buscar notícias que antes eram marcadas como concorrentes
  const noticias = await prisma.newsArticle.findMany({
    where: {
      tags: { contains: 'Concorrentes' }
    },
    select: {
      title: true,
      summary: true,
      tags: true,
      publishedDate: true,
      link: true,
      feed: {
        select: {
          name: true
        }
      }
    },
    orderBy: { publishedDate: 'desc' },
    take: 20
  });

  console.log('📊 COMPARAÇÃO: SISTEMA ANTIGO vs NOVO INTEGRADO\n');
  console.log('='.repeat(100));

  let antigosRelevantes = 0;
  let novosRelevantes = 0;
  let melhorias = 0;

  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    
    console.log(`\n${i + 1}. ${noticia.title.substring(0, 70)}...`);
    console.log(`   📰 Feed: ${noticia.feed.name}`);
    
    // Sistema antigo (sem verificação contextual)
    const concorrentesAntigos = detectarConcorrentes(`${noticia.title} ${noticia.summary || ''}`);
    const relevanteAntigo = concorrentesAntigos.length > 0;
    
    // Sistema novo (com verificação contextual)
    const concorrentesNovos = detectarConcorrentes(`${noticia.title} ${noticia.summary || ''}`, noticia.feed.name);
    const relevanteNovo = concorrentesNovos.length > 0;
    
    console.log(`   🤖 ANTIGO: ${relevanteAntigo ? '✅ DETECTOU' : '❌ NÃO DETECTOU'} (${concorrentesAntigos.length} agências)`);
    console.log(`   🧠 NOVO:   ${relevanteNovo ? '✅ DETECTOU' : '❌ NÃO DETECTOU'} (${concorrentesNovos.length} agências)`);
    
    if (relevanteAntigo) antigosRelevantes++;
    if (relevanteNovo) novosRelevantes++;
    
    // Análise da mudança
    if (relevanteAntigo && !relevanteNovo) {
      console.log(`   🎯 MELHORIA: Filtrou notícia irrelevante`);
      melhorias++;
    } else if (!relevanteAntigo && relevanteNovo) {
      console.log(`   📈 NOVO: Detectou relevante que antes passava`);
    } else if (relevanteAntigo && relevanteNovo) {
      console.log(`   ✅ MANTIDO: Continua relevante`);
    } else {
      console.log(`   ➖ INALTERADO: Continua não detectado`);
    }
    
    // Mostrar agências detectadas se houver
    if (concorrentesNovos.length > 0) {
      const agencias = concorrentesNovos.map(c => `${c.nome} (${c.nivel})`).join(', ');
      console.log(`   🏢 Agências: ${agencias}`);
    }

    console.log('   ' + '─'.repeat(80));
  }

  console.log(`\n📈 RESULTADOS FINAIS:`);
  console.log(`🤖 Sistema Antigo: ${antigosRelevantes}/20 (${(antigosRelevantes/20*100).toFixed(1)}%)`);
  console.log(`🧠 Sistema Novo:   ${novosRelevantes}/20 (${(novosRelevantes/20*100).toFixed(1)}%)`);
  console.log(`🎯 Melhorias:      ${melhorias} notícias irrelevantes filtradas`);
  
  const reducaoNoise = ((antigosRelevantes - novosRelevantes) / antigosRelevantes * 100).toFixed(1);
  console.log(`📉 Redução de ruído: ${reducaoNoise}%`);
  
  const efficiency = novosRelevantes >= 3 && novosRelevantes <= 8 ? 
    '👍 EXCELENTE' : novosRelevantes < 3 ? '⚠️ MUITO RIGOROSO' : '⚠️ AINDA PERMISSIVO';
  console.log(`🎪 Avaliação: ${efficiency}`);
  
  console.log(`\n💡 RECOMENDAÇÃO:`);
  if (melhorias >= 10) {
    console.log(`✅ Integração bem-sucedida! Filtrou ${melhorias} notícias irrelevantes.`);
    console.log(`🚀 Sistema pronto para produção!`);
  } else if (melhorias >= 5) {
    console.log(`👍 Boa melhoria! Pode ser refinado ainda mais.`);
  } else {
    console.log(`⚠️ Pouca melhoria detectada. Verificar parâmetros.`);
  }
}

testIntegratedImprovement()
  .then(() => {
    console.log('\n✅ Teste do sistema integrado concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no teste integrado:', error);
    process.exit(1);
  });