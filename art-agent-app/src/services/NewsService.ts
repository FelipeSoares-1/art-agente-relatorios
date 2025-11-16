// src/services/NewsService.ts
import { prisma } from '../lib/db.js';
import Parser from 'rss-parser';
import { identificarTags } from '../lib/tag-helper.js';

/**
 * @file Gerencia a lógica de negócio para notícias,
 * como buscar, criar e reprocessar artigos.
 */

// Tipagem para os itens do feed RSS
type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
  content?: string;
};

const parser = new Parser<object, FeedItem>();

class NewsService {
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
                const tags = await this.getTagsFromContent(item.title, item.summary || item.content, feed.name);
                
                console.log(`🔍 Processando: "${item.title.substring(0, 60)}..."`);
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
                    summary: item.summary || item.content,
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
   * Extrai tags do conteúdo de um artigo.
   * @private
   */
  private async getTagsFromContent(title: string, summary: string | null | undefined, feedName: string): Promise<string[]> {
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
