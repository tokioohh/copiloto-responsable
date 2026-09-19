#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  📊 COPILOTO RESPONSABLE - Estado del Proyecto      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Sprint status
echo "🎯 PROGRESO:"
echo "   Sprint 1: ████████████████████ 100% ✅"
echo "   Sprint 2: ░░░░░░░░░░░░░░░░░░░░   0% 🚧 SIGUIENTE"
echo "   Total:    █████░░░░░░░░░░░░░░░  16%"
echo ""

# TypeScript check
echo "🔍 VERIFICACIONES:"
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "   ✅ TypeScript compila sin errores"
else
    echo "   ❌ TypeScript tiene errores"
fi

# Firebase check
if [ -f ".env.local" ]; then
    if grep -q "your-api-key-here" .env.local; then
        echo "   ⚠️  Firebase NO configurado (usando placeholders)"
    else
        echo "   ✅ Firebase configurado"
    fi
else
    echo "   ❌ Archivo .env.local no encontrado"
fi

# Node modules
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencias instaladas"
else
    echo "   ❌ Dependencias NO instaladas (ejecuta: npm install)"
fi

echo ""
echo "📝 DOCUMENTACIÓN DISPONIBLE:"
echo "   • START_HERE.md - Punto de entrada"
echo "   • AGENTS.md - Arquitectura completa"
echo "   • HANDOFF.md - Guía de handoff"
echo "   • PROJECT_CHECKLIST.md - Progreso detallado"
echo ""

echo "⚡ COMANDOS RÁPIDOS:"
echo "   npm start         - Ejecutar app"
echo "   npm run todos     - Ver TODOs pendientes"
echo "   npm run clear     - Limpiar cache"
echo ""

# TODO count
TODO_COUNT=$(grep -r "TODO Sprint" src/ 2>/dev/null | wc -l)
echo "🚧 TODOs PENDIENTES: $TODO_COUNT (en src/)"
echo ""

echo "📂 Ubicación: $PWD"
echo ""
