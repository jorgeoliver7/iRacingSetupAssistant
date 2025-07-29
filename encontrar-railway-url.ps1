# Script para encontrar la URL correcta de Railway
# El backend parece no estar desplegado correctamente

Write-Host "=== DIAGNOSTICO RAILWAY ===" -ForegroundColor Red
Write-Host "PROBLEMA: La URL https://iracing-setup-assistant-production.up.railway.app devuelve 404" -ForegroundColor Red
Write-Host "Esto significa que el backend no esta desplegado correctamente en Railway" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== SOLUCION PASO A PASO ===" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 1: Verificar Railway" -ForegroundColor Yellow
Write-Host "1. Ve a https://railway.app"
Write-Host "2. Haz login con tu cuenta"
Write-Host "3. Busca tu proyecto del backend"
Write-Host "4. Verifica que el proyecto este desplegado (debe mostrar 'Deployed')"
Write-Host ""

Write-Host "PASO 2: Si NO tienes proyecto en Railway" -ForegroundColor Yellow
Write-Host "1. Click 'New Project'"
Write-Host "2. Selecciona 'Deploy from GitHub repo'"
Write-Host "3. Conecta tu repositorio: https://github.com/jorgeacedo/iRacingSetupAssistant"
Write-Host "4. Selecciona la carpeta 'backend' como root directory"
Write-Host "5. Espera a que se despliegue"
Write-Host ""

Write-Host "PASO 3: Configurar variables de entorno" -ForegroundColor Yellow
Write-Host "En tu proyecto Railway, ve a Variables y agrega:"
Write-Host "- NODE_ENV = production"
Write-Host "- FRONTEND_URL = https://i-racing-setup-assistant-qocs4k10l-jorgeacedos-projects.vercel.app"
Write-Host "- JWT_SECRET = tu-secreto-seguro"
Write-Host "- DATABASE_URL = (se configura automaticamente si usas PostgreSQL de Railway)"
Write-Host ""

Write-Host "PASO 4: Agregar base de datos" -ForegroundColor Yellow
Write-Host "1. En tu proyecto Railway, click 'New'"
Write-Host "2. Selecciona 'Database'"
Write-Host "3. Selecciona 'PostgreSQL'"
Write-Host "4. Espera a que se cree"
Write-Host ""

Write-Host "PASO 5: Generar dominio" -ForegroundColor Yellow
Write-Host "1. Click en tu servicio backend"
Write-Host "2. Ve a Settings > Networking"
Write-Host "3. Click 'Generate Domain'"
Write-Host "4. Copia la URL generada"
Write-Host ""

Write-Host "PASO 6: Probar URLs alternativas" -ForegroundColor Yellow
Write-Host "Si ya tienes Railway configurado, prueba estas URLs:"

$alternativeUrls = @(
    "https://web-production-XXXX.up.railway.app",
    "https://backend-production-XXXX.up.railway.app",
    "https://iracing-backend-production-XXXX.up.railway.app"
)

foreach ($url in $alternativeUrls) {
    Write-Host "- $url" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "PASO 7: Verificar logs" -ForegroundColor Yellow
Write-Host "En Railway:"
Write-Host "1. Click en tu servicio"
Write-Host "2. Ve a la tab 'Deployments'"
Write-Host "3. Click en el ultimo deployment"
Write-Host "4. Revisa los logs para errores"
Write-Host ""

Write-Host "=== COMANDOS PARA VERIFICAR ===" -ForegroundColor Green
Write-Host "Una vez que tengas la URL correcta de Railway, ejecuta:"
Write-Host ""
Write-Host "# Probar health check"
Write-Host "Invoke-WebRequest -Uri 'TU-URL-RAILWAY/health' -Method GET" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Probar API"
Write-Host "Invoke-WebRequest -Uri 'TU-URL-RAILWAY/api/cars' -Method GET" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== SIGUIENTE PASO ===" -ForegroundColor Green
Write-Host "Cuando tengas Railway funcionando:"
Write-Host "1. Copia la URL de Railway"
Write-Host "2. Ve a Vercel > Settings > Environment Variables"
Write-Host "3. Configura REACT_APP_API_URL con tu URL de Railway"
Write-Host "4. Redeploy en Vercel"
Write-Host ""

$userUrl = Read-Host "Si ya tienes la URL de Railway, pegala aqui (o presiona Enter para salir)"

if ($userUrl -and $userUrl.Trim() -ne "") {
    Write-Host ""
    Write-Host "Probando URL proporcionada: $userUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$userUrl/health" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "OK URL funciona correctamente" -ForegroundColor Green
            Write-Host "Configura esta URL en Vercel: $userUrl" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "ERROR URL no funciona: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Verifica que el backend este desplegado en Railway" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Green
Write-Host "El problema principal es que el backend no esta correctamente desplegado en Railway."
Write-Host "Sigue los pasos anteriores para configurar Railway correctamente."
Read-Host "Presiona Enter para finalizar"