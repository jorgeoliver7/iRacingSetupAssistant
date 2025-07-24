@echo off
echo ===================================================
echo  Verificacion de PostgreSQL para iRacing Setup Assistant
echo ===================================================
echo.

REM Verificar si PostgreSQL esta instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL no parece estar instalado o no esta en el PATH.
    echo.
    echo Por favor, sigue uno de estos pasos:
    echo 1. Instala PostgreSQL siguiendo las instrucciones en INSTALACION_POSTGRESQL.md
    echo 2. Si ya tienes PostgreSQL instalado, agregalo al PATH siguiendo AGREGAR_POSTGRESQL_AL_PATH.md
    echo.
    echo Abriendo archivos de instrucciones...
    start INSTALACION_POSTGRESQL.md
    start AGREGAR_POSTGRESQL_AL_PATH.md
    exit /b 1
)

echo PostgreSQL encontrado en el sistema.
echo.
echo Ahora puedes ejecutar el script de configuracion de la base de datos.
echo.
echo Presiona cualquier tecla para salir...
pause >nul