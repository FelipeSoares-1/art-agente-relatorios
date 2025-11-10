# Checklist de Deploy no Vercel

## ✅ Antes de Começar
- [ ] Conta no GitHub criada
- [ ] Repositório `art-agente-relatorios` no GitHub
- [ ] Você tem as credenciais Manus (App ID, Secret, etc)
- [ ] Banco de dados PostgreSQL configurado (ou vai usar um novo)

## 🔑 Coletando Informações Necessárias

Antes de fazer o deploy, organize estas informações:

### Autenticação Manus
- [ ] VITE_APP_ID: `_________________`
- [ ] JWT_SECRET: `_________________`
- [ ] OAUTH_SERVER_URL: `https://oauth.manus.computer`
- [ ] OWNER_OPEN_ID: `_________________`

### Banco de Dados
- [ ] DATABASE_URL: `_________________`
  
Exemplo: `postgresql://user:password@host:5432/database`

### APIs Externas
- [ ] BUILT_IN_FORGE_API_URL: `_________________`
- [ ] BUILT_IN_FORGE_API_KEY: `_________________`

## 🚀 Passos do Deploy

### 1️⃣ Crie Conta no Vercel
```
URL: https://vercel.com/signup
Clique em "Continue with GitHub"
Autorize Vercel
```

### 2️⃣ Importe o Repositório
```
Vercel Dashboard → Add New → Project
Procure por: art-agente-relatorios
Clique em: Import
```

### 3️⃣ Configure Variáveis de Ambiente
```
Project Settings → Environment Variables
Adicione todas as variáveis coletadas acima
```

### 4️⃣ Iniciar Deploy
```
Clique em: Deploy
Aguarde 3-5 minutos
```

### 5️⃣ Teste seu Site
```
URL: https://art-agente-relatorios.vercel.app
Teste todas as funcionalidades
```

## 📊 Status do Deploy

- [ ] Deploy iniciado
- [ ] Build concluído
- [ ] Site online
- [ ] APIs respondendo
- [ ] Banco de dados conectado
- [ ] Autenticação funcionando

## 🎉 Pronto!

Seu agente de relatórios está online! 🚀

Para próximas atualizações, apenas faça:
```bash
git push  # Deploy automático! ✨
```

---

**Dúvidas?** Verifique os logs: https://vercel.com/your-account/art-agente-relatorios
