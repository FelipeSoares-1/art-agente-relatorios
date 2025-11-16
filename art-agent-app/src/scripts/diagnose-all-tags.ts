import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarTodasAsTags() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE TODAS AS TAGS\n');
  
  // Buscar todas as notícias com tags
  const todasNoticias = await prisma.newsArticle.findMany({
    where: {
      tags: { not: null }
    },
    select: {
      title: true,
      summary: true,
      tags: true,
      publishedDate: true,
      link: true,
      feed: {
        select: {
          name: true
        }
      }
    },
    orderBy: { publishedDate: 'desc' },
    take: 1000 // Analisar últimas 1000 notícias
  });

  console.log(`📊 Analisando ${todasNoticias.length} notícias...\n`);

  // Extrair e contar todas as tags
  const tagStats: Record<string, {
    count: number;
    exemplos: Array<{
      title: string;
      feed: string;
      isRelevant: boolean;
    }>;
    feedDistribution: Record<string, number>;
  }> = {};

  for (const noticia of todasNoticias) {
    try {
      const tags = JSON.parse(noticia.tags || '[]');
      
      for (const tag of tags) {
        if (!tagStats[tag]) {
          tagStats[tag] = {
            count: 0,
            exemplos: [],
            feedDistribution: {}
          };
        }
        
        tagStats[tag].count++;
        
        // Distribuição por feed
        if (!tagStats[tag].feedDistribution[noticia.feed.name]) {
          tagStats[tag].feedDistribution[noticia.feed.name] = 0;
        }
        tagStats[tag].feedDistribution[noticia.feed.name]++;
        
        // Guardar exemplos (máximo 10 por tag)
        if (tagStats[tag].exemplos.length < 10) {
          const isRelevant = analisarRelevanciaManual(tag, noticia.title, noticia.summary || '', noticia.feed.name);
          tagStats[tag].exemplos.push({
            title: noticia.title,
            feed: noticia.feed.name,
            isRelevant
          });
        }
      }
    } catch {
      // Ignorar erros de parsing de JSON
      continue;
    }
  }

  // Ordenar tags por quantidade
  const tagsOrdenadas = Object.entries(tagStats)
    .sort(([,a], [,b]) => b.count - a.count);

  console.log('📈 TOP 20 TAGS MAIS USADAS:\n');
  console.log('='.repeat(100));

  for (let i = 0; i < Math.min(20, tagsOrdenadas.length); i++) {
    const [tag, stats] = tagsOrdenadas[i];
    
    // Calcular taxa de relevância
    const relevantes = stats.exemplos.filter(ex => ex.isRelevant).length;
    const taxaRelevancia = stats.exemplos.length > 0 ? (relevantes / stats.exemplos.length * 100).toFixed(1) : 'N/A';
    
    console.log(`\n${i + 1}. 🏷️  TAG: "${tag}"`);
    console.log(`   📊 Quantidade: ${stats.count} notícias`);
    console.log(`   🎯 Taxa de Relevância: ${taxaRelevancia}% (${relevantes}/${stats.exemplos.length} amostras)`);
    
    // Distribuição por feeds principais
    const topFeeds = Object.entries(stats.feedDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    console.log(`   📰 Principais Feeds: ${topFeeds.map(([feed, count]) => `${feed} (${count})`).join(', ')}`);
    
    // Status de qualidade
    const qualityStatus = getQualityStatus(parseFloat(taxaRelevancia), stats.count);
    console.log(`   ${qualityStatus}`);
    
    // Mostrar exemplos problemáticos
    const problemáticos = stats.exemplos.filter(ex => !ex.isRelevant);
    if (problemáticos.length > 0) {
      console.log(`   🚨 Exemplos Problemáticos:`);
      for (let j = 0; j < Math.min(3, problemáticos.length); j++) {
        console.log(`      • "${problemáticos[j].title.substring(0, 60)}..." (${problemáticos[j].feed})`);
      }
    }
    
    console.log('   ' + '─'.repeat(90));
  }

  // Identificar tags mais problemáticas
  console.log(`\n🚨 TAGS MAIS PROBLEMÁTICAS (< 60% de relevância):\n`);
  
  const tagsProblematicas = tagsOrdenadas
    .filter(([, stats]) => {
      const relevantes = stats.exemplos.filter(ex => ex.isRelevant).length;
      const taxa = stats.exemplos.length > 0 ? relevantes / stats.exemplos.length : 1;
      return taxa < 0.6 && stats.count >= 10; // Só considerar tags com uso significativo
    })
    .slice(0, 10);

  if (tagsProblematicas.length > 0) {
    for (const [tag, stats] of tagsProblematicas) {
      const relevantes = stats.exemplos.filter(ex => ex.isRelevant).length;
      const taxa = (relevantes / stats.exemplos.length * 100).toFixed(1);
      
      console.log(`🔥 "${tag}" - ${taxa}% relevante (${stats.count} notícias)`);
      console.log(`   💡 Sugestão: ${getSuggestion(tag, parseFloat(taxa))}`);
    }
  } else {
    console.log('✅ Nenhuma tag problemática encontrada!');
  }

  // Resumo executivo
  console.log(`\n📋 RESUMO EXECUTIVO:`);
  console.log(`📊 Total de tags únicas: ${tagsOrdenadas.length}`);
  console.log(`🔥 Tags problemáticas: ${tagsProblematicas.length}`);
  console.log(`✅ Tags funcionando bem: ${tagsOrdenadas.length - tagsProblematicas.length}`);
  
  const topTags = tagsOrdenadas.slice(0, 10);
  const mediaRelevancia = topTags.reduce((acc, [, stats]) => {
    const relevantes = stats.exemplos.filter(ex => ex.isRelevant).length;
    return acc + (relevantes / stats.exemplos.length);
  }, 0) / topTags.length * 100;
  
  console.log(`🎯 Taxa média de relevância (top 10): ${mediaRelevancia.toFixed(1)}%`);
  
  // Recomendações
  console.log(`\n💡 RECOMENDAÇÕES:`);
  if (tagsProblematicas.length > 0) {
    console.log(`🔧 Aplicar verificação contextual em ${tagsProblematicas.length} tags problemáticas`);
    console.log(`📈 Potencial de melhoria: ${tagsProblematicas.reduce((acc, [,stats]) => acc + stats.count, 0)} notícias`);
  }
  
  if (mediaRelevancia >= 80) {
    console.log(`👍 Sistema geral está bem! Focar apenas nas tags problemáticas.`);
  } else if (mediaRelevancia >= 60) {
    console.log(`⚠️ Sistema precisa de melhorias pontuais.`);
  } else {
    console.log(`🚨 Sistema precisa de revisão abrangente.`);
  }
}

