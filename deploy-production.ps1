# Script de Despliegue a Produccion - iRacing Setup Assistant
# Este script automatiza el proceso de despliegue

Write-Host "Iniciando despliegue a produccion..." -ForegroundColor Green

# Verificar que estamos en la rama correcta
$currentBranch = git branch --show-current
Write-Host "Rama actual: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "Advertencia: No estas en la rama main/master" -ForegroundColor Red
    $continue = Read-Host "Continuar de todos modos? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Despliegue cancelado" -ForegroundColor Red
        exit 1
    }
}

# Verificar que no hay cambios sin commitear
$status = git status --porcelain
if ($status) {
    Write-Host "Hay cambios sin commitear:" -ForegroundColor Yellow
    git status --short
    
    $commit = Read-Host "Hacer commit de estos cambios? (y/N)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $message = Read-Host "Mensaje del commit"
        if (-not $message) {
            $message = "Preparacion para despliegue - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        git add .
        git commit -m "$message"
        Write-Host "Cambios commiteados" -ForegroundColor Green
    } else {
        Write-Host "Despliegue cancelado - hay cambios sin commitear" -ForegroundColor Red
        exit 1
    }
}

# Push a GitHub
Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Cyan
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "Cambios subidos exitosamente a GitHub" -ForegroundColor Green
} else {
    Write-Host "Error al subir cambios a GitHub" -ForegroundColor Red
    exit 1
}

# Mostrar informacion de despliegue
Write-Host "`nInformacion de Despliegue:" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

Write-Host "Proximos pasos para completar el despliegue:"
Write-Host ""
Write-Host "1. BACKEND (Railway):" -ForegroundColor Yellow
Write-Host "   - Ve a https://railway.app"
Write-Host "   - Selecciona tu proyecto"
Write-Host "   - El despliegue deberia iniciarse automaticamente"
Write-Host "   - Verifica las variables de entorno:"
Write-Host "     DATABASE_URL (automatico)"
Write-Host "     JWT_SECRET (generar nuevo)"
Write-Host "     FRONTEND_URL (URL de Vercel)"
Write-Host "     NODE_ENV=production"
Write-Host ""
Write-Host "2. FRONTEND (Vercel):" -ForegroundColor Cyan
Write-Host "   - Ve a https://vercel.com"
Write-Host "   - Selecciona tu proyecto"
Write-Host "   - El despliegue deberia iniciarse automaticamente"
Write-Host "   - Verifica la variable de entorno:"
Write-Host "     REACT_APP_API_URL (URL de Railway)"
Write-Host ""
Write-Host "3. VERIFICACION:" -ForegroundColor Green
Write-Host "   - Health check: https://tu-backend.railway.app/health"
Write-Host "   - Frontend: https://tu-frontend.vercel.app"
Write-Host "   - Probar dropdowns de coches y circuitos"

Write-Host "`nURLs de ejemplo:" -ForegroundColor Blue
Write-Host "Frontend: https://iracing-setup.vercel.app"
Write-Host "Backend:  https://iracing-api.railway.app"
Write-Host "Health:   https://iracing-api.railway.app/health"

Write-Host "`nDespliegue preparado exitosamente!" -ForegroundColor Green
Write-Host "Los cambios estan en GitHub y listos para desplegar en produccion." -ForegroundColor Green