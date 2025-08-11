# Script para configurar la base de datos de Supabase
# Ejecutar después de crear el proyecto en Supabase

Write-Host "=== Configuración de Base de Datos iRacing Setup Assistant ===" -ForegroundColor Green
Write-Host ""

# Solicitar la URL de conexión de Supabase
Write-Host "Por favor, sigue estos pasos en Supabase:" -ForegroundColor Yellow
Write-Host "1. Ve a Settings > Database en tu proyecto de Supabase"
Write-Host "2. Copia la 'URI' de Connection string"
Write-Host "3. Reemplaza [YOUR-PASSWORD] con tu contraseña de base de datos"
Write-Host ""

$databaseUrl = Read-Host "Pega aquí tu DATABASE_URL completa"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "Error: DATABASE_URL no puede estar vacía" -ForegroundColor Red
    exit 1
}

# Validar formato básico de la URL
if (-not $databaseUrl.StartsWith("postgresql://")) {
    Write-Host "Error: La URL debe comenzar con 'postgresql://'" -ForegroundColor Red
    exit 1
}

Write-Host "Configurando variable de entorno en Vercel..." -ForegroundColor Blue

# Configurar la variable de entorno en Vercel
try {
    # Crear un archivo temporal con la URL
    $tempFile = [System.IO.Path]::GetTempFileName()
    $databaseUrl | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
    
    # Usar el archivo temporal para evitar problemas con caracteres especiales
    $process = Start-Process -FilePath "npx" -ArgumentList "vercel", "env", "add", "DATABASE_URL", "production" -NoNewWindow -Wait -PassThru -RedirectStandardInput $tempFile
    
    Remove-Item $tempFile -Force
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✓ Variable DATABASE_URL configurada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al configurar la variable de entorno" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Desplegando aplicación..." -ForegroundColor Blue

# Redesplegar la aplicación
try {
    $deployProcess = Start-Process -FilePath "npx" -ArgumentList "vercel", "--prod", "--yes" -NoNewWindow -Wait -PassThru
    
    if ($deployProcess.ExitCode -eq 0) {
        Write-Host "✓ Aplicación desplegada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al desplegar la aplicación" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Configuración Completada ===" -ForegroundColor Green
Write-Host "Tu aplicación ahora debería funcionar correctamente con la base de datos." -ForegroundColor Green
Write-Host "Verifica que los dropdowns de coches y circuitos muestren datos." -ForegroundColor Yellow