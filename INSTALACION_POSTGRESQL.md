# Guía de Instalación de PostgreSQL en Windows

Esta guía te ayudará a instalar PostgreSQL en tu sistema Windows para poder utilizar la aplicación iRacing Setup Assistant con una base de datos real.

## Pasos para Instalar PostgreSQL

### 1. Descargar el Instalador de PostgreSQL

1. Ve al sitio oficial de PostgreSQL para Windows: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/) <mcreference link="https://www.postgresql.org/download/windows/" index="5">5</mcreference>
2. Haz clic en "Download the installer" para descargar el instalador certificado por EDB.
3. Selecciona la versión más reciente de PostgreSQL disponible.

### 2. Ejecutar el Instalador

1. Una vez descargado, haz doble clic en el archivo del instalador.
2. Haz clic en "Next" para comenzar la instalación. <mcreference link="https://www.geeksforgeeks.org/install-postgresql-on-windows/" index="4">4</mcreference>
3. Elige la carpeta de instalación donde quieres que se instale PostgreSQL y haz clic en "Next".
4. Selecciona los componentes que deseas instalar. Asegúrate de incluir:
   - PostgreSQL Server
   - pgAdmin (herramienta gráfica para administrar bases de datos)
   - Command Line Tools
   - StackBuilder
5. Haz clic en "Next".

### 3. Configurar la Instalación

1. Selecciona el directorio donde se almacenarán los datos y haz clic en "Next".
2. Establece una contraseña para el superusuario de la base de datos (postgres). **¡Recuerda esta contraseña!** <mcreference link="https://www.geeksforgeeks.org/install-postgresql-on-windows/" index="4">4</mcreference>
3. Establece el puerto para PostgreSQL. Si no estás seguro, deja el valor predeterminado (5432) y haz clic en "Next".
4. Elige la configuración regional predeterminada y haz clic en "Next".
5. Haz clic en "Next" para iniciar la instalación.
6. Espera a que se complete la instalación, puede tardar unos minutos.
7. Al finalizar, haz clic en "Finish".

### 4. Verificar la Instalación

1. Busca "psql" en la barra de búsqueda de Windows y ábrelo. <mcreference link="https://www.geeksforgeeks.org/install-postgresql-on-windows/" index="4">4</mcreference>
2. Ingresa los detalles del servidor:
   - Server: localhost
   - Database: postgres
   - Port: 5432
   - Username: postgres
   - Password: (la contraseña que estableciste durante la instalación)
3. En el shell de psql, escribe `SELECT version();` para confirmar que PostgreSQL está instalado correctamente.

## Configurar la Base de Datos para iRacing Setup Assistant

### 1. Crear la Base de Datos

1. En el shell de psql, ejecuta el siguiente comando para crear la base de datos:
   ```sql
   CREATE DATABASE iracingdb;
   ```

2. Verifica que la base de datos se haya creado correctamente:
   ```sql
   \l
   ```
   Deberías ver "iracingdb" en la lista de bases de datos.

### 2. Ejecutar el Script SQL

1. Navega a la carpeta donde se encuentra el archivo `setup_database.sql` en el proyecto.
2. Puedes ejecutar el script de dos maneras:

   **Opción 1: Usando psql desde la línea de comandos**
   ```bash
   psql -U postgres -d iracingdb -f ruta/a/setup_database.sql
   ```
   Reemplaza "ruta/a" con la ruta real al archivo.

   **Opción 2: Usando pgAdmin**
   - Abre pgAdmin desde el menú de inicio
   - Conéctate al servidor PostgreSQL
   - Haz clic derecho en la base de datos "iracingdb"
   - Selecciona "Query Tool"
   - Abre el archivo `setup_database.sql`
   - Haz clic en el botón "Execute"

### 3. Actualizar el Archivo .env

1. Abre el archivo `.env` en la carpeta `backend` del proyecto.
2. Actualiza la URL de conexión con tus credenciales:
   ```
   DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/iracingdb
   ```
   Reemplaza "tu_contraseña" con la contraseña que estableciste durante la instalación.

## Iniciar la Aplicación

1. Reinicia el servidor backend para que se conecte a la base de datos:
   ```bash
   cd backend
   node index.js
   ```

2. Verifica que el frontend esté funcionando:
   ```bash
   cd ..
   npm start
   ```

¡Listo! Ahora deberías tener PostgreSQL instalado y configurado correctamente para usar con iRacing Setup Assistant.