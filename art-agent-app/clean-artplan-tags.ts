import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanArtplanTags() {
  try {
    console.log('\n🧹 LIMPANDO TAGS "ARTPLAN" INCORRETAS\n');
    console.log('='.repeat(60));
    
    // Buscar todos os artigos
    const allArticles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        tags: true
      }
    });
    
    console.log(`\n📊 Total de artigos: ${allArticles.length}`);
    
    let articlesWithArtplanTag = 0;
    let articlesUpdated = 0;
    
    for (const article of allArticles) {
      if (article.tags) {
        try {
          const tags = JSON.parse(article.tags);
          
          // Verificar se tem tag "Artplan"
          if (tags.includes('Artplan')) {
            articlesWithArtplanTag++;
            
            // Remover tag "Artplan"
            const newTags = tags.filter((tag: string) => tag !== 'Artplan');
            
            // Atualizar artigo
            await prisma.newsArticle.update({
              where: { id: article.id },
              data: {
                tags: JSON.stringify(newTags)
              }
            });
            
            articlesUpdated++;
            
            if (articlesUpdated % 50 === 0) {
              console.log(`   ✅ ${articlesUpdated} artigos limpos...`);
            }
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    }
    
    console.log(`\n✅ Limpeza concluída!`);
    console.log(`   Artigos com tag "Artplan": ${articlesWithArtplanTag}`);
    console.log(`   Artigos atualizados: ${articlesUpdated}`);
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanArtplanTags();
