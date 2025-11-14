import { prisma } from './src/lib/db';

async function mostrarExemplos() {
  console.log('\n📰 EXEMPLOS DE ARTIGOS COLETADOS\n');
  console.log('═'.repeat(60));
  
  // Propmark
  const propmark = await prisma.newsArticle.findMany({
    where: { feedId: 54 },
    take: 3,
    orderBy: { publishedDate: 'desc' }
  });
  
  console.log('\n✅ PROPMARK (últimos 3 artigos):');
  console.log('─'.repeat(60));
  propmark.forEach((a, i) => {
    console.log(`\n${i+1}. ${a.title}`);
    console.log(`   📅 ${a.publishedDate.toLocaleDateString('pt-BR')}`);
    console.log(`   🔗 ${a.link.substring(0, 50)}...`);
  });
  
  // Meio & Mensagem
  const mm = await prisma.newsArticle.findMany({
    where: { feedId: 72 },
    take: 3,
    orderBy: { publishedDate: 'desc' }
  });
  
  console.log('\n\n✅ MEIO & MENSAGEM (últimos 3 artigos):');
  console.log('─'.repeat(60));
  mm.forEach((a, i) => {
    console.log(`\n${i+1}. ${a.title}`);
    console.log(`   📅 ${a.publishedDate.toLocaleDateString('pt-BR')}`);
    console.log(`   🔗 ${a.link.substring(0, 50)}...`);
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Artigos coletados com sucesso dos sites prioritários!\n');
  
  process.exit(0);
}

mostrarExemplos();
