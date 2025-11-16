// src/services/ScraperService.ts
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { GoogleNewsWebScraper, type GoogleNewsScrapingOptions } from '../lib/scrapers/google-news-web-scraper';

const parser = new Parser();

// --- INTERFACES ---
export interface ScrapedArticle {
  title: string;
  link: string;
  summary: string;
  publishedDate: Date;
  siteName: string;
}

export interface DetailedArticle extends ScrapedArticle {
  author?: string;
  fullContent: string;
}

export interface SearchConfig {
  useWebScraping?: boolean;
  timeFilter?: '24h' | '7d' | '15d';
  rssOnly?: boolean;
  maxArticlesPerQuery?: number;
}

export interface SearchResult {
  title: string;
  link: string;
  pubDate: Date;
  summary: string;
  source: string;
  searchTerm: string;
  foundBy: 'google-news' | 'google-news-web-scraping' | 'propmark' | 'meioemensagem' | 'adnews';
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

export const SEARCH_TARGETS = {
  artplan: {
    name: 'Artplan',
    priority: 'HIGH',
    keywords: ['artplan', 'artplan agência', 'artplan brasil', 'artplan publicidade'],
    frequency: 'daily' as const // 2x ao dia
  },
  mediabrands: {
    name: 'Mediabrands',
    priority: 'HIGH',
    keywords: ['mediabrands', 'ipg mediabrands', 'mediabrands brasil', 'mediabrands advertising'],
    frequency: 'daily' as const
  },
  betchavas: {
    name: 'BETC Havas',
    priority: 'HIGH',
    keywords: ['betc havas', 'betc brasil', 'betc agência', 'betc advertising'],
    frequency: 'daily' as const
  },
  galeria: {
    name: 'Galeria',
    priority: 'HIGH',
    keywords: ['galeria.ag', 'galeria agência', 'galeria publicidade', 'galeria brasil'],
    frequency: 'daily' as const
  },
  africa: {
    name: 'Africa',
    priority: 'HIGH',
    keywords: ['agência africa', 'africa agência', 'africa creative', 'africa ddb'],
    frequency: 'daily' as const
  },
  wmccann: {
    name: 'WMcCann',
    priority: 'HIGH',
    keywords: ['wmccann', 'wm mccann', 'mccann brasil'],
    frequency: 'daily' as const
  },
  vmlyr: {
    name: 'VMLY&R',
    priority: 'HIGH',
    keywords: ['vmly&r', 'vmlyr', 'vmly r brasil'],
    frequency: 'daily' as const
  },
  almapbbdo: {
    name: 'AlmapBBDO',
    priority: 'HIGH',
    keywords: ['almapbbdo', 'almap bbdo', 'almap'],
    frequency: 'daily' as const
  },
  publicis: {
    name: 'Publicis',
    priority: 'MEDIUM',
    keywords: ['publicis brasil', 'publicis worldwide brasil', 'publicis agência', 'publicis advertising'],
    frequency: 'every-2-days' as const
  },
  ogilvy: {
    name: 'Ogilvy',
    priority: 'MEDIUM',
    keywords: ['ogilvy brasil', 'ogilvy agência', 'ogilvy advertising', 'ogilvy comunicação'],
    frequency: 'every-2-days' as const
  },
  essencemediacom: {
    name: 'EssenceMediacom',
    priority: 'MEDIUM',
    keywords: ['essencemediacom', 'essence mediacom', 'essencemediacom brasil', 'essence mediacom agência'],
    frequency: 'every-2-days' as const
  },
  leoburnett: {
    name: 'Leo Burnett',
    priority: 'MEDIUM',
    keywords: ['leo burnett', 'leo burnett brasil'],
    frequency: 'every-2-days' as const
  }
};


class ScraperService {
  // --- MÉTODOS PÚBLICOS ---

