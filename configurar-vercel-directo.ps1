# Script directo para configurar Vercel con la URL de Railway encontrada
# URL detectada: https://iracing-setup-assistant-production.up.railway.app

$railwayUrl = "https://iracing-setup-assistant-production.up.railway.app"

Write-Host "=== CONFIGURACION DIRECTA VERCEL ===" -ForegroundColor Green
Write-Host "URL de Railway detectada: $railwayUrl" -ForegroundColor Cyan
Write-Host ""

Write-Host "Probando la URL de Railway..." -ForegroundColor Yellow

# Probar health check
Write-Host "Probando health check: $railwayUrl/health"
try {
    $healthResponse = Invoke-WebRequest -Uri "$railwayUrl/health" -Method GET -TimeoutSec 10
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "OK Health check exitoso" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR Health check fallo: $($_.Exception.Message)" -ForegroundColor Red
}

# Probar API cars
Write-Host "Probando API cars: $railwayUrl/api/cars"
try {
    $carsResponse = Invoke-WebRequest -Uri "$railwayUrl/api/cars" -Method GET -TimeoutSec 10
    if ($carsResponse.StatusCode -eq 200) {
        Write-Host "OK API cars exitoso" -ForegroundColor Green
        $carsData = $carsResponse.Content | ConvertFrom-Json
        Write-Host "Autos encontrados: $($carsData.Count)"
    }
} catch {
    Write-Host "ERROR API cars fallo: $($_.Exception.Message)" -ForegroundColor Red
}

# Probar API tracks
Write-Host "Probando API tracks: $railwayUrl/api/tracks"
try {
    $tracksResponse = Invoke-WebRequest -Uri "$railwayUrl/api/tracks" -Method GET -TimeoutSec 10
    if ($tracksResponse.StatusCode -eq 200) {
        Write-Host "OK API tracks exitoso" -ForegroundColor Green
        $tracksData = $tracksResponse.Content | ConvertFrom-Json
        Write-Host "Pistas encontradas: $($tracksData.Count)"
    }
} catch {
    Write-Host "ERROR API tracks fallo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== INSTRUCCIONES PARA VERCEL ===" -ForegroundColor Green
Write-Host ""
Write-Host "COPIA ESTA URL:" -ForegroundColor Yellow
Write-Host "$railwayUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "PASOS EN VERCEL:" -ForegroundColor Yellow
Write-Host "1. Ve a https://vercel.com"
Write-Host "2. Haz login con tu cuenta"
Write-Host "3. Busca tu proyecto 'i-racing-setup-assistant'"
Write-Host "4. Click en el proyecto"
Write-Host "5. Ve a Settings (en la barra superior)"
Write-Host "6. Click en Environment Variables (menu izquierdo)"
Write-Host "7. Busca REACT_APP_API_URL o crea nueva variable"
Write-Host "8. Configura:"
Write-Host "   - Name: REACT_APP_API_URL"
Write-Host "   - Value: $railwayUrl"
Write-Host "   - Environments: Production (marcado)"
Write-Host "9. Click Save"
Write-Host "10. Ve a Deployments"
Write-Host "11. Click en los 3 puntos del ultimo deployment"
Write-Host "12. Click Redeploy"
Write-Host "13. Espera a que termine el deployment"
Write-Host ""
Write-Host "=== VERIFICACION ===" -ForegroundColor Green
Write-Host "Despues del redeploy:"
Write-Host "1. Abre tu app: https://i-racing-setup-assistant-qocs4k10l-jorgeacedos-projects.vercel.app/"
Write-Host "2. Abre DevTools (F12)"
Write-Host "3. Ve a Network tab"
Write-Host "4. Recarga la pagina"
Write-Host "5. Verifica llamadas a $railwayUrl/api/cars"
Write-Host "6. Los dropdowns deberian mostrar opciones"
Write-Host ""
Write-Host "URL DE RAILWAY PARA VERCEL:" -ForegroundColor Cyan
Write-Host "$railwayUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Read-Host "Presiona Enter cuando hayas configurado Vercel"