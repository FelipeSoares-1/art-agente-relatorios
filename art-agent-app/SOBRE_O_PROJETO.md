# A.R.T. - Agente de Relatórios e Tendências

## 📰 O que é o A.R.T.

Um **sistema de monitoramento de notícias do mercado publicitário brasileiro** desenvolvido especificamente para a **Artplan**.

## 🎯 Objetivo

Ajudar a **Artplan** a:
- Monitorar o mercado publicitário em tempo real
- Acompanhar **concorrentes** (outras agências, suas conquistas e movimentações)
- Identificar oportunidades de negócio (pitches, novos clientes disponíveis)
- Estar atualizado sobre prêmios e reconhecimentos do mercado
- Acompanhar movimentações de talentos (contratações, promoções)
- Economizar tempo na curadoria manual de notícias

## ⚙️ Funcionalidades Principais

### 1. Coleta Automática
- Coleta automática de notícias via RSS feeds de portais especializados em publicidade e marketing
- Atualização periódica através de cron jobs

### 2. Categorização Inteligente
Sistema de tags baseadas em palavras-chave para classificar automaticamente as notícias:
- **Novos Clientes**: Conquistas de contas, pitches ganhos
- **Campanhas**: Lançamentos, filmes publicitários, ações de marketing
- **Prêmios**: Leões de Cannes, awards, festivais, reconhecimentos
- **Movimentação de Talentos**: Contratações, promoções, saídas de profissionais

### 3. Dashboard Web
- Visualização clara e organizada das notícias
- Filtros por período (24h, dia anterior, 7 dias, 15 dias)
- Filtros por tags
- Cards informativos com título, resumo, data e fonte

### 4. Gerenciamento de Feeds
- Interface para adicionar novos feeds RSS
- Remover feeds que não são mais relevantes
- Visualizar todos os feeds ativos

## 🛠️ Stack Técnica

- **Frontend**: Next.js 16 + React 19 + TailwindCSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite + Prisma ORM
- **Atualização**: Node-cron para agendamento de tarefas
- **Parser RSS**: rss-parser para ler e processar feeds

## 📊 Estrutura do Banco de Dados

### RSSFeed
- id, name, url, createdAt
- Armazena os feeds RSS cadastrados

### NewsArticle
- id, title, link, summary, publishedDate, feedId, tags, createdAt
- Armazena as notícias coletadas com suas tags

## 🚀 Benefícios para a Artplan

1. **Inteligência Competitiva**: Monitoramento contínuo dos concorrentes
2. **Identificação de Oportunidades**: Alertas sobre novos pitches e clientes disponíveis
3. **Economia de Tempo**: Curadoria automática de notícias relevantes
4. **Insights de Mercado**: Visão panorâmica das tendências publicitárias
5. **Acompanhamento de Talentos**: Identificação de profissionais em movimento no mercado
