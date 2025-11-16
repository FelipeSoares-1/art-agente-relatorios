import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

// Configuração anti-bloqueio
const getRequestConfig = (url: string): AxiosRequestConfig => ({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
    'Referer': new URL(url).origin,
  },
  timeout: 15000,
  maxRedirects: 5,
  validateStatus: (status) => status < 500,
});

interface ScrapedArticle {
  title: string;
  link: string;
  summary: string;
  publishedDate: Date;
}

// Scraper específico para Propmark
export async function scrapePropmark(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
  console.log('🔍 Scraping Propmark (site específico)...');
  const articles: ScrapedArticle[] = [];
  const baseUrl = 'https://propmark.com.br';
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      console.log(`  Página ${page}...`);
      
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        
        // Propmark usa estrutura específica - vamos tentar vários seletores
        const selectors = [
          '.post-item',
          '.entry-item',
          '.blog-post',
          'article.post',
          '.post',
          '[class*="post"]',
          '[class*="entry"]',
        ];
        
        for (const selector of selectors) {
          $(selector).each((_, element) => {
            const $article = $(element);
            
            // Buscar título e link
            const $titleLink = $article.find('h2 a, h3 a, .entry-title a, .post-title a, a.title').first();
            const title = $titleLink.text().trim();
            const link = $titleLink.attr('href');
            
            if (!title || !link || title.length < 10) return;
            
            // Buscar resumo
            const summary = $article.find('.entry-excerpt, .excerpt, .post-excerpt, p').first().text().trim() || 
                           $article.find('.entry-content').text().trim().substring(0, 200);
            
            // Buscar data
            const $time = $article.find('time');
            const dateStr = $time.attr('datetime') || $time.text().trim();
            
            if (dateStr) {
              const publishedDate = new Date(dateStr);
              if (!isNaN(publishedDate.getTime())) {
                const fullLink = link.startsWith('http') ? link : `${baseUrl}${link}`;
                
                // Evitar duplicatas
                if (!articles.find(a => a.link === fullLink) && publishedDate >= startDate) {
                  articles.push({ title, link: fullLink, summary: summary || title, publishedDate });
                  found++;
                }
              }
            }
          });
          
          if (found > 0) break; // Se encontrou com esse seletor, não tenta os outros
        }
        
        console.log(`    ✓ ${found} artigos`);
        
        if (found === 0 && page > 1) break;
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (pageError) {
        console.error(`    ✗ Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro');
        if (page === 1) throw pageError; // Se primeira página falhar, para tudo
        break;
      }
    }
  } catch (error) {
    console.error('❌ Erro no Propmark:', error instanceof Error ? error.message : 'Erro desconhecido');
  }
  
  console.log(`  Total Propmark: ${articles.length} artigos`);
  return articles;
}

// Scraper específico para Meio & Mensagem
export async function scrapeMeioMensagem(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
  console.log('🔍 Scraping Meio & Mensagem (site específico)...');
  const articles: ScrapedArticle[] = [];
  const baseUrl = 'https://meioemensagem.com.br';
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? `${baseUrl}/comunicacao` : `${baseUrl}/comunicacao/page/${page}`;
      console.log(`  Página ${page}...`);
      
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        
        // Meio & Mensagem tem estrutura moderna
        const selectors = [
          'article',
          '.card',
          '.post-item',
          '.news-item',
          '[class*="article"]',
          '[class*="post"]',
        ];
        
        for (const selector of selectors) {
          $(selector).each((_, element) => {
            const $article = $(element);
            
            // Buscar título e link
            const $titleLink = $article.find('h2 a, h3 a, h1 a, .title a, a[href*="/comunicacao/"]').first();
            const title = $titleLink.text().trim();
            const link = $titleLink.attr('href');
            
            if (!title || !link || title.length < 10) return;
            
            // Buscar resumo
            const summary = $article.find('p, .description, .excerpt, .summary').first().text().trim() ||
                           $article.find('.content').text().trim().substring(0, 200);
            
            // Buscar data
            const $time = $article.find('time, .date, .published, [datetime]');
            const dateStr = $time.attr('datetime') || $time.text().trim();
            
            if (dateStr) {
              const publishedDate = new Date(dateStr);
              if (!isNaN(publishedDate.getTime())) {
                const fullLink = link.startsWith('http') ? link : `${baseUrl}${link}`;
                
                // Evitar duplicatas
                if (!articles.find(a => a.link === fullLink) && publishedDate >= startDate) {
                  articles.push({ title, link: fullLink, summary: summary || title, publishedDate });
                  found++;
                }
              }
            }
          });
          
          if (found > 0) break;
        }
        
        console.log(`    ✓ ${found} artigos`);
        
        if (found === 0 && page > 1) break;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (pageError) {
        console.error(`    ✗ Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro');
        if (page === 1) throw pageError;
        break;
      }
    }
  } catch (error) {
    console.error('❌ Erro no Meio & Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido');
  }
  
  console.log(`  Total Meio & Mensagem: ${articles.length} artigos`);
  return articles;
}

