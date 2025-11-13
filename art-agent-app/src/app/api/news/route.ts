import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const tag = searchParams.get('tag'); // Novo parâmetro de filtro por tag

  let whereClause: Prisma.NewsArticleWhereInput = {};

  if (period) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'd-1':
        // Dia anterior: da 00:00:00 do dia anterior até 23:59:59 do dia anterior
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDateD1 = new Date(startDate);
        endDateD1.setDate(startDate.getDate() + 1);
        endDateD1.setMilliseconds(-1); // Final do dia anterior
        whereClause.publishedDate = {
          gte: startDate,
          lte: endDateD1,
        };
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '15d':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      default:
        return NextResponse.json({ error: 'Período de filtro inválido.' }, { status: 400 });
    }

    if (period !== 'd-1') { // Para 'd-1' a cláusula já foi definida
      whereClause.publishedDate = {
        gte: startDate,
      };
    }
  }

  if (tag) {
    // Para buscar tags em um campo String que armazena JSON, usamos 'contains'
    // A busca será por uma substring, então '["Minha Tag"]' conterá '"Minha Tag"'
    whereClause.tags = {
      contains: `"${tag}"`,
    };
  }

  try {
    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
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

    // Mapear para incluir o nome do feed diretamente no objeto do artigo
    const formattedArticles = articles.map(article => ({
      ...article,
      feedName: article.feed.name,
      feed: undefined, // Remover o objeto feed original
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar notícias.' },
      { status: 500 }
    );
  }
}
