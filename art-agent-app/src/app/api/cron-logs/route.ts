import { NextResponse } from 'next/server';
import { getScrapingLogs, executarScrapingManual } from '@/lib/cron-scraping';

// GET - Obter logs de scraping
export async function GET() {
  try {
    const logs = getScrapingLogs(20);
    
    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch {
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
    await executarScrapingManual();
    
    return NextResponse.json({
      success: true,
      message: 'Scraping manual executado com sucesso',
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
