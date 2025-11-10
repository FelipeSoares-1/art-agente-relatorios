# 💾 Database Schema Documentation

## Visão Geral

A.R.T usa **MySQL 8+** como banco de dados com **Drizzle ORM** para queries type-safe em TypeScript.

---

## 📋 Tabelas

### Users (Usuários)

Armazena dados de autenticação e perfil de usuários.

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  preferences JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Campos:**
- `id` - UUID único
- `email` - Email único para login
- `name` - Nome do usuário
- `passwordHash` - Hash bcrypt da senha
- `role` - Permissão do usuário
- `preferences` - JSON com preferências (tema, categorias, etc)

**Exemplo de preferences:**
```json
{
  "theme": "dark",
  "notifications": true,
  "categories": ["futebol", "igaming"],
  "emailDigest": "weekly"
}
```

---

### News (Notícias)

Armazena notícias consolidadas de múltiplas fontes.

```sql
CREATE TABLE news (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT,
  url VARCHAR(2000) UNIQUE NOT NULL,
  source VARCHAR(255),
  category ENUM('futebol', 'igaming', 'marketing') NOT NULL,
  sentiment ENUM('positive', 'neutral', 'negative'),
  imageUrl VARCHAR(2000),
  authorName VARCHAR(255),
  publishedAt TIMESTAMP,
  externalId VARCHAR(255),
  relevanceScore DECIMAL(3, 2),
  viewCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_sentiment (sentiment),
  INDEX idx_publishedAt (publishedAt),
  INDEX idx_source (source),
  FULLTEXT INDEX idx_search (title, description)
);
```

**Campos:**
- `id` - UUID único
- `title` - Título da notícia
- `description` - Resumo curto
- `content` - Conteúdo completo
- `url` - Link original (único para evitar duplicatas)
- `source` - Fonte (ESPN, CNN, etc)
- `category` - Categoria da notícia
- `sentiment` - Análise de sentimento (IA)
- `imageUrl` - Imagem destacada
- `relevanceScore` - Score 0-1 (filtros)
- `viewCount` - Contador de visualizações

---

### Reports (Relatórios)

Armazena relatórios gerados automaticamente ou manualmente.

```sql
CREATE TABLE reports (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  content LONGTEXT,
  category ENUM('futebol', 'igaming', 'marketing') NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  viewCount INT DEFAULT 0,
  downloadCount INT DEFAULT 0,
  metadata JSON,
  generatedBy VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  publishedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt),
  FULLTEXT INDEX idx_search (title, summary, content)
);
```

**Campos:**
- `id` - UUID único
- `userId` - Autor do relatório (FK)
- `title` - Título
- `summary` - Resumo executivo
- `content` - Conteúdo completo
- `category` - Categoria principal
- `status` - Draft/Published/Archived
- `metadata` - JSON com metadados customizados
- `generatedBy` - "AI" ou "manual"

**Exemplo de metadata:**
```json
{
  "aiModel": "gpt-4-turbo",
  "sourceCount": 15,
  "language": "pt-BR",
  "tags": ["regulamentação", "crescimento"],
  "customFields": {
    "marketSize": "2.5B USD",
    "trend": "↑15%"
  }
}
```

---

### ReportNews (Relação Many-to-Many)

Conecta notícias aos relatórios em que aparecem.

```sql
CREATE TABLE reportNews (
  reportId VARCHAR(36) NOT NULL,
  newsId VARCHAR(36) NOT NULL,
  position INT,
  context TEXT,
  PRIMARY KEY (reportId, newsId),
  FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (newsId) REFERENCES news(id) ON DELETE CASCADE,
  INDEX idx_newsId (newsId)
);
```

**Campos:**
- `reportId` - ID do relatório (PK, FK)
- `newsId` - ID da notícia (PK, FK)
- `position` - Ordem no relatório
- `context` - Explicação de por que foi incluída

---

### UserFavorites (Favoritos)

Notícias salvas por usuários.

```sql
CREATE TABLE userFavorites (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  newsId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (newsId) REFERENCES news(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_news (userId, newsId),
  INDEX idx_userId (userId)
);
```

---

### NewsCategories (Categorização)

Texto descritivo para categorias (pode ser estendido).

