import puppeteer, { Browser } from 'puppeteer';

export interface NewsArticleWeb {
  title: string;
  link: string;
  summary: string;
  publishedDate: string;
  source: string;
}

export interface GoogleNewsScrapingOptions {
  timeFilter?: '24h' | '7d' | '15d';
  maxArticles?: number;
  timeout?: number;
}

export class GoogleNewsWebScraper {
  private browser: Browser | null = null;

  constructor(private options: GoogleNewsScrapingOptions = {}) {
    this.options = {
      maxArticles: 10,
      timeout: 30000,
      ...options
    };
  }

  /**
   * Inicializa o browser
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Fecha o browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Busca notícias usando web scraping com filtros temporais
   */
  async searchNews(query: string, options?: GoogleNewsScrapingOptions): Promise<NewsArticleWeb[]> {
    const searchOptions = { ...this.options, ...options };
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Construir URL com filtro temporal
      const timeFilter = searchOptions.timeFilter ? ` when:${searchOptions.timeFilter}` : '';
      const searchQuery = encodeURIComponent(query + timeFilter);
      const searchUrl = `https://news.google.com/search?q=${searchQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

      console.log(`🔍 Buscando: ${query}${timeFilter}`);
      console.log(`📱 URL: ${searchUrl}`);

      // Navegar para página de resultados
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: searchOptions.timeout 
      });

      // Aguardar carregamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Tentar aguardar por artigos
      try {
        await page.waitForSelector('article', { timeout: 10000 });
      } catch (_) {
        console.log('⚠️ Timeout aguardando artigos, tentando continuar...');
      }

      // Extrair artigos da página
      const articles = await page.evaluate((maxArticles: number) => {
        const articleElements = document.querySelectorAll('article');
        const results: NewsArticleWeb[] = [];

        articleElements.forEach((article, index) => {
          if (index >= maxArticles) return;

          try {
            let title = '';
            let link = '';
            let publishedDate = '';
            let source = '';

            // ESTRATÉGIA 1: Buscar links do Google News (formato ./read/[hash])
            const allLinks = article.querySelectorAll('a');
            let mainLink: HTMLAnchorElement | null = null;
            let titleText = '';

            // Priorizar links com classe JtKRv que contém o título
            for (const linkEl of allLinks) {
              const href = linkEl.getAttribute('href');
              const text = linkEl.textContent?.trim() || '';
              const className = linkEl.className || '';

              if (href && href.includes('./read/') && className.includes('JtKRv') && text.length > 10) {
                mainLink = linkEl;
                titleText = text;
                break;
              }
            }

            // Se não achou link com JtKRv, procurar qualquer link com ./read/
            if (!mainLink) {
              for (const linkEl of allLinks) {
                const href = linkEl.getAttribute('href');
                const text = linkEl.textContent?.trim() || '';

                if (href && href.includes('./read/')) {
                  mainLink = linkEl;
                  if (text.length > 10) {
                    titleText = text;
                  }
                  break;
                }
              }
            }

            // Extrair dados se encontrou link
            if (mainLink) {
              const href = mainLink.getAttribute('href') || '';

              if (href.startsWith('./read/')) {
                link = `https://news.google.com${href.substring(1)}`;
              } else if (href.startsWith('./')) {
                link = `https://news.google.com${href.substring(1)}`;
              } else if (href.startsWith('/')) {
                link = `https://news.google.com${href}`;
              } else if (href.startsWith('http')) {
                link = href;
              }

