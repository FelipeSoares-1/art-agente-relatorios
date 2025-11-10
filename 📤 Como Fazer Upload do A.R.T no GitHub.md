# 📤 Como Fazer Upload do A.R.T no GitHub

## ⚡ Versão Rápida (5 minutos)

### 1️⃣ Extraia o código
```bash
tar -xzf art-agente-relatorios.tar.gz
cd news_report_agent
```

### 2️⃣ Configure Git localmente
```bash
git init
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
git add .
git commit -m "Initial commit: A.R.T - Agente de Relatórios e Tendências"
```

### 3️⃣ Crie repositório no GitHub
- Acesse https://github.com/new
- Nomeie: `art-agente-relatorios`
- Clique em "Create repository"

### 4️⃣ Conecte e faça push
```bash
git remote add origin https://github.com/SEU_USUARIO/art-agente-relatorios.git
git branch -M main
git push -u origin main
```

✅ **Pronto!** Seu código está no GitHub!

---

## 📚 Versão Detalhada

### Pré-requisitos
- Git instalado: https://git-scm.com/download
- Conta GitHub: https://github.com/signup
- Node.js 18+: https://nodejs.org

### Passo a Passo

#### 1. Preparar o Código Localmente

```bash
# Extrair arquivo
tar -xzf art-agente-relatorios.tar.gz
cd news_report_agent

# Inicializar Git
git init

# Configurar identidade
git config user.name "Seu Nome Completo"
git config user.email "seu.email@example.com"

# Verificar status
git status
```

#### 2. Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Preencha os campos:
   - **Repository name**: `art-agente-relatorios`
   - **Description**: `A.R.T - Agente de Relatórios e Tendências com identidade Artplan`
   - **Visibility**: Escolha "Public" ou "Private"
3. **Não marque** nenhuma opção de inicialização
4. Clique em **Create repository**

#### 3. Fazer Push do Código

Copie os comandos da página do GitHub (segunda opção) e execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/art-agente-relatorios.git
git branch -M main
git add .
git commit -m "Initial commit: A.R.T - Agente de Relatórios e Tendências"
git push -u origin main
```

#### 4. Adicionar Documentação (Opcional)

```bash
# Criar .gitignore
cat > .gitignore << 'GITIGNORE'
node_modules/
.pnpm-store/
pnpm-lock.yaml
.env
.env.local
dist/
build/
.vscode/
.idea/
.DS_Store
*.log
GITIGNORE

# Criar README.md
cat > README.md << 'README'
# A.R.T - Agente de Relatórios e Tendências

Agente inteligente de consolidação de notícias com identidade visual Artplan.

## 🎯 Funcionalidades
- ⚽ Futebol (Resultados, Transferências, Lesões)
- 🎰 iGaming (Mercado de Apostas, Regulamentação)
- 📢 Marketing (Campanhas Publicitárias, Patrocínios)

## 🛠️ Tech Stack
- React 19 + Tailwind CSS 4
- Express 4 + tRPC 11
- MySQL/TiDB + Drizzle ORM
- Manus OAuth

## 📦 Instalação
```bash
git clone https://github.com/SEU_USUARIO/art-agente-relatorios.git
cd art-agente-relatorios
pnpm install
pnpm db:push
pnpm dev
```

## 📄 Licença
MIT

---
Desenvolvido com ❤️ usando Manus AI
README

# Fazer commit e push
git add .gitignore README.md
git commit -m "Add .gitignore and README"
git push
```

---

## 🆘 Troubleshooting

### ❌ "fatal: not a git repository"
```bash
git init
```

### ❌ "Permission denied (publickey)"
Configure chaves SSH: https://docs.github.com/pt/authentication/connecting-to-github-with-ssh

### ❌ "The branch 'main' is not fully merged"
```bash
git branch -D main
git branch -M main
```

### ❌ "Everything up-to-date"
Você já fez push com sucesso! ✅

---

## 📋 Checklist Final

- [ ] Código extraído
- [ ] Git inicializado localmente
- [ ] Repositório criado no GitHub
- [ ] Push realizado com sucesso
- [ ] README.md visível no GitHub
- [ ] .gitignore funcionando (sem node_modules)

---

## 🔗 Links Úteis

- [Git Docs](https://git-scm.com/doc)
- [GitHub Help](https://docs.github.com)
- [SSH Keys Setup](https://docs.github.com/pt/authentication/connecting-to-github-with-ssh)
- [GitHub CLI](https://cli.github.com) (alternativa)

---

## 💡 Dica Bônus: Usar GitHub CLI

Se preferir usar a linha de comando:

```bash
# Instalar GitHub CLI
# macOS: brew install gh
# Windows: choco install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Fazer login
gh auth login

# Criar repositório
gh repo create art-agente-relatorios --public --source=. --remote=origin --push
```

---

**Última atualização**: Novembro 2025
**Desenvolvido por**: Manus AI para Artplan
