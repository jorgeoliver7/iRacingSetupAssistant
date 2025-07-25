# Script para diagnosticar problemas de dropdowns vacios en Vercel
# Ejecutar desde el directorio raiz del proyecto

Write-Host "Diagnosticando problema de dropdowns vacios en Vercel..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar variables de entorno locales
Write-Host "1. Verificando configuracion local:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   Archivo .env encontrado" -ForegroundColor Green
    $envContent = Get-Content ".env" | Where-Object { $_ -match "REACT_APP_API_URL" }
    if ($envContent) {
        Write-Host "   Variable local: $envContent" -ForegroundColor White
    } else {
        Write-Host "   REACT_APP_API_URL no encontrada en .env local" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Archivo .env no encontrado" -ForegroundColor Yellow
}

# 2. Mostrar configuracion esperada para Vercel
Write-Host ""
Write-Host "2. Configuracion requerida en Vercel:" -ForegroundColor Yellow
Write-Host "   Variable de entorno en Vercel:" -ForegroundColor White
Write-Host "   REACT_APP_API_URL=https://tu-backend.railway.app" -ForegroundColor Cyan
Write-Host ""

# 3. URLs de prueba
Write-Host "3. URLs para probar manualmente:" -ForegroundColor Yellow
Write-Host "   Frontend en Vercel: https://tu-frontend.vercel.app" -ForegroundColor White
Write-Host "   Backend en Railway: https://tu-backend.railway.app" -ForegroundColor White
Write-Host "   Health Check: https://tu-backend.railway.app/health" -ForegroundColor White
Write-Host "   API Cars: https://tu-backend.railway.app/api/cars" -ForegroundColor White
Write-Host "   API Tracks: https://tu-backend.railway.app/api/tracks" -ForegroundColor White
Write-Host ""

# 4. Pasos de diagnostico
Write-Host "4. Pasos de diagnostico:" -ForegroundColor Yellow
Write-Host "   a) Verificar que el backend este funcionando:" -ForegroundColor White
Write-Host "      - Abrir: https://tu-backend.railway.app/health" -ForegroundColor Cyan
Write-Host "      - Debe mostrar: status: ok" -ForegroundColor Gray
Write-Host ""
Write-Host "   b) Verificar APIs del backend:" -ForegroundColor White
Write-Host "      - Abrir: https://tu-backend.railway.app/api/cars" -ForegroundColor Cyan
Write-Host "      - Debe mostrar lista de coches" -ForegroundColor Gray
Write-Host ""
Write-Host "   c) Verificar CORS en logs de Railway:" -ForegroundColor White
Write-Host "      - Ir a Railway dashboard y revisar Logs" -ForegroundColor Cyan
Write-Host "      - Buscar mensajes de CORS o errores 403/404" -ForegroundColor Gray
Write-Host ""
Write-Host "   d) Verificar variables de entorno en Vercel:" -ForegroundColor White
Write-Host "      - Ir a Vercel dashboard y revisar Environment Variables" -ForegroundColor Cyan
Write-Host "      - Verificar que REACT_APP_API_URL este configurada" -ForegroundColor Gray
Write-Host ""

# 5. Soluciones comunes
Write-Host "5. Soluciones comunes:" -ForegroundColor Yellow
Write-Host "   Problema: Variables de entorno incorrectas" -ForegroundColor Red
Write-Host "   Solucion: Verificar REACT_APP_API_URL en Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "   Problema: CORS bloqueando requests" -ForegroundColor Red
Write-Host "   Solucion: Verificar FRONTEND_URL en Railway" -ForegroundColor Green
Write-Host ""
Write-Host "   Problema: Backend no responde" -ForegroundColor Red
Write-Host "   Solucion: Verificar deployment en Railway" -ForegroundColor Green
Write-Host ""

# 6. Comandos utiles
Write-Host "6. Comandos para redeploy:" -ForegroundColor Yellow
Write-Host "   Frontend (Vercel): git push origin main" -ForegroundColor Cyan
Write-Host "   Backend (Railway): Se redespliega automaticamente con git push" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checklist de verificacion:" -ForegroundColor Blue
Write-Host "   - Backend health check responde OK" -ForegroundColor White
Write-Host "   - APIs /api/cars y /api/tracks devuelven datos" -ForegroundColor White
Write-Host "   - REACT_APP_API_URL configurada en Vercel" -ForegroundColor White
Write-Host "   - FRONTEND_URL configurada en Railway" -ForegroundColor White
Write-Host "   - No hay errores CORS en logs de Railway" -ForegroundColor White
Write-Host ""
Write-Host "Si todos los puntos estan OK, los dropdowns deberian funcionar" -ForegroundColor Green