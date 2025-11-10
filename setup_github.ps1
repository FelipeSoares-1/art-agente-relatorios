# Script de Setup Automatico do GitHub para A.R.T
$git = "C:\Program Files\Git\bin\git.exe"

# Configurar Git
Write-Host "Configurando Git..." -ForegroundColor Cyan
& $git config --global user.name "Felipe Soares"
& $git config --global user.email "consultor.casteliano@gmail.com"

# Navegar para o diretorio do projeto
$projectPath = "c:\Users\Felipe Soares\Desktop\VS CODE PROJETOS\PROJETOS\A.R.T"
Set-Location $projectPath
Write-Host "Diretorio: $projectPath" -ForegroundColor Cyan

# Inicializar repositorio Git
Write-Host "Inicializando repositorio Git..." -ForegroundColor Cyan
& $git init

# Adicionar arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Cyan
& $git add .

# Criar commit
Write-Host "Criando commit inicial..." -ForegroundColor Cyan
& $git commit -m "Initial commit: A.R.T - Agente de Relatorios e Tendencias

- Interface web completa com React 19 + Tailwind CSS
- Backend tRPC com Express 4
- Autenticacao Manus OAuth
- Banco de dados MySQL com Drizzle ORM
- Identidade visual Artplan
- Geracao de relatorios de noticias
- Historico de relatorios
- Design responsivo e moderno"

# Configurar remote
Write-Host "Adicionando remote origin..." -ForegroundColor Cyan
& $git remote add origin https://github.com/felipesoares-1/art-agente-relatorios.git

# Renomear branch para main
Write-Host "Renomeando branch para main..." -ForegroundColor Cyan
& $git branch -M main

# Push para GitHub
Write-Host "Fazendo push para GitHub..." -ForegroundColor Cyan
Write-Host "ATENCAO: Voce pode ser solicitado a autenticar no navegador. Autorize a solicitacao!" -ForegroundColor Yellow
& $git push -u origin main

Write-Host "Sucesso! Repositorio criado em: https://github.com/felipesoares-1/art-agente-relatorios" -ForegroundColor Green
Write-Host "Seu projeto esta no GitHub!" -ForegroundColor Green
