import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CONCORRENTES_ARTPLAN } from '@/lib/tag-helper';

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
        tags: true,
      },
    });

    // 3. Criar um set com nomes de concorrentes para busca rápida
    const competitorNames = new Set(CONCORRENTES_ARTPLAN.map(c => c.nome));

    // 4. Contar menções
    const mentionCounts: Record<string, number> = {};
    CONCORRENTES_ARTPLAN.forEach(c => {
      mentionCounts[c.nome] = 0; // Inicializa todos com 0
    });

    articles.forEach(article => {
      const tags = parseTags(article.tags);
      tags.forEach(tag => {
        if (competitorNames.has(tag)) {
          mentionCounts[tag] = (mentionCounts[tag] || 0) + 1;
        }
      });
    });

    // 5. Formatar para o gráfico e ordenar
    const formattedData = Object.entries(mentionCounts)
      .map(([name, mentions]) => ({ name, menções: mentions }))
      .filter(item => item.menções > 0) // Opcional: mostrar apenas concorrentes com menções
      .sort((a, b) => b.menções - a.menções);

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching competitor mentions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