function analisarRelevanciaManual(tag: string, title: string, summary: string, feedName: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  const tagLower = tag.toLowerCase();
  
  // Análise específica por tipo de tag
  switch (tagLower) {
    case 'concorrentes':
      return analisarConcorrentes(text, feedName);
    
    case 'artplan':
      return analisarArtplan(text);
    
    case 'prêmios':
    case 'premios':
      return analisarPremios(text);
    
    case 'campanhas':
      return analisarCampanhas(text);
    
    case 'novos clientes':
      return analisarNovosClientes(text);
    
    case 'digital':
      return analisarDigital(text);
    
    case 'inovação':
    case 'inovacao':
      return analisarInovacao(text, feedName);
    
    case 'mercado':
      return analisarMercado(text, feedName);
    
    default:
      return analisarGenerico(text, feedName);
  }
}

function analisarConcorrentes(text: string, feedName: string): boolean {
  const irrelevant = ['trump', 'biden', 'científico', 'médico', 'smartphone', 'tempestade', 'foguete'];
  const relevant = ['agência', 'publicidade', 'campanha', 'cliente', 'marketing'];
  
  if (irrelevant.some(word => text.includes(word))) return false;
  return relevant.some(word => text.includes(word)) || 
         ['propmark', 'meio', 'adnews'].some(source => feedName.toLowerCase().includes(source));
}

function analisarArtplan(text: string): boolean {
  const irrelevant = ['funcionário preso', 'acidente', 'crime', 'problema pessoal'];
  const relevant = ['campanha', 'cliente', 'projeto', 'criação', 'agência', 'publicidade'];
  
  if (irrelevant.some(phrase => text.includes(phrase))) return false;
  return relevant.some(word => text.includes(word));
}

