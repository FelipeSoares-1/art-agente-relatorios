import { PrismaClient } from '@prisma/client';
import { debugArtplanScoring } from '../lib/artplan';

const prisma = new PrismaClient();

async function analyzeArtplanDetection() {
  console.log('🔍 ANÁLISE DA DETECÇÃO DE ARTPLAN\n');

  // Buscar artigos que mencionam "artplan" para ver o que está sendo perdido
  const articlesWithArtplan = await prisma.newsArticle.findMany({
    where: {
      OR: [
        { title: { contains: 'artplan' } },
        { title: { contains: 'Art' } },
        { summary: { contains: 'artplan' } },
        { summary: { contains: 'Art' } }
      ]
    },
    include: {
      feed: {
        select: { name: true }
      }
    },
    take: 30,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📊 Encontrados ${articlesWithArtplan.length} artigos mencionando "artplan":\n`);

  // Analisar cada artigo
  for (const article of articlesWithArtplan.slice(0, 10)) {
    console.log(`📰 "${article.title}"`);
    console.log(`   Feed: ${article.feed.name}`);
    console.log(`   Data: ${article.createdAt.toLocaleDateString('pt-BR')}`);
    
    // Debug do scoring atual
    const content = `${article.title} ${article.summary || ''}`;
    const scoring = debugArtplanScoring(content, article.feed.name);
    
    console.log(`   Score atual: ${scoring.score}`);
    console.log(`   Detalhes: ${scoring.details.join(', ')}`);
    
    // Verificar se tem tag Artplan
    const hasArtplanTag = article.tags && article.tags.includes('Artplan');
    console.log(`   Tag Artplan: ${hasArtplanTag ? '✅ SIM' : '❌ NÃO'}`);
    
    console.log('');
  }

  // Contar quantos artigos com Artplan atualmente no banco
  const articlesWithArtplanTag = await prisma.newsArticle.count({
    where: {
      tags: { contains: 'Artplan' }
    }
  });

  console.log(`📈 ESTATÍSTICAS:`);
  console.log(`• Artigos mencionando "artplan": ${articlesWithArtplan.length}`);
  console.log(`• Artigos com tag "Artplan": ${articlesWithArtplanTag}`);
  console.log(`• Taxa de detecção: ${((articlesWithArtplanTag / articlesWithArtplan.length) * 100).toFixed(1)}%`);

  await prisma.$disconnect();
}

analyzeArtplanDetection().catch(console.error);