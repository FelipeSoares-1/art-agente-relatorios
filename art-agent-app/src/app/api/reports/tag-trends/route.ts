import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Helper para parsear as tags de forma segura
const parseTags = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d'; // '7d', '15d', '30d'
  const limit = parseInt(searchParams.get('limit') || '5', 10); // Top N tags

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

    // 2. Buscar artigos do período
    const articles = await prisma.newsArticle.findMany({
      where: {
        newsDate: {
          gte: startDate,
        },
        status: {
          in: ['PROCESSED', 'ENRICHED'],
        },
      },
      select: {
        newsDate: true,
        tags: true,
      },
    });

    // 3. Processar os dados em memória
    const tagCounts: Record<string, number> = {};
    const dailyTagCounts: Record<string, Record<string, number>> = {};

    articles.forEach(article => {
      const dateStr = new Date(article.newsDate).toISOString().split('T')[0];
      const tags = parseTags(article.tags);

      if (!dailyTagCounts[dateStr]) {
        dailyTagCounts[dateStr] = {};
      }

      tags.forEach(tag => {
        // Contagem total para o ranking
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        // Contagem diária
        dailyTagCounts[dateStr][tag] = (dailyTagCounts[dateStr][tag] || 0) + 1;
      });
    });

    // 4. Identificar as Top N tags
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);

    // 5. Formatar a resposta para o Recharts
    const formattedData = Object.entries(dailyTagCounts).map(([date, tags]) => {
      const entry: Record<string, string | number> = { date };
      topTags.forEach(topTag => {
        entry[topTag] = tags[topTag] || 0;
      });
      return entry;
    });
    
    // Ordenar por data para o gráfico de linha
    formattedData.sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

    return NextResponse.json({
      topTags,
      data: formattedData,
    });

  } catch (error) {
    console.error('Error fetching tag trends:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
