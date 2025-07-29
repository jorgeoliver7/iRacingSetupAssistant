# Script para configurar base de datos y desplegar en Vercel
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Configurando base de datos y desplegando en Vercel..." -ForegroundColor Green

# Paso 1: Instrucciones para Supabase
Write-Host "`n📊 PASO 1: Configurar Base de Datos en Supabase" -ForegroundColor Cyan
Write-Host "1. Ve a https://supabase.com" -ForegroundColor White
Write-Host "2. Haz clic en 'Start your project'" -ForegroundColor White
Write-Host "3. Inicia sesión con GitHub" -ForegroundColor White
Write-Host "4. Crea un nuevo proyecto:" -ForegroundColor White
Write-Host "   - Nombre: iracing-setup-assistant" -ForegroundColor Yellow
Write-Host "   - Región: East US (más cercana)" -ForegroundColor Yellow
Write-Host "   - Password: (guarda esta contraseña)" -ForegroundColor Yellow
Write-Host "5. Espera a que se cree el proyecto (2-3 minutos)" -ForegroundColor White
Write-Host "6. Ve a Settings > Database" -ForegroundColor White
Write-Host "7. Copia la 'Connection string' (URI)" -ForegroundColor White

Write-Host "`n⏳ Presiona ENTER cuando hayas copiado la CONNECTION STRING de Supabase..." -ForegroundColor Yellow
$null = Read-Host

# Solicitar la cadena de conexión
Write-Host "`n🔗 Pega aquí tu CONNECTION STRING de Supabase:" -ForegroundColor Blue
$DATABASE_URL = Read-Host "DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "❌ Error: DATABASE_URL no puede estar vacío" -ForegroundColor Red
    exit 1
}

# Generar JWT Secret
$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
$JWT_SECRET = -join ((1..64) | ForEach { Get-Random -InputObject $chars.ToCharArray() })
Write-Host "🔐 JWT_SECRET generado automáticamente" -ForegroundColor Green

# Paso 2: Configurar variables de entorno en Vercel
Write-Host "`n⚙️ PASO 2: Configurando variables de entorno en Vercel..." -ForegroundColor Cyan

# Configurar DATABASE_URL
Write-Host "📊 Configurando DATABASE_URL..." -ForegroundColor Blue
vercel env add DATABASE_URL production --value="$DATABASE_URL"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error configurando DATABASE_URL" -ForegroundColor Yellow
}

# Configurar JWT_SECRET
Write-Host "🔐 Configurando JWT_SECRET..." -ForegroundColor Blue
vercel env add JWT_SECRET production --value="$JWT_SECRET"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ JWT_SECRET configurada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error configurando JWT_SECRET" -ForegroundColor Yellow
}

# Configurar NODE_ENV
Write-Host "🌍 Configurando NODE_ENV..." -ForegroundColor Blue
vercel env add NODE_ENV production --value="production"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ NODE_ENV configurada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error configurando NODE_ENV" -ForegroundColor Yellow
}

# Configurar FRONTEND_URL
Write-Host "🌐 Configurando FRONTEND_URL..." -ForegroundColor Blue
vercel env add FRONTEND_URL production --value="https://i-racing-setup-assistant.vercel.app"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FRONTEND_URL configurada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error configurando FRONTEND_URL" -ForegroundColor Yellow
}

# Paso 3: Crear esquema de base de datos
Write-Host "`n🏗️ PASO 3: Creando esquema de base de datos..." -ForegroundColor Cyan

# Crear archivo SQL temporal con el esquema
$schemaSQL = @'
-- Esquema de base de datos para iRacing Setup Assistant

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de coches
CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de circuitos
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    length DECIMAL(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de setups
CREATE TABLE IF NOT EXISTS setups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    setup_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setup_id)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setup_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_setups_user_id ON setups(user_id);
CREATE INDEX IF NOT EXISTS idx_setups_car_id ON setups(car_id);
CREATE INDEX IF NOT EXISTS idx_setups_track_id ON setups(track_id);
CREATE INDEX IF NOT EXISTS idx_setups_public ON setups(is_public);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_setup_id ON ratings(setup_id);

