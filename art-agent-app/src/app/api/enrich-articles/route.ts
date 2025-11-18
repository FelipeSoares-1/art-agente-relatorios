
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NewsArticle } from '@prisma/client';
import { GoogleNewsWebScraper } from '@/lib/scrapers/google-news-web-scraper';
import { identificarTags } from '@/lib/tag-helper';

interface ScrapedMetadata {
    newsDate: Date | null;
    fullContent: string;
}

async function deepScrapeArticle(article: NewsArticle, scraper: GoogleNewsWebScraper): Promise<ScrapedMetadata | null> {
    console.log(`[EnrichWorker] Iniciando deep scrape para: ${article.link}`);
    try {
        const metadata = await scraper.scrapeArticleMetadata(article.link);
        // Ensure metadata and newsDate exist, and fullContent is a string
        if (!metadata || !metadata.newsDate) {
            console.error(`[EnrichWorker] Metadados ou data de notícia ausentes para ${article.link}`);
            return null;
        }
        return {
            newsDate: metadata.newsDate,
            fullContent: metadata.fullContent || '',
        };
    } catch (error) {
        console.error(`[EnrichWorker] Erro no deep scrape para ${article.link}:`, error);
        return null;
    }
}

export async function GET() {
    const scraper = new GoogleNewsWebScraper();
    console.log('[EnrichWorker] Iniciando busca por artigos pendentes de enriquecimento...');

    try {
        const articlesToEnrich = await prisma.newsArticle.findMany({
            where: {
                status: 'PENDING_ENRICHMENT',
            },
            take: 10, // Limita a 10 artigos por execução para não sobrecarregar
        });

        if (articlesToEnrich.length === 0) {
            console.log('[EnrichWorker] Nenhum artigo para enriquecer.');
            return NextResponse.json({ message: 'Nenhum artigo para enriquecer.' });
        }

        console.log(`[EnrichWorker] ${articlesToEnrich.length} artigos encontrados para enriquecimento.`);

        let enrichedCount = 0;
        let failedCount = 0;

        for (const article of articlesToEnrich) {
            try {
                const metadata = await deepScrapeArticle(article, scraper);

                if (metadata) {
                    const newTags = identificarTags(metadata.fullContent, article.title);
                    await prisma.newsArticle.update({
                        where: { id: article.id },
                        data: {
                            newsDate: metadata.newsDate,
                            tags: JSON.stringify(newTags),
                            status: 'ENRICHED',
                        },
                    });
                    enrichedCount++;
                } else {
                    // Se o deep scrape falhar, marcamos como falho para não tentar de novo
                    await prisma.newsArticle.update({
                        where: { id: article.id },
                        data: { status: 'ENRICHMENT_FAILED' },
                    });
                    failedCount++;
                }
            } catch (error) {
                failedCount++;
                console.error(`[EnrichWorker] Erro ao processar o artigo ${article.id}:`, error);
                 await prisma.newsArticle.update({
                    where: { id: article.id },
                    data: { status: 'ENRICHMENT_FAILED' },
                });
            }
        }

        const report = {
            totalFound: articlesToEnrich.length,
            enrichedCount,
            failedCount,
        };

        console.log('[EnrichWorker] Processo de enriquecimento finalizado.', report);

        return NextResponse.json(report);

    } catch (error) {
        console.error('[EnrichWorker] Erro geral no processo de enriquecimento:', error);
        return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
    }
}
