import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { identificarTags, invalidateTagCache } from '@/lib/tag-helper';

const prisma = new PrismaClient();

// POST - Re-processar tags em todos os artigos
export async function POST() {
  try {
    console.log('🔄 Iniciando re-processamento de tags...');
    
    // Invalida cache para garantir que está usando tags atualizadas
    invalidateTagCache();
    
    // Buscar todos os artigos
    const articles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        tags: true
      }
    });
    
    let updated = 0;
    let processed = 0;
    
    for (const article of articles) {
      processed++;
      
      const texto = `${article.title} ${article.summary || ''}`;
      const newTags = await identificarTags(texto);
      
      // Comparar com tags antigas
      const oldTags = article.tags ? JSON.parse(article.tags) : [];
      
      // Atualizar apenas se houver mudança
      if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
        await prisma.newsArticle.update({
          where: { id: article.id },
          data: {
            tags: newTags.length > 0 ? JSON.stringify(newTags) : null
          }
        });
        updated++;
      }
      
      // Log de progresso a cada 100 artigos
      if (processed % 100 === 0) {
        console.log(`   Processados: ${processed}/${articles.length}...`);
      }
    }
    
    console.log(`✅ Re-processamento concluído: ${updated} artigos atualizados`);
    
    return NextResponse.json({
      success: true,
      message: 'Tags re-processadas com sucesso',
      totalProcessed: articles.length,
      totalUpdated: updated
    });
    
  } catch (error) {
    console.error('Erro ao re-processar tags:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao re-processar tags' 
      },
      { status: 500 }
    );
  }
}
