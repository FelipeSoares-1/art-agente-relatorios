# 🎨 ART Agent App - Sistema de Monitoramento de Notícias

Um sistema inteligente de coleta, processamento e enriquecimento automático de notícias sobre publicidade, marketing e agências. Utiliza web scraping, feeds RSS e um pipeline de processamento assíncrono para garantir a alta qualidade e precisão dos dados.

## 📋 Visão Geral

**ART Agent App** é uma aplicação Next.js que:

- 📰 **Coleta notícias** de múltiplas fontes (Google News, RSS feeds, web scrapers).
- 🏷️ **Categoriza automaticamente** usando tags configuráveis e lógica contextual.
- 📈 **Apresenta uma página de Relatórios** com gráficos interativos sobre tendências de tags, menções de concorrentes e distribuição de fontes.
- ✨ **Valida e Enriquece Dados**: Identifica notícias com datas imprecisas e usa um worker assíncrono para corrigi-las, garantindo maior acurácia.
- 🛠️ **Oferece uma página de Status do Sistema** para monitorar a saúde dos coletores de notícias e executar ações administrativas.
- ⏰ **Agenda tarefas** de coleta, busca e enriquecimento de dados em segundo plano.

---

## 🏛️ Arquitetura de Coleta de Dados

Para garantir tanto a velocidade da coleta quanto a precisão dos dados, o sistema utiliza uma arquitetura de processamento em 3 fases:

### Fase 1: Coleta Rápida
- **O quê**: Scrapers e leitores de RSS coletam novos artigos da forma mais rápida possível, focando em título, link e data de publicação inicial.
- **Objetivo**: Inserir um grande volume de notícias no banco de dados rapidamente para que não se percam.

### Fase 2: Validação e Sinalização
- **O quê**: No momento da inserção, o `NewsService` realiza uma verificação de sanidade na data de publicação usando o `date-validator`.
- **Objetivo**: Se a data for suspeita (ex: muito antiga, no futuro, ou uma data padrão), o artigo recebe o status `PENDING_ENRICHMENT`. Caso contrário, recebe `PROCESSED`.

### Fase 3: Enriquecimento Assíncrono
- **O quê**: Um cron job executa um "worker" a cada hora. Esse worker busca por artigos com status `PENDING_ENRICHMENT`.
- **Objetivo**: Para cada artigo pendente, o worker realiza um "deep scrape" para obter o **conteúdo completo** e a data de publicação correta. Com base no conteúdo completo, as **tags são reavaliadas** para garantir maior precisão. Após a correção e reavaliação, o status do artigo é atualizado para `ENRICHED`.

Este pipeline garante que o dashboard sempre tenha notícias frescas, enquanto a qualidade dos dados é continuamente melhorada em segundo plano.

---

## 🚀 Começar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/FelipeSoares-1/art-agente-relatorios.git
cd art-agent-app

# 2. Instale dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto e adicione a linha abaixo:
DATABASE_URL="file:./prisma/dev.db"

# 4. Configure e popule o banco de dados
# Este comando reseta o banco de dados, aplica as migrações e executa o seed.
# O seed popula as categorias de tags iniciais.
npm run db:reset

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

---

## 🛠️ Scripts NPM Essenciais

- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload.
- `npm run build`: Gera a build de produção do projeto.
- `npm run start`: Inicia um servidor de produção (requer `npm run build` antes).

### Scripts de Banco de Dados

