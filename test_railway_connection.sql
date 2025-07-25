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
