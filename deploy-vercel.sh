#!/bin/bash

# Script de Deploy Automático no Vercel
# Este script ajuda a configurar o projeto para o Vercel

echo "🚀 Iniciando setup do Vercel..."
echo ""

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI instalado!"
echo ""
echo "🔑 Faça login no Vercel..."
vercel login

echo ""
echo "🎯 Importando projeto..."
vercel

echo ""
echo "✅ Deploy iniciado! Verifique em https://vercel.com"
