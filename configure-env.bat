@echo off
echo === Configuracion de Base de Datos iRacing Setup Assistant ===
echo.
echo Sigue estos pasos:
echo 1. Crea tu proyecto en Supabase (https://supabase.com/dashboard)
echo 2. Ve a Settings ^> Database
echo 3. Copia la URI de Connection string
echo 4. Reemplaza [YOUR-PASSWORD] con tu contrasena
echo 5. Ejecuta: npx vercel env add DATABASE_URL
echo 6. Pega tu URL cuando te lo pida
echo 7. Ejecuta: npx vercel --prod --yes
echo.
echo Presiona cualquier tecla para abrir Supabase...
pause >nul
start https://supabase.com/dashboard
echo.
echo Cuando tengas tu DATABASE_URL, ejecuta estos comandos:
echo npx vercel env add DATABASE_URL
echo npx vercel --prod --yes
echo.
pause