  public async deepScrape(url: string): Promise<DetailedArticle> {
    console.log(`\n[ScraperService] INICIANDO DEEP SCRAPE PARA: ${url}`);
    try {
      const response = await axios.get(url, getRequestConfig(url));
      const $ = cheerio.load(response.data);

      // Seletores genéricos com fallbacks
      const title = $('h1, .title, .entry-title, .post-title').first().text().trim();
      const author = $('.author, .byline, a[rel="author"]').first().text().trim();
      const dateText = $('time, .date, .published, .post-date').first().attr('datetime') || $('time, .date, .published, .post-date').first().text().trim();
      
      // Lógica para extrair o conteúdo principal
      let fullContent = '';
      $('article, .post-content, .entry-content, .article-body').each((_, element) => {
        const contentHtml = $(element).html();
        if (contentHtml && contentHtml.length > fullContent.length) {
          fullContent = $(element).text().trim();
        }
      });

      // Se o conteúdo ainda estiver vazio, tenta uma abordagem mais simples
      if (!fullContent) {
        fullContent = $('body').text().trim();
      }

      const publishedDate = dateText ? new Date(dateText) : new Date();
      const siteName = new URL(url).hostname;

      const detailedArticle: DetailedArticle = {
        title: title || 'Título não encontrado',
        link: url,
        summary: fullContent.substring(0, 200) + '...',
        publishedDate,
        siteName,
        author: author || 'Autor não encontrado',
        fullContent,
      };

      console.log(`✓ Deep Scrape concluído para: ${url}`);
      return detailedArticle;

    } catch (error) {
      console.error(`✗ Erro no Deep Scrape para ${url}:`, error instanceof Error ? error.message : 'Erro desconhecido');
      throw new Error(`Falha ao fazer o deep scrape da URL: ${url}`);
    }
  }

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
        await this._sleep(2000);
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

  public async runActiveSearch(
    targetKey: keyof typeof SEARCH_TARGETS,
    config: SearchConfig = {}
  ): Promise<SearchResult[]> {
    const target = SEARCH_TARGETS[targetKey];
    const allResults: SearchResult[] = [];
    
    console.log(`\n🎯 [ScraperService] Iniciando busca ativa: ${target.name}`);
    console.log(`   Prioridade: ${target.priority}`);
    console.log(`   Keywords: ${target.keywords.join(', ')}`);
    
    if (config.useWebScraping && config.timeFilter) {
      console.log(`   🤖 Modo: Web Scraping com filtro ${config.timeFilter}`);
    } else {
      console.log(`   📡 Modo: RSS tradicional`);
    }
    console.log('');
    
    for (const keyword of target.keywords) {
      let googleResults: SearchResult[] = [];
      if (config.useWebScraping && config.timeFilter) {
        googleResults = await this._searchGoogleNewsWebScraping(keyword, {
          timeFilter: config.timeFilter,
          maxArticles: config.maxArticlesPerQuery || 10
        });
      } else {
        googleResults = await this._searchGoogleNewsRss(keyword);
      }
      allResults.push(...googleResults);
      
      await this._sleep(1000);
      
      if (!config.rssOnly) {
        const propmarkResults = await this._searchPropmarkInternal(keyword);
        allResults.push(...propmarkResults);
        await this._sleep(1000);
        
        const mmResults = await this._searchMeioMensagemInternal(keyword);
        allResults.push(...mmResults);
        await this._sleep(1000);
        
        const adnewsResults = await this._searchAdNewsInternal(keyword);
        allResults.push(...adnewsResults);
        await this._sleep(1000);
      }
    }
    
    const uniqueResults = this._removeDuplicates(allResults);
    
    console.log(`\n✅ [ScraperService] Busca completa para ${target.name}:`);
    console.log(`   Total encontrado: ${allResults.length}`);
    console.log(`   Únicos: ${uniqueResults.length}`);
    
    return uniqueResults;
  }

