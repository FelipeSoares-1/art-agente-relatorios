import { prisma } from '@/lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

async function diagnoseDates() {
  console.log('🔍 DIAGNÓSTICO DETALHADO DE DATAS\n');

  try {
    // Buscar feeds RSS tradicionais (não "Busca Ativa")
    const feeds = await prisma.rSSFeed.findMany({
      where: {
        NOT: { name: 'Busca Ativa' }
      }
    });

    console.log(`📡 Analisando ${feeds.length} feeds RSS tradicionais\n`);

    for (const feed of feeds) {
      console.log(`\n🔍 ========== FEED: ${feed.name} ==========`);
      console.log(`URL: ${feed.url}`);

      try {
        // Parse do RSS atual
        const parsedFeed = await parser.parseURL(feed.url);
        
        if (!parsedFeed.items || parsedFeed.items.length === 0) {
          console.log(`❌ Nenhum item encontrado no feed\n`);
          continue;
        }

        // Analisar primeiros 3 itens do RSS
        console.log(`\n📅 ANÁLISE DOS PRIMEIROS 3 ITENS DO RSS:`);
        for (let i = 0; i < Math.min(3, parsedFeed.items.length); i++) {
          const item = parsedFeed.items[i];
          if (!item.pubDate || !item.title) continue;

          console.log(`\n  ${i + 1}. "${item.title.substring(0, 50)}..."`);
          console.log(`     📅 Data original RSS: "${item.pubDate}"`);
          
          // Testar diferentes métodos de parse
          const methods = [
            { name: 'new Date()', parse: () => new Date(item.pubDate || '') },
            { name: 'Date.parse()', parse: () => new Date(Date.parse(item.pubDate || '')) },
            { name: 'Manual cleanup', parse: () => {
              const cleaned = (item.pubDate || '').trim().replace(/\s+/g, ' ');
              return new Date(cleaned);
            }}
          ];

          for (const method of methods) {
            try {
              const parsed = method.parse();
              const isValid = !isNaN(parsed.getTime());
              const hoursAgo = isValid ? Math.round((Date.now() - parsed.getTime()) / (1000 * 60 * 60)) : 'N/A';
              
              console.log(`     ${method.name}: ${isValid ? '✅' : '❌'} ${isValid ? parsed.toISOString() : 'Invalid'} (${hoursAgo}h atrás)`);
            } catch (error) {
              console.log(`     ${method.name}: ❌ Erro - ${error instanceof Error ? error.message : 'Unknown'}`);
            }
          }
        }

        // Buscar artigos existentes no banco deste feed
        const existingArticles = await prisma.newsArticle.findMany({
          where: { feedId: feed.id },
          select: { title: true, newsDate: true, link: true },
          orderBy: { id: 'desc' },
          take: 3
        });

        console.log(`\n💾 ARTIGOS NO BANCO (últimos 3):`);
        if (existingArticles.length === 0) {
          console.log(`     Nenhum artigo encontrado no banco`);
        } else {
          for (let i = 0; i < existingArticles.length; i++) {
            const article = existingArticles[i];
            const hoursAgo = Math.round((Date.now() - article.newsDate.getTime()) / (1000 * 60 * 60));
            console.log(`  ${i + 1}. "${article.title.substring(0, 50)}..."`);
            console.log(`     💾 Data no banco: ${article.newsDate.toISOString()} (${hoursAgo}h atrás)`);
          }
        }

        // Comparar: encontrar artigos que existem tanto no RSS quanto no banco
        console.log(`\n🔄 COMPARAÇÃO RSS vs BANCO:`);
        let comparisonCount = 0;
        for (const item of parsedFeed.items.slice(0, 5)) {
          if (!item.link || !item.pubDate) continue;
          
          const dbArticle = await prisma.newsArticle.findFirst({
            where: { link: item.link },
            select: { title: true, newsDate: true }
          });

          if (dbArticle) {
            comparisonCount++;
            const rssDate = new Date(item.pubDate);
            const dbDate = dbArticle.newsDate;
            const diffHours = Math.abs(rssDate.getTime() - dbDate.getTime()) / (1000 * 60 * 60);

            console.log(`\n  🔍 Artigo encontrado: "${item.title?.substring(0, 40)}..."`);
            console.log(`     📅 RSS: "${item.pubDate}" → ${rssDate.toISOString()}`);
            console.log(`     💾 Banco: ${dbDate.toISOString()}`);
            console.log(`     ⏰ Diferença: ${Math.round(diffHours)} horas ${diffHours > 24 ? '❌ PROBLEMA!' : '✅ OK'}`);
          }
        }

        if (comparisonCount === 0) {
          console.log(`     ⚠️ Nenhum artigo comum encontrado entre RSS e banco`);
        }

        console.log(`\n✅ Análise do feed ${feed.name} concluída`);

      } catch (error) {
        console.error(`❌ Erro ao analisar feed ${feed.name}:`, error);
      }

      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 DIAGNÓSTICO COMPLETO!');
    console.log('\nℹ️  Verifique os logs acima para identificar:');
    console.log('   - Formatos de data problemáticos');
    console.log('   - Artigos com diferenças > 24h');
    console.log('   - Métodos de parse que funcionam melhor');

  } catch (error) {
    console.error('❌ Erro crítico no diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  diagnoseDates();
}

export { diagnoseDates };