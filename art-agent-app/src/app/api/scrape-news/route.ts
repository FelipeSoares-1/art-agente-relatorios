import { NextResponse } from 'next/server';
import { scrapeNews } from '@/lib/news-scraper';
import { scrapePropmark, scrapeMeioMensagem, scrapeAdNews } from '@/lib/scrapers-especificos';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const startDate = body.startDate ? new Date(body.startDate) : new Date('2025-01-01');
    const priorities = body.priorities || ['ALTA', 'MÉDIA', 'BAIXA'];
    const useSpecificScrapers = body.useSpecificScrapers || false;
    
    // Garantir que os feeds existem
    let propmarkFeed = await db.rSSFeed.findUnique({ where: { name: 'Propmark' } });
    if (!propmarkFeed) {
      propmarkFeed = await db.rSSFeed.create({
        data: { name: 'Propmark', url: 'https://www.propmark.com.br' },
      });
    }
    
    let meioMensagemFeed = await db.rSSFeed.findUnique({ where: { name: 'Meio & Mensagem' } });
    if (!meioMensagemFeed) {
      meioMensagemFeed = await db.rSSFeed.create({
        data: { name: 'Meio & Mensagem', url: 'https://www.meioemenasagem.com.br' },
      });
    }
    
    let adnewsFeed = await db.rSSFeed.findUnique({ where: { name: 'AdNews' } });
    if (!adnewsFeed) {
      adnewsFeed = await db.rSSFeed.create({
        data: { name: 'AdNews', url: 'https://www.adnews.com.br' },
      });
    }
    
    // Se useSpecificScrapers = true, usa scrapers otimizados para sites críticos
    if (useSpecificScrapers) {
      console.log('🚀 Usando scrapers específicos otimizados (Propmark, M&M, AdNews)...');
      
      const results = {
        propmark: { scraped: 0, saved: 0 },
        meioMensagem: { scraped: 0, saved: 0 },
        adnews: { scraped: 0, saved: 0 },
      };
      
      // Propmark
      const propmarkArticles = await scrapePropmark(startDate, 5);
      results.propmark.scraped = propmarkArticles.length;
      for (const article of propmarkArticles) {
        try {
          await db.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              newsDate: article.publishedDate,
              insertedAt: new Date(),
              feedId: propmarkFeed.id,
              tags: JSON.stringify([]),
            },
          });
          results.propmark.saved++;
        } catch {
          // Artigo duplicado, ignora
        }
      }
      
      // Meio & Mensagem
      const mmArticles = await scrapeMeioMensagem(startDate, 5);
      results.meioMensagem.scraped = mmArticles.length;
      for (const article of mmArticles) {
        try {
          await db.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              newsDate: article.publishedDate,
              insertedAt: new Date(),
              feedId: meioMensagemFeed.id,
              tags: JSON.stringify([]),
            },
          });
          results.meioMensagem.saved++;
        } catch {
          // Artigo duplicado, ignora
        }
      }
      
      // AdNews
      const adnewsArticles = await scrapeAdNews(startDate, 5);
      results.adnews.scraped = adnewsArticles.length;
      for (const article of adnewsArticles) {
        try {
          await db.newsArticle.create({
            data: {
              title: article.title,
              link: article.link,
              summary: article.summary,
              newsDate: article.publishedDate,
              insertedAt: new Date(),
              feedId: adnewsFeed.id,
              tags: JSON.stringify([]),
            },
          });
          results.adnews.saved++;
        } catch {
          // Artigo duplicado, ignora
        }
      }
      
      const totalSaved = results.propmark.saved + results.meioMensagem.saved + results.adnews.saved;
      const totalScraped = results.propmark.scraped + results.meioMensagem.scraped + results.adnews.scraped;
      
      return NextResponse.json({
        success: true,
        message: `Scraping específico concluído: ${totalScraped} coletados, ${totalSaved} salvos`,
        results,
        totalScraped,
        totalSaved,
      });
    }
    
    // Scraping genérico original
    console.log('Iniciando scraping via API...');
    const result = await scrapeNews(startDate, priorities);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro ao executar scraping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao executar scraping',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// GET para mostrar status
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de scraping de notícias. Use POST para executar.',
    usage: {
      method: 'POST',
      body: {
        startDate: 'YYYY-MM-DD (opcional, padrão: 2025-01-01)',
        priorities: 'Array de prioridades (opcional, padrão: ["ALTA", "MÉDIA", "BAIXA"])'
      },
      examples: {
        'Todas as prioridades': {
          startDate: '2025-01-01',
          priorities: ['ALTA', 'MÉDIA', 'BAIXA']
        },
        'Apenas alta prioridade': {
          startDate: '2025-01-01',
          priorities: ['ALTA']
        },
        'Alta e média': {
          startDate: '2025-01-01',
          priorities: ['ALTA', 'MÉDIA']
        }
      }
    }
  });
}
