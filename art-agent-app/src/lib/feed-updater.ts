import { prisma } from '@/lib/db';
import Parser from 'rss-parser';
import { identificarTags } from './tag-helper';

// Tipagem para os itens do feed RSS
type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  summary?: string;
  content?: string;
};

// Instancia o parser
const parser = new Parser<object, FeedItem>();

async function getTagsFromContent(title: string, summary: string | null | undefined): Promise<string[]> {
  const content = `${title} ${summary || ''}`;
  return await identificarTags(content);
}

export async function runFeedUpdate(): Promise<{ newArticlesCount: number; message: string }> {
  console.log('Iniciando a atualização de feeds...');

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
          if (!item.link || !item.title || !item.pubDate) {
            continue; // Pula itens sem os campos essenciais
          }

          // 1. Verifica se o artigo já existe pelo link
          const articleExists = await prisma.newsArticle.findUnique({
            where: { link: item.link },
          });

          // 2. Se não existir, cria o novo artigo
          if (!articleExists) {
            const tags = await getTagsFromContent(item.title, item.summary || item.content);
            
            await prisma.newsArticle.create({
              data: {
                title: item.title,
                link: item.link,
                summary: item.summary || item.content || '',
                publishedDate: new Date(item.pubDate),
                feedId: feed.id,
                tags: tags.length > 0 ? JSON.stringify(tags) : null, // Salva tags como JSON string
              },
            });
            newArticlesCount++;
          }
        }
      } catch (error) {
        console.error(`Erro ao processar o feed ${feed.name} (${feed.url}):`, error);
        // Continua para o próximo feed em caso de erro
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
