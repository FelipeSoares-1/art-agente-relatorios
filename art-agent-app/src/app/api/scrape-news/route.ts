import { NextResponse } from 'next/server';
import { newsService } from '@/services/NewsService';
import { scraperService } from '@/services/ScraperService';
import { ScrapedArticle } from '@/services/ScraperService';

// Helper para garantir que o tipo do array de prioridades está correto
function parsePriorities(prioritiesParam: string | null): Array<'ALTA' | 'MÉDIA' | 'BAIXA'> {
  if (!prioritiesParam) {
    return ['ALTA', 'MÉDIA', 'BAIXA'];
  }
  return prioritiesParam.split(',') as Array<'ALTA' | 'MÉDIA' | 'BAIXA'>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const startDate = body.startDate ? new Date(body.startDate) : new Date('2025-01-01');
    const priorities = parsePriorities(body.priorities);
    const useSpecificScrapers = body.useSpecificScrapers || false;

    let articles: ScrapedArticle[] = [];
    
    if (useSpecificScrapers) {
      console.log('🚀 [API] Usando scrapers específicos...');
      articles = await scraperService.runSpecificScrapers(startDate);
    } else {
      console.log('🌐 [API] Usando scraper genérico...');
      articles = await scraperService.runGenericWebScraper(startDate, priorities);
    }

    // Salvar os artigos coletados usando o NewsService
    const report = await newsService.saveArticles(articles);

    const message = `Scraping concluído! ${report.totalSaved} novos artigos salvos de ${report.totalFound} encontrados.`;

    return NextResponse.json({
      message,
      totalScraped: report.totalFound,
      totalSaved: report.totalSaved,
      details: report.details,
    });

  } catch (error) {
    console.error('Erro na rota /api/scrape-news:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao fazer scraping de notícias.' },
      { status: 500 }
    );
  }
}

// GET para mostrar status e documentação
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de scraping de notícias. Use POST para executar.',
    usage: {
      method: 'POST',
      body: {
        startDate: 'YYYY-MM-DD (opcional)',
        priorities: 'Array<"ALTA" | "MÉDIA" | "BAIXA"> (opcional, para scraper genérico)',
        useSpecificScrapers: 'boolean (opcional, padrão: false)'
      },
    }
  });
}