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

// Função para parsear a data do RSS de forma mais robusta
function parseRSSDate(pubDate: string): Date {
  try {
    // Remove caracteres extras comuns em feeds RSS
    const cleanDate = pubDate.trim();
    
    // Log para debug
    console.log(`📅 Parseando data RSS: "${cleanDate}"`);
    
    // Tenta fazer parse direto primeiro
    const date = new Date(cleanDate);
    
    // Verifica se a data é válida
    if (!isNaN(date.getTime())) {
      console.log(`✅ Data parseada com sucesso: ${date.toISOString()}`);
      return date;
    }
    
    // Se falhar, retorna data atual como fallback
    console.warn(`⚠️ Data inválida no RSS: ${pubDate}, usando data atual`);
    return new Date();
  } catch (error) {
    console.error(`❌ Erro ao parsear data RSS: ${pubDate}`, error);
    return new Date();
  }
}

async function getTagsFromContent(title: string, summary: string | null | undefined, feedName: string): Promise<string[]> {
  const content = `${title} ${summary || ''}`;
  return await identificarTags(content, feedName);
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
            const tags = await getTagsFromContent(item.title, item.summary || item.content, feed.name);
            
            // Parsear a data de forma mais robusta
            console.log(`🔍 Processando: "${item.title.substring(0, 60)}..."`);
            console.log(`📅 Data original do RSS: "${item.pubDate}"`);
            
            const publishedDate = parseRSSDate(item.pubDate);
            
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