- `npm run prisma:migrate`: Cria e aplica uma nova migração no banco de dados.
- `npm run db:push`: Sincroniza o schema do Prisma com o banco de dados (sem criar migrações).
- `npm run db:reset`: **(Destrutivo)** Apaga o banco de dados, aplica todas as migrações e executa o `seed`. Ideal para um início limpo.
- `npm run db:seed`: Executa o script `prisma/seed.ts` para popular o banco com dados iniciais (ex: categorias de tags).
- `npm run prisma:studio`: Abre a interface gráfica do Prisma para visualizar e editar os dados do banco.

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/                  # Rotas da API (Next.js)
│   │   ├── news/             # GET /api/news - Listar notícias com filtros
│   │   ├── feeds/            # GET/POST /api/feeds - Gerenciar feeds RSS
│   │   ├── tag-categories/   # GET/POST /api/tag-categories - Gerenciar tags
│   │   └── enrich-articles/  # GET /api/enrich-articles - Endpoint do Worker
│   │   └── reports/          # Endpoints para os gráficos de relatórios
│   ├── dashboard/            # Página de Status do Sistema
│   ├── reports/              # Página de Relatórios com gráficos
│   └── page.tsx              # Página inicial (Feed de Notícias)
├── lib/
│   ├── db.ts                 # Cliente Prisma (singleton)
│   ├── cron-job.ts           # Agendador de todas as tarefas (cron jobs)
│   ├── tag-helper.ts         # Lógica de categorização por tags
│   ├── date-validator.ts     # Utilitário para validar e sinalizar datas suspeitas
│   └── scrapers/
│       └── google-news-web-scraper.ts # Scraper com Puppeteer para deep scrape
├── services/
│   ├── NewsService.ts        # Lógica de negócio para salvar, buscar e limpar notícias
│   └── ScraperService.ts     # Orquestra os diferentes scrapers
└── scripts/                  # Scripts de administração e testes manuais (via ts-node)

prisma/
├── schema.prisma             # Definição dos modelos e do banco de dados
├── seed.ts                   # Script para popular o banco com dados iniciais
└── migrations/               # Histórico de migrações do schema

public/                       # Arquivos estáticos
.env                          # Variáveis de ambiente (NÃO versionado)
```

---

## 🗄️ Banco de Dados (Prisma)

O schema (`prisma/schema.prisma`) define os seguintes modelos principais:

- **`NewsArticle`**: Armazena cada notícia coletada.
  - `link`: Campo `@@unique` para evitar duplicatas.
  - `newsDate`: A data da notícia, que pode ser corrigida pelo processo de enriquecimento.
  - `status`: Enum (`ArticleStatus`) que rastreia o artigo no pipeline (`PROCESSED`, `PENDING_ENRICHMENT`, `ENRICHED`).
  - `tags`: Um campo `String` que armazena um array de tags em formato JSON.
  - `summary`: O resumo da notícia, armazenado como texto puro após a limpeza.

- **`RSSFeed`**: Armazena as fontes de notícias (feeds RSS e scrapers).

- **`TagCategory`**: Define as categorias de tags, suas palavras-chave e se estão ativas.

---

## 🔄 Workflows Comuns

### Adicionar uma Nova Categoria de Tag

1.  **Via Frontend**: Acesse a página `/tags`.
2.  Clique em "Adicionar Categoria".
3.  Preencha o nome, as palavras-chave (separadas por vírgula) e escolha uma cor.
4.  Ative a categoria.
5.  O sistema começará a usar as novas palavras-chave para taguear notícias automaticamente.

### Forçar a Atualização dos Feeds

Para buscar notícias imediatamente sem esperar o cron job, você pode acionar a API manualmente:

```bash
# Use a extensão 'REST Client' no VS Code ou uma ferramenta como o Postman
GET http://localhost:3000/api/update-feeds
```

### Limpar o Banco de Dados e Recomeçar

Se precisar de um ambiente limpo, o script `db:reset` é a melhor opção:

```bash
npm run db:reset
```
Isso irá apagar todos os dados, recriar a estrutura do banco e popular as categorias de tags definidas no `seed.ts`.

### Modelo `NewsArticle`

- `id`: ID único
- `title`: Título do artigo
- `link`: URL do artigo
- `summary`: Resumo/descrição
- `newsDate`: Data da publicação (campo principal para filtros)
- `insertedAt`: Data de inserção no banco
- `status`: Status do artigo no pipeline de processamento. Valores possíveis:
    - `PROCESSED`: Coletado com data válida.
    - `PENDING_ENRICHMENT`: Coletado, mas a data é suspeita e aguarda correção.
    - `ENRICHED`: A data foi corrigida pelo worker.
    - `ENRICHMENT_FAILED`: O worker tentou corrigir, mas falhou.
- `feedId`: Chave estrangeira para o `RSSFeed`.
- `tags`: String JSON contendo as tags detectadas (ex: `["Prêmios", "Digital"]`).
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
