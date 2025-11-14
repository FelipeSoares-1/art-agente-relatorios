/**
 * Active Search Service
 * 
 * Serviço de busca ativa para termos específicos usando:
 * 1. Google News RSS Feed
 * 2. Busca interna nos sites (Propmark, Meio & Mensagem, AdNews)
 * 
 * Diferença do sistema passivo:
 * - Passivo: Espera RSS feeds genéricos trazerem menções
 * - Ativo: Busca proativamente por termos específicos
 */

import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';
import { identificarTags } from './tag-helper';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const parser = new Parser();

// Configuração de alvos de busca
export const SEARCH_TARGETS = {
  artplan: {
    name: 'Artplan',
    priority: 'HIGH',
    keywords: ['artplan', 'artplan agência', 'artplan brasil', 'artplan publicidade'],
    frequency: 'daily' // 2x ao dia
  },
  mediabrands: {
    name: 'Mediabrands',
    priority: 'HIGH',
    keywords: ['mediabrands', 'ipg mediabrands', 'mediabrands brasil', 'mediabrands advertising'],
    frequency: 'daily'
  },
  betchavas: {
    name: 'BETC Havas',
    priority: 'HIGH',
    keywords: ['betc havas', 'betc brasil', 'betc agência', 'betc advertising'],
    frequency: 'daily'
  },
  galeria: {
    name: 'Galeria',
    priority: 'HIGH',
    keywords: ['galeria.ag', 'galeria agência', 'galeria publicidade', 'galeria brasil'],
    frequency: 'daily'
  },
  africa: {
    name: 'Africa',
    priority: 'HIGH',
    keywords: ['agência africa', 'africa agência', 'africa creative', 'africa ddb'],
    frequency: 'daily'
  },
  wmccann: {
    name: 'WMcCann',
    priority: 'HIGH',
    keywords: ['wmccann', 'wm mccann', 'mccann brasil'],
    frequency: 'daily'
  },
  vmlyr: {
    name: 'VMLY&R',
    priority: 'HIGH',
    keywords: ['vmly&r', 'vmlyr', 'vmly r brasil'],
    frequency: 'daily'
  },
  almapbbdo: {
    name: 'AlmapBBDO',
    priority: 'HIGH',
    keywords: ['almapbbdo', 'almap bbdo', 'almap'],
    frequency: 'daily'
  },
  publicis: {
    name: 'Publicis',
    priority: 'MEDIUM',
    keywords: ['publicis brasil', 'publicis worldwide brasil', 'publicis agência', 'publicis advertising'],
    frequency: 'every-2-days'
  },
  ogilvy: {
    name: 'Ogilvy',
    priority: 'MEDIUM',
    keywords: ['ogilvy brasil', 'ogilvy agência', 'ogilvy advertising', 'ogilvy comunicação'],
    frequency: 'every-2-days'
  },
  essencemediacom: {
    name: 'EssenceMediacom',
    priority: 'MEDIUM',
    keywords: ['essencemediacom', 'essence mediacom', 'essencemediacom brasil', 'essence mediacom agência'],
    frequency: 'every-2-days'
  },
  leoburnett: {
    name: 'Leo Burnett',
    priority: 'MEDIUM',
    keywords: ['leo burnett', 'leo burnett brasil'],
    frequency: 'every-2-days'
  }
};

export interface SearchResult {
  title: string;
  link: string;
  pubDate: Date;
  summary: string;
  source: string;
  searchTerm: string;
  foundBy: 'google-news' | 'propmark' | 'meioemensagem' | 'adnews';
}

/**
 * Busca no Google News via RSS Feed
 * URL: https://news.google.com/rss/search?q={termo}&hl=pt-BR&gl=BR&ceid=BR:pt-419
 */
export async function searchGoogleNews(searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    // Encode search term para URL
    const encodedTerm = encodeURIComponent(searchTerm);
    const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedTerm}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    
    console.log(`🔍 Buscando no Google News: "${searchTerm}"`);
    
    const feed = await parser.parseURL(googleNewsUrl);
    
    for (const item of feed.items) {
      if (item.title && item.link && item.pubDate) {
        results.push({
          title: item.title,
          link: item.link,
          pubDate: new Date(item.pubDate),
          summary: item.contentSnippet || item.content || '',
          source: extractSourceFromGoogleNews(item.title),
          searchTerm,
          foundBy: 'google-news'
        });
      }
    }
    
    console.log(`✅ Google News: ${results.length} artigos encontrados`);
  } catch (error) {
    console.error(`❌ Erro ao buscar no Google News para "${searchTerm}":`, error);
  }
  
  return results;
}

/**
 * Extrai o nome da fonte do título do Google News
 * Formato: "Título da notícia - Nome da Fonte"
 */
function extractSourceFromGoogleNews(title: string): string {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return 'Google News';
}

