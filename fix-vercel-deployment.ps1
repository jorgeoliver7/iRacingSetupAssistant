# Script para solucionar el problema de dropdowns vacios en Vercel
# Basado en la investigacion de URLs de Railway

Write-Host "Solucionando problema de dropdowns vacios en Vercel..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar el estado del backend
Write-Host "PASO 1: Verificar Backend en Railway" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a railway.app y abre tu proyecto" -ForegroundColor White
Write-Host "2. Busca tu servicio de backend (Node.js/Express)" -ForegroundColor White
Write-Host "3. Haz clic en el servicio del backend" -ForegroundColor White
Write-Host "4. Ve a Settings > Networking" -ForegroundColor White
Write-Host "5. Si no hay dominio, haz clic en 'Generate Domain'" -ForegroundColor White
Write-Host "6. Copia la URL generada (ej: https://tu-proyecto.railway.app)" -ForegroundColor White
Write-Host ""

# Paso 2: Probar el backend
Write-Host "PASO 2: Probar Backend" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Abre estas URLs en tu navegador para verificar:" -ForegroundColor White
Write-Host "- https://tu-proyecto.railway.app/health" -ForegroundColor Cyan
Write-Host "  (Debe mostrar: OK o status: ok)" -ForegroundColor Gray
Write-Host ""
Write-Host "- https://tu-proyecto.railway.app/api/cars" -ForegroundColor Cyan
Write-Host "  (Debe mostrar: lista de coches en JSON)" -ForegroundColor Gray
Write-Host ""
Write-Host "- https://tu-proyecto.railway.app/api/tracks" -ForegroundColor Cyan
Write-Host "  (Debe mostrar: lista de circuitos en JSON)" -ForegroundColor Gray
Write-Host ""

# Paso 3: Configurar variables en Railway
Write-Host "PASO 3: Configurar Variables en Railway" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "En Railway, ve a tu backend > Variables y verifica:" -ForegroundColor White
Write-Host ""
Write-Host "Variables requeridas:" -ForegroundColor Cyan
Write-Host "- NODE_ENV=production" -ForegroundColor White
Write-Host "- PORT=3001" -ForegroundColor White
Write-Host "- JWT_SECRET=[tu-secret-seguro]" -ForegroundColor White
Write-Host "- FRONTEND_URL=https://tu-frontend.vercel.app" -ForegroundColor White
Write-Host "- DATABASE_URL=[se configura automaticamente con PostgreSQL]" -ForegroundColor White
Write-Host ""

# Paso 4: Configurar Vercel
Write-Host "PASO 4: Configurar Frontend en Vercel" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a vercel.com y abre tu proyecto" -ForegroundColor White
Write-Host "2. Ve a Settings > Environment Variables" -ForegroundColor White
Write-Host "3. Agrega/edita esta variable:" -ForegroundColor White
Write-Host ""
Write-Host "   Nombre: REACT_APP_API_URL" -ForegroundColor Cyan
Write-Host "   Valor:  https://tu-proyecto.railway.app" -ForegroundColor Cyan
Write-Host "   (Usar la URL exacta de Railway del Paso 1)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Guarda los cambios" -ForegroundColor White
Write-Host "5. Ve a Deployments y haz 'Redeploy'" -ForegroundColor White
Write-Host "   O simplemente: git push origin main" -ForegroundColor White
Write-Host ""

# Paso 5: Verificacion final
Write-Host "PASO 5: Verificacion Final" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Despues del redeploy:" -ForegroundColor White
Write-Host "1. Abre tu app en Vercel" -ForegroundColor White
Write-Host "2. Abre las herramientas de desarrollador (F12)" -ForegroundColor White
Write-Host "3. Ve a la pestana Network" -ForegroundColor White
Write-Host "4. Recarga la pagina" -ForegroundColor White
Write-Host "5. Busca requests a /api/cars y /api/tracks" -ForegroundColor White
Write-Host "6. Verifica que respondan con status 200" -ForegroundColor White
Write-Host ""

# Troubleshooting
Write-Host "TROUBLESHOOTING" -ForegroundColor Red
Write-Host "===============" -ForegroundColor Red
Write-Host ""
Write-Host "Si los dropdowns siguen vacios:" -ForegroundColor White
Write-Host ""
Write-Host "A) Error CORS:" -ForegroundColor Yellow
Write-Host "   - Verifica FRONTEND_URL en Railway" -ForegroundColor White
Write-Host "   - Debe ser exactamente la URL de Vercel" -ForegroundColor White
Write-Host ""
Write-Host "B) Backend no responde:" -ForegroundColor Yellow
Write-Host "   - Revisa logs en Railway > Deployments" -ForegroundColor White
Write-Host "   - Verifica que el build sea exitoso" -ForegroundColor White
Write-Host ""
Write-Host "C) Variables incorrectas:" -ForegroundColor Yellow
Write-Host "   - Verifica REACT_APP_API_URL en Vercel" -ForegroundColor White
Write-Host "   - Debe apuntar a Railway (sin barra final)" -ForegroundColor White
Write-Host ""
Write-Host "D) Base de datos vacia:" -ForegroundColor Yellow
Write-Host "   - Ejecuta los scripts de inicializacion" -ForegroundColor White
Write-Host "   - Verifica conexion a PostgreSQL" -ForegroundColor White
Write-Host ""

Write-Host "URLs de ejemplo:" -ForegroundColor Blue
Write-Host "Frontend: https://iracing-setup.vercel.app" -ForegroundColor Cyan
Write-Host "Backend:  https://iracing-backend.railway.app" -ForegroundColor Cyan
Write-Host "Health:   https://iracing-backend.railway.app/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiendo estos pasos, los dropdowns deberian funcionar!" -ForegroundColor Green