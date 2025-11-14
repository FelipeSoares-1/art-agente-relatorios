import { scrapeGoogleNews } from './src/lib/scrapers-especificos';
import { prisma } from './src/lib/db';

async function testGoogleNewsScraper() {
  console.log('🧪 Testando Google Notícias Scraper\n');
  
  const keywords = ['publicidade brasil', 'marketing digital'];
  const articles = await scrapeGoogleNews(keywords, 20);
  
  console.log(`\n📊 Artigos coletados: ${articles.length}`);
  console.log('\n📰 Exemplos (primeiros 5):\n');
  
  articles.slice(0, 5).forEach((article, i) => {
    console.log(`${i+1}. ${article.title}`);
    console.log(`   Link: ${article.link.substring(0, 80)}...`);
    console.log(`   Resumo: ${article.summary.substring(0, 80)}...`);
    console.log();
  });
  
  // Salvar no banco
  console.log('\n💾 Salvando no banco de dados...');
  
  const googleFeed = await prisma.rSSFeed.upsert({
    where: { url: 'https://news.google.com' },
    update: {},
    create: { name: 'Google Notícias (Scraping)', url: 'https://news.google.com' },
  });
  
  let saved = 0;
  let duplicates = 0;
  
  for (const article of articles) {
    try {
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          link: article.link,
          summary: article.summary,
          publishedDate: article.publishedDate,
          feedId: googleFeed.id,
          tags: JSON.stringify([]),
        },
      });
      saved++;
    } catch {
      duplicates++;
    }
  }
  
  console.log(`\n✅ Salvos: ${saved} | Duplicados: ${duplicates}`);
  
  const total = await prisma.newsArticle.count();
  console.log(`📚 Total no banco: ${total} artigos\n`);
  
  process.exit(0);
}

testGoogleNewsScraper();
