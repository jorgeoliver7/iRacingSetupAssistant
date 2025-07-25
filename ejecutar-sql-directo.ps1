# Script para ejecutar SQL en Railway PostgreSQL
Write-Host "Ejecutando inicialización de base de datos en Railway..." -ForegroundColor Green

try {
    # Leer el contenido del archivo SQL
    $sqlContent = Get-Content -Path "temp_init.sql" -Raw
    
    # Crear un archivo temporal con el contenido SQL
    $tempFile = "temp_sql_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
    $sqlContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    Write-Host "Archivo temporal creado: $tempFile" -ForegroundColor Yellow
    
    # Intentar ejecutar con railway run
    Write-Host "Intentando ejecutar SQL con railway run..." -ForegroundColor Yellow
    $result = railway run -- psql -c "$sqlContent" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Base de datos inicializada exitosamente!" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "Error al ejecutar con railway run. Intentando método alternativo..." -ForegroundColor Yellow
        
        # Método alternativo: usar railway connect con input redirection
        Write-Host "Usando railway connect con redirección..." -ForegroundColor Yellow
        $sqlContent | railway connect Postgres-w_J3
    }
    
    # Limpiar archivo temporal
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
        Write-Host "Archivo temporal eliminado." -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Error durante la ejecución: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Por favor, conecte manualmente con: railway connect Postgres-w_J3" -ForegroundColor Yellow
    Write-Host "Y ejecute el contenido de temp_init.sql manualmente." -ForegroundColor Yellow
}

Write-Host "Script completado." -ForegroundColor Green