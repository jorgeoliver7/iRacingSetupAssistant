# Script para ejecutar init_db.sql usando Railway CLI

Write-Host "=== Inicializando Base de Datos Railway PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo SQL existe
if (-not (Test-Path "init_db.sql")) {
    Write-Host "Error: No se encuentra init_db.sql" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Archivo init_db.sql encontrado" -ForegroundColor Green
Write-Host "Ejecutando inicializacion de base de datos..." -ForegroundColor Yellow
Write-Host ""

# Metodo 1: Usar railway run con psql
Write-Host "Metodo 1: Usando railway run psql" -ForegroundColor Cyan
try {
    $output1 = railway run psql -f init_db.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Exito con railway run psql" -ForegroundColor Green
        Write-Host $output1
        Write-Host ""
        Write-Host "=== BASE DE DATOS INICIALIZADA CORRECTAMENTE ===" -ForegroundColor Green
        Write-Host "La base de datos Railway PostgreSQL esta lista para usar" -ForegroundColor Green
        Read-Host "Presiona Enter para continuar"
        exit 0
    } else {
        Write-Host "Error con railway run psql: $output1" -ForegroundColor Red
    }
} catch {
    Write-Host "Error ejecutando railway run psql: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Metodo 2: Usando railway connect" -ForegroundColor Cyan
Write-Host "Conectando a Railway PostgreSQL..." -ForegroundColor Yellow

# Metodo 2: Usar railway connect y enviar comandos
try {
    # Leer el contenido del archivo SQL
    $sqlContent = Get-Content "init_db.sql" -Raw
    
    # Crear un archivo temporal con el contenido SQL
    $tempFile = "temp_init.sql"
    $sqlContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    Write-Host "Ejecutando comandos SQL..." -ForegroundColor Yellow
    
    # Ejecutar usando railway run psql con archivo temporal
    $output2 = railway run psql -f $tempFile 2>&1
    
    # Limpiar archivo temporal
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Exito con metodo alternativo" -ForegroundColor Green
        Write-Host $output2
        Write-Host ""
        Write-Host "=== BASE DE DATOS INICIALIZADA CORRECTAMENTE ===" -ForegroundColor Green
        Write-Host "La base de datos Railway PostgreSQL esta lista para usar" -ForegroundColor Green
    } else {
        Write-Host "Error con metodo alternativo: $output2" -ForegroundColor Red
        Write-Host ""
        Write-Host "=== SOLUCION MANUAL ===" -ForegroundColor Yellow
        Write-Host "Puedes ejecutar manualmente:" -ForegroundColor Yellow
        Write-Host "1. railway connect Postgres-w_J3" -ForegroundColor Cyan
        Write-Host "2. Dentro de psql, ejecutar: \i init_db.sql" -ForegroundColor Cyan
        Write-Host "3. O copiar y pegar el contenido de init_db.sql" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error en metodo alternativo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "=== INSTRUCCIONES MANUALES ===" -ForegroundColor Yellow
    Write-Host "Para inicializar manualmente la base de datos:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta: railway connect Postgres-w_J3" -ForegroundColor Cyan
    Write-Host "2. Una vez en psql, ejecuta: \i init_db.sql" -ForegroundColor Cyan
    Write-Host "3. Verifica con: SELECT * FROM cars LIMIT 5;" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Presiona Enter para continuar"