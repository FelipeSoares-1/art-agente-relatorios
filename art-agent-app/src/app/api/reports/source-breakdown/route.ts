import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d'; // '7d', '15d', '30d'

  try {
    // 1. Calcular a data de início
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '15d':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // 2. Agrupar e contar artigos por feedId
    const sourceCounts = await prisma.newsArticle.groupBy({
      by: ['feedId'],
      where: {
        newsDate: {
          gte: startDate,
        },
        status: {
          in: ['PROCESSED', 'ENRICHED'],
        },
      },
      _count: {
        id: true,
      },
    });

    // 3. Buscar os nomes dos feeds
    const feedIds = sourceCounts.map(item => item.feedId);
    const feeds = await prisma.rSSFeed.findMany({
      where: {
        id: {
          in: feedIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Criar um mapa para busca rápida de nomes de feed
    const feedIdToNameMap = new Map(feeds.map(feed => [feed.id, feed.name]));

    // 4. Formatar para o gráfico de pizza
    const formattedData = sourceCounts
      .map(item => ({
        name: feedIdToNameMap.get(item.feedId) || 'Desconhecido',
        value: item._count.id,
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching source breakdown:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
