# Script para Configurar pgAdmin y Evitar Error IDNA
# Automatiza la configuracion de conexion a Railway PostgreSQL

Write-Host "=== CONFIGURADOR PGADMIN PARA RAILWAY ===" -ForegroundColor Green
Write-Host ""

# Datos de conexion Railway
$railwayConfig = @{
    Host = "roundhouse.proxy.rlwy.net"
    Port = "5432"
    Database = "railway"
    Username = "postgres"
    Password = "ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI"
}

Write-Host "Configuracion de Conexion Railway:" -ForegroundColor Cyan
Write-Host "Host: $($railwayConfig.Host)" -ForegroundColor White
Write-Host "Port: $($railwayConfig.Port)" -ForegroundColor White
Write-Host "Database: $($railwayConfig.Database)" -ForegroundColor White
Write-Host "Username: $($railwayConfig.Username)" -ForegroundColor White
Write-Host "Password: [OCULTA]" -ForegroundColor White
Write-Host ""

# Crear script SQL de prueba
$testScript = @'
-- Script de Prueba de Conexion
-- Ejecutar despues de conectar para verificar

-- 1. Verificar conexion
SELECT 'Conexion exitosa a Railway PostgreSQL' as status, NOW() as timestamp;

-- 2. Verificar version
SELECT version();

-- 3. Listar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. Si las tablas no existen, ejecutar railway_init.sql
-- \i backend/railway_init.sql

-- 5. Verificar datos despues de inicializacion
SELECT 'tracks' as tabla, COUNT(*) as registros FROM tracks
UNION ALL
SELECT 'cars' as tabla, COUNT(*) as registros FROM cars
UNION ALL
SELECT 'users' as tabla, COUNT(*) as registros FROM users;

SELECT 'Prueba completada exitosamente' as resultado;
'@

$testScript | Out-File -FilePath "test_railway_connection.sql" -Encoding UTF8
Write-Host "Script de prueba creado: test_railway_connection.sql" -ForegroundColor Green

Write-Host ""
Write-Host "=== INSTRUCCIONES PARA PGADMIN ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abrir pgAdmin 4" -ForegroundColor White
Write-Host "2. Clic derecho en Servers -> Register -> Server" -ForegroundColor White
Write-Host "3. En pestana General:" -ForegroundColor White
Write-Host "   - Name: Railway PostgreSQL" -ForegroundColor Gray
Write-Host "4. En pestana Connection:" -ForegroundColor White
Write-Host "   - Host: $($railwayConfig.Host)" -ForegroundColor Gray
Write-Host "   - Port: $($railwayConfig.Port)" -ForegroundColor Gray
Write-Host "   - Maintenance database: $($railwayConfig.Database)" -ForegroundColor Gray
Write-Host "   - Username: $($railwayConfig.Username)" -ForegroundColor Gray
Write-Host "   - Password: $($railwayConfig.Password)" -ForegroundColor Gray
Write-Host "5. Clic en Save" -ForegroundColor White
Write-Host "6. Ejecutar test_railway_connection.sql para verificar" -ForegroundColor White
Write-Host ""

Write-Host "=== SOLUCION AL ERROR IDNA ===" -ForegroundColor Red
Write-Host "Si obtienes el error idna codec cannot encode character:" -ForegroundColor White
Write-Host "1. NO uses la URL completa de Railway" -ForegroundColor White
Write-Host "2. USA los parametros individuales mostrados arriba" -ForegroundColor White
Write-Host "3. Asegurate de usar el host externo: $($railwayConfig.Host)" -ForegroundColor White
Write-Host ""
Write-Host "Configuracion completada. Buena suerte!" -ForegroundColor Green

# Preguntar si quiere abrir pgAdmin
$openPgAdmin = Read-Host "Quieres abrir pgAdmin ahora? (s/n)"
if ($openPgAdmin -eq "s" -or $openPgAdmin -eq "S") {
    try {
        Start-Process "pgAdmin4.exe"
        Write-Host "pgAdmin abierto. Sigue las instrucciones arriba." -ForegroundColor Green
    } catch {
        Write-Host "No se pudo abrir pgAdmin automaticamente. Abrelo manualmente." -ForegroundColor Yellow
    }
}

Write-Host "Presiona Enter para continuar..."
Read-Host