```sql
CREATE TABLE newsCategories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

---

## 🔍 Queries Comuns

### Listar Notícias com Pagination

```typescript
// Drizzle ORM
const result = await db
  .select()
  .from(news)
  .where(eq(news.category, "futebol"))
  .limit(10)
  .offset(0)
  .orderBy(desc(news.publishedAt));
```

### Buscar Notícias por Texto

```typescript
// Full-text search
const result = await db
  .select()
  .from(news)
  .where(sql`MATCH(title, description) AGAINST(${searchTerm})`)
  .limit(20);
```

### Relatórios por Usuário

```typescript
const result = await db
  .select()
  .from(reports)
  .where(eq(reports.userId, userId))
  .orderBy(desc(reports.createdAt))
  .limit(10);
```

### Relatório com Todas as Notícias

```typescript
// Join com related news
const result = await db
  .select({
    report: reports,
    news: news
  })
  .from(reports)
  .leftJoin(reportNews, eq(reports.id, reportNews.reportId))
  .leftJoin(news, eq(reportNews.newsId, news.id))
  .where(eq(reports.id, reportId))
  .orderBy(reportNews.position);
```

### Análise de Sentimento por Categoria

```typescript
const result = await db
  .select({
    sentiment: news.sentiment,
    count: count(news.id)
  })
  .from(news)
  .where(
    and(
      eq(news.category, category),
      gte(news.publishedAt, lastWeek)
    )
  )
  .groupBy(news.sentiment);
```

---

## 📊 Índices

### Índices Existentes

```sql
-- Users
INDEX idx_email (email)
INDEX idx_role (role)

-- News
INDEX idx_category (category)
INDEX idx_sentiment (sentiment)
INDEX idx_publishedAt (publishedAt)
INDEX idx_source (source)
FULLTEXT INDEX idx_search (title, description)

-- Reports
INDEX idx_userId (userId)
INDEX idx_category (category)
INDEX idx_status (status)
INDEX idx_createdAt (createdAt)
FULLTEXT INDEX idx_search (title, summary, content)

-- Relationships
INDEX idx_newsId (reportNews.newsId)
INDEX idx_userId (userFavorites.userId)
```

### Recomendações de Performance

```sql
-- Adicionar índices para queries frequentes
ALTER TABLE news ADD INDEX idx_category_publishedAt (category, publishedAt);
ALTER TABLE reports ADD INDEX idx_userId_createdAt (userId, createdAt);
ALTER TABLE news ADD INDEX idx_sentiment_category (sentiment, category);
```

---

## 🔐 Migrações

### Criar Primeira Migração

```bash
pnpm db:generate  # Gera based na schema Drizzle
pnpm db:push      # Aplica ao banco
```

### Estrutura de Migrações

```
drizzle/
├── migrations/
│   ├── 0001_init.sql           # Tabelas iniciais
│   ├── 0002_add_sentiment.sql  # Adiciona coluna sentiment
│   └── 0003_add_indexes.sql    # Otimizações
└── schema.ts                   # Definições Drizzle
```

---

## 📈 Crescimento de Dados

### Estimativas (1 ano)

| Tabela | Registros | Tamanho |
|--------|-----------|---------|
| users | 10.000 | ~5 MB |
| news | 500.000 | ~1 GB |
| reports | 50.000 | ~500 MB |
| reportNews | 750.000 | ~50 MB |
| userFavorites | 200.000 | ~20 MB |

### Estratégias de Escalabilidade

1. **Particionamento de News** (por mês/categoria)
2. **Read Replicas** para queries pesadas
3. **Cache** (Redis) de notícias frequentes
4. **Archive** de relatórios antigos
5. **Índices** em colunas de busca

---

## 🔄 Backup & Recovery

```bash
# Backup completo
mysqldump -u user -p art_db > backup.sql

# Backup incremental (binlog)
mysqlbinlog /var/log/mysql/binlog.000001 > incremental.sql

# Restore
mysql -u user -p art_db < backup.sql
```

---

## 🔒 Segurança

```sql
-- Usuários específicos (não root)
CREATE USER 'art_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON art_db.* TO 'art_app'@'localhost';

-- Aplicar princípio do menor privilégio
REVOKE ALL ON *.* FROM 'art_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON art_db.* TO 'art_app'@'localhost';
```

---

**Última atualização:** 10 de Novembro de 2025
