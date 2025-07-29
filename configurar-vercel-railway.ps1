#!/usr/bin/env pwsh
# Script para configurar Vercel con Railway URL
# Autor: iRacing Setup Assistant Team

Write-Host "=== CONFIGURACION VERCEL CON RAILWAY ==="
Write-Host "Este script configurara Vercel para usar Railway como backend"
Write-Host ""

# URL de Railway conocida
$RAILWAY_URL = "https://iracing-setup-assistant-production.up.railway.app"

Write-Host "Configurando variable de entorno en Vercel..."
Write-Host "URL de Railway: $RAILWAY_URL"
Write-Host ""

# Configurar variable de entorno en Vercel manualmente
Write-Host "PASOS PARA CONFIGURAR VERCEL:"
Write-Host "1. Ve al dashboard de Vercel: https://vercel.com/dashboard"
Write-Host "2. Selecciona tu proyecto"
Write-Host "3. Ve a Settings > Environment Variables"
Write-Host "4. Agrega una nueva variable:"
Write-Host "   Name: REACT_APP_API_URL"
Write-Host "   Value: $RAILWAY_URL"
Write-Host "   Environment: Production"
Write-Host "5. Guarda los cambios"
Write-Host "6. Redeploy tu aplicacion"
Write-Host ""

# Intentar redeploy automatico
Write-Host "Intentando redeploy automatico..."
try {
    vercel --prod
    Write-Host "Redeploy exitoso"
} catch {
    Write-Host "Error en redeploy automatico"
    Write-Host "Por favor ejecuta manualmente: vercel --prod"
}

Write-Host ""
Write-Host "=== VERIFICACION ==="
Write-Host "1. Verifica que Railway este funcionando:"
Write-Host "   $RAILWAY_URL/api/cars"
Write-Host ""
Write-Host "2. Verifica tu aplicacion Vercel"
Write-Host ""
Write-Host "3. Revisa las Network calls en DevTools"
Write-Host ""
Write-Host "=== COMANDOS UTILES ==="
Write-Host "Ver variables de Vercel: vercel env ls"
Write-Host "Logs de Vercel: vercel logs"
Write-Host "Dashboard Vercel: vercel open"
Write-Host "Dashboard Railway: railway open"
Write-Host ""
Write-Host "Configuracion completada!"