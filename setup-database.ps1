# Script de Configuracion Automatica de Base de Datos
# Prepara todos los comandos SQL necesarios para Railway PostgreSQL

Write-Host "Configurando Base de Datos para Railway..." -ForegroundColor Green
Write-Host "" 

# Verificar archivos SQL
if (-not (Test-Path "backend\enhanced_database_schema.sql")) {
    Write-Host "Error: No se encuentra enhanced_database_schema.sql" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend\setup_database.sql")) {
    Write-Host "Error: No se encuentra setup_database.sql" -ForegroundColor Red
    exit 1
}

Write-Host "Archivos SQL encontrados" -ForegroundColor Green

# Crear script de inicializacion completo
Write-Host "Creando script de inicializacion..." -ForegroundColor Yellow

$initScript = @'
-- Script de Inicializacion Completa para Railway PostgreSQL
-- Ejecutar en orden despues de crear la base de datos

-- 1. Verificar conexion
SELECT version();

-- 2. Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Ejecutar esquema principal
'@

# Leer y agregar enhanced_database_schema.sql
$schemaContent = Get-Content "backend\enhanced_database_schema.sql" -Raw
$initScript += "`n-- === ENHANCED DATABASE SCHEMA ===`n"
$initScript += $schemaContent

# Leer y agregar setup_database.sql
$setupContent = Get-Content "backend\setup_database.sql" -Raw
$initScript += "`n`n-- === SETUP DATABASE ===`n"
$initScript += $setupContent

# Agregar datos de prueba
$initScript += @'

-- === DATOS DE PRUEBA ===
-- Insertar algunos datos basicos para verificar funcionamiento

INSERT INTO tracks (name, config, category) VALUES 
('Watkins Glen International', 'Boot', 'Road'),
('Charlotte Motor Speedway', 'Oval', 'Oval'),
('Spa-Francorchamps', 'Grand Prix', 'Road')
ON CONFLICT (name, config) DO NOTHING;

INSERT INTO cars (name, category, class) VALUES 
('BMW M4 GT3', 'GT3', 'GT3'),
('Porsche 911 GT3 Cup', 'GT3 Cup', 'GT3 Cup'),
('Formula Vee', 'Formula', 'Formula Vee')
ON CONFLICT (name) DO NOTHING;

-- Verificar insercion
SELECT 'Tracks insertados:' as info, COUNT(*) as count FROM tracks;
SELECT 'Cars insertados:' as info, COUNT(*) as count FROM cars;
SELECT 'Usuarios registrados:' as info, COUNT(*) as count FROM users;

-- Verificar estructura de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Base de datos inicializada correctamente' as status;
'@

# Guardar script completo
$initScript | Out-File -FilePath "backend\railway_init.sql" -Encoding UTF8
Write-Host "Script de inicializacion creado: backend\railway_init.sql" -ForegroundColor Green

# Crear comandos para Railway
$railwayCommands = @'
# COMANDOS PARA CONFIGURAR POSTGRESQL EN RAILWAY

## 1. CREAR BASE DE DATOS
1. En Railway, anadir servicio PostgreSQL
2. Railway generara automaticamente DATABASE_URL
3. Copiar la URL de conexion

## 2. CONECTAR A LA BASE DE DATOS
# Opcion A: Desde Railway Dashboard
1. Ve a tu servicio PostgreSQL
2. Pestana "Data"
3. Usar el Query Editor

# Opcion B: Desde terminal local
psql "postgresql://usuario:password@host:5432/database"

## 3. EJECUTAR SCRIPT DE INICIALIZACION
# Copiar y pegar el contenido de railway_init.sql
# O ejecutar desde archivo:
\i railway_init.sql

## 4. VERIFICAR INSTALACION
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) FROM tracks;
SELECT COUNT(*) FROM cars;

## 5. CONFIGURAR VARIABLES DE ENTORNO
# En tu servicio backend de Railway:
DATABASE_URL=postgresql://usuario:password@host:5432/database
NODE_ENV=production
JWT_SECRET=tu-secreto-generado
FRONTEND_URL=https://tu-frontend.vercel.app

## 6. HEALTH CHECK
# Verificar que el backend se conecte:
GET https://tu-backend.railway.app/health

## TROUBLESHOOTING
# Si hay errores de conexion:
1. Verificar DATABASE_URL
2. Comprobar que PostgreSQL este activo
3. Revisar logs del servicio backend
4. Verificar que las tablas existan
'@

$railwayCommands | Out-File -FilePath "RAILWAY_DATABASE_SETUP.txt" -Encoding UTF8
Write-Host "Comandos guardados en RAILWAY_DATABASE_SETUP.txt" -ForegroundColor Green

# Crear script de verificacion
$verifyScript = @'
-- Script de Verificacion de Base de Datos
-- Ejecutar despues de la inicializacion para verificar que todo funciona

-- Verificar conexion
SELECT 'Conexion exitosa' as status, NOW() as timestamp;

-- Verificar tablas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar datos
SELECT 'tracks' as table_name, COUNT(*) as records FROM tracks
UNION ALL
SELECT 'cars' as table_name, COUNT(*) as records FROM cars
UNION ALL
SELECT 'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'setups' as table_name, COUNT(*) as records FROM setups;

-- Verificar indices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

SELECT 'Verificacion completada' as final_status;
'@

$verifyScript | Out-File -FilePath "backend\railway_verify.sql" -Encoding UTF8
Write-Host "Script de verificacion creado: backend\railway_verify.sql" -ForegroundColor Green

# Resumen
Write-Host "" 
Write-Host "CONFIGURACION DE BASE DE DATOS COMPLETADA" -ForegroundColor Green
Write-Host "" 
Write-Host "Archivos creados:" -ForegroundColor Cyan
Write-Host "  backend\railway_init.sql (Script completo de inicializacion)" -ForegroundColor White
Write-Host "  backend\railway_verify.sql (Script de verificacion)" -ForegroundColor White
Write-Host "  RAILWAY_DATABASE_SETUP.txt (Comandos paso a paso)" -ForegroundColor White
Write-Host "" 
Write-Host "Siguiente paso:" -ForegroundColor Cyan
Write-Host "  1. Crear PostgreSQL en Railway" -ForegroundColor White
Write-Host "  2. Ejecutar railway_init.sql" -ForegroundColor White
Write-Host "  3. Ejecutar railway_verify.sql" -ForegroundColor White
Write-Host "" 
Write-Host "Base de datos lista para produccion!" -ForegroundColor Green

Read-Host "Presiona Enter para continuar"