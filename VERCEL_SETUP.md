# 🚀 Guia de Deploy no Vercel

## Passo 1: Crie uma Conta no Vercel

1. Vá para **https://vercel.com/signup**
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar seus repositórios GitHub
4. Confirme sua senha e email

## Passo 2: Importe o Repositório

Opção A - Via Interface Web (Mais Fácil):
1. Após login no Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Procure por `art-agente-relatorios`
4. Clique em **"Import"**

Opção B - Via CLI (Automático):
```bash
npm install -g vercel
vercel
```

## Passo 3: Configure as Variáveis de Ambiente

No Dashboard do Vercel:
1. Vá para seu projeto
2. Clique em **"Settings"**
3. Clique em **"Environment Variables"**
4. Adicione as seguintes variáveis:

### Variáveis Obrigatórias:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `VITE_APP_ID` | *seu_app_id* | ID da aplicação Manus |
| `JWT_SECRET` | *seu_secret* | Chave secreta JWT |
| `DATABASE_URL` | *sua_url* | URL do PostgreSQL |
| `OAUTH_SERVER_URL` | `https://oauth.manus.computer` | Servidor OAuth |
| `OWNER_OPEN_ID` | *seu_owner_id* | ID do proprietário |
| `BUILT_IN_FORGE_API_URL` | *sua_url* | URL da Forge API |
| `BUILT_IN_FORGE_API_KEY` | *sua_key* | Chave da Forge API |

## Passo 4: Deploy

1. Após configurar as variáveis, clique em **"Deploy"**
2. Espere de 3-5 minutos
3. Seu site estará em: **https://art-agente-relatorios.vercel.app** ✅

## ✨ Próximas Atualizações

Qualquer novo `push` para a branch `master` fará deploy automático!

```bash
git add .
git commit -m "nova feature"
git push  # → Deploy automático no Vercel! 🚀
```

## 📞 Suporte

Se tiver problemas, verifique:
- ✅ As variáveis de ambiente estão configuradas?
- ✅ O banco de dados PostgreSQL está online?
- ✅ Os tokens/keys são válidos?

Verifique os logs do deployment em: **https://vercel.com/your-account/art-agente-relatorios**
