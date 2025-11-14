import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConcorrentesTag() {
  try {
    const tag = await prisma.tagCategory.findFirst({
      where: { name: 'Concorrentes' }
    });

    if (tag) {
      console.log('\n📋 TAG CONCORRENTES ATUAL:\n');
      console.log(`ID: ${tag.id}`);
      console.log(`Nome: ${tag.name}`);
      console.log(`Cor: ${tag.color}`);
      console.log(`Habilitada: ${tag.enabled}`);
      console.log(`\n🏷️  KEYWORDS (${JSON.parse(tag.keywords).length} total):\n`);
      
      const keywords = JSON.parse(tag.keywords);
      keywords.forEach((kw: string, index: number) => {
        console.log(`  ${index + 1}. ${kw}`);
      });
    } else {
      console.log('❌ Tag Concorrentes não encontrada');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConcorrentesTag();