function analisarPremios(text: string): boolean {
  const irrelevant = ['esportivo', 'político', 'científico', 'nobel', 'oscar', 'grammy'];
  const relevant = ['publicidade', 'propaganda', 'marketing', 'cannes', 'criatividade', 'agência'];
  
  if (irrelevant.some(word => text.includes(word))) return false;
  return relevant.some(word => text.includes(word));
}

function analisarCampanhas(text: string): boolean {
  const irrelevant = ['política', 'eleitoral', 'vacinação', 'saúde pública'];
  const relevant = ['publicitária', 'marketing', 'marca', 'produto', 'agência'];
  
  if (irrelevant.some(word => text.includes(word))) return false;
  return relevant.some(word => text.includes(word));
}

function analisarNovosClientes(text: string): boolean {
  const irrelevant = ['banco', 'cartão de crédito', 'financeiro', 'jurídico'];
  const relevant = ['agência', 'publicidade', 'conta', 'marketing', 'comunicação'];
  
  if (irrelevant.some(word => text.includes(word))) return false;
  return relevant.some(word => text.includes(word));
}

function analisarDigital(text: string): boolean {
  const irrelevant = ['moeda digital', 'documento digital', 'assinatura digital'];
  const relevant = ['marketing digital', 'publicidade digital', 'agência digital', 'campanha digital'];
  
  if (irrelevant.some(phrase => text.includes(phrase))) return false;
  return relevant.some(phrase => text.includes(phrase));
}

function analisarInovacao(text: string, feedName: string): boolean {
  // Inovação é muito ampla, precisa contexto publicitário
  const relevant = ['publicidade', 'marketing', 'agência', 'comunicação', 'campanha'];
  return relevant.some(word => text.includes(word)) ||
         ['propmark', 'meio', 'adnews'].some(source => feedName.toLowerCase().includes(source));
}

function analisarMercado(text: string, feedName: string): boolean {
  // Mercado é muito ampla, precisa contexto publicitário
  const irrelevant = ['mercado financeiro', 'bolsa de valores', 'commodities'];
  const relevant = ['publicidade', 'marketing', 'agência', 'comunicação'];
  
  if (irrelevant.some(phrase => text.includes(phrase))) return false;
  return relevant.some(word => text.includes(word)) ||
         ['propmark', 'meio', 'adnews'].some(source => feedName.toLowerCase().includes(source));
}

function analisarGenerico(text: string, feedName: string): boolean {
  // Para tags não específicas, usar critério geral de relevância publicitária
  const relevant = ['publicidade', 'marketing', 'agência', 'comunicação', 'campanha', 'marca'];
  return relevant.some(word => text.includes(word)) ||
         ['propmark', 'meio', 'adnews'].some(source => feedName.toLowerCase().includes(source));
}

function getQualityStatus(relevancia: number, count: number): string {
  if (isNaN(relevancia)) return '❓ Status: Sem dados suficientes';
  
  if (relevancia >= 80) {
    return '✅ Status: EXCELENTE - Funcionando bem';
  } else if (relevancia >= 60) {
    return '⚠️  Status: REGULAR - Pode melhorar';
  } else if (count >= 50) {
    return '🚨 Status: PROBLEMÁTICA - Necessita correção urgente';
  } else {
    return '🔍 Status: MONITORAR - Poucos dados';
  }
}

function getSuggestion(tag: string, relevancia: number): string {
  const suggestions = [
    'Aplicar verificação contextual similar à de "Concorrentes"',
    'Refinar palavras-chave de detecção',
    'Adicionar filtros por fonte confiável',
    'Implementar penalizações para contextos irrelevantes'
  ];
  
  if (relevancia < 30) {
    return `${suggestions[0]} + ${suggestions[3]}`;
  } else if (relevancia < 50) {
    return suggestions[1];
  } else {
    return suggestions[2];
  }
}

diagnosticarTodasAsTags()
  .then(() => {
    console.log('\n✅ Diagnóstico completo de tags concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no diagnóstico:', error);
    process.exit(1);
  });