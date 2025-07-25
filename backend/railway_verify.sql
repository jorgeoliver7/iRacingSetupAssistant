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
