@echo off
echo ===================================================
echo  Configuracion de Base de Datos para iRacing Setup Assistant
echo ===================================================
echo.

REM Verificar si PostgreSQL esta instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL no parece estar instalado o no esta en el PATH.
    echo.
    echo Tienes dos opciones:
    echo 1. Instalar PostgreSQL siguiendo las instrucciones en INSTALACION_POSTGRESQL.md
    echo 2. Si ya tienes PostgreSQL instalado, agregarlo al PATH siguiendo las instrucciones en AGREGAR_POSTGRESQL_AL_PATH.md
    echo.
    echo Que archivo de instrucciones deseas abrir?
    echo 1. Instrucciones de instalacion de PostgreSQL
    echo 2. Instrucciones para agregar PostgreSQL al PATH
    echo.
    set /p OPCION=Ingresa el numero de opcion (1 o 2): 
    
    if "%OPCION%"=="1" (
        start INSTALACION_POSTGRESQL.md
    ) else if "%OPCION%"=="2" (
        start AGREGAR_POSTGRESQL_AL_PATH.md
    ) else (
        echo Opcion no valida. Abriendo ambos archivos...
        start INSTALACION_POSTGRESQL.md
        start AGREGAR_POSTGRESQL_AL_PATH.md
    )
    
    exit /b 1
)

echo PostgreSQL encontrado en el sistema.
echo.

REM Solicitar credenciales
set /p PGUSER=Ingresa el nombre de usuario de PostgreSQL (por defecto 'postgres'): 
if "%PGUSER%"=="" set PGUSER=postgres

set /p PGPASSWORD=Ingresa la contrasena de PostgreSQL: 
if "%PGPASSWORD%"=="" (
    echo La contrasena no puede estar vacia.
    exit /b 1
)

echo.
echo Intentando crear la base de datos 'iracingdb'...

REM Crear la base de datos
psql -U %PGUSER% -c "CREATE DATABASE iracingdb;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No se pudo crear la base de datos. Verificando si ya existe...
    psql -U %PGUSER% -c "SELECT 1 FROM pg_database WHERE datname='iracingdb';" | findstr "1" >nul
    if %ERRORLEVEL% EQU 0 (
        echo La base de datos 'iracingdb' ya existe.
    ) else (
        echo Error al crear la base de datos. Verifica tus credenciales.
        exit /b 1
    )
) else (
    echo Base de datos 'iracingdb' creada exitosamente.
)

echo.
echo Ejecutando script SQL para crear tablas y datos de ejemplo...

REM Ejecutar el script SQL
psql -U %PGUSER% -d iracingdb -f backend\setup_database.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error al ejecutar el script SQL.
    exit /b 1
) else (
    echo Script SQL ejecutado exitosamente.
)

echo.
echo Actualizando archivo .env con las credenciales...

REM Actualizar el archivo .env
echo DATABASE_URL=postgresql://%PGUSER%:%PGPASSWORD%@localhost:5432/iracingdb > backend\.env
echo Archivo .env actualizado.

echo.
echo ===================================================
echo  Configuracion completada exitosamente!
echo ===================================================
echo.
echo Ahora puedes iniciar el backend con:
echo   cd backend
echo   node index.js
echo.
echo Y el frontend con:
echo   npm start
echo.
echo Presiona cualquier tecla para salir...
pause >nul