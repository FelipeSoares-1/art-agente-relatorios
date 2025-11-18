import { GET } from './route';
import { prisma } from '@/lib/db';
import { GoogleNewsWebScraper } from '@/lib/scrapers/google-news-web-scraper';
import { identificarTags } from '@/lib/tag-helper';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...data,
    }),
  },
}));

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    newsArticle: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    tagCategory: {
      findMany: jest.fn(),
    },
  },
}));

// Mock Scraper
jest.mock('@/lib/scrapers/google-news-web-scraper');
const mockScrapeArticleMetadata = jest.fn();
(GoogleNewsWebScraper as jest.Mock).mockImplementation(() => {
  return {
    scrapeArticleMetadata: mockScrapeArticleMetadata,
  };
});

// Mock identificarTags
jest.mock('@/lib/tag-helper', () => ({
  identificarTags: jest.fn(),
}));

describe('GET /api/enrich-articles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.tagCategory.findMany as jest.Mock).mockResolvedValue([
      { name: 'Prêmios', keywords: JSON.stringify(['prêmio']), color: '#000' },
      { name: 'Concorrentes', keywords: JSON.stringify(['concorrente']), color: '#000' },
    ]);
  });

  it('should enrich articles with PENDING_ENRICHMENT status, correct date, and re-evaluate tags', async () => {
    const mockArticle = {
      id: '1',
      title: 'Notícia sobre concorrente com data suspeita',
      link: 'http://example.com/news/1',
      summary: 'Resumo com palavra-chave de concorrente.',
      newsDate: new Date('2023-01-01T00:00:00.000Z'),
      status: 'PENDING_ENRICHMENT',
      tags: JSON.stringify(['Concorrentes']),
    };
    const correctedDate = new Date('2024-11-18T10:00:00.000Z');
    const fullContentWithCorrectTag = 'Conteúdo completo da notícia com menção a um prêmio.';

    (prisma.newsArticle.findMany as jest.Mock).mockResolvedValueOnce([mockArticle]);
    mockScrapeArticleMetadata.mockImplementationOnce(() =>
      Promise.resolve({
        newsDate: correctedDate,
        fullContent: fullContentWithCorrectTag,
      })
    );
    (identificarTags as jest.Mock).mockReturnValue(['Prêmios']);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse.enrichedCount).toBe(1);
    expect(mockScrapeArticleMetadata).toHaveBeenCalledWith(mockArticle.link);
    expect(identificarTags).toHaveBeenCalledWith(fullContentWithCorrectTag, mockArticle.title);
    expect(prisma.newsArticle.update).toHaveBeenCalledWith({
      where: { id: mockArticle.id },
      data: {
        newsDate: correctedDate,
        status: 'ENRICHED',
        tags: JSON.stringify(['Prêmios']),
      },
    });
  });

  it('should handle articles where full content does not yield new tags', async () => {
    const mockArticle = {
      id: '2',
      title: 'Notícia sem tags claras',
      link: 'http://example.com/news/2',
      status: 'PENDING_ENRICHMENT',
      tags: JSON.stringify([]),
    };
    const correctedDate = new Date('2024-11-18T11:00:00.000Z');
    const fullContentWithoutTags = 'Conteúdo sem palavras-chave de tags conhecidas.';

    (prisma.newsArticle.findMany as jest.Mock).mockResolvedValueOnce([mockArticle]);
    mockScrapeArticleMetadata.mockImplementationOnce(() =>
      Promise.resolve({
        newsDate: correctedDate,
        fullContent: fullContentWithoutTags,
      })
    );
    (identificarTags as jest.Mock).mockReturnValue([]);

    await GET();

    expect(prisma.newsArticle.update).toHaveBeenCalledWith({
      where: { id: mockArticle.id },
      data: {
        newsDate: correctedDate,
        status: 'ENRICHED',
        tags: JSON.stringify([]),
      },
    });
  });

  it('should handle scraper failure gracefully', async () => {
    const mockArticle = {
      id: '3',
      title: 'Notícia com scraper falho',
      link: 'http://example.com/news/3',
      status: 'PENDING_ENRICHMENT',
      tags: JSON.stringify([]),
    };

    (prisma.newsArticle.findMany as jest.Mock).mockResolvedValueOnce([mockArticle]);
    mockScrapeArticleMetadata.mockImplementationOnce(() => Promise.reject(new Error('Scraper failed')));

    const response = await GET();
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse.failedCount).toBe(1);
    expect(prisma.newsArticle.update).toHaveBeenCalledWith({
      where: { id: mockArticle.id },
      data: {
        status: 'ENRICHMENT_FAILED',
      },
    });
  });

  it('should not process articles if none are PENDING_ENRICHMENT', async () => {
    (prisma.newsArticle.findMany as jest.Mock).mockResolvedValueOnce([]);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse.message).toBe('Nenhum artigo para enriquecer.');
    expect(mockScrapeArticleMetadata).not.toHaveBeenCalled();
  });
});
