# Script de Diagnostico de Conexion Railway PostgreSQL
# Identifica y resuelve problemas de timeout y conexion

Write-Host "=== DIAGNOSTICO DE CONEXION RAILWAY POSTGRESQL ===" -ForegroundColor Green
Write-Host ""

# Configuracion Railway
$railwayHosts = @(
    "roundhouse.proxy.rlwy.net",
    "postgres-w_j3.railway.internal"
)
$port = 5432
$database = "railway"
$username = "postgres"
$password = "ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI"

Write-Host "1. VERIFICANDO CONECTIVIDAD DE RED..." -ForegroundColor Yellow
Write-Host ""

foreach ($host in $railwayHosts) {
    Write-Host "Probando conexion a: $host`:$port" -ForegroundColor Cyan
    
    try {
        $result = Test-NetConnection -ComputerName $host -Port $port -WarningAction SilentlyContinue
        
        if ($result.TcpTestSucceeded) {
            Write-Host "✅ EXITO: $host es accesible" -ForegroundColor Green
            $workingHost = $host
        } else {
            Write-Host "❌ FALLO: $host no es accesible" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ ERROR: No se pudo probar $host - $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "2. VERIFICANDO HERRAMIENTAS DISPONIBLES..." -ForegroundColor Yellow
Write-Host ""

# Verificar psql
$psqlAvailable = Get-Command "psql" -ErrorAction SilentlyContinue
if ($psqlAvailable) {
    Write-Host "✅ psql disponible" -ForegroundColor Green
    $psqlVersion = & psql --version
    Write-Host "   Version: $psqlVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ psql no disponible" -ForegroundColor Red
}

# Verificar pgAdmin
$pgAdminAvailable = Get-Command "pgAdmin4.exe" -ErrorAction SilentlyContinue
if ($pgAdminAvailable) {
    Write-Host "✅ pgAdmin disponible" -ForegroundColor Green
} else {
    Write-Host "❌ pgAdmin no disponible" -ForegroundColor Red
}

# Verificar Railway CLI
$railwayAvailable = Get-Command "railway" -ErrorAction SilentlyContinue
if ($railwayAvailable) {
    Write-Host "✅ Railway CLI disponible" -ForegroundColor Green
} else {
    Write-Host "❌ Railway CLI no disponible" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. PROBANDO CONEXION POSTGRESQL..." -ForegroundColor Yellow
Write-Host ""

if ($workingHost -and $psqlAvailable) {
    Write-Host "Probando conexion con psql a $workingHost..." -ForegroundColor Cyan
    
    $connectionString = "postgresql://$username`:$password@$workingHost`:$port/$database"
    
    try {
        # Probar conexion simple
        $testQuery = "SELECT 'Conexion exitosa' as status, version();"
        $result = & psql $connectionString -c $testQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ CONEXION EXITOSA con psql" -ForegroundColor Green
            Write-Host "   Host funcional: $workingHost" -ForegroundColor Gray
        } else {
            Write-Host "❌ FALLO DE CONEXION con psql" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ ERROR ejecutando psql: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No se puede probar conexion (falta psql o host accesible)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. GENERANDO CONFIGURACION RECOMENDADA..." -ForegroundColor Yellow
Write-Host ""

if ($workingHost) {
    Write-Host "=== CONFIGURACION PGADMIN RECOMENDADA ===" -ForegroundColor Green
    Write-Host "Host: $workingHost" -ForegroundColor White
    Write-Host "Port: $port" -ForegroundColor White
    Write-Host "Database: $database" -ForegroundColor White
    Write-Host "Username: $username" -ForegroundColor White
    Write-Host "Password: $password" -ForegroundColor White
    Write-Host "SSL Mode: Prefer" -ForegroundColor White
    Write-Host "Connection Timeout: 30 segundos" -ForegroundColor White
    
    # Crear archivo de configuracion
    $config = @"
Configuracion pgAdmin para Railway PostgreSQL
=============================================

Host: $workingHost
Port: $port
Database: $database
Username: $username
Password: $password
SSL Mode: Prefer
Connection Timeout: 30 segundos

URL de Conexion:
postgresql://$username`:$password@$workingHost`:$port/$database

Fecha de generacion: $(Get-Date)
"@
    
    $config | Out-File -FilePath "railway_connection_config.txt" -Encoding UTF8
    Write-Host ""
    Write-Host "✅ Configuracion guardada en: railway_connection_config.txt" -ForegroundColor Green
    
} else {
    Write-Host "❌ No se encontro host accesible" -ForegroundColor Red
    Write-Host ""
    Write-Host "=== SOLUCIONES RECOMENDADAS ===" -ForegroundColor Yellow
    Write-Host "1. Verificar que Railway PostgreSQL este activo" -ForegroundColor White
    Write-Host "2. Buscar URL externa en Railway Dashboard" -ForegroundColor White
    Write-Host "3. Verificar variables de entorno en Railway" -ForegroundColor White
    Write-Host "4. Usar Railway CLI: railway connect postgres" -ForegroundColor White
    Write-Host "5. Contactar soporte de Railway" -ForegroundColor White
}

Write-Host ""
Write-Host "5. VERIFICANDO ARCHIVOS SQL..." -ForegroundColor Yellow
Write-Host ""

$sqlFiles = @(
    "backend\railway_init.sql",
    "test_railway_connection.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== RESUMEN DEL DIAGNOSTICO ===" -ForegroundColor Cyan
Write-Host ""

if ($workingHost) {
    Write-Host "✅ DIAGNOSTICO EXITOSO" -ForegroundColor Green
    Write-Host "   - Host accesible: $workingHost" -ForegroundColor White
    Write-Host "   - Configuracion generada" -ForegroundColor White
    Write-Host "   - Listo para conectar con pgAdmin" -ForegroundColor White
    
    Write-Host ""
    Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "1. Abrir pgAdmin" -ForegroundColor White
    Write-Host "2. Crear nueva conexion con la configuracion generada" -ForegroundColor White
    Write-Host "3. Ejecutar railway_init.sql" -ForegroundColor White
    Write-Host "4. Verificar con test_railway_connection.sql" -ForegroundColor White
    
} else {
    Write-Host "❌ DIAGNOSTICO FALLO" -ForegroundColor Red
    Write-Host "   - Ningun host accesible" -ForegroundColor White
    Write-Host "   - Revisar configuracion Railway" -ForegroundColor White
    Write-Host "   - Considerar usar Railway CLI" -ForegroundColor White
}

Write-Host ""
Read-Host "Presiona Enter para continuar"