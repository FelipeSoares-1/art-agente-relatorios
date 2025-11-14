import axios from 'axios';
import * as cheerio from 'cheerio';

async function testMundoDoMarketing() {
  console.log('🔍 Testando Mundo do Marketing...\n');
  
  try {
    const response = await axios.get('https://www.mundodomarketing.com.br', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      maxRedirects: 5,
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('📊 Testando seletores:\n');
    
    const selectors = [
      'article',
      '.post',
      '.entry',
      '.news-item',
      'a[href*="/noticia/"]',
      'a[href*="/noticias/"]',
    ];
    
    for (const selector of selectors) {
      const count = $(selector).length;
      console.log(`✓ "${selector}": ${count} elementos`);
      
      if (count > 0 && count < 100) {
        $(selector).slice(0, 3).each((i, el) => {
          const $el = $(el);
          const text = $el.text().trim().substring(0, 80);
          const href = $el.attr('href') || $el.find('a').attr('href');
          console.log(`  ${i+1}. ${text}...`);
          if (href) console.log(`     Link: ${href}`);
        });
        console.log();
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error);
  }
}

testMundoDoMarketing();
