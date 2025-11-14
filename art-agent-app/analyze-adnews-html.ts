/**
 * Análise detalhada do HTML do AdNews
 */

import * as cheerio from 'cheerio';

async function analyzeAdNews() {
  console.log('\n🔬 ANÁLISE DETALHADA: AdNews HTML\n');
  console.log('='.repeat(60));
  
  try {
    const searchUrl = 'https://adnews.com.br/?s=artplan';
    console.log(`URL: ${searchUrl}\n`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Encontrar todos os articles
    const articles = $('article');
    console.log(`📊 Total de <article>: ${articles.length}\n`);
    
    if (articles.length > 0) {
      console.log('📋 Analisando primeiros 3 articles:\n');
      
      articles.slice(0, 3).each((index, element) => {
        const $el = $(element);
        
        console.log(`\n--- ARTICLE #${index + 1} ---`);
        console.log(`Classes: ${$el.attr('class')}`);
        console.log(`ID: ${$el.attr('id')}`);
        
        // Todos os h2
        const h2s = $el.find('h2');
        console.log(`\nH2 encontrados: ${h2s.length}`);
        h2s.each((i, h2) => {
          console.log(`  H2[${i}]: "${$(h2).text().trim().substring(0, 80)}"`);
        });
        
        // Todos os h3
        const h3s = $el.find('h3');
        console.log(`\nH3 encontrados: ${h3s.length}`);
        h3s.each((i, h3) => {
          console.log(`  H3[${i}]: "${$(h3).text().trim().substring(0, 80)}"`);
        });
        
        // Todos os links
        const links = $el.find('a');
        console.log(`\nLinks encontrados: ${links.length}`);
        links.slice(0, 3).each((i, link) => {
          const href = $(link).attr('href');
          const text = $(link).text().trim().substring(0, 50);
          console.log(`  Link[${i}]: href="${href}" text="${text}"`);
        });
        
        // HTML interno (primeiros 500 chars)
        console.log(`\nHTML interno (500 chars):`);
        console.log($el.html()?.substring(0, 500));
      });
    }
    
    // Verificar se é Single Page Application (SPA)
    console.log('\n\n🔍 Verificando se é SPA (React/Vue/etc)...\n');
    
    const hasReact = html.includes('react') || html.includes('React') || html.includes('__NEXT');
    const hasVue = html.includes('vue') || html.includes('Vue');
    const hasAngular = html.includes('angular') || html.includes('ng-');
    
    console.log(`React detectado: ${hasReact ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Vue detectado: ${hasVue ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Angular detectado: ${hasAngular ? '✅ SIM' : '❌ NÃO'}`);
    
    if (hasReact || hasVue || hasAngular) {
      console.log('\n⚠️  PROBLEMA: Site usa JavaScript para renderizar!');
      console.log('   Cheerio não consegue executar JavaScript.');
      console.log('   SOLUÇÃO: Usar Puppeteer ou Playwright.');
    }
    
    // Buscar por div root
    const root = $('#root, #__next, [id*="app"]');
    if (root.length > 0) {
      console.log(`\n🎯 Root container encontrado: ${root.attr('id') || root.attr('class')}`);
      console.log(`   Conteúdo inicial: ${root.html()?.substring(0, 200)}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

analyzeAdNews();
