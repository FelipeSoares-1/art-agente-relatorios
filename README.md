# A.R.T - Agente de Relatórios e Tendências

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20%2B-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)

**Agente inteligente de consolidação de notícias com identidade visual Artplan**

[Features](#-features) • [Stack](#-stack-tecnológico) • [Setup](#-setup) • [Documentação](#-documentação) • [Contribuir](#-contribuição)

</div>

---

## 🎯 Features

### ⚽ Futebol
- Resultados em tempo real
- Notícias de transferências
- Monitoramento de lesões
- Análise de desempenho

### 🎰 iGaming
- Mercado de apostas
- Regulamentação e compliance
- Tendências de mercado
- Análise de oportunidades

### 📢 Marketing
- Campanhas publicitárias
- Patrocínios e parcerias
- Análise de concorrência
- ROI tracking

### 🤖 Inteligência
- Consolidação automática de notícias com IA (OpenAI)
- Análise de tendências
- Geração de relatórios
- Histórico de relatórios com busca

### 🎨 Design
- Interface moderna com React 19
- Tema claro/escuro com next-themes
- Responsivo (Tailwind CSS 4)
- Componentes Radix UI
- Animações com Framer Motion

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** — UI library
- **Tailwind CSS 4** — Utility-first styling
- **Radix UI** — Accessible component primitives
- **Vite 7** — Fast build tool
- **React Query (TanStack)** — Data fetching
- **Wouter** — Client-side routing
- **Framer Motion** — Animations
- **Lucide React** — Icons

### Backend
- **Express 4** — HTTP server
- **tRPC 11** — Type-safe RPC framework
- **Node.js 20+** — Runtime

### Database
- **MySQL** — Database
- **Drizzle ORM** — Type-safe ORM
- **Drizzle Kit** — Migration tool

### Authentication
- **Manus OAuth** — Identity provider
- **jose** — JWT handling
- **Cookie** — Session management

### AI & Data
- **OpenAI API** — LLM for content summarization
- **Axios** — HTTP client

### Development
- **TypeScript 5.9** — Type safety
- **Vitest** — Unit testing
- **Prettier** — Code formatting
- **ESBuild** — Bundler

---

## 🚀 Setup

### Pré-requisitos
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 10+ ([Install](https://pnpm.io/installation))
- **MySQL 8+** ([Download](https://dev.mysql.com/downloads/mysql/))
- Conta **OpenAI** com API key ([Get Started](https://platform.openai.com/api-keys))
- Conta **Manus** para OAuth

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/FelipeSoares-1/art-agente-relatorios.git
cd art-agente-relatorios/news_report_agent
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Configure o banco de dados**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

6. **Acesse a aplicação**
```
Frontend: http://localhost:5173
API: http://localhost:3000
```

---

## 📦 Estrutura do Projeto

```
news_report_agent/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas/rotas
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # Estilos globais
│   │   └── App.tsx
│   └── index.html
├── server/                 # Backend Express
│   ├── _core/              # Core do servidor
│   ├── routes/             # Rotas tRPC
│   ├── middleware/         # Middlewares
│   ├── utils/              # Utilidades
│   └── index.ts
├── shared/                 # Código compartilhado
│   ├── types/              # Tipos TypeScript
│   ├── constants/          # Constantes
│   └── utils/              # Funções utilitárias
├── drizzle/                # Migrações de banco
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── README.md
```

---

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Iniciar servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Iniciar servidor em produção

# Banco de dados
pnpm db:push      # Executar migrações

# Qualidade de código
pnpm check        # Type check (TypeScript)
pnpm format       # Formatar código com Prettier
pnpm test         # Rodar testes

# Build
pnpm build        # Build frontend (Vite) + backend (ESBuild)
```

---

## 🔐 Variáveis de Ambiente

Veja `[.env.example](.env.example)` para lista completa. As principais são:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/art_db

# OpenAI
OPENAI_API_KEY=sk-...

# Manus OAuth
MANUS_CLIENT_ID=...
MANUS_CLIENT_SECRET=...

# API
API_URL=http://localhost:3000
API_PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

---

## 📚 Documentação

- [API Docs](./docs/API.md) — Referência completa da API tRPC
- [Database Schema](./docs/DATABASE.md) — Estrutura do banco
- [Contributing](./CONTRIBUTING.md) — Guia de contribuição
- [Architecture](./docs/ARCHITECTURE.md) — Decisões de arquitetura

---

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Com cobertura
pnpm test:coverage
```

---

## 🚢 Deploy

### Vercel (Frontend)
1. Push para GitHub
2. Connect repo no [Vercel](https://vercel.com)
3. Configurar variáveis de ambiente
4. Deploy automático

### Railway/Render (Backend)
1. Criar app novo
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático com `pnpm build && pnpm start`

---

## 🤝 Contribuição

Adoramos contribuições! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para:
- Padrões de código
- Process de pull requests
- Configuração do ambiente de desenvolvimento

---

## 📄 Licença

MIT © 2025 Artplan

---

## 👥 Suporte

- 📧 Email: consultor.casteliano@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/FelipeSoares-1/art-agente-relatorios/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/FelipeSoares-1/art-agente-relatorios/discussions)

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando Manus AI

**Stack:**
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [tRPC](https://trpc.io)
- [OpenAI](https://openai.com)
