# 🔒 Política de Segurança

## Relatando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no A.R.T, **por favor não a divulgue publicamente**. Em vez disso:

1. **Envie um email** para consultor.casteliano@gmail.com com:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sua sugestão de correção (se tiver)

2. **Aguarde nossa resposta** em até 48 horas
3. **Trabalharemos juntos** em uma correção
4. **Você será creditado** na divulgação (se desejar)

## Compromisso de Segurança

- ✅ Responderemos a vulnerabilidades relatadas em até 48 horas
- ✅ Trabalharemos para corrigir vulnerabilidades críticas em até 7 dias
- ✅ Forneceremos crédito público (opcional) ao pesquisador
- ✅ Manteremos detalhes da vulnerabilidade confidenciais até correção

## Práticas de Segurança

### Frontend
- ✅ Sanitização de inputs com Zod
- ✅ CSRF protection
- ✅ Content Security Policy (CSP)
- ✅ XSS prevention com React

### Backend
- ✅ Validação de entrada com Zod
- ✅ JWT com expiração
- ✅ Rate limiting
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ CORS configurado

### Database
- ✅ Senhas com hash bcrypt
- ✅ Dados sensíveis não são logados
- ✅ Backups regular
- ✅ Acesso restrito com princípio do menor privilégio

## Checklist de Segurança para PRs

Antes de contribuir, verifique:

- [ ] Nenhuma chave/secret foi commitada
- [ ] Inputs são validados com Zod
- [ ] Queries preparadas (Drizzle)
- [ ] Sem console.log de dados sensíveis
- [ ] Auth verificado em rotas protegidas
- [ ] CORS específico, não `*`
- [ ] Senhas hasheadas antes de salvar
- [ ] Rate limiting em endpoints públicos

## Dependências de Segurança

Mantemos dependências atualizadas com `pnpm update`. Você pode verificar vulnerabilidades conhecidas com:

```bash
pnpm audit
pnpm audit --fix
```

## Relatórios de Segurança Anteriores

Quando vulnerabilidades forem corrigidas, anunciaremos em [Security Advisories](https://github.com/FelipeSoares-1/art-agente-relatorios/security/advisories).

---

**Obrigado por manter A.R.T seguro! 🛡️**
