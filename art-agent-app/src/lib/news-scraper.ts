import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/db';

// Palavras-chave para categorização inteligente
const KEYWORDS = {
  'Novos Clientes': ['conquista', 'nova conta', 'ganha conta', 'novo cliente', 'pitch'],
  'Campanhas': ['campanha', 'lança', 'publicidade', 'filme', 'comercial', 'ação'],
  'Prêmios': ['prêmio', 'vence', 'leão', 'award', 'festival', 'reconhecimento'],
  'Movimentação de Talentos': ['contrata', 'chega para', 'deixa a agência', 'novo diretor', 'promove'],
};

function getTagsFromContent(title: string, summary: string | null | undefined): string[] {
  const content = `${title} ${summary || ''}`.toLowerCase();
  const tags: string[] = [];

  for (const tag in KEYWORDS) {
    for (const keyword of KEYWORDS[tag as keyof typeof KEYWORDS]) {
      if (content.includes(keyword)) {
        tags.push(tag);
        break;
      }
    }
  }
  return tags;
}

interface ScrapedArticle {
  title: string;
  link: string;
  summary: string;
  publishedDate: Date;
}

// Scraper genérico baseado em seletores comuns de WordPress/sites de notícias
async function scrapeWebsite(
  siteName: string,
  baseUrl: string,
  startDate: Date,
  maxPages: number = 5
): Promise<ScrapedArticle[]> {
  console.log(`Iniciando scraping de ${siteName}...`);
  const articles: ScrapedArticle[] = [];
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
      console.log(`[${siteName}] Buscando página ${page}...`);
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        let foundInPage = 0;
        
        // Seletores comuns para artigos em sites WordPress e de notícias
        $('article, .post, .card, .news-item, .entry').each((_, element) => {
          const $article = $(element);
          
          // Tentar diferentes seletores para o link/título
          const $link = $article.find('h2 a, h3 a, h1 a, .entry-title a, .post-title a, .card-title a, a[rel="bookmark"]').first();
          const title = $link.text().trim();
          const link = $link.attr('href');
          
          // Extrair resumo
          const summary = $article.find('.entry-content p, .excerpt p, .post-excerpt, .card-text, .description, p').first().text().trim() ||
                         $article.find('.entry-summary, .post-summary').text().trim();
          
          // Extrair data
          const dateText = $article.find('time').first().attr('datetime') ||
                          $article.find('time, .entry-date, .post-date, .date, .published').first().text().trim();
          
          if (title && link && title.length > 10 && dateText) {
            const publishedDate = new Date(dateText);

            // Apenas processa se for uma data válida
            if (!isNaN(publishedDate.getTime())) {
              // Filtrar apenas notícias desde startDate
              if (publishedDate >= startDate) {
                const fullLink = link.startsWith('http') ? link : `${baseUrl}${link}`;

                // Evitar duplicatas na mesma rodada
                if (!articles.find(a => a.link === fullLink)) {
                  articles.push({
                    title,
                    link: fullLink,
                    summary: summary || title,
                    publishedDate,
                  });
                  foundInPage++;
                }
              }
            }
          }
        });
        
        console.log(`[${siteName}] Página ${page}: ${foundInPage} artigos encontrados`);
        
        // Se não encontrou nenhum artigo nesta página, para
        if (foundInPage === 0 && page > 1) {
          console.log(`[${siteName}] Nenhum artigo novo encontrado. Parando.`);
          break;
        }
        
        // Delay entre páginas
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (pageError) {
        console.error(`[${siteName}] Erro na página ${page}:`, pageError instanceof Error ? pageError.message : 'Erro desconhecido');
        break;
      }
    }
  } catch (error) {
    console.error(`Erro geral ao fazer scraping de ${siteName}:`, error);
  }
  
  console.log(`[${siteName}] Total: ${articles.length} artigos encontrados`);
  return articles;
}

