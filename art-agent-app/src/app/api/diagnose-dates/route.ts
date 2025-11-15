import { NextResponse } from 'next/server';
import { diagnoseDates } from '@/scripts/diagnose-dates';

export async function POST() {
  try {
    console.log('🔍 Iniciando diagnóstico de datas via API...');
    
    await diagnoseDates();
    
    return NextResponse.json({
      success: true,
      message: 'Diagnóstico concluído! Verifique os logs no terminal para detalhes completos.',
    });

  } catch (error) {
    console.error('❌ Erro no diagnóstico de datas via API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor durante o diagnóstico de datas.',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para diagnóstico de datas. Use POST para executar.' 
  });
}