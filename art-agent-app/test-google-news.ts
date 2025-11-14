import axios from 'axios';
import * as cheerio from 'cheerio';

async function testGoogleNews() {
  console.log('🔍 Testando Google Notícias...\n');
  
  try {
    // Buscar por "publicidade brasil"
    const searchQuery = 'publicidade+marketing+brasil';
    const url = `https://news.google.com/search?q=${searchQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    
    console.log(`URL: ${url}\n`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Content-Length: ${response.data.length}\n`);
    
    const $ = cheerio.load(response.data);
    
    // Google News usa estrutura complexa, vamos testar vários seletores
    console.log('📊 Testando seletores:\n');
    
    const selectors = [
      'article',
      'a[href^="./articles/"]',
      'a[href^="./read/"]',
      '[data-n-tid]',
      'h3',
      'h4',
    ];
    
    for (const selector of selectors) {
      const count = $(selector).length;
      console.log(`✓ "${selector}": ${count} elementos`);
      
      if (count > 0 && count < 200) {
        $(selector).slice(0, 3).each((i, el) => {
          const $el = $(el);
          const text = $el.text().trim().substring(0, 100);
          const href = $el.attr('href');
          if (text && text.length > 10) {
            console.log(`  ${i+1}. ${text}...`);
            if (href) console.log(`     Link: ${href.substring(0, 80)}`);
          }
        });
        console.log();
      }
    }
    
    // Tentar encontrar artigos específicos
    console.log('\n🔎 Buscando artigos (abordagem 1 - articles)...\n');
    
    let articles1 = 0;
    
    // Abordagem 1: Procurar em <article>
    $('article').each((_, element) => {
      const $article = $(element);
      const fullText = $article.text().trim();
      
      // Buscar qualquer link dentro do article
      const $link = $article.find('a').first();
      const href = $link.attr('href');
      
      if (href && fullText.length > 20) {
        articles1++;
        if (articles1 <= 5) {
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const title = lines.find(l => l.length >= 30 && l.length <= 200) || lines[0];
          
          console.log(`${articles1}. ${title.substring(0, 100)}`);
          console.log(`   Link: ${href}`);
          console.log();
        }
      }
    });
    
    console.log(`Abordagem 1: ${articles1} encontrados\n`);
    
    // Abordagem 2: Pegar todos os links ./read/ diretamente
    console.log('🔎 Buscando artigos (abordagem 2 - links diretos)...\n');
    
    let articles2 = 0;
    $('a[href^="./read/"]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const text = $link.text().trim();
      
      if (text && text.length > 20 && !text.includes('Mais') && !text.includes('...')) {
        articles2++;
        if (articles2 <= 10) {
          console.log(`${articles2}. ${text}`);
          console.log(`   Link: https://news.google.com${href}`);
          
          // Tentar pegar fonte do parent
          const $parent = $link.parent().parent();
          const sourceText = $parent.text();
          const sourceMatch = sourceText.match(/^([^M]+)Mais/);
          if (sourceMatch) {
            console.log(`   Fonte: ${sourceMatch[1].trim()}`);
          }
          
          console.log();
        }
      }
    });
    
    console.log(`\n✅ Total encontrado (abordagem 2): ${articles2} artigos`);
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error);
  }
}

testGoogleNews();
