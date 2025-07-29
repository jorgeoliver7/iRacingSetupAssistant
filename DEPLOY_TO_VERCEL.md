# 🚀 Guía de Despliegue a Vercel

## ✅ Estado Actual
Tu aplicación está **lista para desplegarse** en Vercel. Todas las configuraciones necesarias han sido completadas:

- ✅ Configuración de `vercel.json` optimizada
- ✅ API serverless en carpeta `/api`
- ✅ Dependencias instaladas
- ✅ Rutas configuradas correctamente
- ✅ Build del frontend funcionando

## 🎯 Pasos para Desplegar

### 1. Instalar Vercel CLI (si no lo tienes)
```bash
npm install -g vercel
```

### 2. Iniciar Sesión en Vercel
```bash
vercel login
```

### 3. Configurar Base de Datos

#### Opción A: Supabase (Recomendado)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la Connection String (URI)

#### Opción B: Neon
1. Ve a [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la Connection String

### 4. Configurar Variables de Entorno en Vercel

1. Ejecuta el primer despliegue:
   ```bash
   vercel
   ```

2. Ve al Dashboard de Vercel > Tu Proyecto > Settings > Environment Variables

3. Agrega estas variables:
   ```
   DATABASE_URL=postgresql://usuario:password@host:5432/database?sslmode=require
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   NODE_ENV=production
   FRONTEND_URL=https://tu-app.vercel.app
   ```

### 5. Migrar Datos (si vienes de Railway)

1. Exporta datos de Railway:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. Importa a nueva base de datos:
   ```bash
   psql $NEW_DATABASE_URL < backup.sql
   ```

### 6. Despliegue Final
```bash
vercel --prod
```

## 🔧 Configuración Automática

Puedes usar el script automatizado:
```bash
powershell -ExecutionPolicy Bypass -File setup-vercel.ps1
```

## 🧪 Verificar Despliegue

1. **Frontend**: Visita tu URL de Vercel
2. **API**: Prueba `https://tu-app.vercel.app/api/health`
3. **Autenticación**: Intenta registrarte/iniciar sesión
4. **Base de datos**: Verifica que los setups se cargan correctamente

## 🐛 Solución de Problemas

### Error 500 en API
- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa los logs en Vercel Dashboard > Functions

### Error de CORS
- Asegúrate de que `FRONTEND_URL` esté configurada
- Verifica que la URL no tenga `/` al final

### Base de datos no conecta
- Verifica que la cadena de conexión incluya `?sslmode=require`
- Asegúrate de que la base de datos permita conexiones externas

### Build falla
- Ejecuta `npm run build` localmente para verificar
- Revisa que todas las dependencias estén en `package.json`

## 📊 Ventajas de Vercel vs Railway

| Característica | Vercel | Railway |
|---|---|---|
| **Despliegue** | ✅ Automático desde Git | ⚠️ Problemas recurrentes |
| **Escalabilidad** | ✅ Serverless automático | ❌ Limitado |
| **Logs** | ✅ Detallados y accesibles | ❌ Inaccesibles |
| **Base de datos** | ⚠️ Externa requerida | ✅ Integrada |
| **Costo** | ✅ Generoso plan gratuito | ⚠️ Limitado |
| **Performance** | ✅ CDN global | ⚠️ Variable |

## 🎉 ¡Listo!

Una vez desplegado, tu aplicación estará disponible en una URL como:
`https://iracing-setup-assistant.vercel.app`

### URLs importantes:
- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api`
- **Health Check**: `https://tu-app.vercel.app/api/health`

---

💡 **Tip**: Guarda este archivo para futuras referencias y compártelo con tu equipo.