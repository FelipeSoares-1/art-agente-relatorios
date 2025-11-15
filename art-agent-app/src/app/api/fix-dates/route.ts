import { NextResponse } from 'next/server';
import { updateExistingDates } from '@/scripts/fix-dates';

export async function POST() {
  try {
    console.log('🚀 Iniciando correção de datas via API...');
    
    const result = await updateExistingDates();
    
    return NextResponse.json({
      success: true,
      message: `Correção concluída! ${result.checkedCount} artigos verificados, ${result.updatedCount} atualizados, ${result.errorCount} feeds com erro.`,
      checkedCount: result.checkedCount,
      updatedCount: result.updatedCount,
      errorCount: result.errorCount
    });

  } catch (error) {
    console.error('❌ Erro na correção de datas via API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor durante a correção de datas.',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para correção de datas. Use POST para executar.' 
  });
}