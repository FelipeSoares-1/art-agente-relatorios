# 📚 API Documentation

## Visão Geral

A.R.T usa **tRPC** para comunicação entre cliente e servidor. tRPC oferece type-safety completo entre frontend e backend sem precisar gerar código.

**Base URL:** `http://localhost:3000`  
**Versão:** 1.0.0  
**Autenticação:** JWT (Bearer Token)

---

## 🔐 Autenticação

### Login
```typescript
POST /trpc/auth.login
{
  "json": {
    "email": "user@example.com",
    "password": "senha123"
  }
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "user": {
        "id": "user_123",
        "email": "user@example.com",
        "name": "João Silva"
      },
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Refresh Token
```typescript
POST /trpc/auth.refresh
{
  "json": {
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Logout
```typescript
POST /trpc/auth.logout
```

---

## 📰 Reports (Relatórios)

### Listar Relatórios

```typescript
GET /trpc/reports.list?input={"limit":10,"offset":0}
```

**Query Parameters:**
- `limit` (number): Itens por página (default: 10)
- `offset` (number): Offset de paginação (default: 0)
- `search` (string, optional): Buscar por título

**Response:**
```json
{
  "result": {
    "data": {
      "reports": [
        {
          "id": "rpt_123",
          "title": "Mercado de Apostas - Nov 2025",
          "summary": "Análise completa das tendências...",
          "category": "iGaming",
          "createdAt": "2025-11-10T14:30:00Z",
          "updatedAt": "2025-11-10T14:30:00Z"
        }
      ],
      "total": 42,
      "hasMore": true
    }
  }
}
```

### Obter Relatório

```typescript
GET /trpc/reports.get?input={"id":"rpt_123"}
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "rpt_123",
      "title": "Mercado de Apostas - Nov 2025",
      "summary": "Análise completa das tendências...",
      "content": "Detalhes completos do relatório...",
      "category": "iGaming",
      "sources": [
        {
          "title": "Notícia 1",
          "url": "https://...",
          "sentiment": "positive"
        }
      ],
      "createdAt": "2025-11-10T14:30:00Z"
    }
  }
}
```

### Gerar Novo Relatório

```typescript
POST /trpc/reports.create
{
  "json": {
    "title": "Relatório Personalizado",
    "category": "futebol",
    "newsIds": ["news_1", "news_2"],
    "includeAnalysis": true
  }
}
```

**Categories:**
- `futebol` - Futebol
- `igaming` - iGaming
- `marketing` - Marketing

**Response:**
```json
{
  "result": {
    "data": {
      "id": "rpt_new_123",
      "status": "generating",
      "message": "Gerando relatório com IA..."
    }
  }
}
```

### Atualizar Relatório

```typescript
PUT /trpc/reports.update
{
  "json": {
    "id": "rpt_123",
    "title": "Novo Título",
    "summary": "Novo resumo"
  }
}
```

### Deletar Relatório

```typescript
DELETE /trpc/reports.delete?input={"id":"rpt_123"}
```

**Response:**
```json
{
  "result": {
    "data": {
      "success": true,
      "message": "Relatório deletado com sucesso"
    }
  }
}
```

---

## 📰 News (Notícias)

### Listar Notícias

```typescript
GET /trpc/news.list?input={"category":"futebol","limit":20}
```

**Query Parameters:**
- `category` (string): futebol | igaming | marketing
- `limit` (number): Itens por página
- `offset` (number): Offset
- `search` (string, optional): Buscar
- `from` (date, optional): Data inicial (YYYY-MM-DD)
- `to` (date, optional): Data final (YYYY-MM-DD)

**Response:**
```json
{
  "result": {
    "data": {
      "news": [
        {
          "id": "news_1",
          "title": "Manchester United vence Liverpool",
          "description": "Resumo da notícia...",
          "url": "https://...",
          "source": "ESPN",
          "category": "futebol",
          "sentiment": "positive",
          "imageUrl": "https://...",
          "publishedAt": "2025-11-10T10:00:00Z",
          "relevance": 0.95
        }
      ],
      "total": 150,
      "hasMore": true
    }
  }
}
```

### Obter Notícia

```typescript
GET /trpc/news.get?input={"id":"news_1"}
```

### Sincronizar Notícias (Admin)

```typescript
POST /trpc/news.sync
{
  "json": {
    "categories": ["futebol", "igaming"],
    "limit": 50
  }
}
```

---

## 📊 Analytics (Análises)

### Trending Topics

```typescript
GET /trpc/analytics.trending?input={"category":"igaming","days":7}
```

**Response:**
```json
{
  "result": {
    "data": {
      "topics": [
        {
          "name": "Regulamentação",
          "mentions": 245,
          "trend": "↑",
          "trendPercent": 15
        }
      ]
    }
  }
}
```

### Sentiment Analysis

```typescript
GET /trpc/analytics.sentiment?input={"category":"futebol","days":30}
```

**Response:**
```json
{
  "result": {
    "data": {
      "positive": 0.65,
      "neutral": 0.25,
      "negative": 0.10,
      "overall": "positive"
    }
  }
}
```

### Category Stats

```typescript
GET /trpc/analytics.stats?input={"from":"2025-11-01","to":"2025-11-10"}
```

---

## 👤 User Profile

### Obter Perfil

```typescript
GET /trpc/user.profile
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "João Silva",
      "role": "admin",
      "preferences": {
        "theme": "dark",
        "notifications": true,
        "categories": ["futebol", "igaming"]
      },
      "createdAt": "2025-01-15T00:00:00Z"
    }
  }
}
```

### Atualizar Perfil

```typescript
PUT /trpc/user.update
{
  "json": {
    "name": "João Silva Jr",
    "preferences": {
      "theme": "light",
      "categories": ["futebol"]
    }
  }
}
```

---

## ⚠️ Error Handling

Todos os erros seguem este padrão:

```json
{
  "error": {
    "json": {
      "code": "UNAUTHORIZED",
      "message": "Token inválido ou expirado",
      "details": {
        "hint": "Faça login novamente"
      }
    }
  }
}
```

### Códigos de Erro

| Código | Status | Descrição |
|--------|--------|-----------|
| `UNAUTHORIZED` | 401 | Token inválido/expirado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `BAD_REQUEST` | 400 | Dados inválidos |
| `CONFLICT` | 409 | Conflito (ex: email duplicado) |
| `INTERNAL_SERVER_ERROR` | 500 | Erro do servidor |

---

## 🔄 Client Usage (React)

### Setup

```typescript
import { trpc } from '@/lib/trpc';

// No seu componente React
export const ReportsList = () => {
  const { data, isLoading } = trpc.reports.list.useQuery({
    limit: 10,
    offset: 0
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      {data?.reports.map(report => (
        <div key={report.id}>{report.title}</div>
      ))}
    </div>
  );
};
```

### Mutations

```typescript
const createReportMutation = trpc.reports.create.useMutation();

const handleCreate = async () => {
  try {
    const result = await createReportMutation.mutateAsync({
      title: "Novo Relatório",
      category: "futebol"
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
```

---

## 📖 Recursos

- [tRPC Documentation](https://trpc.io)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

---

**Última atualização:** 10 de Novembro de 2025
