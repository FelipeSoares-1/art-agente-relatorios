/**
 * Script para testar e identificar os seletores HTML corretos
 * dos sites Propmark e AdNews
 */

import * as cheerio from 'cheerio';

async function testPropmark() {
  console.log('\n🔍 TESTANDO PROPMARK\n');
  console.log('='.repeat(60));
  
  try {
    const searchUrl = 'https://propmark.com.br/?s=artplan';
    console.log(`URL: ${searchUrl}\n`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Testar diferentes seletores
    console.log('📋 Testando seletores...\n');
    
    // Seletor 1: article
    const articles1 = $('article');
    console.log(`1. article: ${articles1.length} elementos`);
    
    // Seletor 2: .post
    const articles2 = $('.post');
    console.log(`2. .post: ${articles2.length} elementos`);
    
    // Seletor 3: .entry
    const articles3 = $('.entry');
    console.log(`3. .entry: ${articles3.length} elementos`);
    
    // Seletor 4: .search-result
    const articles4 = $('.search-result');
    console.log(`4. .search-result: ${articles4.length} elementos`);
    
    // Seletor 5: .item-list
    const articles5 = $('.item-list');
    console.log(`5. .item-list: ${articles5.length} elementos`);
    
    // Seletor 6: .c-post
    const articles6 = $('.c-post');
    console.log(`6. .c-post: ${articles6.length} elementos`);
    
    // Seletor 7: [class*="post"]
    const articles7 = $('[class*="post"]');
    console.log(`7. [class*="post"]: ${articles7.length} elementos`);
    
    // Tentar extrair título do primeiro elemento encontrado
    console.log('\n📰 Testando extração de dados do primeiro elemento:\n');
    
    if (articles1.length > 0) {
      const $first = $(articles1[0]);
      
      // Testar diferentes seletores de título
      const title1 = $first.find('h2 a').first().text().trim();
      const title2 = $first.find('h3 a').first().text().trim();
      const title3 = $first.find('.entry-title a').first().text().trim();
      const title4 = $first.find('a.title').first().text().trim();
      const title5 = $first.find('h2').first().text().trim();
      const title6 = $first.find('h3').first().text().trim();
      
      console.log(`h2 a: "${title1}"`);
      console.log(`h3 a: "${title2}"`);
      console.log(`.entry-title a: "${title3}"`);
      console.log(`a.title: "${title4}"`);
      console.log(`h2: "${title5}"`);
      console.log(`h3: "${title6}"`);
      
      // Link
      const link1 = $first.find('a').first().attr('href');
      console.log(`\nPrimeiro link: ${link1}`);
      
      // Resumo
      const summary1 = $first.find('p').first().text().trim().substring(0, 100);
      console.log(`Resumo: ${summary1}...`);
    }
    
    // Salvar HTML para análise manual (primeiros 5000 chars)
    console.log('\n📄 HTML (primeiros 2000 caracteres):\n');
    console.log(html.substring(0, 2000));
    
  } catch (error) {
    console.error('❌ Erro ao testar Propmark:', error);
  }
}

async function testAdNews() {
  console.log('\n\n🔍 TESTANDO ADNEWS\n');
  console.log('='.repeat(60));
  
  try {
    const searchUrl = 'https://adnews.com.br/?s=artplan';
    console.log(`URL: ${searchUrl}\n`);
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Testar diferentes seletores
    console.log('📋 Testando seletores...\n');
    
    // Seletor 1: article
    const articles1 = $('article');
    console.log(`1. article: ${articles1.length} elementos`);
    
    // Seletor 2: .post
    const articles2 = $('.post');
    console.log(`2. .post: ${articles2.length} elementos`);
    
    // Seletor 3: .item
    const articles3 = $('.item');
    console.log(`3. .item: ${articles3.length} elementos`);
    
    // Seletor 4: .search-result
    const articles4 = $('.search-result');
    console.log(`4. .search-result: ${articles4.length} elementos`);
    
    // Seletor 5: .card
    const articles5 = $('.card');
    console.log(`5. .card: ${articles5.length} elementos`);
    
    // Seletor 6: [class*="post"]
    const articles6 = $('[class*="post"]');
    console.log(`6. [class*="post"]: ${articles6.length} elementos`);
    
    // Tentar extrair título do primeiro elemento encontrado
    console.log('\n📰 Testando extração de dados do primeiro elemento:\n');
    
    if (articles1.length > 0) {
      const $first = $(articles1[0]);
      
      // Testar diferentes seletores de título
      const title1 = $first.find('h2 a').first().text().trim();
      const title2 = $first.find('h3 a').first().text().trim();
      const title3 = $first.find('.title a').first().text().trim();
      const title4 = $first.find('h2').first().text().trim();
      const title5 = $first.find('h3').first().text().trim();
      
      console.log(`h2 a: "${title1}"`);
      console.log(`h3 a: "${title2}"`);
      console.log(`.title a: "${title3}"`);
      console.log(`h2: "${title4}"`);
      console.log(`h3: "${title5}"`);
      
      // Link
      const link1 = $first.find('a').first().attr('href');
      console.log(`\nPrimeiro link: ${link1}`);
      
      // Resumo
      const summary1 = $first.find('p').first().text().trim().substring(0, 100);
      console.log(`Resumo: ${summary1}...`);
    }
    
    // Salvar HTML para análise manual (primeiros 5000 chars)
    console.log('\n📄 HTML (primeiros 2000 caracteres):\n');
    console.log(html.substring(0, 2000));
    
  } catch (error) {
    console.error('❌ Erro ao testar AdNews:', error);
  }
}

async function main() {
  console.log('\n🧪 TESTE DE SCRAPERS - HTML PARSING\n');
  console.log('='.repeat(60));
  
  await testPropmark();
  await testAdNews();
  
  console.log('\n\n✅ Testes concluídos!\n');
}

main();
