// src/services/CompetitorService.ts
import { CONCORRENTES_ARTPLAN, isRelevantPublicityNews } from '../lib/tag-helper';

interface Competitor {
  nome: string;
  nivel: string;
  ranking: number;
}

class CompetitorService {
  /**
   * Detecta concorrentes em um texto e retorna uma lista de objetos de concorrentes.
   * @param texto - O texto a ser analisado.
   * @param feedName - O nome do feed da notícia.
   * @returns Uma lista de concorrentes encontrados.
   */
  public detectarConcorrentes(texto: string, feedName: string = ''): Competitor[] {
    const textoLower = texto.toLowerCase();
    const concorrentesEncontrados: Competitor[] = [];

    for (const concorrente of CONCORRENTES_ARTPLAN) {
      const nomeLower = concorrente.nome.toLowerCase();
      let encontrado = false;

      // Verifica nome principal
      if (textoLower.includes(nomeLower)) {
        encontrado = true;
      }

      // Verifica alias se existir
      if (!encontrado && 'alias' in concorrente) {
        const aliases = (concorrente as any).alias;
        if (Array.isArray(aliases)) {
          for (const alias of aliases) {
            if (textoLower.includes(alias.toLowerCase())) {
              encontrado = true;
              break;
            }
          }
        }
      }

      if (encontrado) {
        // APLICAR VERIFICAÇÃO CONTEXTUAL
        const relevanceCheck = isRelevantPublicityNews(texto, '', feedName, concorrente.nome);
        
        if (relevanceCheck.isRelevant) {
          if (!concorrentesEncontrados.find(c => c.nome === concorrente.nome)) {
            concorrentesEncontrados.push({
              nome: concorrente.nome,
              nivel: concorrente.nivel,
              ranking: concorrente.ranking
            });
          }
        }
      }
    }

    // Ordenar por ranking (menor é mais importante)
    return concorrentesEncontrados.sort((a, b) => a.ranking - b.ranking);
  }

  /**
   * Gera um relatório de menções a concorrentes.
   * @param noticias - Uma lista de notícias para analisar.
   * @returns Um relatório de menções a concorrentes.
   */
  public gerarRelatorioConcorrentes(noticias: Array<{ title: string; summary?: string | null; feedName?: string }>) {
    const mencoesPorConcorrente: Record<string, { count: number; nivel: string; ranking: number }> = {};

    for (const noticia of noticias) {
      const texto = `${noticia.title} ${noticia.summary || ''}`;
      const feedName = noticia.feedName || 'Unknown';
      const concorrentes = this.detectarConcorrentes(texto, feedName);

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

  private hasPublicityContext(text: string, agencyName: string): boolean {
    const contextWords = [
      'lança', 'cria', 'desenvolve', 'assina', 'campanha', 'cliente',
      'conta', 'publicidade', 'propaganda', 'marketing', 'criação'
    ];

    // Procura por palavras de contexto próximas à agência
    const agencyIndex = text.indexOf(agencyName);
    if (agencyIndex === -1) return false;

    // Verifica contexto 50 caracteres antes e depois
    const before = text.substring(Math.max(0, agencyIndex - 50), agencyIndex);
    const after = text.substring(agencyIndex, agencyIndex + 50);
    const contextArea = before + after;

    return contextWords.some(word => contextArea.includes(word));
  }
}

export const competitorService = new CompetitorService();
