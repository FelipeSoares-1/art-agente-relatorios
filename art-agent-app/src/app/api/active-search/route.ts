import { NextRequest, NextResponse } from 'next/server';
import { performActiveSearch, saveSearchResults, SEARCH_TARGETS, runHighPrioritySearch } from '@/lib/active-search-service';

/**
 * API para executar busca ativa
 * 
 * POST /api/active-search
 * 
 * Body:
 * {
 *   "target": "artplan" | "mediabrands" | "betchavas" | "galeria" | "africa" |
 *              "wmccann" | "vmlyr" | "almapbbdo" | "publicis" | "ogilvy" |
 *              "essencemediacom" | "leoburnett" | "all-high"
 * }
 * 
 * Resposta:
 * {
 *   "success": true,
 *   "target": "artplan",
 *   "found": 263,
 *   "saved": 263,
 *   "skipped": 0,
 *   "message": "Busca ativa concluída com sucesso"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target } = body;
    
    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Target é obrigatório' },
        { status: 400 }
      );
    }
    
    console.log(`\n🎯 API: Iniciando busca ativa para: ${target}\n`);
    
    // Executar todos os targets de alta prioridade
    if (target === 'all-high') {
      await runHighPrioritySearch();
      
      return NextResponse.json({
        success: true,
        target: 'all-high',
        message: 'Busca ativa para todos os targets de alta prioridade concluída',
      });
    }
    
    // Validar target individual
    if (!(target in SEARCH_TARGETS)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Target inválido. Opções: ${Object.keys(SEARCH_TARGETS).join(', ')}, all-high` 
        },
        { status: 400 }
      );
    }
    
    // Executar busca para target específico
    const results = await performActiveSearch(target as keyof typeof SEARCH_TARGETS);
    const { saved, skipped } = await saveSearchResults(results);
    
    return NextResponse.json({
      success: true,
      target,
      targetName: SEARCH_TARGETS[target as keyof typeof SEARCH_TARGETS].name,
      found: results.length,
      saved,
      skipped,
      message: `Busca ativa concluída: ${saved} artigos salvos, ${skipped} duplicatas ignoradas`,
    });
    
  } catch (error) {
    console.error('❌ Erro na API de busca ativa:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/active-search
 * 
 * Retorna informações sobre os targets disponíveis
 */
export async function GET() {
  return NextResponse.json({
    targets: Object.entries(SEARCH_TARGETS).map(([key, target]) => ({
      key,
      name: target.name,
      priority: target.priority,
      keywords: target.keywords,
      frequency: target.frequency,
    })),
    usage: {
      method: 'POST',
      body: {
        target: 'artplan | mediabrands | betchavas | galeria | africa | wmccann | vmlyr | almapbbdo | publicis | ogilvy | essencemediacom | leoburnett | all-high'
      },
      examples: [
        {
          description: 'Buscar apenas Artplan',
          body: { target: 'artplan' }
        },
        {
          description: 'Buscar todos os targets de alta prioridade',
          body: { target: 'all-high' }
        }
      ]
    }
  });
}