// Sites para scraping organizados por prioridade (baseado no CSV data/rss_feeds_completo_atualizado.csv)
const SCRAPING_SITES: Array<{ name: string; url: string; pages: number; priority: 'ALTA' | 'MÉDIA' | 'BAIXA' }> = [
  // ALTA PRIORIDADE - Principais portais de publicidade brasileiros
  { name: 'Propmark', url: 'https://propmark.com.br', pages: 15, priority: 'ALTA' },
  { name: 'Meio & Mensagem', url: 'https://meioemensagem.com.br', pages: 15, priority: 'ALTA' },
  { name: 'AdNews', url: 'https://adnews.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Janela', url: 'https://janela.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Mundo do Marketing', url: 'https://mundodomarketing.com.br', pages: 12, priority: 'ALTA' },
  { name: 'Update or Die', url: 'https://updateordie.com', pages: 12, priority: 'ALTA' },
  { name: 'Clube de Criação', url: 'https://clubedecriacao.com.br', pages: 10, priority: 'ALTA' },
  { name: 'ABAP', url: 'https://www.abap.com.br', pages: 8, priority: 'ALTA' },
  
  // MÉDIA PRIORIDADE - Portais relevantes com cobertura específica
  { name: 'Marcas Pelo Mundo', url: 'https://marcaspelomundo.com.br', pages: 8, priority: 'MÉDIA' },
  { name: 'Grandes Nomes da Propaganda', url: 'https://grandesnomesdapropaganda.com.br', pages: 8, priority: 'MÉDIA' },
  { name: 'Agência Caracará', url: 'https://agenciacarcara.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'AB9 Consultoria', url: 'https://ab9.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Vira Página', url: 'https://virapagina.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Content Marketing Brasil', url: 'https://contentmarketingbrasil.com', pages: 5, priority: 'MÉDIA' },
  { name: 'CITAS', url: 'https://citas.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Portal Megabrasil', url: 'https://megabrasil.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Exame', url: 'https://exame.com', pages: 5, priority: 'MÉDIA' },
  { name: 'Valor Econômico', url: 'https://valor.globo.com/empresas/marketing', pages: 5, priority: 'MÉDIA' },
  { name: 'B9', url: 'https://www.b9.com.br', pages: 6, priority: 'MÉDIA' },
  { name: 'Marcodigital', url: 'https://marcodigital.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Mercado & Consumo', url: 'https://mercadoeconsumo.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'Portal Comunique-se', url: 'https://comunique-se.com.br', pages: 5, priority: 'MÉDIA' },
  { name: 'IstoÉ Dinheiro', url: 'https://istoedinheiro.com.br', pages: 4, priority: 'MÉDIA' },
  { name: 'Repórter Brasil', url: 'http://reporterbrasil.org.br', pages: 4, priority: 'MÉDIA' },
  
  // BAIXA PRIORIDADE - Cobertura ocasional ou contexto geral
  { name: 'Vox News', url: 'https://voxnews.com.br', pages: 4, priority: 'BAIXA' },
  { name: 'Doutores da Web', url: 'https://doutoresdaweb.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Tecnoblog', url: 'https://tecnoblog.net', pages: 3, priority: 'BAIXA' },
  { name: 'Canaltech', url: 'https://canaltech.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Agência Brasil EBC', url: 'https://agenciabrasil.ebc.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Startupi', url: 'https://startupi.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'Folha de S.Paulo', url: 'https://folha.uol.com.br', pages: 3, priority: 'BAIXA' },
  { name: 'O Globo', url: 'https://oglobo.globo.com', pages: 3, priority: 'BAIXA' },
  { name: 'Estadão', url: 'https://estadao.com.br', pages: 3, priority: 'BAIXA' },
];

// Função principal de scraping
export async function scrapeNews(
  startDate: Date = new Date('2025-01-01'),
  priorities: Array<'ALTA' | 'MÉDIA' | 'BAIXA'> = ['ALTA', 'MÉDIA', 'BAIXA']
): Promise<{
  totalScraped: number;
  totalSaved: number;
  message: string;
  details: { site: string; priority: string; found: number; saved: number }[];
}> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`INICIANDO SCRAPING DE NOTÍCIAS`);
  console.log(`Data inicial: ${startDate.toISOString().split('T')[0]}`);
  console.log(`Prioridades: ${priorities.join(', ')}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const allArticles: Array<ScrapedArticle & { feedId: number; siteName: string }> = [];
  const details: { site: string; priority: string; found: number; saved: number }[] = [];
  
  // Filtrar sites por prioridade
  const sitesToScrape = SCRAPING_SITES.filter(site => priorities.includes(site.priority));
  
  console.log(`Total de sites para scraping: ${sitesToScrape.length}\n`);
  
  // Scraping de cada site
  for (let i = 0; i < sitesToScrape.length; i++) {
    const site = sitesToScrape[i];
    console.log(`[${i + 1}/${sitesToScrape.length}] Processando ${site.name} (${site.priority})...`);
    try {
      // Buscar ou criar feed para o site
      const feed = await prisma.rSSFeed.upsert({
        where: { name: `${site.name} (Scraper)` },
        update: {},
        create: {
          name: `${site.name} (Scraper)`,
          url: site.url
        }
      });
      
      // Executar scraping
      const siteArticles = await scrapeWebsite(site.name, site.url, startDate, site.pages);
      
      // Adicionar feedId aos artigos
      const articlesWithFeed = siteArticles.map(a => ({
        ...a,
        feedId: feed.id,
        siteName: site.name
      }));
      
      allArticles.push(...articlesWithFeed);
      
      // Adicionar aos detalhes
      details.push({
        site: site.name,
        priority: site.priority,
        found: siteArticles.length,
        saved: 0 // Será atualizado depois
      });
      
      console.log(`✓ ${site.name}: ${siteArticles.length} artigos coletados\n`);
      
      // Delay entre sites
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`✗ Erro ao processar ${site.name}:`, error instanceof Error ? error.message : 'Erro desconhecido');
      console.log('');
    }
  }
  
  console.log(`\n=== RESUMO DO SCRAPING ===`);
  console.log(`Total de artigos encontrados: ${allArticles.length}`);
  
  // Salvar artigos no banco
  let savedCount = 0;
  
  for (const article of allArticles) {
    try {
      // Verificar se já existe
      const exists = await prisma.newsArticle.findUnique({
        where: { link: article.link }
      });
      
      if (!exists) {
        const tags = getTagsFromContent(article.title, article.summary);
        
        await prisma.newsArticle.create({
          data: {
            title: article.title,
            link: article.link,
            summary: article.summary,
            newsDate: article.publishedDate,
            insertedAt: new Date(),
            feedId: article.feedId,
            tags: tags.length > 0 ? JSON.stringify(tags) : null
          }
        });
        
        savedCount++;
        
        // Registrar salvamento nos detalhes
        const siteDetail = details.find(d => d.site === article.siteName);
        if (siteDetail) {
          siteDetail.saved++;
        }
      }
      
    } catch (error) {
      console.error(`Erro ao salvar artigo "${article.title}":`, error);
    }
  }
  
  const message = `Scraping concluído! ${savedCount} novos artigos salvos de ${allArticles.length} encontrados.`;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`RESUMO FINAL DO SCRAPING`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total encontrado: ${allArticles.length} artigos`);
  console.log(`Total salvo: ${savedCount} artigos (${allArticles.length - savedCount} duplicatas)`);
  console.log(`\nDetalhes por site:`);
  
  // Agrupar por prioridade
  const byPriority = {
    'ALTA': details.filter(d => d.priority === 'ALTA'),
    'MÉDIA': details.filter(d => d.priority === 'MÉDIA'),
    'BAIXA': details.filter(d => d.priority === 'BAIXA')
  };
  
  for (const [priority, sites] of Object.entries(byPriority)) {
    if (sites.length > 0) {
      console.log(`\n  ${priority}:`);
      sites.forEach(d => {
        const percentage = d.found > 0 ? Math.round((d.saved / d.found) * 100) : 0;
        console.log(`    • ${d.site}: ${d.saved}/${d.found} salvos (${percentage}%)`);
      });
    }
  }
  
  console.log(`\n${'='.repeat(60)}\n`);
  
  return {
    totalScraped: allArticles.length,
    totalSaved: savedCount,
    message,
    details
  };
}
