# 🏗️ Arquitetura do Projeto

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite)                       │
│  React 19 + Tailwind CSS 4 + Radix UI + Wouter + React Query │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  tRPC Bridge (Type-Safe)                     │
│          Client ◄─► Server Type Definitions                 │
└────────────────────┬────────────────────────────────────────┘
                     │ tRPC Router
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + Node.js)                     │
│  tRPC Procedures + Express Middlewares + Auth               │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│   Database Layer (Drizzle ORM)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
              MySQL Database
```

---

## 📁 Estrutura de Pastas

```
news_report_agent/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── ui/                  # Radix UI wrappers
│   │   │   ├── layout/              # Layout components
│   │   │   ├── forms/               # Form components
│   │   │   └── sections/            # Page sections
│   │   ├── pages/                   # Páginas/rotas
│   │   │   ├── dashboard.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── news.tsx
│   │   │   └── admin.tsx
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAuth.ts           # Auth state
│   │   │   ├── useNotification.ts   # Toast notifications
│   │   │   └── useTheme.ts          # Theme management
│   │   ├── lib/                     # Utilitários
│   │   │   ├── trpc.ts             # tRPC client setup
│   │   │   ├── api.ts              # HTTP clients
│   │   │   └── utils.ts            # Helper functions
│   │   ├── styles/                  # Estilos globais
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   └── index.html
│
├── server/                          # Backend Express
│   ├── _core/
│   │   └── index.ts                 # Server setup & tRPC router
│   ├── routes/                      # tRPC routers
│   │   ├── auth.ts                  # Auth procedures
│   │   ├── reports.ts               # Report procedures
│   │   ├── news.ts                  # News procedures
│   │   ├── analytics.ts             # Analytics procedures
│   │   └── user.ts                  # User procedures
│   ├── middleware/                  # Express middlewares
│   │   ├── auth.ts                  # JWT verification
│   │   ├── cors.ts                  # CORS setup
│   │   └── errorHandler.ts          # Error handling
│   ├── utils/                       # Utilidades do servidor
│   │   ├── jwt.ts                   # JWT utilities
│   │   ├── openai.ts                # OpenAI integration
│   │   ├── newsProvider.ts          # News fetching
│   │   └── db.ts                    # Database helpers
│   └── services/                    # Business logic
│       ├── reportService.ts         # Report business logic
│       ├── newsService.ts           # News business logic
│       └── authService.ts           # Auth business logic
│
├── shared/                          # Código compartilhado
│   ├── types/
│   │   ├── index.ts                 # Main types
│   │   ├── report.ts                # Report types
│   │   ├── news.ts                  # News types
│   │   └── user.ts                  # User types
│   ├── constants/
│   │   ├── categories.ts            # Category constants
│   │   ├── endpoints.ts             # API endpoints
│   │   └── messages.ts              # UI messages
│   └── utils/
│       ├── validators.ts            # Zod schemas
│       ├── formatters.ts            # Data formatting
│       └── helpers.ts               # Shared helpers
│
├── drizzle/                         # Migrações de banco
│   ├── migrations/
│   │   ├── 0001_init.sql            # Schema inicial
│   │   ├── 0002_add_indexes.sql     # Indexes
│   │   └── ...
│   └── schema.ts                    # Drizzle schema
│
├── .env.example                     # Template de env vars
├── .github/
│   └── workflows/                   # GitHub Actions
│       ├── ci.yml                   # CI/CD pipeline
│       ├── pr-lint.yml              # PR validation
│       └── deploy.yml               # Deploy automatizado
├── docs/
│   ├── API.md                       # Documentação API
│   ├── DATABASE.md                  # Schema do BD
│   └── ARCHITECTURE.md              # Este arquivo
├── package.json                     # Dependências
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── vitest.config.ts                 # Vitest config
└── README.md                        # Documentação principal
```

---

## 🔄 Fluxo de Dados

### Fluxo de Autenticação

```
Login Form
    ↓
[POST] /auth/login
    ↓
authService.login()
    ↓
JWT Token Generated
    ↓