// Scraper específico para Google Notícias
export async function scrapeGoogleNews(keywords: string[], maxResults: number = 50): Promise<ScrapedArticle[]> {
  console.log('🔍 Scraping Google Notícias...');
  const articles: ScrapedArticle[] = [];
  const baseUrl = 'https://news.google.com';
  
  try {
    for (const keyword of keywords) {
      console.log(`  Buscando: "${keyword}"...`);
      
      const searchQuery = encodeURIComponent(keyword);
      const url = `${baseUrl}/search?q=${searchQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        
        // Google News: pegar links diretos ./read/
        $('a[href^="./read/"]').each((_, element) => {
          const $link = $(element);
          const href = $link.attr('href');
          const title = $link.text().trim();
          
          // Filtrar títulos válidos
          if (!title || title.length < 20 || title.includes('Mais') || title.includes('...')) {
            return;
          }
          
          // Tentar extrair fonte do contexto
          const $parent = $link.parent().parent();
          const parentText = $parent.text();
          const sourceMatch = parentText.match(/^([^M]+)Mais/);
          const source = sourceMatch ? sourceMatch[1].trim() : 'Google Notícias';
          
          const fullLink = `${baseUrl}${href}`;
          const publishedDate = new Date(); // Google News não mostra data exata na listagem
          
          // Evitar duplicatas
          if (!articles.find(a => a.title === title || a.link === fullLink)) {
            articles.push({ 
              title, 
              link: fullLink, 
              summary: `${source} - ${title}`,
              publishedDate 
            });
            found++;
          }
          
          if (articles.length >= maxResults) return false; // Parar quando atingir o máximo
        });
        
        console.log(`    ✓ ${found} artigos`);
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay maior para Google
        
      } catch (error) {
        console.error(`    ✗ Erro na busca "${keyword}":`, error instanceof Error ? error.message : 'Erro');
      }
      
      if (articles.length >= maxResults) break;
    }
  } catch (error) {
    console.error('❌ Erro no Google Notícias:', error instanceof Error ? error.message : 'Erro desconhecido');
  }
  
  console.log(`  Total Google Notícias: ${articles.length} artigos`);
  return articles.slice(0, maxResults);
}

// Scraper específico para AdNews
export async function scrapeAdNews(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
  console.log('🔍 Scraping AdNews (site específico)...');
  const articles: ScrapedArticle[] = [];
  const baseUrl = 'https://adnews.com.br';
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      console.log(`  Página ${page}...`);
      
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        
        // AdNews usa estrutura específica: <a href="/post/..."><article>...</article></a>
        $('a[href^="/post/"]').each((_, element) => {
          const $link = $(element);
          const href = $link.attr('href');
          const $article = $link.find('article');
          
          if (!href || $article.length === 0) return;
          
          // Extrair título do texto do article (primeira linha geralmente é o título)
          const fullText = $article.text().trim();
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          // Encontrar título (geralmente é uma linha com tamanho razoável)
          let title = '';
          for (const line of lines) {
            if (line.length >= 20 && line.length <= 200 && !line.includes('Opinião') && !line.includes('Novidade')) {
              title = line;
              break;
            }
          }
          
          if (!title) {
            // Fallback: pega a linha mais longa
            title = lines.reduce((longest, current) => 
              current.length > longest.length ? current : longest, '');
          }
          
          if (!title || title.length < 10) return;
          
          // Limpar título de palavras extras
          title = title.replace(/^(Novidade|Opinião|Artigo)\s+/i, '');
          
          // Resumo é o restante do texto
          const summary = lines.slice(1, 4).join(' ').substring(0, 200) || title;
          
          // Data padrão (AdNews não mostra data na listagem)
          const publishedDate = new Date();
          
          const fullLink = `${baseUrl}${href}`;
          
          if (!articles.find(a => a.link === fullLink) && publishedDate >= startDate) {
            articles.push({ title, link: fullLink, summary, publishedDate });
            found++;
          }
        });
        
        console.log(`    ✓ ${found} artigos`);
        
        if (found === 0 && page > 1) break;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (pageError) {
        console.error(`    ✗ Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro');
        if (page === 1) throw pageError;
        break;
      }
    }
  } catch (error) {
    console.error('❌ Erro no AdNews:', error instanceof Error ? error.message : 'Erro desconhecido');
  }
  
  console.log(`  Total AdNews: ${articles.length} artigos`);
  return articles;
}
