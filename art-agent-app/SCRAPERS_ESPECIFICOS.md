# Scrapers Específicos - Documentação

## ✅ STATUS: IMPLEMENTADO E FUNCIONANDO

### Scrapers Otimizados Implementados

1. **Propmark** ✅
   - URL: https://propmark.com.br
   - Status: **FUNCIONANDO**
   - Último teste: 49 artigos coletados, 27 salvos
   - Técnicas: Headers personalizados, User-Agent, delay entre páginas

2. **Meio & Mensagem** ✅  
   - URL: https://meioemensagem.com.br/comunicacao
   - Status: **FUNCIONANDO**
   - Último teste: 9 artigos coletados, 6 salvos
   - Técnicas: Múltiplos seletores CSS, parsing robusto

3. **AdNews** ⚠️
   - URL: https://adnews.com.br
   - Status: **EM DESENVOLVIMENTO**
   - Último teste: 0 artigos (seletores precisam ajuste)

## 🚀 Como Usar

### Via Terminal (Recomendado)

```powershell
# Executar scraping específico
npx tsx save-scraped-final.ts
```

### Via API (Quando servidor estiver rodando)

```powershell
# Método 1: PowerShell
$body = '{"useSpecificScrapers":true,"startDate":"2025-01-01"}'
Invoke-WebRequest -Uri http://localhost:3000/api/scrape-news `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

# Método 2: curl (se disponível)
curl -X POST http://localhost:3000/api/scrape-news `
  -H "Content-Type: application/json" `
  -d '{"useSpecificScrapers":true,"startDate":"2025-01-01"}'
```

## 📊 Resultados do Último Teste

```
=== RESUMO FINAL ===
📊 Total coletado: 58 artigos
💾 Total salvo: 33 novos artigos
🔄 Total duplicados: 25
📚 Total no banco de dados: 888 artigos (era 820, +68 com outros testes)
```

### Breakdown por Site:
- **Propmark**: 49 coletados → 27 salvos (22 duplicados)
- **Meio & Mensagem**: 9 coletados → 6 salvos (3 duplicados)
- **AdNews**: 0 coletados (precisa ajustes nos seletores)

## 🔧 Técnicas Anti-Bloqueio Implementadas

1. **Headers Customizados**
   ```typescript
   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...'
   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9...'
   'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
   'Referer': new URL(url).origin
   ```

2. **Delays Entre Requisições**
   - 2 segundos entre cada página
   - Evita sobrecarga do servidor e detecção

3. **Múltiplos Seletores CSS**
   - Cada scraper tenta vários seletores até encontrar artigos
   - Exemplo: `'.post-item', '.entry-item', '.blog-post', 'article.post'`

4. **Gestão de Erros**
   - Try-catch por página
   - Se uma página falha, continua nas próximas
   - Logging detalhado para debugging

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
1. `src/lib/scrapers-especificos.ts` - Scrapers otimizados
2. `test-scrapers.ts` - Script de teste rápido
3. `save-scraped-final.ts` - Script para salvar no banco
4. `SCRAPERS_ESPECIFICOS.md` - Esta documentação

### Arquivos Modificados
1. `src/lib/db.ts` - Adicionado alias `db` para `prisma`
2. `src/app/api/scrape-news/route.ts` - Suporte para `useSpecificScrapers`

## 🎯 Próximos Passos

### Prioridade ALTA
- [ ] Corrigir scraper do AdNews (ajustar seletores CSS)
- [ ] Adicionar Mundo do Marketing
- [ ] Adicionar ABAP

### Prioridade MÉDIA
- [ ] Implementar sistema de agendamento automático (cron)
- [ ] Dashboard de monitoramento de scraping
- [ ] Métricas: taxa de sucesso, artigos por dia, etc.

### Prioridade BAIXA
- [ ] Rotação de User-Agents
- [ ] Proxy rotation (se necessário)
- [ ] Captcha handling (apenas se encontrar bloqueios)

## 🧪 Como Testar

### Teste Rápido (sem salvar no banco)
```powershell
npx tsx test-scrapers.ts
```

### Teste Completo (com salvamento)
```powershell
npx tsx save-scraped-final.ts
```

### Verificar Banco de Dados
```powershell
# Contar artigos por feed
npx prisma studio
# Ou via código
node -e "const{prisma}=require('./src/lib/db');prisma.newsArticle.count().then(console.log)"
```

## ⚠️ Troubleshooting

### Problema: "Cannot find module '@/lib/db'"
**Solução**: Verificar que `tsconfig.json` tem configuração de paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Problema: "feed is required"
**Solução**: Scrapers agora criam feeds automaticamente com `upsert`

### Problema: Scraper retorna 0 artigos
**Soluções**:
1. Verificar se site está acessível: `Invoke-WebRequest -Uri "https://site.com"`
2. Inspecionar HTML: Ver seletores CSS corretos
3. Testar com diferentes seletores no scraper
4. Adicionar mais logs para debugging

## 📚 Recursos

### Documentação
- Cheerio: https://cheerio.js.org/
- Axios: https://axios-http.com/
- Prisma: https://www.prisma.io/docs

### Ferramentas de Desenvolvimento
- Browser DevTools → Inspect Element → Copy selector
- `npx prisma studio` - Interface visual do banco
- PowerShell `Select-String` - Buscar padrões em HTML

## 💡 Dicas

1. **Sempre testar scrapers antes de rodar em produção**
2. **Respeitar robots.txt dos sites**
3. **Não fazer scraping muito frequente (máx 1x por hora)**
4. **Manter delays entre requisições (mínimo 1-2 segundos)**
5. **Logar resultados para monitoramento**

---

**Última atualização**: Janeiro 2025  
**Status**: Propmark e M&M funcionais, AdNews em desenvolvimento
