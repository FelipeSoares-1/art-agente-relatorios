// src/services/NewsService.ts
import { prisma } from '../lib/db';
import Parser from 'rss-parser';
import { identificarTags } from '../lib/tag-helper';
import { isDateSuspicious } from '../lib/date-validator';
import { ScrapedArticle, SearchResult } from './ScraperService';
import { htmlToText } from 'html-to-text';

/**
 * @file Gerencia a lógica de negócio para notícias,
 * como buscar, criar e reprocessar artigos.
 */

// Palavras-chave para categorização inteligente
const KEYWORDS = {
  'Novos Clientes': ['conquista', 'nova conta', 'ganha conta', 'novo cliente', 'pitch'],
  'Campanhas': ['campanha', 'lança', 'publicidade', 'filme', 'comercial', 'ação'],
  'Prêmios': ['prêmio', 'vence', 'leão', 'award', 'festival', 'reconhecimento'],
  'Movimentação de Talentos': ['contrata', 'chega para', 'deixa a agência', 'novo diretor', 'promove'],
};

// Tipagem para os itens do feed RSS
type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
  content?: string;
};

const parser = new Parser();

class NewsService {
  /**
   * Salva uma lista de artigos coletados por um scraper no banco de dados.
   * Verifica duplicatas, cria feeds se necessário e gera tags.
   * @param articles - A lista de artigos para salvar.
   * @returns Um relatório do que foi salvo.
   */
  public async saveArticles(articles: ScrapedArticle[]): Promise<{
    totalSaved: number;
    totalFound: number;
    details: { site: string; found: number; saved: number }[];
  }> {
    console.log(`\n[NewsService] === INICIANDO SALVAMENTO DE ARTIGOS ===`);
    console.log(`Total de artigos recebidos: ${articles.length}`);

    let savedCount = 0;
    const siteCounts: { [key: string]: { found: number; saved: number } } = {};

    // Contar artigos encontrados por site
    for (const article of articles) {
      if (!siteCounts[article.siteName]) {
        siteCounts[article.siteName] = { found: 0, saved: 0 };
      }
      siteCounts[article.siteName].found++;
    }

    for (const article of articles) {
      try {
        const exists = await prisma.newsArticle.findUnique({
          where: { link: article.link }
        });

        if (!exists) {
          // Garante que o feed existe para o site do scraper
          const feed = await prisma.rSSFeed.upsert({
            where: { name: `${article.siteName} (Scraper)` },
            update: {},
            create: {
              name: `${article.siteName} (Scraper)`,
              url: new URL(article.link).origin
            }
          });

          const cleanSummary = article.summary ? htmlToText(article.summary, { wordwrap: 130 }) : null;

          const tags = this.getTagsFromScrapedContent(article.title, cleanSummary);
          const status = isDateSuspicious(article.publishedDate)
            ? 'PENDING_ENRICHMENT'
            : 'PROCESSED';

          await prisma.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: cleanSummary,
              newsDate: article.publishedDate,
              insertedAt: new Date(),
              feedId: feed.id,
              tags: tags.length > 0 ? JSON.stringify(tags) : null,
              status: status
            }
          });

          savedCount++;
          if (siteCounts[article.siteName]) {
            siteCounts[article.siteName].saved++;
          }
        }
      } catch (error) {
        console.error(`[NewsService] Erro ao salvar artigo "${article.title}":`, error);
      }
    }

    const details = Object.entries(siteCounts).map(([site, counts]) => ({
      site,
      ...counts
    }));

    console.log(`[NewsService] Total salvo: ${savedCount} de ${articles.length} artigos.`);
    return {
      totalSaved: savedCount,
      totalFound: articles.length,
      details
    };
  }

  /**
   * Salva resultados de busca ativa no banco de dados.
   */
  public async saveActiveSearchResults(results: SearchResult[]): Promise<{ saved: number; skipped: number }> {
    let saved = 0;
    let skipped = 0;
    
    console.log(`\n[NewsService] 💾 Salvando ${results.length} artigos de busca ativa no banco...`);
    
    let activeSearchFeed = await prisma.rSSFeed.findFirst({
      where: { name: 'Busca Ativa' }
    });
    
    if (!activeSearchFeed) {
      activeSearchFeed = await prisma.rSSFeed.create({
        data: {
          name: 'Busca Ativa',
          url: 'https://internal-active-search'
        }
      });
      console.log(`[NewsService]    ✅ Feed "Busca Ativa" criado`);
    }
    
    for (const result of results) {
      try {
        const existing = await prisma.newsArticle.findFirst({
          where: { link: result.link }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        const tags = await identificarTags(`${result.title} ${result.summary}`);
        
        await prisma.newsArticle.create({
          data: {
            title: result.title,
            link: result.link,
            newsDate: result.pubDate,
            summary: result.summary,
            feedId: activeSearchFeed.id,
            tags: tags.length > 0 ? JSON.stringify(tags) : null,
            insertedAt: new Date(),
          },
        });
        
        saved++;
        
        if (saved % 10 === 0) {
          console.log(`[NewsService]    ✅ ${saved} artigos salvos...`);
        }
      } catch (error) {
        console.error(`[NewsService]    ❌ Erro ao salvar artigo: ${result.title}`, error);
      }
    }
    
    console.log(`\n[NewsService] ✅ Processo de busca ativa concluído:`);
    console.log(`   Salvos: ${saved}`);
    console.log(`   Ignorados (duplicatas): ${skipped}`);
    
    return { saved, skipped };
  }

  /**
   * Extrai tags de conteúdo com base em palavras-chave pré-definidas.
   * @private
   */
  private getTagsFromScrapedContent(title: string, summary: string | null | undefined): string[] {
    const content = `${title} ${summary || ''}`.toLowerCase();
    const tags: string[] = [];

    for (const tag in KEYWORDS) {
      for (const keyword of KEYWORDS[tag as keyof typeof KEYWORDS]) {
        if (content.includes(keyword)) {
          tags.push(tag);
          break;
        }
      }
    }
    return tags;
  }

  /**
   * Itera sobre todos os RSSFeeds cadastrados e busca por novos artigos.
   * Artigos novos são salvos no banco de dados.
   */
  public async updateFromRssFeeds(): Promise<{ newArticlesCount: number; message: string }> {
    console.log('Iniciando a atualização de feeds via NewsService...');

    try {
      const feeds = await prisma.rSSFeed.findMany();
      if (feeds.length === 0) {
        console.log('Nenhum feed cadastrado para atualizar.');
        return { newArticlesCount: 0, message: 'Nenhum feed cadastrado.' };
      }

      let newArticlesCount = 0;

      for (const feed of feeds) {
        try {
          console.log(`Processando feed: ${feed.name}`);
          const parsedFeed = await parser.parseURL(feed.url);
          
          if (!parsedFeed.items) continue;

          for (const item of parsedFeed.items) {
            try {
              if (!item.link || !item.title || !item.pubDate) {
                continue; // Pula itens sem os campos essenciais
              }

              const articleExists = await prisma.newsArticle.findUnique({
                where: { link: item.link },
              });

              if (!articleExists) {
                const summaryText = item.summary || item.content || '';
                const cleanSummary = htmlToText(summaryText, { wordwrap: 130 });

                const tags = await this.getTagsFromRssContent(item.title, cleanSummary, feed.name);
                
                console.log(`🔍 Processando: "${item.title.substring(0, 60)}"...`);
                console.log(`📅 Data original do RSS: "${item.pubDate}"`);
                
                const publishedDate = this.parseRSSDate(item.pubDate);
                
                console.log(`✅ Nova notícia salva - Data final: ${publishedDate.toISOString()}`);
                console.log(`⏰ Diferença para agora: ${Math.round((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60))} horas\n`);
                
                await prisma.newsArticle.create({
                  data: {
                    title: item.title,
                    link: item.link,
                    newsDate: publishedDate,
                insertedAt: new Date(),
                    summary: cleanSummary,
                    feedId: feed.id,
                    tags: JSON.stringify(tags)
                  }
                });
                newArticlesCount++;
              }
            } catch (itemError) {
              console.error(`  - Erro ao processar item "${item.title || 'Sem título'}" do feed ${feed.name}. Pulando.`, itemError instanceof Error ? itemError.message : itemError);
            }
          }
        } catch (error) {
          console.error(`Erro ao processar o feed ${feed.name} (${feed.url}):`, error);
        }
      }

      const message = `Atualização concluída. ${newArticlesCount} novos artigos foram adicionados.`;
      console.log(message);
      return { newArticlesCount, message };

    } catch (error) {
      console.error('Um erro crítico ocorreu durante a atualização de feeds:', error);
      throw new Error('Erro interno do servidor durante a atualização de feeds.');
    }
  }

  /**
   * Extrai tags do conteúdo de um artigo de RSS.
   * @private
   */
  private async getTagsFromRssContent(title: string, summary: string | null | undefined, feedName: string): Promise<string[]> {
    const content = `${title} ${summary || ''}`;
    return await identificarTags(content, feedName);
  }

  /**
   * Converte a string de data de um feed RSS para um objeto Date.
   * Lança um erro se a data for inválida.
   * @private
   */
  private parseRSSDate(pubDate: string): Date {
    try {
      const cleanDate = pubDate.trim();
      console.log(`📅 Parseando data RSS: "${cleanDate}"`);
      const date = new Date(cleanDate);
      
      if (!isNaN(date.getTime())) {
        console.log(`✅ Data parseada com sucesso: ${date.toISOString()}`);
        return date;
      }
      
      throw new Error(`Data inválida no RSS: ${pubDate}`);
    } catch (error) {
      console.error(`❌ Erro ao parsear data RSS: ${pubDate}`, error);
      throw error; // Re-lança o erro para o chamador
    }
    }
}

export const newsService = new NewsService();