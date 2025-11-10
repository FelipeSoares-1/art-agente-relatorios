#!/bin/bash

# A.R.T - Quick GitHub Setup Script
# Este script automatiza o upload do projeto para o GitHub

echo "🚀 A.R.T - Agente de Relatórios e Tendências"
echo "📤 Quick GitHub Setup"
echo ""

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado. Por favor, instale Git primeiro."
    exit 1
fi

# Solicitar informações do usuário
read -p "📝 Seu nome (para git config): " git_name
read -p "📧 Seu email (para git config): " git_email
read -p "👤 Seu usuário GitHub: " github_user
read -p "📦 Nome do repositório (padrão: art-agente-relatorios): " repo_name
repo_name=${repo_name:-art-agente-relatorios}

# Navegar para o diretório do projeto
cd /home/ubuntu/news_report_agent || exit 1

echo ""
echo "⚙️  Configurando Git..."

# Configurar Git
git config user.name "$git_name"
git config user.email "$git_email"

# Inicializar repositório se não existir
if [ ! -d .git ]; then
    echo "🔧 Inicializando repositório Git..."
    git init
fi

# Criar .gitignore se não existir
if [ ! -f .gitignore ]; then
    echo "📝 Criando .gitignore..."
    cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
.pnpm-store/
pnpm-lock.yaml

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Temporary files
.tmp/
temp/
GITIGNORE
fi

# Criar README.md se não existir
if [ ! -f README.md ]; then
    echo "📖 Criando README.md..."
    cat > README.md << 'README'
# A.R.T - Agente de Relatórios e Tendências

Agente inteligente de consolidação de notícias com identidade visual Artplan.

## 🎯 Funcionalidades

- ⚽ **Futebol**: Resultados, Transferências, Lesões
- 🎰 **iGaming**: Mercado de Apostas, Regulamentação
- 📢 **Marketing**: Campanhas Publicitárias, Patrocínios

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB com Drizzle ORM
- **Auth**: Manus OAuth

## 📦 Instalação

```bash
git clone https://github.com/$github_user/$repo_name.git
cd $repo_name
pnpm install
pnpm db:push
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Documentação

Veja [GITHUB_SETUP.md](../GITHUB_SETUP.md) para instruções detalhadas.

---

**Desenvolvido com ❤️ usando Manus AI**
README
fi

echo ""
echo "📤 Preparando para upload..."

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
echo "💾 Criando commit inicial..."
git commit -m "Initial commit: A.R.T - Agente de Relatórios e Tendências

- Interface web completa com React 19 + Tailwind CSS
- Backend tRPC com Express 4
- Autenticação Manus OAuth
- Banco de dados MySQL com Drizzle ORM
- Identidade visual Artplan
- Geração de relatórios de notícias
- Histórico de relatórios
- Design responsivo e moderno"

echo ""
echo "✅ Configuração local concluída!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Acesse https://github.com/new"
echo "2. Crie um novo repositório com o nome: $repo_name"
echo "3. Execute os seguintes comandos:"
echo ""
echo "   git remote add origin https://github.com/$github_user/$repo_name.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎉 Pronto! Seu código estará no GitHub!"
