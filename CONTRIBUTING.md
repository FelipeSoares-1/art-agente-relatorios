# 🤝 Guia de Contribuição

Obrigado por querer contribuir com o A.R.T! Este documento fornece diretrizes e instruções para fazer isso.

## 📋 Código de Conduta

Esperamos que todos os contribuidores sigam nosso [Código de Conduta](./CODE_OF_CONDUCT.md). A essência dele é:
- Seja respeitoso
- Seja inclusivo
- Seja construtivo
- Denuncie comportamento inadequado aos mantenedores

## 🚀 Como Começar

### 1. Fork e Clone

```bash
# Fork no GitHub, depois:
git clone https://github.com/seu-usuario/art-agente-relatorios.git
cd art-agente-relatorios/news_report_agent
git remote add upstream https://github.com/FelipeSoares-1/art-agente-relatorios.git
```

### 2. Setup do Ambiente

```bash
# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais locais

# Setup do banco (local)
pnpm db:push
```

### 3. Crie uma Branch

```bash
# Atualize a branch main
git fetch upstream
git checkout upstream/main

# Crie sua feature branch
git checkout -b feature/minha-feature
# ou para bugfix
git checkout -b fix/meu-bugfix
```

## 📝 Padrões de Código

### TypeScript
- Use tipos explícitos quando possível
- Evite `any`
- Use interfaces para estruturas complexas

```typescript
// ✅ Bom
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// ❌ Evitar
const user: any = { name: "João" };
```

### React
- Componentes funcionais com hooks
- Nomes descritivos de componentes
- Extraia componentes reutilizáveis

```typescript
// ✅ Bom
export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  return <div>{report.title}</div>;
};

// ❌ Evitar
export default ({ r }) => <div>{r.t}</div>;
```

### Styling
- Use Tailwind CSS classes
- Evite inline styles
- Use `cn()` para condicionais complexas

```tsx
// ✅ Bom
<div className={cn("p-4 rounded", isActive && "bg-blue-500")}>

// ❌ Evitar
<div style={{ padding: "16px", backgroundColor: isActive ? "blue" : "white" }}>
```

### Database
- Sempre crie migrações para mudanças de schema
- Use tipos do Drizzle
- Valide dados na entrada

```typescript
// ✅ Bom
export const reports = createTable("reports", {
  id: text().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp().defaultNow(),
});
```

## 🧪 Testes

- Escreva testes para features novas
- Mantenha cobertura acima de 80%
- Use padrão AAA (Arrange, Act, Assert)

```typescript
describe("reportService", () => {
  it("should summarize news with AI", async () => {
    // Arrange
    const news = [{ title: "...", content: "..." }];
    
    // Act
    const summary = await summarizeNews(news);
    
    // Assert
    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(0);
  });
});
```

## 📦 Commit Messages

Use o padrão Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Nova feature
- `fix`: Bugfix
- `docs`: Documentação
- `style`: Formatação/estilo
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```
feat(reports): add PDF export functionality
fix(auth): resolve token expiration issue
docs(api): update endpoint documentation
refactor(db): optimize query performance
```

## 🔄 Pull Request

### Antes de Abrir

1. Atualize com upstream
```bash
git fetch upstream
git rebase upstream/main
```

2. Rode verificações locais
```bash
pnpm check        # Type check
pnpm format       # Formatação
pnpm test         # Testes
```

3. Push para seu fork
```bash
git push origin feature/minha-feature
```

### Template de PR

```markdown
## Descrição
Breve descrição do que essa PR faz.

## Type de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentation update

## Como Testar
Passos para testar a mudança:
1. ...
2. ...

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem warnings de lint
- [ ] Mudanças de tipo-seguro com TypeScript
- [ ] Código formatado com Prettier

## Screenshots (se aplicável)
```

## 🐛 Reportar Bugs

Use [GitHub Issues](https://github.com/FelipeSoares-1/art-agente-relatorios/issues) com este template:

```markdown
## Descrição do Bug
Descrição clara e concisa do problema.

## Passos para Reproduzir
1. ...
2. ...
3. ...

## Comportamento Esperado
O que deveria acontecer.

## Comportamento Atual
O que está acontecendo.

## Logs/Screenshots
```

## 💡 Sugerir Features

Abra uma [Discussion](https://github.com/FelipeSoares-1/art-agente-relatorios/discussions) ou [Issue](https://github.com/FelipeSoares-1/art-agente-relatorios/issues) com tag `enhancement`.

## 📚 Documentação

Se sua mudança afeta a API ou funcionalidade pública, atualize:
- `README.md` — para overview
- `docs/API.md` — para endpoints tRPC
- Comentários no código — para lógica complexa

## 🎯 Areas Prioritárias

Estamos procurando contribuições em:
- ✅ Testes adicionais
- ✅ Documentação melhorada
- ✅ Performance otimizations
- ✅ UX/UI improvements
- ✅ Novas features (abra uma discussion primeiro)
- ✅ Suporte multilíngue

## ❓ Dúvidas?

- 💬 [GitHub Discussions](https://github.com/FelipeSoares-1/art-agente-relatorios/discussions)
- 📧 consultor.casteliano@gmail.com

---

Obrigado por contribuir! 🎉
