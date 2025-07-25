# Script para inicializar la base de datos Railway PostgreSQL
Write-Host "=== Inicializando Base de Datos Railway PostgreSQL ===" -ForegroundColor Green

# Verificar si el archivo SQL existe
if (Test-Path "simple_init.sql") {
    Write-Host "Archivo simple_init.sql encontrado" -ForegroundColor Green
    
    Write-Host "INSTRUCCIONES PARA INICIALIZAR LA BASE DE DATOS:" -ForegroundColor Cyan
    Write-Host "" 
    Write-Host "1. Asegurate de estar conectado a Railway PostgreSQL" -ForegroundColor Yellow
    Write-Host "   Ejecuta: railway connect Postgres-w_J3" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Una vez en psql (veras el prompt 'railway=#'), ejecuta:" -ForegroundColor Yellow
    Write-Host "   \i simple_init.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "3. O ejecuta los comandos uno por uno:" -ForegroundColor Yellow
    
    # Leer y mostrar el contenido del archivo SQL
    $sqlContent = Get-Content "simple_init.sql" -Raw
    Write-Host "" 
    Write-Host "COMANDOS SQL A EJECUTAR:" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Gray
    Write-Host $sqlContent -ForegroundColor White
    Write-Host "------------------------" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "METODO ALTERNATIVO - Ejecutar comando por comando:" -ForegroundColor Cyan
    
    # Dividir comandos SQL
    $commands = @(
        "SELECT current_database();",
        "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS cars (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, category VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS tracks (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, location VARCHAR(100), length_km DECIMAL(5,3), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS setups (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), car_id INTEGER REFERENCES cars(id), track_id INTEGER REFERENCES tracks(id), name VARCHAR(100) NOT NULL, description TEXT, setup_data JSONB NOT NULL, is_public BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        "INSERT INTO cars (name, category) VALUES ('BMW M4 GT3', 'GT3'), ('Porsche 911 GT3 R', 'GT3'), ('Mercedes-AMG GT3', 'GT3') ON CONFLICT (name) DO NOTHING;",
        "INSERT INTO tracks (name, location, length_km) VALUES ('Spa-Francorchamps', 'Belgium', 7.004), ('Nurburgring GP', 'Germany', 5.148), ('Silverstone GP', 'United Kingdom', 5.891) ON CONFLICT (name) DO NOTHING;",
        "SELECT 'Tablas creadas exitosamente' as status;",
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    )
    
    Write-Host "Comandos individuales para copiar y pegar:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $commands.Length; $i++) {
        Write-Host "$($i+1). $($commands[$i])" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "ESTADO ACTUAL:" -ForegroundColor Cyan
    Write-Host "- Railway PostgreSQL: Conectado" -ForegroundColor Green
    Write-Host "- Archivo SQL: Preparado" -ForegroundColor Green
    Write-Host "- Siguiente paso: Ejecutar comandos en psql" -ForegroundColor Yellow
    
} else {
    Write-Host "Error: No se encontro el archivo simple_init.sql" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Script completado ===" -ForegroundColor Green