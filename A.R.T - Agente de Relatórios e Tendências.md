# A.R.T - Agente de Relatórios e Tendências
## Guia de Upload no GitHub

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- Git instalado em sua máquina
- Uma conta no GitHub
- Node.js e pnpm instalados

### 🚀 Passo 1: Preparar o Repositório Local

```bash
# Extraia o arquivo compactado
tar -xzf art-agente-relatorios.tar.gz
cd news_report_agent

# Inicialize o git (se ainda não estiver inicializado)
git init

# Configure suas credenciais do Git
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
```

### 🔧 Passo 2: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no ícone `+` no canto superior direito
3. Selecione **New repository**
4. Nomeie o repositório: `art-agente-relatorios` (ou outro nome de sua preferência)
5. Adicione uma descrição: `A.R.T - Agente de Relatórios e Tendências com identidade Artplan`
6. Escolha **Public** ou **Private** conforme sua preferência
7. **NÃO** inicialize com README, .gitignore ou licença (vamos fazer isso localmente)
8. Clique em **Create repository**

### 📤 Passo 3: Fazer Push do Código

Após criar o repositório, você verá instruções. Execute os seguintes comandos no terminal:

```bash
# Adicione o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/art-agente-relatorios.git

# Renomeie a branch principal para main (se necessário)
git branch -M main

# Adicione todos os arquivos
git add .

# Crie o primeiro commit
git commit -m "Initial commit: A.R.T - Agente de Relatórios e Tendências"

# Faça push para o GitHub
git push -u origin main
```

### 📝 Passo 4: Adicionar Arquivo .gitignore

Se ainda não existir um `.gitignore`, crie um na raiz do projeto:

```bash
cat > .gitignore << 'EOF'
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
EOF

git add .gitignore
git commit -m "Add .gitignore"
git push
```

### 📖 Passo 5: Adicionar README.md

Crie um README.md descritivo:

```bash
cat > README.md << 'EOF'
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
- **Deployment**: Manus Platform

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- pnpm 10+
- MySQL/TiDB

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/art-agente-relatorios.git
cd art-agente-relatorios

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute as migrações do banco de dados
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🗂️ Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── const.ts       # Constantes (branding)
│   └── index.html
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Procedimentos tRPC
│   ├── db.ts              # Helpers de banco de dados
│   ├── newsAgent.ts       # Lógica de geração de relatórios
│   └── _core/             # Infraestrutura
├── drizzle/               # Schema e migrações
├── shared/                # Código compartilhado
└── package.json
```

## 🎨 Branding

A aplicação utiliza a identidade visual da Artplan:
- **Cor Primária**: #EF3B39 (Vermelho Artplan)
- **Logo**: `/client/public/artplan-logo.png`
- **Nome**: A.R.T (Agente de Relatórios e Tendências)

Para alterar o branding, edite:
- `client/src/const.ts` - Constantes e cores
- `client/src/index.css` - Tema CSS
- `client/public/artplan-logo.png` - Logo

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
DATABASE_URL=mysql://user:password@localhost:3306/art_db
JWT_SECRET=sua_chave_secreta_aqui
VITE_APP_ID=seu_app_id
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_TITLE=A.R.T
```

## 🚀 Deploy

### Opção 1: Manus Platform (Recomendado)
A aplicação foi desenvolvida para a plataforma Manus. Faça push do código e use o botão "Publish" no painel de controle.

### Opção 2: Deploy Manual
```bash
# Build da aplicação
pnpm build

# Inicie o servidor
pnpm start
```

## 📝 Scripts Disponíveis

```bash
pnpm dev           # Inicia servidor de desenvolvimento
pnpm build         # Build para produção
pnpm start         # Inicia servidor de produção
pnpm db:push       # Executa migrações do banco
pnpm tsc           # Verifica tipos TypeScript
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

Desenvolvido pela Artplan - Agência de Tendências Inteligentes

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Manus AI**
EOF

git add README.md
git commit -m "Add comprehensive README"
git push
```

### 🔄 Passo 6: Configurar GitHub Actions (Opcional)

Para CI/CD automático, crie `.github/workflows/deploy.yml`:

```bash
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Manus

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      # Adicione seus passos de deploy aqui
EOF

git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push
```

### ✅ Verificação Final

Após fazer push, verifique:

1. Acesse seu repositório no GitHub
2. Confirme que todos os arquivos estão lá
3. Verifique se o README aparece corretamente
4. Confirme que o `.gitignore` está funcionando (pasta `node_modules` não deve estar no repositório)

### 🎉 Pronto!

Seu código A.R.T está agora no GitHub e pronto para colaboração!

---

## 📚 Referências Úteis

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Manus Documentation](https://docs.manus.im)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🐛 Troubleshooting

### Erro: "fatal: not a git repository"
```bash
git init
```

### Erro: "Permission denied (publickey)"
Configure suas chaves SSH no GitHub: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Erro: "The branch 'main' is not fully merged"
```bash
git branch -D main
git branch -M main
```

---

**Última atualização**: Novembro 2025