  public async runHighPriorityActiveSearch(config: SearchConfig = {}): Promise<SearchResult[]> {
    const highPriorityTargets = Object.entries(SEARCH_TARGETS)
      .filter(([, target]) => target.priority === 'HIGH')
      .map(([key]) => key as keyof typeof SEARCH_TARGETS);
    
    const modeDescription = config.useWebScraping && config.timeFilter 
      ? `WEB SCRAPING (filtro: ${config.timeFilter})`
      : 'RSS tradicional';
    
    console.log(`\n🚀 [ScraperService] Iniciando busca ativa para ${highPriorityTargets.length} alvos de ALTA prioridade`);
    console.log(`   Modo: ${modeDescription}\n`);
    
    let allResults: SearchResult[] = [];
    
    for (const targetKey of highPriorityTargets) {
      const results = await this.runActiveSearch(targetKey, config);
      allResults.push(...results);
      
      console.log(`\n⏳ [ScraperService] Aguardando 2 segundos antes do próximo alvo...\n`);
      await this._sleep(2000);
    }
    
    console.log(`\n🎉 [ScraperService] BUSCA ATIVA DE ALTA PRIORIDADE COMPLETA!`);
    console.log(`   Total de artigos coletados: ${allResults.length}`);
    
    return allResults;
  }

  public async runCronScraping(): Promise<ScrapedArticle[]> {
    console.log('\n🤖 [ScraperService] Iniciando scraping automático para Cron...');
    const startDate = new Date('2025-01-01'); // Data inicial padrão para o cron
    const allArticles: ScrapedArticle[] = [];

    // Scrapers específicos
    const specificScrapersResults = await Promise.all([
      this._scrapePropmark(startDate, 3),
      this._scrapeMeioMensagem(startDate, 3),
      this._scrapeAdNews(startDate, 3)
    ]);
    allArticles.push(...specificScrapersResults.flat());
    await this._sleep(2000);

    // Google Notícias
    const googleKeywords = ['publicidade brasil', 'marketing brasil', 'agências publicidade'];
    const googleArticles = await this._scrapeGoogleNews(googleKeywords, 30);
    allArticles.push(...googleArticles);
    await this._sleep(2000);

    console.log(`\n✅ [ScraperService] Scraping automático concluído! Total de ${allArticles.length} artigos coletados.`);
    return allArticles;
  }

