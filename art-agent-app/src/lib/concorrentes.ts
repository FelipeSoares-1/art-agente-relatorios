// Lista de concorrentes da Artplan baseado no arquivo data/concorrentes_artplan_ranking.csv
export const CONCORRENTES_ARTPLAN = [
  // ALTO - Concorrência direta mais forte (Top 10)
  { nome: 'WMcCann', nivel: 'ALTO', ranking: 1, grupo: 'Holding IPG' },
  { nome: 'VMLY&R', nivel: 'ALTO', ranking: 2, grupo: 'Holding WPP' },
  { nome: 'AlmapBBDO', nivel: 'ALTO', ranking: 3, grupo: 'Holding Omnicom' },
  { nome: 'AlmapBBDO', nivel: 'ALTO', ranking: 3, grupo: 'Holding Omnicom', alias: ['Almap', 'BBDO'] },
  { nome: 'Leo Burnett', nivel: 'ALTO', ranking: 4, grupo: 'Holding Publicis', alias: ['Leo'] },
  { nome: 'BETC Havas', nivel: 'ALTO', ranking: 5, grupo: 'Holding Havas', alias: ['BETC', 'Havas'] },
  { nome: 'Galeria', nivel: 'ALTO', ranking: 6, grupo: 'Independente Brasil', alias: ['Galeria.ag'] },
  { nome: 'Suno United Creators', nivel: 'ALTO', ranking: 7, grupo: 'Independente Brasil', alias: ['Suno'] },
  { nome: 'Africa Creative', nivel: 'ALTO', ranking: 8, grupo: 'Holding Omnicom', alias: ['Africa', 'Africa DDB'] },
  { nome: 'Ogilvy', nivel: 'ALTO', ranking: 9, grupo: 'Holding WPP', alias: ['Ogilvy & Mather', 'Ogilvy Brasil'] },
  { nome: 'Mediabrands', nivel: 'ALTO', ranking: 10, grupo: 'Holding IPG' },

  // MÉDIO - Concorrência relevante (11-23)
  { nome: 'DM9', nivel: 'MÉDIO', ranking: 11, grupo: 'Holding Omnicom', alias: ['DM9DDB'] },
  { nome: 'Grey', nivel: 'MÉDIO', ranking: 12, grupo: 'Holding WPP', alias: ['Grey Brasil'] },
  { nome: 'Publicis', nivel: 'MÉDIO', ranking: 13, grupo: 'Holding Publicis', alias: ['Publicis Brasil'] },
  { nome: 'DPZ', nivel: 'MÉDIO', ranking: 14, grupo: 'Independente Brasil', alias: ['DPZ&T'] },
  { nome: 'FCB', nivel: 'MÉDIO', ranking: 15, grupo: 'Holding IPG', alias: ['FCB Brasil'] },
  { nome: 'Talent', nivel: 'MÉDIO', ranking: 16, grupo: 'Independente Brasil', alias: ['Talent Marcel'] },
  { nome: 'Lew\'Lara\\TBWA', nivel: 'MÉDIO', ranking: 17, grupo: 'Holding Omnicom', alias: ['Lew Lara', 'TBWA'] },
  { nome: 'We', nivel: 'MÉDIO', ranking: 18, grupo: 'Independente Brasil', alias: ['Agência We'] },
  { nome: 'Fbiz', nivel: 'MÉDIO', ranking: 19, grupo: 'Holding WPP' },
  { nome: 'Wieden+Kennedy', nivel: 'MÉDIO', ranking: 20, grupo: 'Independente Brasil', alias: ['Wieden', 'W+K'] },
  { nome: 'Aldeiah', nivel: 'MÉDIO', ranking: 21, grupo: 'Holding IPG' },
  { nome: 'Propeg', nivel: 'MÉDIO', ranking: 22, grupo: 'Independente Brasil', alias: ['Propeg Comunicação'] },
  { nome: 'Dentsu Creative', nivel: 'MÉDIO', ranking: 23, grupo: 'Holding Dentsu', alias: ['Dentsu'] },

  // BAIXO - Concorrência indireta ou menor escala (24-50)
  { nome: 'iD\\TBWA', nivel: 'BAIXO', ranking: 24, grupo: 'Holding Omnicom' },
  { nome: 'Euphoria', nivel: 'BAIXO', ranking: 25, grupo: 'Especializada', alias: ['Euphoria Creative'] },
  { nome: 'R/GA', nivel: 'BAIXO', ranking: 26, grupo: 'Holding IPG' },
  { nome: 'David', nivel: 'BAIXO', ranking: 27, grupo: 'Independente Brasil' },
  { nome: 'Mestiça', nivel: 'BAIXO', ranking: 28, grupo: 'Especializada' },
  { nome: 'Accenture Song', nivel: 'BAIXO', ranking: 29, grupo: 'Especializada' },
  { nome: 'Wunderman Thompson', nivel: 'BAIXO', ranking: 30, grupo: 'Holding WPP' },
  { nome: 'LePub', nivel: 'BAIXO', ranking: 31, grupo: 'Holding Publicis' },
  { nome: 'Rawi', nivel: 'BAIXO', ranking: 32, grupo: 'Especializada', alias: ['Rawí'] },
  { nome: 'iProspect', nivel: 'BAIXO', ranking: 33, grupo: 'Holding Dentsu', alias: ['iProspect Dentsu'] },
  { nome: 'GUT', nivel: 'BAIXO', ranking: 34, grupo: 'Independente Brasil' },
  { nome: 'Tech And Soul', nivel: 'BAIXO', ranking: 35, grupo: 'Especializada' },
  { nome: 'Asia', nivel: 'BAIXO', ranking: 36, grupo: 'Holding Omnicom' },
  { nome: 'Streetwise', nivel: 'BAIXO', ranking: 37, grupo: 'Especializada' },
  { nome: 'Nova/SB', nivel: 'BAIXO', ranking: 38, grupo: 'Independente Brasil' },
  { nome: 'Calia', nivel: 'BAIXO', ranking: 39, grupo: 'Especializada' },
  { nome: 'Jüssi', nivel: 'BAIXO', ranking: 40, grupo: 'Especializada' },
  { nome: 'Greenz', nivel: 'BAIXO', ranking: 41, grupo: 'Independente Brasil' },
  { nome: 'LVL', nivel: 'BAIXO', ranking: 42, grupo: 'Especializada' },
  { nome: 'OpusMúltipla', nivel: 'BAIXO', ranking: 43, grupo: 'Especializada' },
  { nome: 'Binder', nivel: 'BAIXO', ranking: 44, grupo: 'Especializada' },
  { nome: 'Cheil', nivel: 'BAIXO', ranking: 45, grupo: 'Especializada', alias: ['Cheil Brasil'] },
  { nome: 'EssenceMediacom', nivel: 'BAIXO', ranking: 46, grupo: 'Holding WPP', alias: ['Blinks Essence'] },
  { nome: 'CP+B', nivel: 'BAIXO', ranking: 47, grupo: 'Especializada' },
  { nome: 'Droga5', nivel: 'BAIXO', ranking: 48, grupo: 'Especializada' },
  { nome: 'Agência Nacional', nivel: 'BAIXO', ranking: 49, grupo: 'Especializada' },
  { nome: 'Paim', nivel: 'BAIXO', ranking: 50, grupo: 'Especializada', alias: ['Paim Comunicação'] },
];