              title = titleText;
            }

            // ESTRATÉGIA 2: Se não achou título, buscar em headings
            if (!title || title.length < 10) {
              const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
              for (const heading of headings) {
                const headingText = heading.textContent?.trim() || '';
                if (headingText.length > 10) {
                  title = headingText;
                  break;
                }
              }
            }

            // ESTRATÉGIA 3: Buscar data/tempo no texto
            const articleText = article.textContent || '';
            const timePatterns = [
              /\d+\s*(?:minuto|minutos|min|hora|horas|h|dia|dias|d|semana|semanas|sem)s?\s*atrás/gi,
              /há\s*\d+\s*(?:minuto|minutos|min|hora|horas|h|dia|dias|d|semana|semanas|sem)s?/gi,
              /\d{1,2}\/\d{1,2}\/\d{4}/g,
              /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g
            ];

            for (const pattern of timePatterns) {
              const match = articleText.match(pattern);
              if (match) {
                publishedDate = match[0];
                break;
              }
            }

            // ESTRATÉGIA 4: Extrair fonte do texto
            const textParts = articleText.split('Mais');
            if (textParts.length > 1 && textParts[0].trim().length > 0 && textParts[0].trim().length < 100) {
              source = textParts[0].trim();
            } else {
              const sourcePatterns = [
                /^[A-Z][a-z\s&]+(?=Mais|[A-Z])/,
                /De\s+[A-Z][a-z\s]+$/
              ];

              for (const pattern of sourcePatterns) {
                const match = articleText.match(pattern);
                if (match) {
                  source = match[0].replace('De ', '').trim();
                  break;
                }
              }
            }

            // Adicionar à lista se tem dados mínimos
            if (title && title.length > 5 && link && link.length > 10) {
              results.push({
                title: title.trim(),
                link: link.trim(),
                summary: title.trim(),
                publishedDate: publishedDate || 'Data não encontrada',
                source: source || 'Fonte não identificada'
              });
            }

          } catch (error) {
            console.error(`Erro ao extrair artigo ${index}:`, error);
          }
        });

        return results;
      }, searchOptions.maxArticles || 10);

      return articles;
    } catch (error) {
      console.error(`❌ Erro ao buscar notícias para "${query}":`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Busca notícias para múltiplas consultas com filtros temporais
   */
  async searchMultipleQueries(
    queries: string[], 
    options?: GoogleNewsScrapingOptions
  ): Promise<{ [query: string]: NewsArticleWeb[] }> {
    const results: { [query: string]: NewsArticleWeb[] } = {};

    for (const query of queries) {
      try {
        results[query] = await this.searchNews(query, options);
        
        // Aguardar entre consultas para evitar rate limiting
        if (queries.length > 1) {
          console.log('⏳ Aguardando 2 segundos antes da próxima consulta...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar "${query}":`, error);
        results[query] = [];
      }
    }

    return results;
  }

  /**
   * Converte artigos web para formato compatível com o sistema
   */
  static convertToNewsArticle(webArticle: NewsArticleWeb, searchTerm: string) {
    return {
      title: webArticle.title,
      link: webArticle.link,
      summary: webArticle.summary,
      publishedDate: this.parsePublishedDate(webArticle.publishedDate),
      source: webArticle.source,
      searchTerm,
      scrapingMethod: 'web-scraping' as const
    };
  }

  /**
   * Converte datas relativas para formato ISO
   */
  private static parsePublishedDate(dateString: string): string {
    const now = new Date();
    
    // Tentar diferentes formatos
    const relativePatterns = [
      { pattern: /(\d+)\s*minutos?\s*atrás/i, unit: 'minutes' },
      { pattern: /(\d+)\s*horas?\s*atrás/i, unit: 'hours' },
      { pattern: /(\d+)\s*dias?\s*atrás/i, unit: 'days' },
      { pattern: /(\d+)\s*semanas?\s*atrás/i, unit: 'weeks' },
      { pattern: /há\s*(\d+)\s*minutos?/i, unit: 'minutes' },
      { pattern: /há\s*(\d+)\s*horas?/i, unit: 'hours' },
      { pattern: /há\s*(\d+)\s*dias?/i, unit: 'days' }
    ];

    for (const { pattern, unit } of relativePatterns) {
      const match = dateString.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        const date = new Date(now);
        
        switch (unit) {
          case 'minutes':
            date.setMinutes(date.getMinutes() - value);
            break;
          case 'hours':
            date.setHours(date.getHours() - value);
            break;
          case 'days':
            date.setDate(date.getDate() - value);
            break;
          case 'weeks':
            date.setDate(date.getDate() - (value * 7));
            break;
        }
        
        return date.toISOString();
      }
    }

    // Se já está em formato ISO, retornar como está
    if (dateString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/)) {
      return dateString;
    }

    // Fallback: retornar string vazia para indicar falha
    return '';
  }

  /**
   * Visita uma URL de artigo e tenta extrair metadados, especialmente a data.
   */
  async scrapeArticleMetadata(url: string): Promise<{ date: Date | null }> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      console.log(`[Scraper] 🕵️ Visitando URL para deep scrape: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: this.options.timeout });

      const dateString = await page.evaluate(() => {
        // 1. Seletor <time datetime="..."> (mais confiável)
        const timeElement = document.querySelector('time[datetime]');
        if (timeElement) {
          return timeElement.getAttribute('datetime');
        }

        // 2. Meta tag Open Graph
        const metaOg = document.querySelector('meta[property="article:published_time"]');
        if (metaOg) {
          return metaOg.getAttribute('content');
        }

        // 3. Meta tag <meta name="publish-date" ...>
        const metaPublishDate = document.querySelector('meta[name="publish-date"]');
        if (metaPublishDate) {
            return metaPublishDate.getAttribute('content');
        }

        // 4. JSON-LD
        const jsonLdElement = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdElement) {
          try {
            const jsonLd = JSON.parse(jsonLdElement.innerHTML);
            if (jsonLd.datePublished) {
              return jsonLd.datePublished;
            }
            if (jsonLd.mainEntity && jsonLd.mainEntity.datePublished) {
                return jsonLd.mainEntity.datePublished;
            }
          } catch (_) {
            // Ignora erros de parsing de JSON
          }
        }
        
        return null;
      });

      if (!dateString) {
        console.log(`[Scraper] ⚠️ Data não encontrada para ${url}`);
        return { date: null };
      }

      try {
        const date = new Date(dateString);
        // Validação simples para evitar datas inválidas
        if (isNaN(date.getTime())) {
            console.log(`[Scraper] ⚠️ Data inválida (parsing falhou): "${dateString}"`);
            return { date: null };
        }
        console.log(`[Scraper] ✅ Data extraída para ${url}: ${date.toISOString()}`);
        return { date };
      } catch (_) {
        console.log(`[Scraper] ⚠️ Erro ao fazer parsing da data: "${dateString}"`);
        return { date: null };
      }

    } catch (error) {
      console.error(`[Scraper] ❌ Erro ao fazer deep scrape da URL ${url}:`, error);
      return { date: null };
    } finally {
      await page.close();
    }
  }
}