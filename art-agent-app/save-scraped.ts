// Script para salvar artigos dos scrapers específicos no banco
import { scrapePropmark, scrapeMeioMensagem } from './src/lib/scrapers-especificos';
import { prisma } from './src/lib/db';

async function salvarArtigos() {
  console.log('\n=== SALVANDO ARTIGOS DOS SCRAPERS ESPECÍFICOS ===\n');
  
  const startDate = new Date('2025-01-01');
  const stats = {
    propmark: { coletados: 0, salvos: 0, duplicados: 0 },
    meioMensagem: { coletados: 0, salvos: 0, duplicados: 0 },
  };
  
  // Garantir que os feeds existem
  let propmarkFeed = await prisma.rSSFeed.findUnique({ where: { name: 'Propmark' } });
  if (!propmarkFeed) {
    propmarkFeed = await prisma.rSSFeed.create({
      data: { name: 'Propmark', url: 'https://www.propmark.com.br' },
    });
  }
  
  let meioMensagemFeed = await prisma.rSSFeed.findUnique({ where: { name: 'Meio & Mensagem' } });
  if (!meioMensagemFeed) {
    meioMensagemFeed = await prisma.rSSFeed.create({
      data: { name: 'Meio & Mensagem', url: 'https://www.meioemenasagem.com.br' },
    });
  }
  
  // Propmark
  console.log('1. Processando Propmark...');
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
          tags: JSON.stringify([]),
          feedId: propmarkFeed.id,
        },
      });
      stats.propmark.salvos++;
    } catch {
      stats.propmark.duplicados++;
    }
  }
  
  console.log(`✅ Propmark: ${stats.propmark.coletados} coletados, ${stats.propmark.salvos} salvos, ${stats.propmark.duplicados} duplicados`);
  
  // Meio & Mensagem
  console.log('\n2. Processando Meio & Mensagem...');
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
          tags: JSON.stringify([]),
          feedId: meioMensagemFeed.id,
        },
      });
      stats.meioMensagem.salvos++;
    } catch {
      stats.meioMensagem.duplicados++;
    }
  }
  
  console.log(`✅ Meio & Mensagem: ${stats.meioMensagem.coletados} coletados, ${stats.meioMensagem.salvos} salvos, ${stats.meioMensagem.duplicados} duplicados`);
  
  const totalSalvos = stats.propmark.salvos + stats.meioMensagem.salvos;
  const totalColetados = stats.propmark.coletados + stats.meioMensagem.coletados;
  
  console.log(`\n=== RESUMO FINAL ===`);
  console.log(`Total coletado: ${totalColetados} artigos`);
  console.log(`Total salvo: ${totalSalvos} novos artigos`);
  console.log(`Total duplicados: ${totalColetados - totalSalvos}`);
  console.log(`\n✅ PROCESSO CONCLUÍDO!\n`);
}

salvarArtigos().catch(console.error);
