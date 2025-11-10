# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- [ ] Testes automáticos (Vitest + Playwright)
- [ ] Suporte multilíngue (i18n)
- [ ] Export de relatórios em PDF/Excel
- [ ] Dashboard com gráficos e analytics
- [ ] Integração com mais fontes de notícias
- [ ] Sistema de alertas e notificações
- [ ] API GraphQL alternativo

### Alterado
- [ ] Melhorar performance de queries do banco
- [ ] Refatorar componentes de UI para melhor reutilização
- [ ] Otimizar bundle size do frontend

### Corrigido
- [ ] (A corrigir em próximas versões)

## [1.0.0] - 2025-11-10

### Adicionado
- ✅ **Documentação Completa**
  - README.md com setup instructions
  - .env.example com todas as variáveis
  - API.md com documentação tRPC completa
  - ARCHITECTURE.md com diagramas e decisões
  - DATABASE.md com schema e queries
  - CONTRIBUTING.md com guidelines
  - CODE_OF_CONDUCT.md para comunidade
  - SECURITY.md com políticas

- ✅ **GitHub Actions Workflows**
  - CI pipeline: linting, tests, type check
  - PR validation: conventional commits
  - Deployment pipeline: build & deploy automático

- ✅ **Stack Tecnológico Core**
  - React 19 + Tailwind CSS 4 (Frontend)
  - Express 4 + tRPC 11 (Backend)
  - MySQL + Drizzle ORM (Database)
  - OpenAI Integration (AI)
  - Manus OAuth (Auth)

- ✅ **Features Principais**
  - Consolidação automática de notícias
  - Geração de relatórios com IA
  - Análise de sentimento
  - Categorização (⚽ Futebol, 🎰 iGaming, 📢 Marketing)
  - Dashboard responsivo
  - Search com full-text
  - User preferences e favorites

- ✅ **Segurança**
  - JWT authentication
  - Rate limiting
  - CORS configurado
  - Input validation com Zod
  - SQL injection protection
  - XSS prevention

### Alterado
- (Primeira release pública)

### Corrigido
- (Primeira release pública)

### Removido
- Arquivo `.tar.gz` grande (GitHub limit 100MB)

---

## Convenções

### Tipos de Mudança
- **Adicionado**: Para novas features
- **Alterado**: Para mudanças em funcionalidade existente
- **Corrigido**: Para bugfixes
- **Removido**: Para funcionalidades removidas
- **Segurança**: Para patches de vulnerabilidade

### Versionamento
- **MAJOR**: Breaking changes
- **MINOR**: Nova feature (backwards compatible)
- **PATCH**: Bugfix (backwards compatible)

### Exemplo de Commit
```
feat(reports): add PDF export functionality

This allows users to export reports as PDF files.
Implements export service with template rendering.

Closes #123
```

---

## Como Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes completos.

Resumidamente:
1. Fork o repositório
2. Crie branch: `git checkout -b feature/nome`
3. Commit: `git commit -m "feat(scope): description"`
4. Push: `git push origin feature/nome`
5. Abra Pull Request

---

**[Voltar ao Topo](#-changelog)**
