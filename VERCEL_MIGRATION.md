# 🚀 Migración a Vercel - iRacing Setup Assistant

## 📋 Resumen de Cambios

Hemos migrado la aplicación de Railway a Vercel para mejorar la confiabilidad y performance. La nueva arquitectura incluye:

- **Frontend**: React app desplegado en Vercel
- **Backend**: Funciones serverless en Vercel (`/api/*`)
- **Base de Datos**: PostgreSQL (recomendamos Supabase o Neon)

## 🏗️ Arquitectura Nueva

```
📁 Proyecto Raíz
├── 📁 src/              # Frontend React
├── 📁 api/              # Funciones Serverless
│   ├── index.js         # Punto de entrada principal
│   ├── package.json     # Dependencias del backend
│   └── 📁 routes/       # Rutas de la API
│       ├── auth.js      # Autenticación
│       ├── setups.js    # Gestión de setups
│       ├── favorites.js # Favoritos
│       ├── ratings.js   # Calificaciones
│       ├── comparisons.js # Comparaciones
│       └── generator.js # Generador de setups
├── vercel.json          # Configuración de Vercel
└── package.json         # Dependencias del frontend
```

## 🔧 Configuración Paso a Paso

### 1. Preparar Base de Datos

#### Opción A: Supabase (Recomendado)
1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a Settings > Database
4. Copiar la Connection String
5. Ejecutar el schema de la base de datos:
   ```sql
   -- Usar el contenido de backend/enhanced_database_schema.sql
   ```

#### Opción B: Neon
1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nueva base de datos
3. Copiar la Connection String
4. Ejecutar el schema

### 2. Configurar Vercel

#### Instalación Automática
```powershell
# Ejecutar desde la raíz del proyecto
.\setup-vercel.ps1
```

#### Instalación Manual

1. **Instalar Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel**:
   ```bash
   vercel login
   ```

3. **Instalar dependencias**:
   ```bash
   npm install
   ```

4. **Configurar variables de entorno**:
   En el dashboard de Vercel, agregar:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu-clave-secreta-aqui
   NODE_ENV=production
   FRONTEND_URL=https://tu-app.vercel.app
   ```

5. **Desplegar**:
   ```bash
   vercel --prod
   ```

## 🔄 Migración de Datos

### Desde Railway

1. **Exportar datos de Railway**:
   ```bash
   # Conectar a Railway DB
   railway connect
   
   # Exportar datos
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Importar a nueva DB**:
   ```bash
   # Conectar a nueva DB (Supabase/Neon)
   psql "postgresql://nueva-conexion" < backup.sql
   ```

## 🌐 URLs de la API

Después del despliegue, las APIs estarán disponibles en:

```
https://tu-app.vercel.app/api/health
https://tu-app.vercel.app/api/auth/login
https://tu-app.vercel.app/api/auth/register
https://tu-app.vercel.app/api/setups
https://tu-app.vercel.app/api/favorites
https://tu-app.vercel.app/api/ratings
https://tu-app.vercel.app/api/comparisons
https://tu-app.vercel.app/api/generator
```

## 🔍 Testing

### Test de Health Check
```bash
curl https://tu-app.vercel.app/api/health
```

### Test de Frontend
1. Abrir `https://tu-app.vercel.app`
2. Verificar que la aplicación carga correctamente
3. Probar login/registro
4. Verificar funcionalidades principales

## 📊 Ventajas de Vercel

✅ **Performance**: CDN global automático  
✅ **Escalabilidad**: Auto-scaling serverless  
✅ **Confiabilidad**: 99.99% uptime  
✅ **Deploy**: Automático desde Git  
✅ **Logs**: Acceso fácil a logs y métricas  
✅ **SSL**: HTTPS automático  
✅ **Preview**: Deploy de preview para cada PR  

## 🚨 Limitaciones

⚠️ **Timeout**: 10 segundos para funciones (plan gratuito)  
⚠️ **Cold Starts**: Primer request puede ser lento  
⚠️ **Conexiones DB**: Limitadas en serverless  
⚠️ **Memoria**: 1024MB máximo (plan gratuito)  

## 🔧 Troubleshooting

### Error de Conexión a DB
```
Error: connect ECONNREFUSED
```
**Solución**: Verificar DATABASE_URL en variables de entorno

### Error de CORS
```
Access to fetch blocked by CORS policy
```
**Solución**: Verificar FRONTEND_URL en variables de entorno

### Timeout en Funciones
```
Function execution timed out
```
**Solución**: Optimizar queries de DB o considerar plan Pro

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Comprobar conexión a base de datos
4. Revisar este documento

## 🎉 ¡Listo!

Tu aplicación ahora está ejecutándose en Vercel con:
- ✅ Frontend optimizado
- ✅ API serverless
- ✅ Base de datos externa
- ✅ Deploy automático
- ✅ SSL/HTTPS
- ✅ CDN global

¡Disfruta de tu nueva infraestructura mejorada! 🚀