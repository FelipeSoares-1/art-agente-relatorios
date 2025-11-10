import { DateTime } from "luxon";

/**
 * Dados simulados para o agente de notícias.
 * Na implementação real, isso seria substituído por chamadas ao tool search.
 */
interface NewsItem {
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  url: string;
  source: string;
  topic: "Futebol" | "iGaming" | "Marketing";
}

function getSimulatedNewsData(): NewsItem[] {
  return [
    // Futebol
    {
      title: "Flamengo vence, aproveita derrota do Palmeiras e volta a igualar rival.",
      date: "2025-11-10",
      url: "https://www.hojeemdia.com.br/esportes/flamengo-vence-aproveita-derrota-do-palmeiras-e-volta-a-igualar-rival-1.1092166",
      source: "Hoje em Dia",
      topic: "Futebol",
    },
    {
      title: "Real Madrid confirma lesões de Courtois e Valverde antes da Data Fifa.",
      date: "2025-11-10",
      url: "https://www.lance.com.br/futebol-internacional/astros-sofrem-lesoes-e-sao-cortados-de-selecoes-real-madrid-ja-soma-11-baixas-na-temporada.html",
      source: "Lance!",
      topic: "Futebol",
    },
    {
      title: "Palmeiras perde e deixa-se apanhar pelo Flamengo no topo do Brasileirão.",
      date: "2025-11-09",
      url: "https://sportinforma.sapo.pt/futebol/brasileirao-serie-a/artigos/palmeiras-perde-e-deixa-se-apanhar-pelo-flamengo-no-topo-do-brasileirao",
      source: "Sportinforma",
      topic: "Futebol",
    },

    // iGaming
    {
      title: "Globo fecha com Superbet e mais 3 marcas para a Copa do Mundo de 2026.",
      date: "2025-11-09",
      url: "https://www.meioemensagem.com.br/midia/globo-ja-tem-4-marcas-para-a-copa-do-mundo-de-2026",
      source: "Meio & Mensagem",
      topic: "iGaming",
    },
    {
      title: "Audiência na Câmara debaterá proteção ao consumidor no mercado de apostas.",
      date: "2025-11-07",
      url: "https://www.camara.leg.br/noticias/1010940-audiencia-na-camara-discute-regulamentacao-de-apostas-esportivas/",
      source: "Agência Câmara",
      topic: "iGaming",
    },
    {
      title: "Caixa suspende lançamento de sua plataforma de apostas esportivas.",
      date: "2025-11-06",
      url: "https://www.igamingbrazil.com/destaques/2025/11/06/lula-cobra-e-caixa-suspende-lancamento-de-plataforma-de-apostas/",
      source: "iGaming Brazil",
      topic: "iGaming",
    },
    {
      title: "Betano: Código promocional TERRAVIP oferece bônus e rodadas grátis.",
      date: "2025-11-04",
      url: "https://www.terra.com.br/apostas/codigo-bonus/codigo-de-indicacao-betano,4be2833e2e3f33d5a2d96aa70a1bf928nmxk448m.html",
      source: "Terra",
      topic: "iGaming",
    },

    // Marketing
    {
      title: "AliExpress escala Popó e Wanderlei Silva para campanha do '11.11'.",
      date: "2025-11-10",
      url: "https://www.mundodomarketing.com.br/ultimas-noticias/401330/aliexpress-escala-popo-e-wanderlei-silva-para-campanha-do-11-11.html",
      source: "Mundo do Marketing",
      topic: "Marketing",
    },
    {
      title: "Globo fecha com Superbet e mais 3 marcas para a Copa do Mundo de 2026.",
      date: "2025-11-09",
      url: "https://www.meioemensagem.com.br/midia/globo-ja-tem-4-marcas-para-a-copa-do-mundo-de-2026",
      source: "Meio & Mensagem",
      topic: "Marketing",
    },
  ];
}

/**
 * Gera um resumo conciso da notícia baseado no título
 */
