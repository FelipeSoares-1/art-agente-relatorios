import { NextResponse } from 'next/server';
import { newsService } from '@/services/NewsService';
import { scraperService, SEARCH_TARGETS, SearchConfig } from '@/services/ScraperService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetKey = body.target as keyof typeof SEARCH_TARGETS;
    const config: SearchConfig = body.config || {};

    if (!targetKey || !SEARCH_TARGETS[targetKey]) {
      return NextResponse.json(
        { error: 'Alvo de busca inválido ou não especificado.' },
        { status: 400 }
      );
    }

    console.log(`[API] Recebida requisição de busca ativa para o alvo: ${targetKey}`);

    // 1. Executar a busca ativa usando o ScraperService
    const searchResults = await scraperService.runActiveSearch(targetKey, config);

    // 2. Salvar os resultados usando o NewsService
    const { saved, skipped } = await newsService.saveActiveSearchResults(searchResults);

    return NextResponse.json({
      message: `Busca ativa para "${SEARCH_TARGETS[targetKey].name}" concluída. ${saved} novos artigos salvos, ${skipped} ignorados.`,
      target: targetKey,
      totalFound: searchResults.length,
      totalSaved: saved,
      totalSkipped: skipped,
    });

  } catch (error) {
    console.error('Erro na rota /api/active-search:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao executar busca ativa.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de busca ativa. Use POST para executar.',
    usage: {
      method: 'POST',
      body: {
        target: 'string (ex: "artplan", "mediabrands")',
        config: {
          useWebScraping: 'boolean (opcional)',
          timeFilter: '"24h" | "7d" | "15d" (opcional)',
          rssOnly: 'boolean (opcional)',
          maxArticlesPerQuery: 'number (opcional)'
        }
      },
      availableTargets: Object.keys(SEARCH_TARGETS),
    }
  });
}
