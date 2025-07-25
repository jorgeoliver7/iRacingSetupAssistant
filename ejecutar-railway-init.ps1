# Script para ejecutar railway_init.sql en Railway PostgreSQL

Write-Host "=== Ejecutando railway_init.sql en Railway PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend\railway_init.sql")) {
    Write-Host "Error: No se encuentra backend\railway_init.sql" -ForegroundColor Red
    Write-Host "Asegurate de ejecutar este script desde el directorio raiz del proyecto" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Archivo railway_init.sql encontrado" -ForegroundColor Green
Write-Host "Conectando a Railway PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el script SQL usando railway run
try {
    Write-Host "Ejecutando: railway run psql -f backend/railway_init.sql" -ForegroundColor Cyan
    $result = railway run psql -f backend/railway_init.sql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" 
        Write-Host "=== EXITO ===" -ForegroundColor Green
        Write-Host "El script railway_init.sql se ejecuto correctamente" -ForegroundColor Green
        Write-Host "La base de datos Railway PostgreSQL esta lista" -ForegroundColor Green
        Write-Host ""
        Write-Host "Resultado:" -ForegroundColor Cyan
        Write-Host $result
    } else {
        Write-Host "" 
        Write-Host "=== ERROR EN LA EJECUCION ===" -ForegroundColor Red
        Write-Host "Error ejecutando railway_init.sql:" -ForegroundColor Red
        Write-Host $result
        Write-Host ""
        Write-Host "=== SOLUCION ALTERNATIVA ===" -ForegroundColor Yellow
        Write-Host "Puedes conectarte manualmente con:" -ForegroundColor Yellow
        Write-Host "railway connect Postgres-w_J3" -ForegroundColor Cyan
        Write-Host "Y luego ejecutar: \i backend/railway_init.sql" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "" 
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host "Error ejecutando el comando railway:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "=== VERIFICACIONES ===" -ForegroundColor Yellow
    Write-Host "1. Verifica que Railway CLI este instalado: railway --version" -ForegroundColor Yellow
    Write-Host "2. Verifica que estes logueado: railway login" -ForegroundColor Yellow
    Write-Host "3. Verifica que el proyecto este vinculado: railway status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== VERIFICAR CONEXION ===" -ForegroundColor Cyan
Write-Host "Para verificar que la base de datos funciona, puedes ejecutar:" -ForegroundColor Yellow
Write-Host "railway run psql -f backend/railway_verify.sql" -ForegroundColor Cyan

Write-Host ""
Read-Host "Presiona Enter para continuar"