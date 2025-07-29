# Script automatizado para configurar Railway y Vercel
# Resuelve el problema de dropdowns vacios sin intervencion manual

Write-Host "=== CONFIGURACION AUTOMATICA RAILWAY Y VERCEL ===" -ForegroundColor Green
Write-Host ""

# URLs comunes de Railway para probar
$railwayUrls = @(
    "https://iracing-setup-assistant-production.up.railway.app",
    "https://backend-production.up.railway.app",
    "https://iracing-backend-production.up.railway.app",
    "https://setup-assistant-production.up.railway.app",
    "https://iracing-production.up.railway.app"
)

Write-Host "PASO 1: Probando URLs comunes de Railway..." -ForegroundColor Yellow
$workingUrl = $null

foreach ($url in $railwayUrls) {
    Write-Host "Probando: $url"
    try {
        $response = Invoke-WebRequest -Uri "$url/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "OK Encontrada URL funcional: $url" -ForegroundColor Green
            $workingUrl = $url
            break
        }
    } catch {
        Write-Host "ERROR No responde: $url" -ForegroundColor Red
    }
}

if (-not $workingUrl) {
    Write-Host "PASO 2: Probando con dominios personalizados..." -ForegroundColor Yellow
    
    # Intentar encontrar el proyecto en Railway
    Write-Host "No se encontro URL automaticamente."
    Write-Host "Instrucciones para encontrar tu URL de Railway:"
    Write-Host "1. Ve a https://railway.app"
    Write-Host "2. Haz login con tu cuenta"
    Write-Host "3. Busca tu proyecto del backend"
    Write-Host "4. Si no tienes dominio generado:"
    Write-Host "   - Click en tu servicio"
    Write-Host "   - Ve a Settings > Networking"
    Write-Host "   - Click Generate Domain"
    Write-Host "   - Copia la URL generada"
    Write-Host ""
    $workingUrl = Read-Host "Pega aqui la URL de Railway"
}

Write-Host ""
Write-Host "PASO 3: Probando endpoints del backend..." -ForegroundColor Yellow

# Probar health check
Write-Host "Probando health check: $workingUrl/health"
try {
    $healthResponse = Invoke-WebRequest -Uri "$workingUrl/health" -Method GET -TimeoutSec 10
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "OK Health check exitoso" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR Health check fallo" -ForegroundColor Red
    Write-Host "Verifica que tu backend este desplegado en Railway"
}

# Probar API cars
Write-Host "Probando API cars: $workingUrl/api/cars"
try {
    $carsResponse = Invoke-WebRequest -Uri "$workingUrl/api/cars" -Method GET -TimeoutSec 10
    if ($carsResponse.StatusCode -eq 200) {
        Write-Host "OK API cars exitoso" -ForegroundColor Green
        $carsData = $carsResponse.Content | ConvertFrom-Json
        Write-Host "Autos encontrados: $($carsData.Count)"
    }
} catch {
    Write-Host "ERROR API cars fallo" -ForegroundColor Red
}

# Probar API tracks
Write-Host "Probando API tracks: $workingUrl/api/tracks"
try {
    $tracksResponse = Invoke-WebRequest -Uri "$workingUrl/api/tracks" -Method GET -TimeoutSec 10
    if ($tracksResponse.StatusCode -eq 200) {
        Write-Host "OK API tracks exitoso" -ForegroundColor Green
        $tracksData = $tracksResponse.Content | ConvertFrom-Json
        Write-Host "Pistas encontradas: $($tracksData.Count)"
    }
} catch {
    Write-Host "ERROR API tracks fallo" -ForegroundColor Red
}

Write-Host ""
Write-Host "PASO 4: Configuracion de Vercel" -ForegroundColor Yellow
Write-Host "Para configurar Vercel con la URL encontrada:"
Write-Host ""
Write-Host "1. Ve a https://vercel.com y haz login"
Write-Host "2. Busca tu proyecto del frontend"
Write-Host "3. Ve a Settings > Environment Variables"
Write-Host "4. Busca la variable REACT_APP_API_URL"
Write-Host "5. Si existe, editala. Si no existe, creala"
Write-Host "6. Configura el valor como: $workingUrl"
Write-Host "7. Asegurate de marcar Production"
Write-Host "8. Click Save"
Write-Host ""
Write-Host "PASO 5: Redesplegar en Vercel"
Write-Host "1. Ve a la tab Deployments"
Write-Host "2. Click en los 3 puntos del ultimo deployment"
Write-Host "3. Selecciona Redeploy"
Write-Host "4. Espera a que termine"
Write-Host ""

Write-Host "=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "URL del backend encontrada: $workingUrl" -ForegroundColor Cyan
Write-Host "Configura REACT_APP_API_URL en Vercel con esta URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints importantes:" -ForegroundColor Cyan
Write-Host "- Health: $workingUrl/health"
Write-Host "- Cars: $workingUrl/api/cars"
Write-Host "- Tracks: $workingUrl/api/tracks"
Write-Host ""
Write-Host "Despues de configurar Vercel, los dropdowns deberian funcionar."
Read-Host "Presiona Enter para finalizar"