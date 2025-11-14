import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateConcorrentesTag() {
  console.log('🔄 Atualizando categoria Concorrentes com lista completa do CSV...\n');

  // Lista completa de concorrentes do CSV
  const concorrentes = [
    // Top 10 - ALTO
    'WMcCann', 'VMLY&R', 'AlmapBBDO', 'Almap BBDO', 'Leo Burnett', 'BETC Havas',
    'Galeria', 'Galeria.ag', 'Suno United Creators', 'Africa Creative', 'Africa DDB', 'Africa',
    'Ogilvy', 'Ogilvy & Mather', 'Mediabrands',
    
    // 11-20 - MÉDIO
    'DM9', 'DM9DDB', 'Grey Brasil', 'Grey', 'Publicis Brasil', 'Publicis',
    'DPZ', 'DPZ&T', 'FCB Brasil', 'FCB', 'Talent', 'Talent Marcel',
    'Lew Lara', 'Lew\'Lara', 'TBWA', 'We', 'Agência We', 'Fbiz', 'Wieden+Kennedy',
    
    // 21-30
    'Aldeiah', 'Propeg', 'Propeg Comunicação', 'Dentsu Creative', 'Dentsu',
    'iD\\TBWA', 'Euphoria Creative', 'R/GA', 'David', 'Mestiça',
    'Accenture Song', 'Wunderman Thompson', 'Wunderman',
    
    // 31-40
    'LePub', 'Rawi', 'Rawí', 'iProspect Dentsu', 'iProspect',
    'GUT', 'Tech And Soul', 'Asia', 'Streetwise', 'Nova/SB', 'Calia',
    
    // 41-50
    'Jüssi', 'Jussi', 'Greenz', 'LVL', 'OpusMúltipla', 'Opus Múltipla',
    'Binder', 'Cheil Brasil', 'Cheil', 'EssenceMediacom', 'Blinks Essence',
    'CP+B', 'Droga5', 'Agência Nacional', 'Paim Comunicação', 'Paim',
    
    // Holdings e variações
    'IPG', 'WPP', 'Omnicom', 'Havas', 'McCann', 'BBDO', 'DDB',
    'Lew Lara TBWA', 'AlmapBBDO', 'Africa DDB'
  ];

  // Remove duplicatas e ordena
  const uniqueConcorrentes = [...new Set(concorrentes.map(c => c.toLowerCase()))]
    .sort();

  console.log(`📋 Total de keywords: ${uniqueConcorrentes.length}\n`);

  try {
    // Atualiza a categoria Concorrentes
    const updated = await prisma.tagCategory.update({
      where: { name: 'Concorrentes' },
      data: {
        keywords: JSON.stringify(uniqueConcorrentes)
      }
    });

    console.log('✅ Categoria "Concorrentes" atualizada com sucesso!');
    console.log(`📊 ${uniqueConcorrentes.length} keywords cadastradas\n`);
    
    console.log('🏢 Primeiras 20 agências:');
    uniqueConcorrentes.slice(0, 20).forEach((agencia, idx) => {
      console.log(`   ${idx + 1}. ${agencia}`);
    });
    
    console.log(`   ... e mais ${uniqueConcorrentes.length - 20} agências\n`);
    
    return updated;
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    throw error;
  }
}

updateConcorrentesTag()
  .then(() => {
    console.log('\n✨ Atualização concluída!');
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na atualização:', error);
    prisma.$disconnect();
    process.exit(1);
  });
