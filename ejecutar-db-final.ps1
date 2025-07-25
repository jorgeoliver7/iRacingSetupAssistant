# Script final para inicializar Railway PostgreSQL
Write-Host "=== Ejecutando Inicialización Final de Railway PostgreSQL ===" -ForegroundColor Green

# Comandos SQL a ejecutar
$sqlCommands = @"
SELECT current_database();
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cars (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, category VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS tracks (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, location VARCHAR(100), length_km DECIMAL(5,3), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS setups (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), car_id INTEGER REFERENCES cars(id), track_id INTEGER REFERENCES tracks(id), name VARCHAR(100) NOT NULL, description TEXT, setup_data JSONB NOT NULL, is_public BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO cars (name, category) VALUES ('BMW M4 GT3', 'GT3'), ('Porsche 911 GT3 R', 'GT3'), ('Mercedes-AMG GT3', 'GT3') ON CONFLICT (name) DO NOTHING;
INSERT INTO tracks (name, location, length_km) VALUES ('Spa-Francorchamps', 'Belgium', 7.004), ('Nurburgring GP', 'Germany', 5.148), ('Silverstone GP', 'United Kingdom', 5.891) ON CONFLICT (name) DO NOTHING;
SELECT 'Tablas creadas exitosamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
"@

# Guardar en archivo temporal
$sqlCommands | Out-File -FilePath "final_init.sql" -Encoding UTF8

Write-Host "Archivo final_init.sql creado" -ForegroundColor Green
Write-Host "Comandos SQL preparados:" -ForegroundColor Yellow
Write-Host $sqlCommands -ForegroundColor White

Write-Host ""
Write-Host "INSTRUCCIONES FINALES:" -ForegroundColor Cyan
Write-Host "1. Estas conectado a Railway PostgreSQL (terminal 7)" -ForegroundColor Green
Write-Host "2. Ejecuta: \i final_init.sql" -ForegroundColor White
Write-Host "3. O copia y pega los comandos uno por uno" -ForegroundColor White

Write-Host ""
Write-Host "=== Listo para ejecutar ===" -ForegroundColor Green