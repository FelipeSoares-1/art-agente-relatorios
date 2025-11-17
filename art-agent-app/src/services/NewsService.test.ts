// src/services/NewsService.test.ts
import { prisma } from '../lib/db';
import { newsService } from './NewsService'; // CORREÇÃO FINAL: Importa a instância
import { ScrapedArticle } from './ScraperService';
import { isDateSuspicious } from '../lib/date-validator';

// Mock do Prisma Client
jest.mock('../lib/db', () => ({
  prisma: {
    newsArticle: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    rSSFeed: {
      upsert: jest.fn(),
    },
  },
}));

// Mock do tag-helper para isolar o teste
jest.mock('../lib/tag-helper', () => ({
  identificarTags: jest.fn().mockResolvedValue(['mock-tag']),
}));

// Mock do date-validator
jest.mock('../lib/date-validator', () => ({
    isDateSuspicious: jest.fn(),
}));

describe('NewsService', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveArticles', () => {
    it('should_save_new_article_with_PROCESSED_status_when_date_is_valid', async () => {
      // Arrange
      const mockArticle: ScrapedArticle = {
        title: 'Test Article',
        link: 'http://test.com/article',
        summary: 'This is a test summary.',
        publishedDate: new Date('2025-11-16T10:00:00Z'), // Data válida
        siteName: 'Test Site',
      };

      const mockFeed = {
        id: 1,
        name: 'Test Site (Scraper)',
        url: 'http://test.com',
        createdAt: new Date(),
      };

      (prisma.newsArticle.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.rSSFeed.upsert as jest.Mock).mockResolvedValue(mockFeed);
      (prisma.newsArticle.create as jest.Mock).mockResolvedValue({});
      // Configura o mock para retornar 'false' (data não é suspeita)
      (isDateSuspicious as jest.Mock).mockReturnValue(false);

      // Act
      await newsService.saveArticles([mockArticle]);

      // Assert
      expect(prisma.newsArticle.create).toHaveBeenCalledTimes(1);
      expect(prisma.newsArticle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PROCESSED', // A verificação principal!
        }),
      });
      // Verifica se o validador foi chamado com a data correta
      expect(isDateSuspicious).toHaveBeenCalledWith(mockArticle.publishedDate);
    });

    it('should_save_new_article_with_PENDING_ENRICHMENT_status_when_date_is_suspicious', async () => {
        // Arrange
        const mockArticle: ScrapedArticle = {
          title: 'Suspicious Article',
          link: 'http://test.com/suspicious-article',
          summary: 'This article has a suspicious date.',
          publishedDate: new Date('1970-01-01T00:00:00Z'), // Data suspeita (Unix epoch)
          siteName: 'Test Site',
        };
  
        const mockFeed = {
            id: 2,
            name: 'Test Site (Scraper)',
            url: 'http://test.com',
            createdAt: new Date(),
        };

        (prisma.newsArticle.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.rSSFeed.upsert as jest.Mock).mockResolvedValue(mockFeed);
        (prisma.newsArticle.create as jest.Mock).mockResolvedValue({});
        // Configura o mock para retornar 'true' (data é suspeita)
        (isDateSuspicious as jest.Mock).mockReturnValue(true);
  
        // Act
        await newsService.saveArticles([mockArticle]);
  
        // Assert
        expect(prisma.newsArticle.create).toHaveBeenCalledTimes(1);
        expect(prisma.newsArticle.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'PENDING_ENRICHMENT', // A verificação principal!
          }),
        });
        // Verifica se o validador foi chamado com a data correta
        expect(isDateSuspicious).toHaveBeenCalledWith(mockArticle.publishedDate);
      });

    it('should_not_save_article_when_it_already_exists', async () => {
        // Arrange
        const mockArticle: ScrapedArticle = {
          title: 'Existing Article',
          link: 'http://test.com/existing-article',
          summary: 'This article already exists.',
          publishedDate: new Date(),
          siteName: 'Test Site',
        };
  
        (prisma.newsArticle.findUnique as jest.Mock).mockResolvedValue({ id: 123, ...mockArticle });
  
        // Act
        await newsService.saveArticles([mockArticle]);
  
        // Assert
        expect(prisma.newsArticle.findUnique).toHaveBeenCalledWith({
          where: { link: mockArticle.link },
        });
        expect(prisma.newsArticle.create).not.toHaveBeenCalled();
      });
  });
});
