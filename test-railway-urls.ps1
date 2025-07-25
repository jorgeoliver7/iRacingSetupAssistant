# Script para probar URLs de Railway y encontrar la correcta
# Este script prueba las URLs mas comunes de Railway

Write-Host "=== PROBANDO URLS DE RAILWAY ===" -ForegroundColor Yellow
Write-Host ""

# URLs comunes a probar
$urls = @(
    "https://iracing-api.railway.app",
    "https://iracing-backend.railway.app",
    "https://iracing-setup.railway.app",
    "https://iracing-assistant.railway.app",
    "https://iracing-setup-assistant.railway.app",
    "https://backend.railway.app",
    "https://api.railway.app"
)

Write-Host "Probando URLs de Railway..." -ForegroundColor Green
Write-Host ""

foreach ($url in $urls) {
    Write-Host "Probando: $url" -ForegroundColor Cyan
    
    try {
        # Probar endpoint de salud
        $healthUrl = "$url/health"
        $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  OK Health check (200)" -ForegroundColor Green
            
            # Probar endpoint de cars
            try {
                $carsUrl = "$url/api/cars"
                $carsResponse = Invoke-WebRequest -Uri $carsUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
                
                if ($carsResponse.StatusCode -eq 200) {
                    Write-Host "  OK API Cars (200)" -ForegroundColor Green
                    Write-Host "  *** ESTA URL FUNCIONA CORRECTAMENTE ***" -ForegroundColor Yellow
                    Write-Host "  *** USA ESTA URL EN VERCEL: $url ***" -ForegroundColor Yellow
                } else {
                    Write-Host "  X API Cars fallo" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "  X API Cars no responde" -ForegroundColor Red
            }
        } else {
            Write-Host "  X Health check fallo" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  X No responde o error de conexion" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== INSTRUCCIONES ===" -ForegroundColor Yellow
Write-Host "1. Busca la URL que muestra '*** ESTA URL FUNCIONA CORRECTAMENTE ***'"
Write-Host "2. Copia esa URL exacta"
Write-Host "3. Ve a vercel.com > tu proyecto > Settings > Environment Variables"
Write-Host "4. Configura REACT_APP_API_URL con esa URL"
Write-Host "5. Redespliega en Vercel"
Write-Host ""
Write-Host "Si ninguna URL funciona, verifica que tu backend este corriendo en Railway."
Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Yellow