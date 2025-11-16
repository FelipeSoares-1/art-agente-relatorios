import { PrismaClient } from '@prisma/client';
import { loadTagCategories } from '../lib/tag-helper';

const prisma = new PrismaClient();

async function debugTagSystem() {
  console.log('🔍 DEBUG DO SISTEMA DE TAGS\n');

  // 1. Verificar categorias no banco
  console.log('📊 CATEGORIAS NO BANCO:');
  const dbCategories = await prisma.tagCategory.findMany({
    where: { enabled: true },
    select: { name: true, keywords: true }
  });

  dbCategories.forEach(cat => {
    const keywords = JSON.parse(cat.keywords);
    console.log(`  • ${cat.name}:`);
    console.log(`    Keywords: ${keywords.join(', ')}`);
    console.log('');
  });

  // 2. Verificar o que o sistema carrega
  console.log('🔄 CATEGORIAS CARREGADAS PELO SISTEMA:');
  const loadedCategories = await loadTagCategories();
  
  loadedCategories.forEach(cat => {
    console.log(`  • ${cat.name}:`);
    console.log(`    Keywords: ${cat.keywords.join(', ')}`);
    console.log('');
  });

  // 3. Teste manual de detecção
  console.log('🧪 TESTE MANUAL DE DETECÇÃO:');
  
  const testText = "AlmapBBDO vence nova conta da Coca-Cola";
  console.log(`Texto: "${testText}"`);
  console.log(`Texto lowercase: "${testText.toLowerCase()}"`);
  
  for (const category of loadedCategories) {
    console.log(`\nTestando categoria "${category.name}":`);
    
    for (const keyword of category.keywords) {
      const found = testText.toLowerCase().includes(keyword.toLowerCase());
      console.log(`  • "${keyword}": ${found ? '✅ ENCONTRADA' : '❌ não encontrada'}`);
    }
  }

  await prisma.$disconnect();
}

debugTagSystem().catch(console.error);