/**
 * Busca no Propmark usando a busca interna
 * URL: https://propmark.com.br/?s={termo}
 * 
 * NOTA: Propmark usa JavaScript para renderizar resultados.
 * Por enquanto, retorna array vazio. Considerar usar Puppeteer no futuro.
 */
export async function searchPropmark(searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchUrl = `https://propmark.com.br/?s=${encodedTerm}`;
    
    console.log(`🔍 Buscando no Propmark: "${searchTerm}"`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Propmark renderiza com JavaScript - Cheerio não consegue extrair
    // Tentativa básica com seletores genéricos
    $('[class*="post"], .post, article, [data-post]').each((_, element) => {
      const $el = $(element);
      
      // Tentar múltiplos seletores de título
      let titleElement = $el.find('h2 a').first();
      if (!titleElement.length) titleElement = $el.find('h3 a').first();
      if (!titleElement.length) titleElement = $el.find('h2').first();
      if (!titleElement.length) titleElement = $el.find('h3').first();
      if (!titleElement.length) titleElement = $el.find('a[href*="propmark"]').first();
      
      const title = titleElement.text().trim();
      let link = titleElement.attr('href') || $el.find('a').first().attr('href');
      
      // Garantir URL absoluta
      if (link && !link.startsWith('http')) {
        link = `https://propmark.com.br${link}`;
      }
      
      const summary = $el.find('p, .excerpt, .summary').first().text().trim();
      const dateStr = $el.find('time').attr('datetime') || 
                      $el.find('[datetime]').attr('datetime');
      
      if (title && link && title.length > 10) {
        results.push({
          title,
          link,
          pubDate: dateStr ? new Date(dateStr) : new Date(),
          summary: summary.substring(0, 300),
          source: 'Propmark',
          searchTerm,
          foundBy: 'propmark'
        });
      }
    });
    
    console.log(`✅ Propmark: ${results.length} artigos encontrados`);
    if (results.length === 0) {
      console.log(`   ⚠️  Propmark requer JavaScript - considere usar Puppeteer`);
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar no Propmark para "${searchTerm}":`, error);
  }
  
  return results;
}

/**
 * Busca no Meio & Mensagem usando a busca interna
 * URL: https://meioemensagem.com.br/?s={termo}
 */
export async function searchMeioMensagem(searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchUrl = `https://meioemensagem.com.br/?s=${encodedTerm}`;
    
    console.log(`🔍 Buscando no Meio & Mensagem: "${searchTerm}"`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // M&M usa class 'post' ou 'article' para cada resultado
    $('.post, article, .search-result').each((_, element) => {
      const $el = $(element);
      const titleElement = $el.find('h2 a, h3 a, .title a, a.title').first();
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const summary = $el.find('.excerpt, .summary, p').first().text().trim();
      const dateStr = $el.find('time, .date').attr('datetime') || 
                      $el.find('time, .date').text().trim();
      
      if (title && link) {
        results.push({
          title,
          link,
          pubDate: dateStr ? new Date(dateStr) : new Date(),
          summary: summary.substring(0, 300),
          source: 'Meio & Mensagem',
          searchTerm,
          foundBy: 'meioemensagem'
        });
      }
    });
    
    console.log(`✅ Meio & Mensagem: ${results.length} artigos encontrados`);
  } catch (error) {
    console.error(`❌ Erro ao buscar no Meio & Mensagem para "${searchTerm}":`, error);
  }
  
  return results;
}

/**
 * Busca no AdNews usando a busca interna
 * URL: https://adnews.com.br/?s={termo}
 */
export async function searchAdNews(searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchUrl = `https://adnews.com.br/?s=${encodedTerm}`;
    
    console.log(`🔍 Buscando no AdNews: "${searchTerm}"`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // AdNews usa <article> para cada resultado (47 elementos encontrados!)
    $('article').each((_, element) => {
      const $el = $(element);
      
      // Título pode estar em h2, h3 ou direto no link
      let title = $el.find('h2').first().text().trim();
      if (!title) title = $el.find('h3').first().text().trim();
      if (!title) title = $el.find('h1').first().text().trim();
      if (!title) title = $el.find('a').first().text().trim();
      
      // Link geralmente é o primeiro <a> dentro do article
      let link = $el.find('a').first().attr('href');
      
      // Garantir URL absoluta
      if (link && !link.startsWith('http')) {
        link = `https://adnews.com.br${link}`;
      }
      
      // Resumo/descrição
      const summary = $el.find('p').first().text().trim();
      
      // Data
      const dateStr = $el.find('time').attr('datetime') || 
                      $el.find('[datetime]').attr('datetime') ||
                      $el.find('time').text().trim();
      
      // Validar que tem conteúdo relevante
      if (title && link && title.length > 15) {
        results.push({
          title,
          link,
          pubDate: dateStr ? new Date(dateStr) : new Date(),
          summary: summary.substring(0, 300) || title,
          source: 'AdNews',
          searchTerm,
          foundBy: 'adnews'
        });
      }
    });
    
    console.log(`✅ AdNews: ${results.length} artigos encontrados`);
  } catch (error) {
    console.error(`❌ Erro ao buscar no AdNews para "${searchTerm}":`, error);
  }
  
  return results;
}

/**
 * Executa busca ativa completa para um alvo específico
 */
export async function performActiveSearch(targetKey: keyof typeof SEARCH_TARGETS): Promise<SearchResult[]> {
  const target = SEARCH_TARGETS[targetKey];
  const allResults: SearchResult[] = [];
  
  console.log(`\n🎯 Iniciando busca ativa: ${target.name}`);
  console.log(`   Prioridade: ${target.priority}`);
  console.log(`   Keywords: ${target.keywords.join(', ')}\n`);
  
  // Buscar cada keyword em todas as fontes
  for (const keyword of target.keywords) {
    // Google News
    const googleResults = await searchGoogleNews(keyword);
    allResults.push(...googleResults);
    
    // Aguardar 1 segundo entre requests para não sobrecarregar
    await sleep(1000);
    
    // Propmark
    const propmarkResults = await searchPropmark(keyword);
    allResults.push(...propmarkResults);
    await sleep(1000);
    
    // Meio & Mensagem
    const mmResults = await searchMeioMensagem(keyword);
    allResults.push(...mmResults);
    await sleep(1000);
    
    // AdNews
    const adnewsResults = await searchAdNews(keyword);
    allResults.push(...adnewsResults);
    await sleep(1000);
  }
  
  // Remover duplicatas baseado no link
  const uniqueResults = removeDuplicates(allResults);
  
  console.log(`\n✅ Busca completa para ${target.name}:`);
  console.log(`   Total encontrado: ${allResults.length}`);
  console.log(`   Únicos: ${uniqueResults.length}`);
  
  return uniqueResults;
}

/**
 * Salva resultados da busca no banco de dados
 */
export async function saveSearchResults(results: SearchResult[]): Promise<{ saved: number; skipped: number }> {
  let saved = 0;
  let skipped = 0;
  
  console.log(`\n💾 Salvando ${results.length} artigos no banco...`);
  
  // Buscar ou criar feed "Busca Ativa"
  let activeSearchFeed = await prisma.rSSFeed.findFirst({
    where: { name: 'Busca Ativa' }
  });
  
  if (!activeSearchFeed) {
    activeSearchFeed = await prisma.rSSFeed.create({
      data: {
        name: 'Busca Ativa',
        url: 'https://internal-active-search'
      }
    });
    console.log(`   ✅ Feed "Busca Ativa" criado`);
  }
  
  for (const result of results) {
    try {
      // Verificar se artigo já existe
      const existing = await prisma.newsArticle.findFirst({
        where: { link: result.link }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Identificar tags automaticamente
      const tags = await identificarTags(`${result.title} ${result.summary}`);
      
      // Salvar novo artigo
      await prisma.newsArticle.create({
        data: {
          title: result.title,
          link: result.link,
          publishedDate: result.pubDate,
          summary: result.summary,
          feedId: activeSearchFeed.id,
          tags: JSON.stringify(tags)
        }
      });
      
      saved++;
      
      if (saved % 10 === 0) {
        console.log(`   ✅ ${saved} artigos salvos...`);
      }
    } catch (error) {
      console.error(`   ❌ Erro ao salvar artigo: ${result.title}`, error);
    }
  }
  
  console.log(`\n✅ Processo concluído:`);
  console.log(`   Salvos: ${saved}`);
  console.log(`   Ignorados (duplicatas): ${skipped}`);
  
  return { saved, skipped };
}

/**
 * Remove resultados duplicados baseado no link
 */
function removeDuplicates(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];
  
  for (const result of results) {
    if (!seen.has(result.link)) {
      seen.add(result.link);
      unique.push(result);
    }
  }
  
  return unique;
}

/**
 * Helper para aguardar
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executa busca ativa para todos os alvos de alta prioridade
 */
export async function runHighPrioritySearch(): Promise<void> {
  const highPriorityTargets = Object.entries(SEARCH_TARGETS)
    .filter(([, target]) => target.priority === 'HIGH')
    .map(([key]) => key as keyof typeof SEARCH_TARGETS);
  
  console.log(`\n🚀 Iniciando busca ativa para ${highPriorityTargets.length} alvos de ALTA prioridade\n`);
  
  let totalSaved = 0;
  let totalSkipped = 0;
  
  for (const targetKey of highPriorityTargets) {
    const results = await performActiveSearch(targetKey);
    const { saved, skipped } = await saveSearchResults(results);
    totalSaved += saved;
    totalSkipped += skipped;
    
    console.log(`\n⏳ Aguardando 2 segundos antes do próximo alvo...\n`);
    await sleep(2000);
  }
  
  console.log(`\n🎉 BUSCA ATIVA COMPLETA!`);
  console.log(`   Artigos salvos: ${totalSaved}`);
  console.log(`   Duplicatas ignoradas: ${totalSkipped}`);
  
  await prisma.$disconnect();
}
