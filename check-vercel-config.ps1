# Script para verificar y corregir la configuracion de Vercel
# Problema: Los dropdowns no funcionan en la app desplegada

Write-Host "=== DIAGNOSTICO DE CONFIGURACION VERCEL ===" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar configuracion local
Write-Host "1. CONFIGURACION LOCAL:" -ForegroundColor Green
Write-Host "   - Frontend local: http://localhost:3000"
Write-Host "   - Backend local: http://localhost:3001"
Write-Host ""

# 2. URLs de la aplicacion desplegada
Write-Host "2. APLICACION DESPLEGADA:" -ForegroundColor Green
Write-Host "   - Frontend Vercel: https://i-racing-setup-assistant-qocs4k10l-jorgeacedos-projects.vercel.app/"
Write-Host "   - Backend Railway: [NECESITA VERIFICACION]"
Write-Host ""

# 3. Pasos para solucionar
Write-Host "3. PASOS PARA SOLUCIONAR:" -ForegroundColor Red
Write-Host ""
Write-Host "PASO A: Encontrar la URL correcta del backend en Railway"
Write-Host "   1. Ve a railway.app y abre tu proyecto"
Write-Host "   2. Ve a Settings - Networking"
Write-Host "   3. Si no hay dominio, haz clic en Generate Domain"
Write-Host "   4. Copia la URL generada (ej: https://tu-proyecto.railway.app)"
Write-Host ""

Write-Host "PASO B: Probar el backend manualmente"
Write-Host "   Abre estas URLs en tu navegador:"
Write-Host "   - https://tu-proyecto.railway.app/health"
Write-Host "   - https://tu-proyecto.railway.app/api/cars"
Write-Host "   - https://tu-proyecto.railway.app/api/tracks"
Write-Host "   (Todas deben responder con JSON)"
Write-Host ""

Write-Host "PASO C: Configurar variable en Vercel" -ForegroundColor Cyan
Write-Host "   1. Ve a vercel.com, tu proyecto, Settings, Environment Variables"
Write-Host "   2. Busca REACT_APP_API_URL"
Write-Host "   3. Si existe, EDITALA. Si no existe, CREALA:"
Write-Host "      Nombre: REACT_APP_API_URL"
Write-Host "      Valor:  https://tu-proyecto.railway.app"
Write-Host "      Entornos: Production, Preview, Development"
Write-Host "   4. Guarda los cambios"
Write-Host ""

Write-Host "PASO D: Redesplegar en Vercel" -ForegroundColor Magenta
Write-Host "   IMPORTANTE: Despues de cambiar variables de entorno:"
Write-Host "   1. Ve a Deployments en Vercel"
Write-Host "   2. Haz clic en los 3 puntos del ultimo deployment"
Write-Host "   3. Selecciona Redeploy"
Write-Host "   O simplemente: git push origin main"
Write-Host ""

Write-Host "PASO E: Verificar funcionamiento"
Write-Host "   1. Abre la app en Vercel"
Write-Host "   2. Presiona F12 (herramientas de desarrollador)"
Write-Host "   3. Ve a la pestana Network"
Write-Host "   4. Recarga la pagina"
Write-Host "   5. Busca requests a /api/cars y /api/tracks"
Write-Host "   6. Verifica que respondan con status 200"
Write-Host ""

# 4. URLs comunes de Railway para probar
Write-Host "4. URLs COMUNES DE RAILWAY PARA PROBAR:" -ForegroundColor Yellow
Write-Host "   - https://iracing-api.railway.app"
Write-Host "   - https://iracing-backend.railway.app"
Write-Host "   - https://iracing-setup.railway.app"
Write-Host "   - https://iracing-assistant.railway.app"
Write-Host ""

# 5. Problemas comunes
Write-Host "5. PROBLEMAS COMUNES:" -ForegroundColor Red
Write-Host "   X Variable REACT_APP_API_URL no configurada en Vercel"
Write-Host "   X Variable apunta a localhost en lugar de Railway"
Write-Host "   X No se redesplego despues de cambiar variables"
Write-Host "   X CORS mal configurado en Railway"
Write-Host "   X Backend de Railway no responde"
Write-Host ""

Write-Host "6. VERIFICACION FINAL:" -ForegroundColor Green
Write-Host "   Si todo esta correcto, los dropdowns deberian:"
Write-Host "   OK Cargar opciones de coches"
Write-Host "   OK Cargar opciones de circuitos"
Write-Host "   OK Mostrar datos en las herramientas de desarrollador"
Write-Host ""

Write-Host "=== FIN DEL DIAGNOSTICO ===" -ForegroundColor Yellow
Write-Host "Ejecuta este script y sigue los pasos para solucionar el problema."