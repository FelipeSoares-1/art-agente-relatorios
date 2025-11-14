// Script para criar feeds genéricos e salvar artigos dos scrapers
import { scrapePropmark, scrapeMeioMensagem } from './src/lib/scrapers-especificos';
import { prisma } from './src/lib/db';

async function salvarArtigosComFeeds() {
  console.log('\n=== CRIANDO FEEDS E SALVANDO ARTIGOS ===\n');
  
  const startDate = new Date('2025-01-01');
  const stats = {
    propmark: { coletados: 0, salvos: 0, duplicados: 0 },
    meioMensagem: { coletados: 0, salvos: 0, duplicados: 0 },
  };
  
  // 1. Criar ou buscar feeds genéricos para scraping
  console.log('1. Configurando feeds...');
  
  const propmarkFeed = await prisma.rSSFeed.upsert({
    where: { url: 'https://propmark.com.br' },
    update: {},
    create: {
      name: 'Propmark (Scraping)',
      url: 'https://propmark.com.br',
    },
  });
  
  const mmFeed = await prisma.rSSFeed.upsert({
    where: { url: 'https://meioemensagem.com.br/comunicacao' },
    update: {},
    create: {
      name: 'Meio & Mensagem (Scraping)',
      url: 'https://meioemensagem.com.br/comunicacao',
    },
  });
  
  console.log(`✅ Feeds configurados:`);
  console.log(`   - Propmark: ID ${propmarkFeed.id}`);
  console.log(`   - Meio & Mensagem: ID ${mmFeed.id}`);
  
  // 2. Processar Propmark
  console.log('\n2. Processando Propmark...');
  const propmarkArticles = await scrapePropmark(startDate, 5);
  stats.propmark.coletados = propmarkArticles.length;
  
  for (const article of propmarkArticles) {
    try {
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          link: article.link,
          summary: article.summary,
          publishedDate: article.publishedDate,
          feedId: propmarkFeed.id,
          tags: JSON.stringify([]),
        },
      });
      stats.propmark.salvos++;
    } catch {
      stats.propmark.duplicados++;
    }
  }
  
  console.log(`✅ Propmark: ${stats.propmark.coletados} coletados, ${stats.propmark.salvos} salvos, ${stats.propmark.duplicados} duplicados`);
  
  // 3. Processar Meio & Mensagem
  console.log('\n3. Processando Meio & Mensagem...');
  const mmArticles = await scrapeMeioMensagem(startDate, 5);
  stats.meioMensagem.coletados = mmArticles.length;
  
  for (const article of mmArticles) {
    try {
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          link: article.link,
          summary: article.summary,
          publishedDate: article.publishedDate,
          feedId: mmFeed.id,
          tags: JSON.stringify([]),
        },
      });
      stats.meioMensagem.salvos++;
    } catch {
      stats.meioMensagem.duplicados++;
    }
  }
  
  console.log(`✅ Meio & Mensagem: ${stats.meioMensagem.coletados} coletados, ${stats.meioMensagem.salvos} salvos, ${stats.meioMensagem.duplicados} duplicados`);
  
  // 4. Resumo final
  const totalSalvos = stats.propmark.salvos + stats.meioMensagem.salvos;
  const totalColetados = stats.propmark.coletados + stats.meioMensagem.coletados;
  
  console.log(`\n=== RESUMO FINAL ===`);
  console.log(`📊 Total coletado: ${totalColetados} artigos`);
  console.log(`💾 Total salvo: ${totalSalvos} novos artigos`);
  console.log(`🔄 Total duplicados: ${totalColetados - totalSalvos}`);
  
  // 5. Verificar total no banco
  const totalNoBanco = await prisma.newsArticle.count();
  console.log(`📚 Total no banco de dados: ${totalNoBanco} artigos`);
  
  console.log(`\n✅ PROCESSO CONCLUÍDO!\n`);
}

salvarArtigosComFeeds().catch(console.error);