function generateSummary(title: string): string {
  if (title.includes("Flamengo") || title.includes("Palmeiras")) {
    return "Resultados do Brasileirão esquentam a disputa pela liderança.";
  } else if (title.includes("Real Madrid")) {
    return "Lesões importantes no elenco merengue antes da Data Fifa.";
  } else if (title.includes("Superbet") && title.includes("Globo")) {
    return "Casa de apostas garante patrocínio de peso para o maior evento esportivo.";
  } else if (title.includes("Câmara")) {
    return "Legislativo debate a proteção do consumidor no mercado de apostas.";
  } else if (title.includes("Caixa")) {
    return "Governo suspende planos de lançamento da plataforma de apostas estatal.";
  } else if (title.includes("Betano")) {
    return "Plataforma lança novo código promocional para atrair usuários.";
  } else if (title.includes("AliExpress")) {
    return "Gigante do e-commerce usa celebridades do esporte em campanha de vendas.";
  }
  return title.split(":")[0].trim();
}

/**
 * Filtra notícias por período
 */
function filterByPeriod(news: NewsItem[], period: "24_horas" | "7_dias"): NewsItem[] {
  const now = DateTime.now();
  const cutoff =
    period === "24_horas" ? now.minus({ hours: 24 }) : now.minus({ days: 7 });

  return news.filter((item) => {
    const newsDate = DateTime.fromISO(item.date);
    return newsDate >= cutoff;
  });
}

/**
 * Agrupa notícias por tópico
 */
function groupByTopic(news: NewsItem[]): Record<string, NewsItem[]> {
  const result: Record<string, NewsItem[]> = {};
  for (const item of news) {
    if (!result[item.topic]) {
      result[item.topic] = [];
    }
    result[item.topic].push(item);
  }
  return result;
}

/**
 * Agrupa notícias por título (para múltiplas fontes)
 */
function groupByTitle(
  news: NewsItem[]
): Record<string, { date: string; sources: Array<{ source: string; url: string }> }> {
  const result: Record<string, { date: string; sources: Array<{ source: string; url: string }> }> = {};
  for (const item of news) {
    if (!result[item.title]) {
      result[item.title] = { date: item.date, sources: [] };
    }
    result[item.title].sources.push({ source: item.source, url: item.url });
  }
  return result;
}

/**
 * Formata o relatório em Markdown
 */
function formatReportMarkdown(
  groupedNews: Record<string, NewsItem[]>
): string {
  const topicOrder = [
    "Futebol",
    "iGaming",
    "Marketing",
  ];

  let report = "# Relatório de Notícias\n\n";

  for (const topic of topicOrder) {
    if (!groupedNews[topic] || groupedNews[topic].length === 0) {
      continue;
    }

    const topicTitle =
      topic === "Futebol"
        ? "Futebol (Resultados, Transferências, Lesões)"
        : topic === "iGaming"
          ? "iGaming e Mercado de Apostas (Bets)"
          : "Marketing e Campanhas Publicitárias";

    report += `### **${topicTitle}**\n\n`;

    const newsByTitle = groupByTitle(groupedNews[topic]);

    for (const [title, data] of Object.entries(newsByTitle)) {
      const summary = generateSummary(title);
      const date = DateTime.fromISO(data.date).toFormat("dd/MM");
      const sourcesStr = data.sources
        .map((s) => `[${s.source}](${s.url})`)
        .join(" | ");

      report += `*   **${title}**\n`;
      report += `    *   ${summary}. **(Data: ${date})**\n`;
      report += `        *   *Fontes:* ${sourcesStr}\n\n`;
    }
  }

  return report;
}

/**
 * Função principal para gerar o relatório
 */
export async function generateNewsReport(
  period: "24_horas" | "7_dias"
): Promise<string> {
  // 1. Coletar dados (simulado)
  const allNews = getSimulatedNewsData();

  // 2. Filtrar por período
  const filteredNews = filterByPeriod(allNews, period);

  // 3. Agrupar por tópico
  const groupedNews = groupByTopic(filteredNews);

  // 4. Formatar em Markdown
  const report = formatReportMarkdown(groupedNews);

  return report;
}
