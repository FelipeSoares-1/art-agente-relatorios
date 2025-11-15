import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const tag = searchParams.get('tag');
  const feedId = searchParams.get('feedId');
  const search = searchParams.get('search');

  const whereClause: Prisma.NewsArticleWhereInput = {};

  if (period) {
    const now = new Date();
    let startDate: Date;

    console.log(`🔍 Filtro de período solicitado: ${period}`);
    console.log(`📅 Data/hora atual: ${now.toISOString()}`);

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        console.log(`⏰ 24h - Buscando notícias desde: ${startDate.toISOString()}`);
        break;
      case 'd-1':
        // Dia anterior: da 00:00:00 do dia anterior até 23:59:59 do dia anterior
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDateD1 = new Date(startDate);
        endDateD1.setDate(startDate.getDate() + 1);
        endDateD1.setMilliseconds(-1); // Final do dia anterior
        console.log(`📆 Dia anterior - Entre: ${startDate.toISOString()} e ${endDateD1.toISOString()}`);
        whereClause.publishedDate = {
          gte: startDate,
          lte: endDateD1,
        };
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        console.log(`📅 7 dias - Buscando notícias desde: ${startDate.toISOString()}`);
        break;
      case '15d':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        console.log(`📅 15 dias - Buscando notícias desde: ${startDate.toISOString()}`);
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

  if (feedId) {
    whereClause.feedId = parseInt(feedId, 10);
  }

  try {
    console.log(`📊 Executando query com filtros:`, whereClause);
    
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

    console.log(`🎯 Encontrados ${articles.length} artigos`);
    
    // Log das primeiras 3 datas para debug
    if (articles.length > 0) {
      console.log(`📅 Primeiras 3 datas encontradas:`);
      articles.slice(0, 3).forEach((article, i) => {
        console.log(`  ${i + 1}. ${article.title.substring(0, 50)}... - ${article.publishedDate.toISOString()}`);
      });
    }

    // Mapear para incluir o nome do feed diretamente no objeto do artigo
    let formattedArticles = articles.map(article => ({
      ...article,
      feedName: article.feed.name,
      feed: undefined, // Remover o objeto feed original
    }));

    // Filtro de busca case-insensitive (aplicado após a query)
    if (search) {
      const searchLower = search.toLowerCase();
      formattedArticles = formattedArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        (article.summary && article.summary.toLowerCase().includes(searchLower)) ||
        (article.tags && article.tags.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar notícias.' },
      { status: 500 }
    );
  }
}
