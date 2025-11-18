// src/scripts/fix-concorrente-tag-name.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Buscando pela tag "Concorrente"...');
  
  const singularTag = await prisma.tagCategory.findUnique({
    where: {
      name: 'Concorrente',
    },
  });

  if (singularTag) {
    console.log('Tag "Concorrente" encontrada. Atualizando para "Concorrentes"...');
    
    await prisma.tagCategory.update({
      where: {
        id: singularTag.id,
      },
      data: {
        name: 'Concorrentes',
      },
    });

    console.log('✅ Tag atualizada com sucesso!');
  } else {
    console.log('⚠️ Tag "Concorrente" (singular) não encontrada. Verificando se "Concorrentes" (plural) já existe...');
    const pluralTag = await prisma.tagCategory.findUnique({
        where: {
            name: 'Concorrentes',
        }
    });
    if (pluralTag) {
        console.log('✅ A tag "Concorrentes" já existe. Nenhuma ação necessária.');
    } else {
        console.log('❌ Nenhuma das tags foi encontrada. Algo está errado.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro ao atualizar a tag:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
