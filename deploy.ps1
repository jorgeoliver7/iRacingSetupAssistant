# Script de Deployment para iRacing Setup Assistant
# Ejecutar desde el directorio raíz del proyecto

Write-Host "🚀 Iniciando deployment de iRacing Setup Assistant..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecutar desde el directorio raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar variables de entorno
Write-Host "📋 Verificando configuración..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado. Por favor, configura las variables antes de continuar." -ForegroundColor Green
        Write-Host "📝 Edita el archivo .env con tus URLs de producción" -ForegroundColor Cyan
        exit 0
    }
}

if (!(Test-Path "backend\.env")) {
    Write-Host "⚠️  Archivo backend\.env no encontrado. Creando desde backend\.env.example..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ Archivo backend\.env creado. Por favor, configura las variables antes de continuar." -ForegroundColor Green
        Write-Host "📝 Edita el archivo backend\.env con tu configuración de producción" -ForegroundColor Cyan
        exit 0
    }
}

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
    exit 1
}

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Build del frontend
Write-Host "🔨 Construyendo aplicación para producción..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build de producción" -ForegroundColor Red
    exit 1
}

# Verificar que el build se creó correctamente
if (!(Test-Path "build\index.html")) {
    Write-Host "❌ Error: Build no se generó correctamente" -ForegroundColor Red
    exit 1
}

# Mostrar información del build
$buildSize = (Get-ChildItem "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Tamaño del build: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan

Write-Host "✅ ¡Build completado exitosamente!" -ForegroundColor Green
Write-Host "" 
Write-Host "📋 Próximos pasos para deployment:" -ForegroundColor Cyan
Write-Host "" 
Write-Host "1. 🌐 Frontend (Vercel):" -ForegroundColor Yellow
Write-Host "   - Conecta tu repositorio en vercel.com" -ForegroundColor White
Write-Host "   - Framework: React" -ForegroundColor White
Write-Host "   - Build Command: npm run build" -ForegroundColor White
Write-Host "   - Output Directory: build" -ForegroundColor White
Write-Host "   - Environment Variable: REACT_APP_API_URL" -ForegroundColor White
Write-Host "" 
Write-Host "2. 🗄️  Backend (Railway):" -ForegroundColor Yellow
Write-Host "   - Crea proyecto en railway.app" -ForegroundColor White
Write-Host "   - Root Directory: backend" -ForegroundColor White
Write-Host "   - Añade PostgreSQL database" -ForegroundColor White
Write-Host "   - Configura variables de entorno" -ForegroundColor White
Write-Host "" 
Write-Host "3. 📚 Consulta DEPLOYMENT.md para instrucciones detalladas" -ForegroundColor Yellow
Write-Host "" 
Write-Host "🎉 ¡Tu aplicación está lista para producción!" -ForegroundColor Green