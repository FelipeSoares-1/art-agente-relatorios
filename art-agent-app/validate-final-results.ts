import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateResults() {
  try {
    console.log('\n📊 VALIDAÇÃO FINAL - BUSCA ATIVA COMPLETA\n');
    console.log('='.repeat(70));
    
    // Total de artigos no banco
    const totalArticles = await prisma.newsArticle.count();
    console.log(`\n📰 Total de artigos no banco: ${totalArticles}`);
    
    // Artigos do feed "Busca Ativa"
    const activeSearchFeed = await prisma.rSSFeed.findFirst({
      where: { name: 'Busca Ativa' }
    });
    
    if (activeSearchFeed) {
      const activeSearchArticles = await prisma.newsArticle.count({
        where: { feedId: activeSearchFeed.id }
      });
      console.log(`🔍 Artigos da Busca Ativa: ${activeSearchArticles}`);
    }
    
    // Carregar todos os artigos para análise
    const allArticles = await prisma.newsArticle.findMany({
      select: {
        id: true,
        title: true,
        tags: true,
        publishedDate: true,
        feed: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Análise por empresa
    console.log('\n🎯 ARTIGOS POR EMPRESA:\n');
    
    const companies = [
      { name: 'Artplan', keywords: ['artplan'] },
      { name: 'WMcCann', keywords: ['wmccann', 'wm mccann', 'mccann'] },
      { name: 'VMLY&R', keywords: ['vmly&r', 'vmlyr', 'vmly'] },
      { name: 'AlmapBBDO', keywords: ['almapbbdo', 'almap bbdo', 'almap'] }
    ];
    
    const stats: { [key: string]: any } = {};
    
    companies.forEach(company => {
      const articles = allArticles.filter(article => {
        const titleLower = article.title.toLowerCase();
        return company.keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
      });
      
      // Distribuição por fonte
      const sources: { [key: string]: number } = {};
      articles.forEach(article => {
        const source = article.feed.name;
        sources[source] = (sources[source] || 0) + 1;
      });
      
      // Tags mais comuns
      const tagCounts: { [key: string]: number } = {};
      articles.forEach(article => {
        if (article.tags) {
          try {
            const tags = JSON.parse(article.tags);
            tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          } catch (e) {
            // Ignorar erros
          }
        }
      });
      
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      stats[company.name] = {
        total: articles.length,
        sources,
        topTags
      };
      
      console.log(`${company.name}: ${articles.length} artigos`);
      console.log(`   Fontes:`);
      Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([source, count]) => {
          console.log(`      ${source}: ${count}`);
        });
      
      if (topTags.length > 0) {
        console.log(`   Top Tags:`);
        topTags.forEach(([tag, count]) => {
          console.log(`      ${tag}: ${count}`);
        });
      }
      console.log('');
    });
    
    // Comparação antes/depois
    console.log('\n📈 COMPARAÇÃO ANTES/DEPOIS:\n');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│ Empresa   │ Antes │ Depois │ Melhoria          │');
    console.log('├─────────────────────────────────────────────────┤');
    console.log(`│ Artplan   │   4   │  ${stats['Artplan'].total.toString().padEnd(4)} │ +${((stats['Artplan'].total / 4 - 1) * 100).toFixed(0)}%${' '.repeat(13 - ((stats['Artplan'].total / 4 - 1) * 100).toFixed(0).length)}│`);
    console.log(`│ WMcCann   │   2   │  ${stats['WMcCann'].total.toString().padEnd(4)} │ +${((stats['WMcCann'].total / 2 - 1) * 100).toFixed(0)}%${' '.repeat(13 - ((stats['WMcCann'].total / 2 - 1) * 100).toFixed(0).length)}│`);
    console.log(`│ VMLY&R    │   1   │  ${stats['VMLY&R'].total.toString().padEnd(4)} │ +${((stats['VMLY&R'].total / 1 - 1) * 100).toFixed(0)}%${' '.repeat(13 - ((stats['VMLY&R'].total / 1 - 1) * 100).toFixed(0).length)}│`);
    console.log(`│ AlmapBBDO │   5   │  ${stats['AlmapBBDO'].total.toString().padEnd(4)} │ +${((stats['AlmapBBDO'].total / 5 - 1) * 100).toFixed(0)}%${' '.repeat(13 - ((stats['AlmapBBDO'].total / 5 - 1) * 100).toFixed(0).length)}│`);
    console.log('└─────────────────────────────────────────────────┘');
    
    // Total geral
    const totalBefore = 4 + 2 + 1 + 5; // 12 artigos antes
    const totalAfter = stats['Artplan'].total + stats['WMcCann'].total + stats['VMLY&R'].total + stats['AlmapBBDO'].total;
    const improvement = ((totalAfter / totalBefore - 1) * 100).toFixed(0);
    
    console.log(`\n🎯 TOTAL: ${totalBefore} → ${totalAfter} artigos (+${improvement}%)`);
    
    // Estatísticas de tags
    console.log('\n\n📊 TAGS APLICADAS (todos os artigos):\n');
    
    const allTagCounts: { [key: string]: number } = {};
    allArticles.forEach(article => {
      if (article.tags) {
        try {
          const tags = JSON.parse(article.tags);
          tags.forEach((tag: string) => {
            allTagCounts[tag] = (allTagCounts[tag] || 0) + 1;
          });
        } catch (e) {
          // Ignorar
        }
      }
    });
    
    Object.entries(allTagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count} artigos`);
      });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Validação concluída!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateResults();
