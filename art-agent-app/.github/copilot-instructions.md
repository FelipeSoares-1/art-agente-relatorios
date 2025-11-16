# ART Agent App - Instruções para Agentes de IA

**Última atualização:** 16 de novembro de 2025

## 📌 Visão Geral da Arquitetura

Sistema Next.js 16 + SQLite para monitoramento automático de notícias sobre publicidade, com coleta por **múltiplos canais** (Google News, RSS feeds, web scrapers) e **categorização inteligente via tags**.

### Fluxo de Dados Principal
```
Múltiplas Fontes → Scrapers/Feeds → NewsService.saveArticles() 
  → Prisma (SQLite) → Tag-helper identifica tags 
  → API /api/news (filtros: period, tag, feedId, search) 
  → Frontend (Dashboard, Feeds, Tags pages)
```

---

## 🏗️ Componentes Críticos e Seus Limites

### 1. **Tag-Helper** (`src/lib/tag-helper.ts`) - CORAÇÃO DO PROJETO
- **Responsabilidade**: Detectar & classificar notícias automaticamente em categorias (Artplan, Concorrentes, Prêmios, Novos Clientes, Eventos, Digital)
- **Padrão**: Funções `detectarXXX()` com verificação **contextual inteligente** (não apenas palavra-chave)
  - Exemplo: `detectarConcorrentesBoolean(texto, feedName)` valida se menção é relevante (evita falsos positivos)
  - Armazena tags como **JSON array em campo `tags` string** → `["Prêmios", "Digital"]`
- **Cache**: Categorias em memória com TTL de 5 minutos para evitar overload do DB
- **Crucial**: Se modificar estrutura de tags → regenerar com `npx prisma generate` (caso contrário Prisma Client fica desincronizado)

### 2. **NewsService** (`src/services/NewsService.ts`)
- **saveArticles()**: Bulk insert com deduplicação via `link` (UNIQUE)
  - ⚠️ **SEMPRE incluir `insertedAt: new Date()`** quando criar NewsArticle
  - Retorna relatório `{totalSaved, totalFound, details[]}`
- **updateFromRssFeeds()**: Parser RSS simples, chamado a cada 30 min
- **saveActiveSearchResults()**: Para resultados de busca ativa (8h e 18h)
- **Tipo**: `ScrapedArticle` tem `publishedDate: Date`, mas Prisma espera `newsDate`

### 3. **Cron Jobs** (`src/lib/cron-job.ts`, `src/lib/cron-scraping.ts`)
- **Feed updater**: `0 */30 * * *` (a cada 30 min)
- **Active search**: `0 8 * * *` e `0 18 * * *` (horários fixos)
- **Web scrapers**: `0 */4 * * *` (a cada 4 horas)
- ⚠️ **TIMEZONE CRÍTICO**: America/Sao_Paulo (não mudar sem testar)
- **Inicialização**: Deve ocorrer em `src/app/layout.tsx` (dentro de `if (typeof window === 'undefined')`)
- **Sem reinicialização automática**: Jobs apenas começam quando servidor inicia; considere verificação de "já em execução"

### 4. **API Endpoints** (`src/app/api/**/route.ts`)
- **`GET /api/news`**: Filtros via query string (period, tag, feedId, search)
  - ⚠️ **Campo correto é `newsDate`** (não `publishedDate`)
  - Exemplo: `/api/news?period=24h&tag=Concorrentes`
- **`POST /api/tag-categories`**: Validar JSON em `keywords` 
- **`GET /api/feeds`**: Listar feeds RSS
- Não possuem autenticação (adicionar se necessário)

### 5. **Prisma Schema** (`prisma/schema.prisma`)
- **NewsArticle**: `link` é @unique (deduplicação automática)
- **TagCategory**: `keywords` é String, mas interpretado como JSON internamente
- **RSSFeed**: Simples referência (1:N com NewsArticle)
- **Campos críticos em NewsArticle**: `newsDate` (filtros temporais), `tags` (JSON), `insertedAt` (tracking)

---

## ⚠️ Armadilhas Comuns e Soluções

### 1. Prisma Client Desincronizado
**Sintoma**: TypeScript "Property X does not exist" mesmo após mudança no schema
```powershell
# Full reset obrigatório
Remove-Item -Path node_modules\.prisma -Recurse -Force
Remove-Item -Path node_modules\@prisma\client -Recurse -Force
npm install
npx prisma generate
```

### 2. Campo `newsDate` vs `publishedDate` Mismatch
- **Banco + Schema**: `newsDate` ✅
- **ScraperService types**: `publishedDate` em `ScrapedArticle` ✅ (isso é CORRETO)
- **NewsService**: CONVERTE `publishedDate` → `newsDate` antes de salvar
- ❌ **Errado**: Usar `publishedDate` em queries Prisma diretas

