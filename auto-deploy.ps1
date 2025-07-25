# Auto-Deployment Script para iRacing Setup Assistant
# Este script automatiza la preparacion para deployment en Railway + Vercel

Write-Host "Iniciando Auto-Deployment Script..." -ForegroundColor Green
Write-Host "" 

# Verificar directorio actual
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Ejecuta este script desde la carpeta raiz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "Directorio verificado: $(Get-Location)" -ForegroundColor Cyan

# 1. Crear archivo .env para frontend (si no existe)
Write-Host "Configurando archivos de entorno..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    "REACT_APP_API_URL=https://tu-backend.railway.app" | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Creado .env para frontend" -ForegroundColor Green
} else {
    Write-Host ".env ya existe para frontend" -ForegroundColor Blue
}

# 2. Crear archivo .env para backend (si no existe)
if (-not (Test-Path "backend\.env")) {
    $backendEnvContent = @(
        "NODE_ENV=production",
        "PORT=3001",
        "JWT_SECRET=tu-secreto-super-seguro-minimo-32-caracteres-aqui",
        "FRONTEND_URL=https://tu-frontend.vercel.app",
        "DATABASE_URL=postgresql://usuario:password@host:5432/database"
    )
    $backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "Creado .env para backend" -ForegroundColor Green
} else {
    Write-Host ".env ya existe para backend" -ForegroundColor Blue
}

# 3. Crear railway.json optimizado
Write-Host "Configurando Railway..." -ForegroundColor Yellow

$railwayContent = @'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
'@

$railwayContent | Out-File -FilePath "backend\railway.json" -Encoding UTF8
Write-Host "Configuracion Railway actualizada" -ForegroundColor Green

# 4. Crear vercel.json optimizado
Write-Host "Configurando Vercel..." -ForegroundColor Yellow

$vercelContent = @'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
'@

$vercelContent | Out-File -FilePath "vercel.json" -Encoding UTF8
Write-Host "Configuracion Vercel actualizada" -ForegroundColor Green

# 5. Generar JWT Secret seguro
Write-Host "Generando JWT Secret seguro..." -ForegroundColor Yellow

$jwtSecret = -join ((1..64) | ForEach {Get-Random -input ([char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')})
Write-Host "JWT Secret generado: $jwtSecret" -ForegroundColor Cyan
Write-Host "Copia este valor para Railway" -ForegroundColor Yellow

# 6. Build de prueba
Write-Host "Ejecutando build de prueba..." -ForegroundColor Yellow

try {
    npm run build | Out-Null
    Write-Host "Build exitoso - Listo para deployment" -ForegroundColor Green
} catch {
    Write-Host "Error en build - Revisar errores" -ForegroundColor Red
}

# 7. Crear comandos de deployment
Write-Host "Creando comandos de deployment..." -ForegroundColor Yellow

$deployContent = @(
    "# COMANDOS DE DEPLOYMENT",
    "",
    "## RAILWAY (Backend)",
    "1. Ve a railway.app",
    "2. Nuevo servicio -> GitHub Repo",
    "3. Root Directory: backend",
    "4. Variables de entorno:",
    "   - NODE_ENV=production",
    "   - JWT_SECRET=$jwtSecret",
    "   - FRONTEND_URL=https://tu-frontend.vercel.app",
    "5. Anadir PostgreSQL database",
    "",
    "## VERCEL (Frontend)",
    "1. Ve a vercel.com",
    "2. Importar proyecto desde GitHub",
    "3. Framework: React",
    "4. Variables de entorno:",
    "   - REACT_APP_API_URL=https://tu-backend.railway.app",
    "",
    "## URLs FINALES",
    "- Frontend: https://tu-proyecto.vercel.app",
    "- Backend: https://tu-backend.railway.app",
    "- API Health: https://tu-backend.railway.app/health"
)

$deployContent | Out-File -FilePath "DEPLOYMENT_COMMANDS.txt" -Encoding UTF8
Write-Host "Comandos guardados en DEPLOYMENT_COMMANDS.txt" -ForegroundColor Green

# Resumen final
Write-Host "" 
Write-Host "AUTO-DEPLOYMENT COMPLETADO" -ForegroundColor Green
Write-Host "" 
Write-Host "Archivos creados/actualizados:" -ForegroundColor Cyan
Write-Host "  .env (frontend)" -ForegroundColor White
Write-Host "  backend\.env (backend)" -ForegroundColor White
Write-Host "  backend\railway.json" -ForegroundColor White
Write-Host "  vercel.json" -ForegroundColor White
Write-Host "  DEPLOYMENT_COMMANDS.txt" -ForegroundColor White
Write-Host "" 
Write-Host "JWT Secret: $jwtSecret" -ForegroundColor Yellow
Write-Host "" 
Write-Host "Siguiente paso: Leer DEPLOYMENT_COMMANDS.txt" -ForegroundColor Cyan
Write-Host "Tu aplicacion esta lista para deployment!" -ForegroundColor Green

Read-Host "Presiona Enter para continuar"