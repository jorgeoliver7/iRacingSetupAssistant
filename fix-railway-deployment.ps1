#!/usr/bin/env pwsh
# Script para arreglar el deployment de Railway
# Autor: iRacing Setup Assistant Team

Write-Host "=== ARREGLANDO RAILWAY DEPLOYMENT ==="
Write-Host "Este script configurara las variables de entorno y hara el deployment"
Write-Host ""

# Cambiar al directorio backend
Set-Location "backend"

Write-Host "Configurando variables de entorno en Railway..."

# Configurar variables de entorno una por una
try {
    Write-Host "Configurando NODE_ENV..."
    $env:NODE_ENV = "production"
    
    Write-Host "Configurando PORT..."
    $env:PORT = "3001"
    
    Write-Host "Configurando JWT_SECRET..."
    $env:JWT_SECRET = "iracing-setup-assistant-super-secret-jwt-key-2024-production"
    
    Write-Host "Configurando FRONTEND_URL..."
    $env:FRONTEND_URL = "https://i-racing-setup-assistant.vercel.app"
    
    Write-Host "Variables de entorno configuradas localmente"
} catch {
    Write-Host "Error configurando variables: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Verificando estado de Railway..."
railway status

Write-Host ""
Write-Host "Intentando deployment con configuracion completa..."

try {
    # Intentar deployment
    railway up --detach
    
    Write-Host "Deployment iniciado exitosamente"
    
    # Esperar un poco
    Start-Sleep -Seconds 10
    
    # Verificar dominio
    Write-Host "Obteniendo dominio..."
    $domain = railway domain
    Write-Host "Dominio: $domain"
    
    # Esperar que el servicio este listo
    Write-Host "Esperando que el servicio este listo..."
    Start-Sleep -Seconds 30
    
    # Verificar logs
    Write-Host "Verificando logs..."
    railway logs
    
} catch {
    Write-Host "Error en deployment: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== VERIFICACION FINAL ==="
Write-Host "1. Ve al dashboard de Railway para verificar el estado"
Write-Host "2. Configura manualmente las variables de entorno si es necesario:"
Write-Host "   - NODE_ENV=production"
Write-Host "   - PORT=3001"
Write-Host "   - JWT_SECRET=iracing-setup-assistant-super-secret-jwt-key-2024-production"
Write-Host "   - FRONTEND_URL=https://i-racing-setup-assistant.vercel.app"
Write-Host "   - DATABASE_URL=(se configura automaticamente con Postgres)"
Write-Host ""
Write-Host "3. Si el deployment falla, intenta:"
Write-Host "   railway up --detach"
Write-Host ""
Write-Host "Script completado!"