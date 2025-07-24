# iRacing Setup Assistant

Una aplicación web para ayudar a los usuarios de iRacing a encontrar configuraciones óptimas para sus coches en diferentes circuitos y tipos de sesión.

## Características

- Selección de coches de iRacing
- Selección de circuitos
- Diferentes tipos de sesión (Práctica, Clasificación, Carrera, Lluvia, Resistencia)
- Recomendaciones de configuración basadas en la combinación seleccionada

## Requisitos previos

- Node.js (v14 o superior)
- PostgreSQL (opcional, la aplicación puede funcionar con datos de ejemplo)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/iracing-setup-assistant.git
cd iracing-setup-assistant
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
```

### 3. Configurar la base de datos (opcional)

Si deseas utilizar PostgreSQL para almacenar datos reales:

1. Instala PostgreSQL si aún no lo tienes instalado
2. Crea una base de datos en PostgreSQL con el nombre `iracingdb`:

```bash
# Desde la línea de comandos de PostgreSQL (psql)
CREATE DATABASE iracingdb;
```

3. Actualiza el archivo `.env` en la carpeta `backend` con tus credenciales:

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/iracingdb
```

> **Importante**: Reemplaza `usuario` y `contraseña` con tus credenciales reales de PostgreSQL.

4. Ejecuta el script SQL para crear las tablas y datos de ejemplo:

```bash
# Si tienes psql en tu PATH
psql -U tu_usuario -d iracingdb -f backend/setup_database.sql

# Alternativamente, puedes copiar y pegar el contenido del archivo setup_database.sql
# directamente en una herramienta como pgAdmin o DBeaver
```

> **Nota**: Si no configuras la base de datos, la aplicación funcionará con datos de ejemplo predefinidos. Verás mensajes de error en la consola del backend, pero la aplicación seguirá funcionando normalmente.

## Ejecución

### 1. Iniciar el backend

```bash
cd backend
node index.js
```

El servidor backend estará disponible en http://localhost:4000

### 2. Iniciar el frontend

En otra terminal:

```bash
# Desde la carpeta raíz del proyecto
npm start
```

La aplicación estará disponible en http://localhost:3000

## Estructura del proyecto

- `/src` - Código fuente del frontend (React)
- `/public` - Archivos estáticos del frontend
- `/backend` - Servidor API (Node.js/Express)

## Tecnologías utilizadas

- Frontend: React
- Backend: Node.js, Express
- Base de datos: PostgreSQL