-- Datos iniciales de coches
INSERT INTO cars (name, category) VALUES 
('Formula Vee', 'Formula'),
('Mazda MX-5 Cup', 'Sports Car'),
('BMW M4 GT4', 'GT4'),
('Porsche 911 GT3 Cup', 'GT3'),
('Mercedes AMG GT3', 'GT3'),
('Formula 3.5', 'Formula'),
('Dallara DW12', 'IndyCar'),
('NASCAR Cup Series', 'NASCAR')
ON CONFLICT (name) DO NOTHING;

-- Datos iniciales de circuitos
INSERT INTO tracks (name, location, length) VALUES 
('Laguna Seca', 'California, USA', 3.602),
('Silverstone', 'England, UK', 5.891),
('Spa-Francorchamps', 'Belgium', 7.004),
('Nürburgring GP', 'Germany', 5.148),
('Road America', 'Wisconsin, USA', 6.515),
('Watkins Glen', 'New York, USA', 5.428),
('Brands Hatch', 'England, UK', 3.908),
('Suzuka', 'Japan', 5.807)
ON CONFLICT (name) DO NOTHING;
'@

# Guardar esquema en archivo temporal
$schemaSQL | Out-File -FilePath "temp_schema.sql" -Encoding UTF8
Write-Host "📝 Esquema SQL creado en temp_schema.sql" -ForegroundColor Blue
Write-Host "📋 Aplica este esquema manualmente en Supabase SQL Editor" -ForegroundColor Yellow

# Paso 4: Despliegue a producción
Write-Host "`n🚀 PASO 4: Desplegando a producción..." -ForegroundColor Cyan

Write-Host "📦 Iniciando despliegue..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡Despliegue exitoso!" -ForegroundColor Green
    Write-Host "`n🎉 ¡Tu aplicación está lista!" -ForegroundColor Green
    Write-Host "🌐 URL: https://i-racing-setup-assistant.vercel.app" -ForegroundColor Cyan
    Write-Host "🔧 API: https://i-racing-setup-assistant.vercel.app/api" -ForegroundColor Cyan
    Write-Host "❤️ Health: https://i-racing-setup-assistant.vercel.app/api/health" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
}

# Paso 5: Verificación
Write-Host "`n🧪 PASO 5: Verificando despliegue..." -ForegroundColor Cyan

Write-Host "📋 Checklist de verificación:" -ForegroundColor Blue
Write-Host "□ Frontend carga correctamente" -ForegroundColor White
Write-Host "□ API responde en /api/health" -ForegroundColor White
Write-Host "□ Registro de usuario funciona" -ForegroundColor White
Write-Host "□ Login funciona" -ForegroundColor White
Write-Host "□ Base de datos conecta" -ForegroundColor White

Write-Host "`n🔍 URLs para probar:" -ForegroundColor Blue
Write-Host "Frontend: https://i-racing-setup-assistant.vercel.app" -ForegroundColor Cyan
Write-Host "API Health: https://i-racing-setup-assistant.vercel.app/api/health" -ForegroundColor Cyan
Write-Host "API Auth: https://i-racing-setup-assistant.vercel.app/api/auth/register" -ForegroundColor Cyan

Write-Host "`n📊 Variables de entorno configuradas:" -ForegroundColor Blue
Write-Host "✅ DATABASE_URL" -ForegroundColor Green
Write-Host "✅ JWT_SECRET" -ForegroundColor Green
Write-Host "✅ NODE_ENV" -ForegroundColor Green
Write-Host "✅ FRONTEND_URL" -ForegroundColor Green

Write-Host "`n🎯 ¡Configuración completada!" -ForegroundColor Green
Write-Host "Si encuentras algún problema, revisa los logs en:" -ForegroundColor Yellow
Write-Host "https://vercel.com/jorgeacedos-projects/i-racing-setup-assistant" -ForegroundColor Cyan

Write-Host "`n📝 IMPORTANTE: Aplica el esquema SQL en Supabase:" -ForegroundColor Red
Write-Host "1. Ve a tu proyecto en Supabase" -ForegroundColor White
Write-Host "2. Abre SQL Editor" -ForegroundColor White
Write-Host "3. Copia y ejecuta el contenido de temp_schema.sql" -ForegroundColor White