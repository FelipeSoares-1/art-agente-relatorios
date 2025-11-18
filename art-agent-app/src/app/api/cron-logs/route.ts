import { NextResponse } from 'next/server';
import { scraperService } from '@/services/ScraperService';
import { newsService } from '@/services/NewsService';

// GET - Obter logs de scraping (temporariamente vazio)
export async function GET() {
  try {
    // Por enquanto, retornamos um array vazio para logs, pois a funcionalidade de logs ainda não foi migrada.
    const logs = []; 
    
    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    return NextResponse.json(
      { error: 'Erro ao obter logs' },
      { status: 500 }
    );
  }
}

// POST - Executar scraping manual
export async function POST() {
  try {
    console.log('🚀 Executando scraping manual via API...');
    const scrapedArticles = await scraperService.runCronScraping();
    const saveResult = await newsService.saveArticles(scrapedArticles);
    
    return NextResponse.json({
      success: true,
      message: 'Scraping manual executado com sucesso',
      details: saveResult
    });
  } catch (error) {
    console.error('Erro no scraping manual:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao executar scraping manual',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