// Função para verificar se uma notícia menciona concorrentes
export function detectarConcorrentes(texto: string): Array<{ nome: string; nivel: string; ranking: number }> {
  const textoLower = texto.toLowerCase();
  const concorrentesEncontrados: Array<{ nome: string; nivel: string; ranking: number }> = [];
  
  for (const concorrente of CONCORRENTES_ARTPLAN) {
    const nomeLower = concorrente.nome.toLowerCase();
    
    // Verifica nome principal
    if (textoLower.includes(nomeLower)) {
      if (!concorrentesEncontrados.find(c => c.nome === concorrente.nome)) {
        concorrentesEncontrados.push({
          nome: concorrente.nome,
          nivel: concorrente.nivel,
          ranking: concorrente.ranking
        });
      }
      continue;
    }
    
    // Verifica alias
    if (concorrente.alias) {
      for (const alias of concorrente.alias) {
        if (textoLower.includes(alias.toLowerCase())) {
          if (!concorrentesEncontrados.find(c => c.nome === concorrente.nome)) {
            concorrentesEncontrados.push({
              nome: concorrente.nome,
              nivel: concorrente.nivel,
              ranking: concorrente.ranking
            });
          }
          break;
        }
      }
    }
  }
  
  // Ordenar por ranking (menor é mais importante)
  return concorrentesEncontrados.sort((a, b) => a.ranking - b.ranking);
}

// Função para gerar relatório de concorrentes
export function gerarRelatorioConcorrentes(noticias: Array<{ title: string; summary?: string | null }>) {
  const mencoesPorConcorrente: Record<string, { count: number; nivel: string; ranking: number }> = {};
  
  for (const noticia of noticias) {
    const texto = `${noticia.title} ${noticia.summary || ''}`;
    const concorrentes = detectarConcorrentes(texto);
    
    for (const concorrente of concorrentes) {
      if (!mencoesPorConcorrente[concorrente.nome]) {
        mencoesPorConcorrente[concorrente.nome] = {
          count: 0,
          nivel: concorrente.nivel,
          ranking: concorrente.ranking
        };
      }
      mencoesPorConcorrente[concorrente.nome].count++;
    }
  }
  
  // Converter para array e ordenar por número de menções
  const relatorio = Object.entries(mencoesPorConcorrente)
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.count - a.count);
  
  return relatorio;
}