### 3. Cache Next.js Turbopack Desatualizado
**Sintoma**: Mudanças não refletem (código antigo roda)
```powershell
Remove-Item -Path .\.next -Recurse -Force
npm run dev
```

### 4. Tags com JSON Parsing
- Banco armazena como String: `'["Tag1", "Tag2"]'`
- Query para buscar: `where: { tags: { contains: '"TagName"' } }`
- Ao salvar: `tags: JSON.stringify(tagsArray)`

### 5. Verificação Contextual em Tags
- Apenas match de keyword **não é suficiente**
- Ex: "Africa" é concorrente, mas notícia sobre "Africa do Sul" é falso positivo
- Verificação contextual verifica feedName, posição no texto, contexto circundante
- Se adicionar tag: implementar `detectarXXX()` com contexto, não simples `includes()`

---

## 🔄 Workflows Críticos

### Deploy de Novas Features

1. **Modificar schema Prisma** → `npx prisma migrate dev --name "desc"`
2. **Criar migration automática** → Verifica se compatível com dados existentes
3. **Regenerar Client** → `npx prisma generate` (automático via postinstall)
4. **Limpar cache** → `.next` e `node_modules/.prisma`
5. **Testar API** → Verificar 200 no GET /api/news antes de deploy

### Adicionar Nova Tag
1. Criar categoria em TagCategory model (UI ou direto no DB)
2. Implementar `detectarXXX()` em tag-helper com contexto
3. Atualizar `identificarTags()` para chamar nova função
4. Testar com artigos conhecidos
5. **Cache atualiza em 5 min** (ou reiniciar para imediato)

### Depuração de Scraper
```bash
# Executar scraper manual (setup DATABASE_URL primeiro)
npx ts-node src/scripts/test-integrated-system.ts
# Ou inspecionar logs em /api/cron-logs
```

---

## 📊 Tipo de Dados e Padrões

### NewsArticle (Schema Prisma)
```typescript
id: Int (autoincrement)
title: String
link: String (@unique - deduplicação)
summary: String?
newsDate: DateTime (campo crítico para filtros)
insertedAt: DateTime (data de coleta)
createdAt: DateTime (@default(now()))
feedId: Int (referência)
tags: String? (JSON array como string)
feed: RSSFeed (relação)
```

### Tag Detection Return
```typescript
Promise<string[]> // Ex: ["Concorrentes", "Prêmios"]
```

### SearchConfig
```typescript
useWebScraping?: boolean
timeFilter?: '24h' | '7d' | '15d'
rssOnly?: boolean
maxArticlesPerQuery?: number
```

---

## 🚀 Comandos Essenciais

```bash
npm run dev                           # Inicia dev server (com hot-reload)
npx prisma db push                    # Sincroniza schema com DB
npx prisma generate                   # Regenera Prisma Client
npx prisma studio                     # GUI para inspecionar DB
npm run build                         # Build production
npx ts-node src/scripts/[script].ts   # Executar script Node/TS
```

---

## 📁 Estrutura Importante

```
src/
├── app/
│   ├── api/news/route.ts              # API principal
│   ├── api/tag-categories/route.ts    # Gerenciar tags
│   ├── dashboard/page.tsx             # Analytics
│   └── feeds/page.tsx                 # UI feeds
├── lib/
│   ├── db.ts                          # Instância Prisma singleton
│   ├── tag-helper.ts                  # 💎 CORAÇÃO (detecção de tags)
│   ├── cron-job.ts                    # Schedulers principais
│   ├── cron-scraping.ts               # Web scrapers agendado
│   └── scrapers/google-news-...ts     # Puppeteer scraper
├── services/
│   ├── NewsService.ts                 # Lógica de salvar/buscar
│   ├── ScraperService.ts              # Orquestração de scrapers
│   └── CompetitorService.ts           # Detecção de concorrentes
└── scripts/                           # Scripts admininstrativos (ts-node)

prisma/
├── schema.prisma                      # Definição do DB
└── migrations/                        # Histórico de mudanças
```

---

## ✅ Checklist para PR/Merge

- [ ] Código compila sem erros TypeScript (`npm run build`)
- [ ] Schema Prisma atualizado se mudou dados
- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Cache Next.js limpo (`.next/` removido)
- [ ] Testou API endpoints relevantes (GET requests no mínimo)
- [ ] Se adicionar tag: tem implementação contextual, não só keyword match
- [ ] Campo `newsDate` usado (não `publishedDate`) em queries Prisma
- [ ] Se modificar cron: testou horário e timezone
- [ ] `insertedAt` sempre presente em NewsArticle.create()

---

## 📚 Referências Importantes

- **MELHORIAS.md**: Histórico completo de bugs, causa raiz, e soluções testadas
- **GEMINI_SESSION_LOG.md**: Log de sessão anterior (problemas resolvidos, patterns)
- **README.md**: Documentação user-facing, setup inicial
- **Tag-Helper Context Detection**: Modelos de verificação contextual para tags
