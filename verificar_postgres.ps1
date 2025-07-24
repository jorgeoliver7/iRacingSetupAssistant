# Script para verificar la instalación de PostgreSQL

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Verificación de PostgreSQL para iRacing Setup Assistant" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PostgreSQL está instalado
$psqlExists = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)

if (-not $psqlExists) {
    Write-Host "PostgreSQL no parece estar instalado o no está en el PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, sigue uno de estos pasos:" -ForegroundColor Yellow
    Write-Host "1. Instala PostgreSQL siguiendo las instrucciones en INSTALACION_POSTGRESQL.md"
    Write-Host "2. Si ya tienes PostgreSQL instalado, agrégalo al PATH siguiendo AGREGAR_POSTGRESQL_AL_PATH.md"
    Write-Host ""
    
    $opcion = Read-Host "¿Qué archivo de instrucciones deseas abrir? (1/2/ambos)"
    
    switch ($opcion) {
        "1" { Invoke-Item "INSTALACION_POSTGRESQL.md" }
        "2" { Invoke-Item "AGREGAR_POSTGRESQL_AL_PATH.md" }
        default { 
            Invoke-Item "INSTALACION_POSTGRESQL.md"
            Invoke-Item "AGREGAR_POSTGRESQL_AL_PATH.md"
        }
    }
    
    exit 1
}

Write-Host "PostgreSQL encontrado en el sistema." -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes ejecutar el script de configuración de la base de datos:" -ForegroundColor Cyan
Write-Host "   .\configurar_base_datos.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")