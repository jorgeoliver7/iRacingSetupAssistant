# Script para instalar PostgreSQL y conectar con Railway
# Ejecutar como administrador para mejor compatibilidad

Write-Host "=== Instalador de PostgreSQL para Railway ==="
Write-Host ""

# Verificar si psql ya esta instalado
function Test-PSQLInstalled {
    try {
        $version = psql --version 2>$null
        if ($version) {
            Write-Host "psql ya esta instalado: $version" -ForegroundColor Green
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Verificar si Chocolatey esta instalado
function Test-ChocolateyInstalled {
    try {
        $chocoVersion = choco --version 2>$null
        if ($chocoVersion) {
            Write-Host "Chocolatey detectado: $chocoVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Instalar PostgreSQL via Chocolatey
function Install-PostgreSQLChocolatey {
    Write-Host "Instalando PostgreSQL via Chocolatey..." -ForegroundColor Yellow
    try {
        choco install postgresql --yes
        Write-Host "PostgreSQL instalado via Chocolatey" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error instalando via Chocolatey" -ForegroundColor Red
        return $false
    }
}

# Agregar PostgreSQL al PATH
function Add-PostgreSQLToPath {
    Write-Host "Buscando instalacion de PostgreSQL..." -ForegroundColor Yellow
    
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin",
        "C:\Program Files (x86)\PostgreSQL\16\bin",
        "C:\Program Files (x86)\PostgreSQL\15\bin",
        "C:\ProgramData\chocolatey\lib\postgresql\tools\postgresql\bin"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path "$path\psql.exe") {
            Write-Host "PostgreSQL encontrado en: $path" -ForegroundColor Green
            
            # Agregar al PATH del usuario
            $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
            if ($currentPath -notlike "*$path*") {
                $newPath = "$currentPath;$path"
                [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
                Write-Host "Agregado al PATH del usuario" -ForegroundColor Green
            }
            
            # Agregar al PATH de la sesion actual
            $env:PATH += ";$path"
            Write-Host "Agregado al PATH de la sesion actual" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host "No se encontro instalacion de PostgreSQL" -ForegroundColor Red
    return $false
}

# Verificar conexion a Railway
function Test-RailwayConnection {
    Write-Host "Verificando conexion a Railway..." -ForegroundColor Yellow
    
    try {
        $railwayStatus = railway status 2>$null
        if ($railwayStatus) {
            Write-Host "Railway CLI funcionando" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "Railway CLI no disponible" -ForegroundColor Red
        return $false
    }
    return $false
}

# Funcion principal
function Main {
    Write-Host "Verificando estado actual..." -ForegroundColor Cyan
    
    # Verificar si psql ya esta instalado
    if (Test-PSQLInstalled) {
        Write-Host "psql ya esta disponible. Procediendo a conectar con Railway..." -ForegroundColor Green
    }
    else {
        Write-Host "psql no esta instalado. Procediendo con la instalacion..." -ForegroundColor Yellow
        
        # Intentar instalacion via Chocolatey si esta disponible
        if (Test-ChocolateyInstalled) {
            if (Install-PostgreSQLChocolatey) {
                Write-Host "Esperando que la instalacion se complete..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
        
        # Buscar y agregar PostgreSQL al PATH
        if (-not (Add-PostgreSQLToPath)) {
            Write-Host ""
            Write-Host "=== INSTALACION MANUAL REQUERIDA ===" -ForegroundColor Red
            Write-Host "No se pudo instalar PostgreSQL automaticamente."
            Write-Host "Por favor:"
            Write-Host "1. Descargar PostgreSQL desde: https://www.postgresql.org/download/windows/"
            Write-Host "2. Instalar incluyendo 'Command Line Tools'"
            Write-Host "3. Reiniciar PowerShell"
            Write-Host "4. Ejecutar este script nuevamente"
            Write-Host ""
            Read-Host "Presiona Enter para continuar"
            return
        }
    }
    
    Write-Host ""
    Write-Host "=== VERIFICACION FINAL ===" -ForegroundColor Cyan
    
    # Verificar psql nuevamente
    if (Test-PSQLInstalled) {
        Write-Host "psql esta disponible" -ForegroundColor Green
        
        # Verificar Railway
        if (Test-RailwayConnection) {
            Write-Host ""
            Write-Host "=== CONECTAR A RAILWAY ===" -ForegroundColor Green
            Write-Host "Ahora puedes ejecutar:"
            Write-Host "railway connect Postgres-w_J3" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Una vez conectado, ejecuta:"
            Write-Host "\i railway_init.sql" -ForegroundColor Yellow
            Write-Host ""
            
            $connect = Read-Host "¿Quieres conectar ahora? (s/n)"
            if ($connect -eq 's' -or $connect -eq 'S' -or $connect -eq 'y' -or $connect -eq 'Y') {
                Write-Host "Conectando a Railway..." -ForegroundColor Yellow
                railway connect Postgres-w_J3
            }
        }
        else {
            Write-Host "Railway CLI no esta disponible" -ForegroundColor Red
            Write-Host "Asegurate de tener Railway CLI instalado y configurado"
        }
    }
    else {
        Write-Host "psql aun no esta disponible" -ForegroundColor Red
        Write-Host "Es posible que necesites reiniciar PowerShell o instalar manualmente"
    }
}

# Ejecutar script principal
Main

Write-Host ""
Write-Host "Script completado. Si tienes problemas, consulta INSTALAR_PSQL_WINDOWS.md" -ForegroundColor Cyan
Read-Host "Presiona Enter para salir"