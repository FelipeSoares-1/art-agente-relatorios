# 🎨 ART Agent App - Sistema de Monitoramento de Notícias

Um sistema inteligente de coleta, processamento e categorização automática de notícias sobre publicidade, marketing e agências. Utiliza web scraping, API feeds RSS e inteligência artificial para classificar artigos em categorias customizáveis.

## 📋 Visão Geral

**ART Agent App** é uma aplicação Next.js que:

- 📰 **Coleta notícias** de múltiplas fontes (Google News, RSS feeds, web scrapers)
- 🏷️ **Categoriza automaticamente** usando tags configuráveis e palavras-chave
- 📊 **Exibe dashboard** com filtros temporais (24h, 7d, 15d)
- ⏰ **Agenda tarefas** de scraping e atualização de feeds
- 🔍 **Busca ativa** em horários específicos (8h e 18h diariamente)

## 🚀 Começar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- SQLite (incluído no Prisma)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/FelipeSoares-1/art-agente-relatorios.git
cd art-agent-app

# Instale dependências
npm install

# Configure as variáveis de ambiente
# Criar .env.local com DATABASE_URL="file:./prisma/dev.db"

# Configure o banco de dados
npx prisma generate
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/              # Rotas API (Next.js)
│   │   ├── news/         # GET /api/news - Listar notícias
│   │   ├── feeds/        # GET /api/feeds - Listar feeds RSS
│   │   ├── tag-categories/ # GET/POST /api/tag-categories - Gerenciar tags
│   │   └── cron-logs/    # GET /api/cron-logs - Logs de execução
│   ├── dashboard/        # Página dashboard
│   ├── feeds/            # Página de feeds
│   ├── tags/             # Página de gerenciamento de tags
│   └── page.tsx          # Home
├── lib/
│   ├── db.ts             # Cliente Prisma
│   ├── google-news-web-scraper.ts  # Web scraper Google News com Puppeteer
│   ├── news-scraper.ts   # Scrapers HTML (Propmark, M&M, AdNews)
│   ├── cron-job.ts       # Scheduler de feeds RSS
│   ├── cron-scraping.ts  # Scheduler de scraping web
│   ├── active-search-service.ts    # Busca ativa em horários específicos
│   ├── tag-helper.ts     # Lógica de categorização por tags
│   └── feed-updater.ts   # Atualização de feeds
└── scripts/              # Scripts de administração

prisma/
├── schema.prisma         # Definição do banco de dados
└── migrations/           # Histórico de migrações

public/                   # Arquivos estáticos
.env.local               # Variáveis de ambiente (criar)
```

## ⚙️ Configuração

### Variáveis de Ambiente (`.env.local`)

```env
# Banco de dados - OBRIGATÓRIO
DATABASE_URL="file:./prisma/dev.db"
```

## 🗄️ Banco de Dados

### Modelos Principais

**NewsArticle**
- `id`: ID único
- `title`: Título do artigo
- `link`: URL do artigo
- `summary`: Resumo/descrição
- `newsDate`: Data da publicação (para filtros temporais)
- `insertedAt`: Data de inserção no banco
- `createdAt`: Data de criação do registro
- `feedId`: Referência ao feed RSS
- `tags`: Array JSON de tags atribuídas

**TagCategory**
- `id`: ID único
- `name`: Nome da categoria (ex: "Artplan", "Prêmios")
- `keywords`: JSON array de palavras-chave para detecção automática
- `color`: Cor hexadecimal para UI
- `enabled`: Se a tag está ativa

**RSSFeed**
- `id`: ID único
- `name`: Nome do feed
- `url`: URL do feed RSS

### Migrações

Para sincronizar o schema com o banco:
```bash
npx prisma db push
```

Para regenerar Prisma Client:
```bash
npx prisma generate
```

## 🔄 Componentes Principais

### 1. **Google News Web Scraper**

Usa Puppeteer para web scraping com filtros temporais (24h, 7d, 15d).

### 2. **Scrapers Específicos**

Coleta de sites: Propmark, Meio & Mensagem, AdNews.

### 3. **Scheduler de Feeds**

Atualiza RSS feeds a cada 30 minutos.

### 4. **Busca Ativa**

Busca automática em horários: 08:00 e 18:00.

### 5. **Categorização por Tags**

Detecta e atribui tags automaticamente.

## 📊 API Endpoints

### `GET /api/news`

Retorna notícias com filtros opcionais.

**Query Parameters:**
- `period`: `24h`, `7d`, `15d`
- `tag`: Nome da tag
- `feedId`: ID do feed
- `search`: Busca por texto

**Exemplo:**
```bash
curl "http://localhost:3000/api/news?period=24h&tag=Premios"
```

### `GET /api/feeds`

Lista feeds RSS.

### `GET /api/tag-categories`

Lista categorias de tags.

### `GET /api/cron-logs`

Logs de execução de jobs.

## 🏷️ Tags Padrão

1. **Artplan** - Notícias sobre Artplan
2. **Prêmios** - Prêmios e reconhecimentos
3. **Concorrentes** - Agências concorrentes
4. **Novos Clientes** - Conquistas de clientes
5. **Digital** - Marketing digital

## 📝 Desenvolvimento

### Adicionar Feed RSS

1. `/feeds` → Novo Feed
2. Cole URL RSS
3. Sistema atualiza a cada 30 min

### Adicionar Tag

1. `/tags` → Nova Tag
2. Configure nome, keywords, cor
3. Notícias recategorizadas automaticamente

## 📚 Documentação

Ver `MELHORIAS.md` para histórico de correções e melhorias.
