import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { detectarConcorrentes, gerarRelatorioConcorrentes, CONCORRENTES_ARTPLAN } from '@/lib/concorrentes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nivel = searchParams.get('nivel'); // ALTO, MÉDIO, BAIXO
  const concorrente = searchParams.get('concorrente'); // Nome específico
  const relatorio = searchParams.get('relatorio'); // true/false

  try {
    // Buscar todas as notícias
    const articles = await prisma.newsArticle.findMany({
      orderBy: {
        publishedDate: 'desc',
      },
      include: {
        feed: {
          select: {
            name: true,
          },
        },
      },
    });

    // Se for relatório, retorna estatísticas
    if (relatorio === 'true') {
      const relatorioData = gerarRelatorioConcorrentes(articles);
      return NextResponse.json({
        totalNoticias: articles.length,
        concorrentesEncontrados: relatorioData.length,
        relatorio: relatorioData,
        topConcorrentes: relatorioData.slice(0, 10)
      });
    }

    // Filtrar notícias que mencionam concorrentes (com verificação contextual)
    const noticiasComConcorrentes = articles.map(article => {
      const texto = `${article.title} ${article.summary || ''}`;
      const feedName = article.feed.name;
      const concorrentes = detectarConcorrentes(texto, feedName); // Passa feedName para verificação contextual
      
      return {
        ...article,
        feedName: article.feed.name,
        feed: undefined,
        concorrentes
      };
    }).filter(article => article.concorrentes.length > 0);

    // Aplicar filtros
    let resultado = noticiasComConcorrentes;

    if (nivel) {
      resultado = resultado.filter(article => 
        article.concorrentes.some(c => c.nivel === nivel.toUpperCase())
      );
    }

    if (concorrente) {
      resultado = resultado.filter(article =>
        article.concorrentes.some(c => 
          c.nome.toLowerCase().includes(concorrente.toLowerCase())
        )
      );
    }

    return NextResponse.json({
      total: resultado.length,
      noticias: resultado
    });
  } catch (error) {
    console.error('Erro ao buscar notícias de concorrentes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar notícias de concorrentes.' },
      { status: 500 }
    );
  }
}

// Endpoint para listar todos os concorrentes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'list') {
      return NextResponse.json({
        total: CONCORRENTES_ARTPLAN.length,
        concorrentes: CONCORRENTES_ARTPLAN,
        porNivel: {
          ALTO: CONCORRENTES_ARTPLAN.filter(c => c.nivel === 'ALTO').length,
          MÉDIO: CONCORRENTES_ARTPLAN.filter(c => c.nivel === 'MÉDIO').length,
          BAIXO: CONCORRENTES_ARTPLAN.filter(c => c.nivel === 'BAIXO').length,
        }
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro no endpoint de concorrentes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
