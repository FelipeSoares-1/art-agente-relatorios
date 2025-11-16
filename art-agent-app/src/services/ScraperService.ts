// src/services/ScraperService.ts
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

// --- INTERFACES ---
export interface ScrapedArticle {
  title: string;
  link: string;
  summary: string;
  publishedDate: Date;
  siteName: string;
}

// --- CONSTANTES ---

const getRequestConfig = (url: string): AxiosRequestConfig => ({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': new URL(url).origin,
  },
  timeout: 15000,
  maxRedirects: 5,
  validateStatus: (status) => status < 500,
});

const SCRAPING_SITES: Array<{ name: string; url: string; pages: number; priority: 'ALTA' | 'MÉDIA' | 'BAIXA' }> = [
  { name: 'Propmark', url: 'https://propmark.com.br', pages: 15, priority: 'ALTA' },
  { name: 'Meio & Mensagem', url: 'https://meioemensagem.com.br', pages: 15, priority: 'ALTA' },
  { name: 'AdNews', url: 'https://adnews.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Janela', url: 'https://janela.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Mundo do Marketing', url: 'https://mundodomarketing.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Update or Die', url: 'https://updateordie.com', pages: 12, priority: 'ALTA' },
  { name: 'Clube de Criação', url: 'https://clubedecriacao.com.br', pages: 10, priority: 'ALTA' },
  { name: 'ABAP', url: 'https://www.abap.com.br', pages: 8, priority: 'ALTA' },
  { name: 'Marcas Pelo Mundo', url: 'https://marcaspelomundo.com.br', pages: 8, priority: 'MÉDIA' },
  { name: 'Grandes Nomes da Propaganda', url: 'https://grandesnomesdapropaganda.com.br', pages: 8, priority: 'MÉDIA' },
  { name: 'Agência Caracará', url: 'https://agenciacarcara.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'AB9 Consultoria', url: 'https://ab9.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Vira Página', url: 'https://virapagina.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Content Marketing Brasil', url: 'https://contentmarketingbrasil.com', pages: 5, priority: 'MÉDIA' },
  { name: 'CITAS', url: 'https://citas.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Portal Megabrasil', url: 'https://megabrasil.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Exame', url: 'https://exame.com', pages: 5, priority: 'MÉDIA' },
  { name: 'Valor Econômico', url: 'https://valor.globo.com/empresas/marketing', pages: 5, priority: 'MÉDIA' },
  { name: 'B9', url: 'https://www.b9.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Marcodigital', url: 'https://marcodigital.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Mercado & Consumo', url: 'https://mercadoeconsumo.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Portal Comunique-se', url: 'https://comunique-se.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'IstoÉ Dinheiro', url: 'https://istoedinheiro.com.br', pages: 4, priority: 'MÉDIA' },
  { name: 'Repórter Brasil', url: 'http://reporterbrasil.org.br', pages: 4, priority: 'MÉDIA' },
  { name: 'Vox News', url: 'https://voxnews.com.br', pages: 4, priority: 'BAIXA' },
  { name: 'Doutores da Web', url: 'https://doutoresdaweb.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Tecnoblog', url: 'https://tecnoblog.net', pages: 3, priority: 'BAIXA' },
  { name: 'Canaltech', url: 'https://canaltech.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Agência Brasil EBC', url: 'https://agenciabrasil.ebc.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Startupi', url: 'https://startupi.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Folha de S.Paulo', url: 'https://folha.uol.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'O Globo', url: 'https://oglobo.globo.com', pages: 3, priority: 'BAIXA' },
  { name: 'Estadão', url: 'https://estadao.com.br', pages: 3, priority: 'BAIXA' },
];

class ScraperService {
  // --- MÉTODOS PÚBLICOS ---

  public async runGenericWebScraper(
    startDate: Date = new Date('2025-01-01'),
    priorities: Array<'ALTA' | 'MÉDIA' | 'BAIXA'> = ['ALTA', 'MÉDIA', 'BAIXA']
  ): Promise<ScrapedArticle[]> {
    console.log(`\n[ScraperService] INICIANDO SCRAPING GENÉRICO...`);
    const allArticles: ScrapedArticle[] = [];
    const sitesToScrape = SCRAPING_SITES.filter(site => priorities.includes(site.priority));
    
    for (let i = 0; i < sitesToScrape.length; i++) {
      const site = sitesToScrape[i];
      console.log(`[${i + 1}/${sitesToScrape.length}] Processando ${site.name} (${site.priority})...`);
      try {
        const siteArticles = await this._scrapeSingleWebsite(site.name, site.url, startDate, site.pages);
        allArticles.push(...siteArticles);
        console.log(`✓ ${site.name}: ${siteArticles.length} artigos coletados\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`✗ Erro ao processar ${site.name}:`, error instanceof Error ? error.message : 'Erro desconhecido');
      }
    }
    return allArticles;
  }

  public async runSpecificScrapers(startDate: Date): Promise<ScrapedArticle[]> {
    console.log('🚀 [ScraperService] Executando scrapers específicos...');
    const results = await Promise.all([
      this._scrapePropmark(startDate),
      this._scrapeMeioMensagem(startDate),
      this._scrapeAdNews(startDate)
    ]);
    const allArticles = results.flat();
    console.log(`🚀 [ScraperService] Total de ${allArticles.length} artigos coletados.`);
    return allArticles;
  }

  public async runGoogleNewsScraper(keywords: string[], maxResults: number = 50): Promise<ScrapedArticle[]> {
    return this._scrapeGoogleNews(keywords, maxResults);
  }

  // --- MÉTODOS PRIVADOS ---

  private async _scrapeSingleWebsite(siteName: string, baseUrl: string, startDate: Date, maxPages: number): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let foundInPage = 0;
        $('article, .post, .card, .news-item, .entry').each((_, element) => {
          const $article = $(element);
          const $link = $article.find('h2 a, h3 a, h1 a, .entry-title a, .post-title a, .card-title a, a[rel="bookmark"]').first();
          const title = $link.text().trim();
          const link = $link.attr('href');
          const summary = $article.find('.entry-content p, .excerpt p, .post-excerpt, .card-text, .description, p').first().text().trim() || $article.find('.entry-summary, .post-summary').text().trim();
          const dateText = $article.find('time').first().attr('datetime') || $article.find('time, .entry-date, .post-date, .date, .published').first().text().trim();
          if (title && link && title.length > 10 && dateText) {
            const publishedDate = new Date(dateText);
            if (!isNaN(publishedDate.getTime()) && publishedDate >= startDate) {
              const fullLink = link.startsWith('http') ? link : `${baseUrl}${link}`;
              if (!articles.find(a => a.link === fullLink)) {
                articles.push({ title, link: fullLink, summary: summary || title, publishedDate, siteName });
                foundInPage++;
              }
            }
          }
        });
        if (foundInPage === 0 && page > 1) break;
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (pageError) {
        console.error(`[${siteName}] Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro desconhecido');
        break;
      }
    }
    return articles;
  }

  private async _scrapePropmark(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
    const siteName = 'Propmark';
    const articles: ScrapedArticle[] = [];
    const baseUrl = 'https://propmark.com.br';
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        $('article.post').each((_, element) => {
          const $article = $(element);
          const $titleLink = $article.find('h2 a').first();
          const title = $titleLink.text().trim();
          const link = $titleLink.attr('href');
          const summary = $article.find('.entry-content p').first().text().trim();
          const dateStr = $article.find('time').attr('datetime');
          if (title && link && dateStr) {
            const publishedDate = new Date(dateStr);
            if (!isNaN(publishedDate.getTime()) && publishedDate >= startDate) {
              if (!articles.find(a => a.link === link)) {
                articles.push({ title, link, summary, publishedDate, siteName });
                found++;
              }
            }
          }
        });
        if (found === 0 && page > 1) break;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (pageError) {
        if (page === 1) throw pageError;
        break;
      }
    }
    return articles;
  }

  private async _scrapeMeioMensagem(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
    const siteName = 'Meio & Mensagem';
    const articles: ScrapedArticle[] = [];
    const baseUrl = 'https://meioemensagem.com.br';
    for (let page = 1; page <= maxPages; page++) {
      const url = `${baseUrl}/comunicacao/page/${page}`;
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        $('article').each((_, element) => {
          const $article = $(element);
          const $titleLink = $article.find('h3 a').first();
          const title = $titleLink.text().trim();
          const link = $titleLink.attr('href');
          const summary = $article.find('p').first().text().trim();
          const dateStr = $article.find('time').attr('datetime');
          if (title && link && dateStr) {
            const publishedDate = new Date(dateStr);
            if (!isNaN(publishedDate.getTime()) && publishedDate >= startDate) {
              if (!articles.find(a => a.link === link)) {
                articles.push({ title, link, summary, publishedDate, siteName });
                found++;
              }
            }
          }
        });
        if (found === 0 && page > 1) break;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (pageError) {
        if (page === 1) throw pageError;
        break;
      }
    }
    return articles;
  }

  private async _scrapeAdNews(startDate: Date, maxPages: number = 10): Promise<ScrapedArticle[]> {
    const siteName = 'AdNews';
    const articles: ScrapedArticle[] = [];
    const baseUrl = 'https://adnews.com.br';
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        let found = 0;
        $('a[href^="/post/"]').each((_, element) => {
          const $link = $(element);
          const href = $link.attr('href');
          const $article = $link.find('article');
          if (!href || $article.length === 0) return;
          const fullText = $article.text().trim();
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          let title = lines.reduce((longest, current) => current.length > longest.length ? current : longest, '');
          if (!title || title.length < 10) return;
          title = title.replace(/^(Novidade|Opinião|Artigo)\s+/i, '');
          const summary = lines.slice(1, 4).join(' ').substring(0, 200) || title;
          const publishedDate = new Date(); // AdNews não mostra data na listagem
          const fullLink = `${baseUrl}${href}`;
          if (!articles.find(a => a.link === fullLink) && publishedDate >= startDate) {
            articles.push({ title, link: fullLink, summary, publishedDate, siteName });
            found++;
          }
        });
        if (found === 0 && page > 1) break;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (pageError) {
        if (page === 1) throw pageError;
        break;
      }
    }
    return articles;
  }

  private async _scrapeGoogleNews(keywords: string[], maxResults: number = 50): Promise<ScrapedArticle[]> {
    const siteName = 'Google Notícias';
    const articles: ScrapedArticle[] = [];
    const baseUrl = 'https://news.google.com';
    for (const keyword of keywords) {
      const searchQuery = encodeURIComponent(keyword);
      const url = `${baseUrl}/search?q=${searchQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      try {
        const response = await axios.get(url, getRequestConfig(url));
        const $ = cheerio.load(response.data);
        $('a[href^="./article/"]').each((_, element) => {
          const $link = $(element);
          const href = $link.attr('href');
          const title = $link.text().trim();
          if (!title || title.length < 20) return;
          const fullLink = `${baseUrl}${href}`;
          const publishedDate = new Date(); // Google News não mostra data exata na listagem
          if (!articles.find(a => a.title === title || a.link === fullLink)) {
            articles.push({ title, link: fullLink, summary: title, publishedDate, siteName });
          }
          if (articles.length >= maxResults) return false;
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        // ignore
      }
      if (articles.length >= maxResults) break;
    }
    return articles.slice(0, maxResults);
  }
}

export const scraperService = new ScraperService();