# Script para configurar Railway paso a paso
# Resuelve el problema de dropdowns vacios en Vercel

Write-Host "=== CONFIGURACION RAILWAY PASO A PASO ===" -ForegroundColor Green
Write-Host ""

# Paso 1: Verificar Railway
Write-Host "PASO 1: Verificar tu proyecto en Railway" -ForegroundColor Yellow
Write-Host "1. Ve a https://railway.app y haz login"
Write-Host "2. Busca tu proyecto del backend"
Write-Host "3. Si no tienes proyecto, crea uno nuevo:"
Write-Host "   - Click New Project"
Write-Host "   - Selecciona Deploy from GitHub repo"
Write-Host "   - Conecta tu repositorio del backend"
Write-Host ""
Read-Host "Presiona Enter cuando hayas verificado tu proyecto en Railway"

# Paso 2: Configurar variables de entorno
Write-Host "PASO 2: Configurar variables de entorno en Railway" -ForegroundColor Yellow
Write-Host "1. En tu proyecto Railway, ve a Settings > Variables"
Write-Host "2. Agrega estas variables (si no existen):"
Write-Host "   - NODE_ENV = production"
Write-Host "   - FRONTEND_URL = https://tu-app.vercel.app"
Write-Host "   - JWT_SECRET = un-valor-secreto-seguro"
Write-Host "3. NO configures PORT manualmente (Railway lo maneja automaticamente)"
Write-Host "4. Si usas PostgreSQL de Railway, DATABASE_URL se configura automaticamente"
Write-Host ""
Read-Host "Presiona Enter cuando hayas configurado las variables"

# Paso 3: Generar dominio
Write-Host "PASO 3: Generar dominio publico" -ForegroundColor Yellow
Write-Host "1. En tu servicio Railway, ve a Settings > Networking"
Write-Host "2. En la seccion Public Networking, click Generate Domain"
Write-Host "3. Railway generara automaticamente una URL como:"
Write-Host "   https://tu-proyecto-production.up.railway.app"
Write-Host "4. NO necesitas especificar puerto - Railway lo detecta automaticamente"
Write-Host "5. Copia esta URL generada"
Write-Host ""
$railwayUrl = Read-Host "Pega aqui la URL de Railway generada"

# Paso 4: Probar backend
Write-Host "PASO 4: Probar el backend en Railway" -ForegroundColor Yellow
Write-Host "Probando endpoints del backend..."
Write-Host ""

# Probar health check
Write-Host "Probando health check: $railwayUrl/health"
try {
    $healthResponse = Invoke-WebRequest -Uri "$railwayUrl/health" -Method GET -TimeoutSec 10
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "OK Health check OK" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR Health check fallo" -ForegroundColor Red
}

# Probar API cars
Write-Host "Probando API cars: $railwayUrl/api/cars"
try {
    $carsResponse = Invoke-WebRequest -Uri "$railwayUrl/api/cars" -Method GET -TimeoutSec 10
    if ($carsResponse.StatusCode -eq 200) {
        Write-Host "OK API cars OK" -ForegroundColor Green
        $carsData = $carsResponse.Content | ConvertFrom-Json
        Write-Host "Numero de autos encontrados: $($carsData.Count)"
    }
} catch {
    Write-Host "ERROR API cars fallo" -ForegroundColor Red
}

# Probar API tracks
Write-Host "Probando API tracks: $railwayUrl/api/tracks"
try {
    $tracksResponse = Invoke-WebRequest -Uri "$railwayUrl/api/tracks" -Method GET -TimeoutSec 10
    if ($tracksResponse.StatusCode -eq 200) {
        Write-Host "OK API tracks OK" -ForegroundColor Green
        $tracksData = $tracksResponse.Content | ConvertFrom-Json
        Write-Host "Numero de pistas encontradas: $($tracksData.Count)"
    }
} catch {
    Write-Host "ERROR API tracks fallo" -ForegroundColor Red
}

Write-Host ""
Read-Host "Presiona Enter para continuar con la configuracion de Vercel"

# Paso 5: Configurar Vercel
Write-Host "PASO 5: Configurar Vercel" -ForegroundColor Yellow
Write-Host "1. Ve a https://vercel.com y haz login"
Write-Host "2. Busca tu proyecto del frontend"
Write-Host "3. Ve a Settings > Environment Variables"
Write-Host "4. Agrega o actualiza esta variable:"
Write-Host "   Variable: REACT_APP_API_URL"
Write-Host "   Value: $railwayUrl"
Write-Host "5. Asegurate de que este marcada para Production"
Write-Host "6. Click Save"
Write-Host ""
Read-Host "Presiona Enter cuando hayas configurado REACT_APP_API_URL en Vercel"

# Paso 6: Redesplegar
Write-Host "PASO 6: Redesplegar en Vercel" -ForegroundColor Yellow
Write-Host "1. En tu proyecto Vercel, ve a la tab Deployments"
Write-Host "2. Click en los 3 puntos del ultimo deployment"
Write-Host "3. Selecciona Redeploy"
Write-Host "4. Espera a que termine el deployment"
Write-Host ""
Read-Host "Presiona Enter cuando el redeploy haya terminado"

# Paso 7: Verificar
Write-Host "PASO 7: Verificar funcionamiento" -ForegroundColor Yellow
Write-Host "1. Abre tu app en Vercel"
Write-Host "2. Abre las herramientas de desarrollador (F12)"
Write-Host "3. Ve a la tab Network"
Write-Host "4. Recarga la pagina"
Write-Host "5. Verifica que las llamadas a $railwayUrl/api/cars y /api/tracks sean exitosas"
Write-Host "6. Los dropdowns deberian mostrar opciones ahora"
Write-Host ""

Write-Host "=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "Si los dropdowns siguen vacios, ejecuta:" -ForegroundColor Cyan
Write-Host "- .\diagnose-vercel-issue.ps1 (diagnostico completo)"
Write-Host "- .\check-vercel-config.ps1 (guia detallada)"
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "- Railway Backend: $railwayUrl"
Write-Host "- Health Check: $railwayUrl/health"
Write-Host "- API Cars: $railwayUrl/api/cars"
Write-Host "- API Tracks: $railwayUrl/api/tracks"
Write-Host ""
Read-Host "Presiona Enter para finalizar"