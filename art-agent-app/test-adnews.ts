import axios from 'axios';
import * as cheerio from 'cheerio';

async function testAdNews() {
  console.log('🔍 Testando estrutura do AdNews...\n');
  
  const response = await axios.get('https://adnews.com.br', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  
  const $ = cheerio.load(response.data);
  
  console.log('📊 Testando diferentes seletores:\n');
  
  // Testar vários seletores
  const selectors = [
    'article',
    'a[href^="/post/"] article',
    'a[href^="/post/"]',
  ];
  
  for (const selector of selectors) {
    const count = $(selector).length;
    console.log(`✓ Seletor "${selector}": ${count} elementos encontrados`);
    
    if (count > 0) {
      // Pegar primeiro exemplo
      const first = $(selector).first();
      const parent = first.parent();
      const link = parent.attr('href') || first.find('a').attr('href');
      const text = first.text().trim().substring(0, 100);
      
      console.log(`  Exemplo: ${text}...`);
      console.log(`  Link: ${link || 'não encontrado'}`);
      console.log();
    }
  }
  
  // Testar extração completa
  console.log('\n📰 Testando extração de artigos:\n');
  let articles = 0;
  
  $('a[href^="/post/"]').each((_, element) => {
    const $link = $(element);
    const href = $link.attr('href');
    const $article = $link.find('article');
    
    if (href && $article.length > 0) {
      const title = $article.text().trim().split('\n')[0];
      
      if (title && title.length > 10 && title.length < 200) {
        articles++;
        
        if (articles <= 5) {
          console.log(`${articles}. ${title.substring(0, 70)}...`);
          console.log(`   Link: https://adnews.com.br${href}`);
          console.log();
        }
      }
    }
  });
  
  console.log(`\n✅ Total de artigos válidos encontrados: ${articles}`);
}

testAdNews().catch(console.error);
