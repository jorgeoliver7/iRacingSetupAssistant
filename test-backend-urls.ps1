# Script para probar las URLs del backend y verificar conectividad
# Ejecutar desde el directorio raiz del proyecto

Write-Host "Probando conectividad del backend..." -ForegroundColor Cyan
Write-Host ""

# URLs comunes de Railway para probar
$testUrls = @(
    "https://iracing-setup-assistant-production.up.railway.app",
    "https://iracing-api.railway.app", 
    "https://iracing-backend.railway.app",
    "https://iracing-setup.railway.app"
)

Write-Host "Probando URLs comunes de Railway:" -ForegroundColor Yellow
Write-Host ""

foreach ($url in $testUrls) {
    Write-Host "Probando: $url" -ForegroundColor White
    
    try {
        # Probar health check
        $healthUrl = "$url/health"
        Write-Host "  Health: $healthUrl" -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  Status: $($response.StatusCode) - OK" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Green
        
        # Probar API cars
        $carsUrl = "$url/api/cars"
        Write-Host "  Cars API: $carsUrl" -ForegroundColor Gray
        $carsResponse = Invoke-WebRequest -Uri $carsUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        $carsData = $carsResponse.Content | ConvertFrom-Json
        Write-Host "  Cars encontrados: $($carsData.Count) items" -ForegroundColor Green
        
        # Probar API tracks
        $tracksUrl = "$url/api/tracks"
        Write-Host "  Tracks API: $tracksUrl" -ForegroundColor Gray
        $tracksResponse = Invoke-WebRequest -Uri $tracksUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        $tracksData = $tracksResponse.Content | ConvertFrom-Json
        Write-Host "  Tracks encontrados: $($tracksData.Count) items" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "  BACKEND FUNCIONAL EN: $url" -ForegroundColor Green -BackgroundColor Black
        Write-Host "  Usar esta URL en Vercel: REACT_APP_API_URL=$url" -ForegroundColor Cyan
        Write-Host ""
        break
        
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "Instrucciones para configurar Vercel:" -ForegroundColor Yellow
Write-Host "1. Ir a vercel.com y abrir tu proyecto" -ForegroundColor White
Write-Host "2. Ir a Settings > Environment Variables" -ForegroundColor White
Write-Host "3. Agregar/editar: REACT_APP_API_URL" -ForegroundColor White
Write-Host "4. Valor: [URL del backend que funciono arriba]" -ForegroundColor White
Write-Host "5. Hacer redeploy: git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "Si ninguna URL funciona:" -ForegroundColor Red
Write-Host "- Verificar que el backend este desplegado en Railway" -ForegroundColor White
Write-Host "- Revisar logs de Railway para errores" -ForegroundColor White
Write-Host "- Verificar que el proyecto este en la rama main" -ForegroundColor White