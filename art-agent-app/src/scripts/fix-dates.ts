import { prisma } from '@/lib/db';
import Parser from 'rss-parser';

// Tipagem para os itens do feed RSS
type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
  content?: string;
};

const parser = new Parser<object, FeedItem>();

// Função melhorada para parsear datas RSS
function parseRSSDate(pubDate: string): Date {
  try {
    const cleanDate = pubDate.trim();
    const date = new Date(cleanDate);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida no RSS: "${pubDate}"`);
    }
    
    return date;
  } catch (error) {
    console.error(`❌ Erro ao parsear data RSS: ${pubDate}`, error);
    throw error; // Re-lança o erro para o chamador lidar
  }
}

async function updateExistingDates() {
  console.log('🔄 Iniciando correção de datas dos artigos existentes...\n');

  try {
    // Buscar todos os feeds (incluindo "Busca Ativa")
    const feeds = await prisma.rSSFeed.findMany();
    console.log(`📡 Encontrados ${feeds.length} feeds para verificar\n`);

    let updatedCount = 0;
    let errorCount = 0;
    let checkedCount = 0;

    for (const feed of feeds) {
      try {
        console.log(`🔍 Processando feed: ${feed.name} (${feed.url})`);
        
        // Buscar artigos existentes deste feed primeiro
        const existingArticles = await prisma.newsArticle.findMany({
          where: { feedId: feed.id },
          select: { id: true, link: true, title: true, newsDate: true },
          take: 100, // Limitar para não sobrecarregar
          orderBy: { id: 'desc' }
        });

        console.log(`📰 ${existingArticles.length} artigos existentes encontrados`);
        checkedCount += existingArticles.length;

        // TIPO 1: Feed "Busca Ativa" (Google News, scraping)
        if (feed.name === 'Busca Ativa') {
          console.log(`🔍 TIPO: Busca Ativa (Google News + Scraping)`);
          console.log(`ℹ️  Artigos da Busca Ativa usam data do Google News RSS`);
          console.log(`ℹ️  Se as datas estão erradas, é problema na fonte (Google News)\n`);
          
          // Para Busca Ativa, vamos apenas reportar as datas
          if (existingArticles.length > 0) {
            console.log(`📅 Amostra de datas da Busca Ativa (primeiras 3):`);
            existingArticles.slice(0, 3).forEach((article, i) => {
              const hoursAgo = Math.round((Date.now() - article.newsDate.getTime()) / (1000 * 60 * 60));
              console.log(`  ${i + 1}. ${article.title.substring(0, 50)}...`);
              console.log(`     Data: ${article.newsDate.toISOString()} (${hoursAgo}h atrás)\n`);
            });
          }
          continue;
        }

        // TIPO 2: Feeds RSS tradicionais
        console.log(`� TIPO: Feed RSS tradicional`);
        
        // Parse do RSS para feeds tradicionais
        const parsedFeed = await parser.parseURL(feed.url);
        
        if (!parsedFeed.items) {
          console.log(`⚠️ Nenhum item encontrado no feed ${feed.name}\n`);
          continue;
        }

        // Comparar com itens do RSS e atualizar datas
        for (const item of parsedFeed.items) {
          if (!item.link || !item.pubDate) continue;

          // Encontrar artigo existente pelo link
          const existingArticle = existingArticles.find(article => article.link === item.link);
          
          if (existingArticle) {
            try {
              // Parse da data correta do RSS
              const correctDate = parseRSSDate(item.pubDate);
              const currentDate = new Date(existingArticle.newsDate);

              // Verificar se as datas são diferentes (diferença > 1 hora)
              const timeDiff = Math.abs(correctDate.getTime() - currentDate.getTime());
              const hoursDiff = timeDiff / (1000 * 60 * 60);

              if (hoursDiff > 1) {
                console.log(`🔧 Atualizando: "${existingArticle.title.substring(0, 60)}..."`);
                console.log(`   📅 Data original RSS: "${item.pubDate}"`);
                console.log(`   📅 Data antiga: ${currentDate.toISOString()}`);
                console.log(`   📅 Data correta: ${correctDate.toISOString()}`);
                console.log(`   ⏰ Diferença: ${Math.round(hoursDiff)} horas\n`);

                // Atualizar no banco
                await prisma.newsArticle.update({
                  where: { id: existingArticle.id },
                  data: { newsDate: correctDate },
                });

                updatedCount++;
              }
            } catch (dateError) {
              console.error(`   - Erro ao processar data para "${item.title}":`, dateError instanceof Error ? dateError.message : dateError);
            }
          }
        }
        
        console.log(`✅ Feed ${feed.name} processado\n`);
        
        // Delay entre feeds para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar feed ${feed.name}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 CORREÇÃO DE DATAS CONCLUÍDA!');
    console.log(`📊 Artigos verificados: ${checkedCount}`);
    console.log(`✅ Artigos atualizados: ${updatedCount}`);
    console.log(`❌ Feeds com erro: ${errorCount}`);
    
    return { updatedCount, errorCount, checkedCount };

  } catch (error) {
    console.error('❌ Erro crítico durante a correção de datas:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    await updateExistingDates();
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão com banco encerrada');
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

export { updateExistingDates };