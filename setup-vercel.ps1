# Script para configurar el proyecto en Vercel
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Configurando iRacing Setup Assistant para Vercel..." -ForegroundColor Green

# Verificar si Vercel CLI está instalado
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
npm install

# Configurar variables de entorno en Vercel
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Blue
Write-Host "Por favor, configura las siguientes variables en tu dashboard de Vercel:" -ForegroundColor Yellow
Write-Host "1. DATABASE_URL - Tu URL de conexión a PostgreSQL" -ForegroundColor White
Write-Host "2. JWT_SECRET - Una clave secreta para JWT" -ForegroundColor White
Write-Host "3. NODE_ENV - production" -ForegroundColor White
Write-Host "4. FRONTEND_URL - La URL de tu aplicación en Vercel" -ForegroundColor White

# Hacer login en Vercel
Write-Host "🔐 Iniciando sesión en Vercel..." -ForegroundColor Blue
vercel login

# Desplegar el proyecto
Write-Host "🚀 Desplegando proyecto..." -ForegroundColor Green
vercel --prod

Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host "📝 Recuerda configurar las variables de entorno en el dashboard de Vercel" -ForegroundColor Yellow
Write-Host "🌐 Tu aplicación estará disponible en la URL proporcionada por Vercel" -ForegroundColor Cyan