Token + Refresh Token
    ↓
Stored in HttpOnly Cookie
    ↓
Frontend State Updated
    ↓
Protected Routes Unlocked
```

### Fluxo de Geração de Relatório

```
User Input
    ↓
[POST] /reports.create (tRPC)
    ↓
reportService.create()
    ↓
Fetch Relevant News
    ↓
Send to OpenAI
    ↓
Process Response
    ↓
Save in Database
    ↓
Return to Frontend
    ↓
Real-time Update (Status)
```

---

## 🔐 Segurança

### Authentication Flow

```typescript
// 1. Login
POST /auth.login
Response: { token, refreshToken }

// 2. Token Storage
localStorage.setItem('token', token)
localStorage.setItem('refreshToken', refreshToken)

// 3. Protected Requests
Header: Authorization: Bearer {token}

// 4. Token Refresh
POST /auth.refresh
Response: { newToken }

// 5. Logout
POST /auth.logout
Clear storage
```

### Middleware de Segurança

```
┌──────────────────┐
│  HTTP Request    │
└────────┬─────────┘
         ↓
┌──────────────────────┐
│  CORS Middleware     │ ← Validar origem
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│  Auth Middleware     │ ← Verificar JWT
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│  Rate Limit          │ ← Proteger contra abuse
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│  tRPC Handler        │
└──────────────────────┘
```

---

## 💾 Database Schema (Resumo)

```sql
-- Users
users
  ├── id (PK)
  ├── email (UNIQUE)
  ├── name
  ├── passwordHash
  ├── role (admin | user)
  ├── createdAt
  └── updatedAt

-- Reports
reports
  ├── id (PK)
  ├── userId (FK)
  ├── title
  ├── summary
  ├── content
  ├── category (futebol | igaming | marketing)
  ├── status (draft | published)
  ├── createdAt
  └── updatedAt

-- News
news
  ├── id (PK)
  ├── title
  ├── description
  ├── url (UNIQUE)
  ├── source
  ├── category
  ├── sentiment (positive | neutral | negative)
  ├── publishedAt
  ├── createdAt
  └── updatedAt

-- News-Report (Many-to-Many)
reportNews
  ├── reportId (FK)
  ├── newsId (FK)
  └── position (order in report)
```

---

## 🔌 Integrações Externas

### OpenAI Integration

```typescript
// newsService.summarizeNews()
const summary = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    {
      role: "system",
      content: "Você é um analista de notícias..."
    },
    {
      role: "user",
      content: `Resuma estas notícias:\n${news}`
    }
  ]
});
```

### News Provider (Exemplo)

```typescript
// Integração com NewsAPI, RSS feeds, Web Scraping
// newsProvider.fetchNews()
const news = await newsProvider.fetchNews({
  category: "futebol",
  limit: 50,
  language: "pt-BR"
});
```

---

## 🚀 Build & Deploy

### Local Development

```bash
pnpm dev
# Frontend: localhost:5173
# Backend: localhost:3000
```

### Production Build

```bash
pnpm build
# Vite builds: client/dist + server/dist
# Output pronto para hosting
```

### Docker (Opcional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## 📊 Performance Considerations

- **Frontend**: Code splitting com Vite
- **Backend**: Caching com Redis (opcional)
- **Database**: Indexes em queries frequentes
- **API**: Pagination para grandes datasets
- **Images**: Otimização com sharp/imagemin
- **Bundling**: Tree-shaking e minificação

---

## 🧪 Testing Strategy

```
┌─────────────────────────┐
│  Unit Tests (Vitest)    │ ← Functions, utils
├─────────────────────────┤
│  Integration Tests      │ ← API routes, DB
├─────────────────────────┤
│  E2E Tests (Playwright) │ ← User flows
└─────────────────────────┘
```

---

## 🔍 Monitoramento

- **Frontend**: Sentry (error tracking)
- **Backend**: Winston (logging)
- **Database**: Query performance monitoring
- **API**: Request/response logging

---

**Última atualização:** 10 de Novembro de 2025
