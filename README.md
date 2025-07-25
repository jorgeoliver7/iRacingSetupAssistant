# 🏎️ iRacing Setup Assistant

Una aplicación web completa para ayudar a los usuarios de iRacing a encontrar, generar y compartir configuraciones óptimas para sus coches en diferentes circuitos y tipos de sesión.

## ✨ Características

### 🔍 Búsqueda y Filtrado
- Búsqueda avanzada de setups por coche, circuito y tipo de sesión
- Filtros por categoría de coche, tipo de circuito y calificación
- Sistema de favoritos personalizado

### 🎛️ Generador de Setups
- Generador inteligente de configuraciones
- Múltiples estilos de setup (equilibrado, velocidad, estabilidad)
- Ajustes automáticos basados en condiciones climáticas

### 👥 Sistema de Usuarios
- Registro y autenticación de usuarios
- Perfiles personalizados
- Sistema de calificaciones y comentarios

### 📊 Comparación y Análisis
- Comparador de setups lado a lado
- Exportación de configuraciones a archivos
- Estadísticas detalladas

### 🌍 Internacionalización
- Soporte multiidioma (Español/Inglés)
- Interfaz adaptable

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

## 🛠️ Tecnologías utilizadas

### Frontend
- **React 19.1.0** - Framework principal
- **CSS3** - Estilos responsivos
- **Context API** - Gestión de estado
- **i18n** - Internacionalización

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

### DevOps
- **Vercel** - Deployment frontend
- **Railway** - Deployment backend
- **Git** - Control de versiones

## 🚀 Deployment

### Opción Rápida
```bash
# Preparar y subir cambios a GitHub
.\deploy-production.ps1
```

### Deployment Manual
Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas de deployment en:
- **Vercel** (Frontend)
- **Railway** (Backend + Database)
- **Netlify + Render** (Alternativa)

### Mejoras para Producción
- ✅ **CORS configurado** para múltiples orígenes
- ✅ **Health check endpoint** (`/health`) para monitoreo
- ✅ **Variables de entorno** optimizadas
- ✅ **Script de deployment** automatizado

## 🌐 Demo en Vivo

- **Frontend**: [https://iracing-setup.vercel.app](https://iracing-setup.vercel.app)
- **API**: [https://iracing-api.railway.app](https://iracing-api.railway.app)

## 📱 PWA Support

La aplicación incluye soporte para Progressive Web App (PWA):
- Instalable en dispositivos móviles
- Funciona offline (próximamente)
- Notificaciones push (próximamente)
