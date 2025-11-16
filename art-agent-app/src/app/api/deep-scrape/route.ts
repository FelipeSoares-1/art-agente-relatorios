// src/app/api/deep-scrape/route.ts
import { NextResponse } from 'next/server';
import { scraperService } from '@/services/ScraperService';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL não fornecida' },
        { status: 400 }
      );
    }

    console.log(`🚀 Executando Deep Scrape para: ${url}`);
    const detailedArticle = await scraperService.deepScrape(url);

    return NextResponse.json({
      success: true,
      article: detailedArticle,
    });

  } catch (error) {
    console.error('Erro no Deep Scrape:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao executar Deep Scrape',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