  // --- MÉTODOS PRIVADOS - SCRAPERS GENÉRICOS ---

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
        await this._sleep(1500);
      } catch (pageError) {
        console.error(`[${siteName}] Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro desconhecido');
        break;
      }
    }
    return articles;
  }

  // --- MÉTODOS PRIVADOS - SCRAPERS ESPECÍFICOS ---

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
        await this._sleep(2000);
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
        await this._sleep(2000);
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
        await this._sleep(2000);
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
        await this._sleep(3000);
      } catch (error) {
        // ignore
      }
      if (articles.length >= maxResults) break;
    }
    return articles.slice(0, maxResults);
  }

  // --- MÉTODOS PRIVADOS - BUSCA ATIVA ---

  private async _searchGoogleNewsRss(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedTerm}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
      console.log(`🔍 Buscando no Google News RSS: "${searchTerm}"`);
      const feed = await parser.parseURL(googleNewsUrl);
      for (const item of feed.items) {
        if (item.title && item.link && item.pubDate) {
          results.push({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            summary: item.contentSnippet || item.content || '',
            source: this._extractSourceFromGoogleNews(item.title),
            searchTerm,
            foundBy: 'google-news'
          });
        }
      }
      console.log(`✅ Google News RSS: ${results.length} artigos encontrados`);
    } catch (error) {
      console.error(`❌ Erro ao buscar no Google News RSS para "${searchTerm}":`, error);
    }
    return results;
  }

  private async _searchGoogleNewsWebScraping(
    searchTerm: string,
    config: GoogleNewsScrapingOptions
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    console.log(`🤖 Usando web scraping para "${searchTerm}" com filtro ${config.timeFilter}`);
    try {
      const scraper = new GoogleNewsWebScraper(config);
      const webArticles = await scraper.searchNews(searchTerm);
      for (const webArticle of webArticles) {
        results.push({
          title: webArticle.title,
          link: webArticle.link,
          pubDate: new Date(GoogleNewsWebScraper.convertToNewsArticle(webArticle, searchTerm).publishedDate),
          summary: webArticle.summary || '',
          source: webArticle.source || 'Web Scraping',
          searchTerm,
          foundBy: 'google-news-web-scraping'
        });
      }
      await scraper.close();
      console.log(`✅ Web Scraping: ${results.length} artigos encontrados`);
    } catch (error) {
      console.error(`❌ Erro no web scraping para "${searchTerm}":`, error);
      // Fallback para RSS se web scraping falhar
      console.log(`🔄 Fallback para RSS...`);
      const rssResults = await this._searchGoogleNewsRss(searchTerm);
      results.push(...rssResults);
    }
    return results;
  }

  private async _searchPropmarkInternal(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const searchUrl = `https://propmark.com.br/?s=${encodedTerm}`;
      console.log(`🔍 Buscando no Propmark (interno): "${searchTerm}"`);
      const response = await axios.get(searchUrl, getRequestConfig(searchUrl));
      const html = response.data;
      const $ = cheerio.load(html);
      $('article.post').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2 a').first().text().trim();
        let link = $el.find('h2 a').first().attr('href');
        if (link && !link.startsWith('http')) link = `https://propmark.com.br${link}`;
        const summary = $el.find('.entry-content p').first().text().trim();
        const dateStr = $el.find('time').attr('datetime');
        if (title && link) {
          results.push({
            title,
            link,
            pubDate: dateStr ? new Date(dateStr) : new Date(),
            summary: summary.substring(0, 300),
            source: 'Propmark',
            searchTerm,
            foundBy: 'propmark'
          });
        }
      });
      console.log(`✅ Propmark (interno): ${results.length} artigos encontrados`);
    } catch (error) {
      console.error(`❌ Erro ao buscar no Propmark (interno) para "${searchTerm}":`, error);
    }
    return results;
  }

  private async _searchMeioMensagemInternal(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const searchUrl = `https://meioemensagem.com.br/?s=${encodedTerm}`;
      console.log(`🔍 Buscando no Meio & Mensagem (interno): "${searchTerm}"`);
      const response = await axios.get(searchUrl, getRequestConfig(searchUrl));
      const html = response.data;
      const $ = cheerio.load(html);
      $('article').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h3 a').first().text().trim();
        let link = $el.find('h3 a').first().attr('href');
        if (link && !link.startsWith('http')) link = `https://meioemensagem.com.br${link}`;
        const summary = $el.find('p').first().text().trim();
        const dateStr = $el.find('time').attr('datetime');
        if (title && link) {
          results.push({
            title,
            link,
            pubDate: dateStr ? new Date(dateStr) : new Date(),
            summary: summary.substring(0, 300),
            source: 'Meio & Mensagem',
            searchTerm,
            foundBy: 'meioemensagem'
          });
        }
      });
      console.log(`✅ Meio & Mensagem (interno): ${results.length} artigos encontrados`);
    } catch (error) {
      console.error(`❌ Erro ao buscar no Meio & Mensagem (interno) para "${searchTerm}":`, error);
    }
    return results;
  }

  private async _searchAdNewsInternal(searchTerm: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const searchUrl = `https://adnews.com.br/?s=${encodedTerm}`;
      const baseUrl = 'https://adnews.com.br';
      console.log(`🔍 Buscando no AdNews (interno): "${searchTerm}"`);
      const response = await axios.get(searchUrl, getRequestConfig(searchUrl));
      const html = response.data;
      const $ = cheerio.load(html);
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
        if (!articles.find(a => a.link === fullLink)) {
          results.push({ title, link: fullLink, summary, publishedDate, source: 'AdNews', searchTerm, foundBy: 'adnews' });
        }
      });
      console.log(`✅ AdNews (interno): ${results.length} artigos encontrados`);
    } catch (error) {
      console.error(`❌ Erro ao buscar no AdNews (interno) para "${searchTerm}":`, error);
    }
    return results;
  }

  private _extractSourceFromGoogleNews(title: string): string {
    const parts = title.split(' - ');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return 'Google News';
  }

  private _removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];
    for (const result of results) {
      if (!seen.has(result.link)) {
        seen.add(result.link);
        unique.push(result);
      }
    }
    return unique;
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const scraperService = new ScraperService();
