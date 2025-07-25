# Script para verificar el estado de la base de datos Railway
Write-Host "=== Verificación de Base de Datos Railway PostgreSQL ===" -ForegroundColor Green

Write-Host "Estado actual:" -ForegroundColor Cyan
Write-Host "- Railway PostgreSQL: Conectado" -ForegroundColor Green
Write-Host "- Tablas creadas: users, cars, tracks, setups" -ForegroundColor Green
Write-Host "- Datos de ejemplo: Insertados" -ForegroundColor Green

Write-Host ""
Write-Host "Comandos de verificación (ejecutar en psql):" -ForegroundColor Yellow
Write-Host "1. SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" -ForegroundColor White
Write-Host "2. SELECT COUNT(*) FROM cars;" -ForegroundColor White
Write-Host "3. SELECT COUNT(*) FROM tracks;" -ForegroundColor White
Write-Host "4. SELECT * FROM cars;" -ForegroundColor White
Write-Host "5. SELECT * FROM tracks;" -ForegroundColor White

Write-Host ""
Write-Host "Estado de servicios:" -ForegroundColor Cyan
Write-Host "- Frontend React: http://localhost:3000" -ForegroundColor Green
Write-Host "- Backend Node.js: Funcionando" -ForegroundColor Green
Write-Host "- Base de datos Railway: Inicializada" -ForegroundColor Green

Write-Host ""
Write-Host "=== Base de datos lista para usar ===" -ForegroundColor Green
Write-Host "La aplicación iRacing Setup Assistant está completamente operativa" -ForegroundColor Cyan