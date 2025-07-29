# Script para probar la configuración de Vercel localmente
# Ejecutar desde la raíz del proyecto

Write-Host "🧪 Probando configuración de Vercel..." -ForegroundColor Green

# Verificar archivos necesarios
Write-Host "📁 Verificando archivos..." -ForegroundColor Blue

$requiredFiles = @(
    "vercel.json",
    "package.json",
    "api/index.js",
    "api/package.json",
    "api/routes/auth.js",
    "api/routes/setups.js",
    "api/routes/favorites.js",
    "api/routes/ratings.js",
    "api/routes/comparisons.js",
    "api/routes/generator.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
        Write-Host "❌ Falta: $file" -ForegroundColor Red
    } else {
        Write-Host "✅ Encontrado: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Faltan archivos necesarios. Abortando." -ForegroundColor Red
    exit 1
}

# Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Blue
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️ node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar estructura de package.json
Write-Host "📋 Verificando package.json..." -ForegroundColor Blue
$packageJson = Get-Content "package.json" | ConvertFrom-Json

$requiredDeps = @("express", "cors", "pg", "dotenv", "bcryptjs", "jsonwebtoken")
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    if (!$packageJson.dependencies.$dep) {
        $missingDeps += $dep
        Write-Host "❌ Dependencia faltante: $dep" -ForegroundColor Red
    } else {
        Write-Host "✅ Dependencia encontrada: $dep" -ForegroundColor Green
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "❌ Faltan dependencias necesarias." -ForegroundColor Red
    Write-Host "Ejecuta: npm install $($missingDeps -join ' ')" -ForegroundColor Yellow
}

# Verificar vercel.json
Write-Host "⚙️ Verificando vercel.json..." -ForegroundColor Blue
$vercelJson = Get-Content "vercel.json" | ConvertFrom-Json

if ($vercelJson.builds) {
    Write-Host "✅ Configuración de builds encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Configuración de builds faltante" -ForegroundColor Red
}

if ($vercelJson.routes) {
    Write-Host "✅ Configuración de routes encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Configuración de routes faltante" -ForegroundColor Red
}

# Verificar variables de entorno
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Blue
Write-Host "⚠️ Recuerda configurar en Vercel:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor White
Write-Host "   - FRONTEND_URL" -ForegroundColor White

# Test de build
Write-Host "🏗️ Probando build del frontend..." -ForegroundColor Blue
try {
    npm run build
    if (Test-Path "build") {
        Write-Host "✅ Build exitoso" -ForegroundColor Green
        # Limpiar build de prueba
        Remove-Item "build" -Recurse -Force
    } else {
        Write-Host "❌ Build falló" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en build: $($_.Exception.Message)" -ForegroundColor Red
}

# Resumen
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
if ($missingFiles.Count -eq 0 -and $missingDeps.Count -eq 0) {
    Write-Host "✅ ¡Configuración lista para Vercel!" -ForegroundColor Green
    Write-Host "`n🚀 Próximos pasos:" -ForegroundColor Blue
    Write-Host "1. vercel login" -ForegroundColor White
    Write-Host "2. Configurar variables de entorno en Vercel Dashboard" -ForegroundColor White
    Write-Host "3. vercel --prod" -ForegroundColor White
} else {
    Write-Host "❌ Hay problemas que resolver antes del despliegue" -ForegroundColor Red
    if ($missingFiles.Count -gt 0) {
        Write-Host "   - Archivos faltantes: $($missingFiles -join ', ')" -ForegroundColor Yellow
    }
    if ($missingDeps.Count -gt 0) {
        Write-Host "   - Dependencias faltantes: $($missingDeps -join ', ')" -ForegroundColor Yellow
    }
}

Write-Host "`n📖 Para más información, consulta VERCEL_MIGRATION.md" -ForegroundColor Cyan