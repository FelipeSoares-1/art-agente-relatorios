# Arquitetura de Coleta e Processamento de Notícias

Este documento detalha a estratégia de arquitetura para a coleta, processamento e enriquecimento de notícias, garantindo alta cobertura, precisão dos dados e performance do sistema.

## O Desafio

O sistema precisa de dados precisos (conteúdo completo, data de publicação correta, tags contextuais) para ser eficaz. No entanto, os métodos de coleta mais precisos (Deep Scrape com Puppeteer) são lentos e consomem muitos recursos, tornando-os inviáveis para a coleta em massa e em tempo real. Uma abordagem ingênua de usar Deep Scrape para todas as notícias resultaria em:

1.  **Lentidão Extrema:** Cron jobs de coleta levariam horas em vez de minutos.
2.  **Risco de Bloqueio de IP:** Atividade intensa e automatizada seria rapidamente identificada e bloqueada pelos sites de notícias.
3.  **Fragilidade:** A extração de dados de dezenas de sites diferentes com layouts diferentes é complexa e propensa a falhas.

## A Solução: Estratégia de Coleta em 3 Fases

Para resolver o dilema entre precisão e performance, adotamos uma arquitetura de processamento assíncrono em três fases.

---

### Fase 1: "O Grande Povoamento" (Script de Execução Única)

- **Propósito:** Realizar a carga inicial de dados históricos (ex: últimos 15 dias) com a máxima qualidade possível.
- **Implementação:** Um script manual (`src/scripts/initial-seeding.ts`).
- **Fluxo:**
    1. O script busca a lista de notícias de um período definido (ex: 15 dias) usando os scrapers superficiais.
    2. Para **cada notícia encontrada**, ele executa sequencialmente:
        a. **Deep Scrape:** Acessa a URL original para obter o conteúdo completo (`fullContent`) e a data de publicação (`newsDate`) mais precisa.
        b. **Análise de Conteúdo:** Com o `fullContent` em mãos, chama `identificarTags()` para uma classificação contextual precisa.
        c. **Armazenamento:** Salva o `NewsArticle` no banco de dados já completo, com `status = 'PROCESSED'`.
- **Vantagens:** Garante uma base de dados inicial rica e precisa, fundamental para a utilidade imediata da aplicação. Por ser uma operação manual e única, a lentidão é um custo aceitável.

---

### Fase 2: "Coleta Diária Inteligente" (Cron Jobs de Coleta)

- **Propósito:** Capturar novas notícias publicadas no dia a dia da forma mais rápida e eficiente possível.
- **Implementação:** Modificação no `NewsService` e nos cron jobs existentes (`update-feeds`, `active-search`).
- **Fluxo:**
    1. Os cron jobs continuam coletando notícias via RSS e scraping superficial.
    2. Ao salvar um novo artigo (`NewsService.saveArticles()`), uma **verificação de sanidade** é aplicada à data (`publishedDate`) fornecida pelo feed.
    3. **Cenário A (Dados Confiáveis):** Se a data for válida e recente, o artigo é salvo com `newsDate` preenchido e `status = 'PROCESSED'`. Uma análise inicial de tags pode ser feita no `summary` como um bônus.
    4. **Cenário B (Dados Suspeitos):** Se a data for inválida, nula ou antiga, o artigo é salvo com `newsDate = null` e `status = 'PENDING_ENRICHMENT'`.
- **Vantagens:** A coleta de novas notícias permanece quase instantânea, garantindo que a aplicação veja novos artigos assim que são publicados.

---

### Fase 3: "O Refinador Assíncrono" (Worker em Background)

- **Propósito:** Processar e corrigir de forma assíncrona os artigos que foram marcados como "problemáticos" na Fase 2.
- **Implementação:** Um novo cron job dedicado (`src/lib/cron-enrichment.ts`).
- **Fluxo:**
    1. O cron job roda em um intervalo regular e seguro (ex: a cada 10 minutos).
    2. A cada execução, ele busca um pequeno lote de artigos do banco com `status = 'PENDING_ENRICHMENT'`.
    3. Para cada artigo no lote, ele executa a mesma lógica da Fase 1:
        a. **Deep Scrape** para obter `fullContent` e `newsDate`.
        b. **Re-análise de Tags** com base no `fullContent`.
        c. **Atualização:** Atualiza o registro no banco de dados com os dados enriquecidos e altera o `status` para `PROCESSED`.
- **Vantagens:**
    - **Qualidade Convergente:** A qualidade geral dos dados no sistema melhora continuamente ao longo do tempo.
    - **Resiliência e Segurança:** Isola o processo lento e arriscado (Deep Scrape) da coleta principal, evitando gargalos e bloqueios de IP.
    - **Escalabilidade:** A arquitetura suporta picos de volume de notícias sem degradar a performance do sistema principal.

## Mudanças no Schema do Banco de Dados

Para suportar esta arquitetura, o seguinte campo será adicionado ao modelo `NewsArticle` em `prisma/schema.prisma`:

```prisma
model NewsArticle {
  // ... campos existentes ...
  tags   String?
  status String  @default("PENDING_ENRICHMENT") // Valores: PENDING_ENRICHMENT, PROCESSED, FAILED
}
```
