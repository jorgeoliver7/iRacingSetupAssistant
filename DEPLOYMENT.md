# 🚀 Guía de Deployment - iRacing Setup Assistant

## 📋 Preparación

### 1. Variables de Entorno

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://tu-backend-url.com
```

#### Backend (.env)
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
PORT=3001
JWT_SECRET=tu-secret-super-seguro-minimo-32-caracteres
FRONTEND_URL=https://tu-frontend-url.com
NODE_ENV=production
```

## 🌐 Opciones de Hosting

### Opción 1: Vercel + Railway (Recomendado)

#### Frontend en Vercel
1. Conectar repositorio en [vercel.com](https://vercel.com)
2. **Framework Preset:** React
3. **Build Command:** `npm run build`
4. **Output Directory:** `build`
5. **Environment Variables:**
   - `REACT_APP_API_URL`: URL de tu backend

#### Backend en Railway
1. Nuevo proyecto en [railway.app](https://railway.app)
2. **Root Directory:** `backend`
3. **Start Command:** `npm start`
4. Añadir PostgreSQL database
5. **Environment Variables:**
   - `DATABASE_URL`: (automático)
   - `JWT_SECRET`: generar secreto seguro
   - `FRONTEND_URL`: URL de Vercel
   - `NODE_ENV`: `production`

### Opción 2: Netlify + Render

#### Frontend en Netlify
1. **Build Command:** `npm run build`
2. **Publish Directory:** `build`
3. **Environment Variables:** `REACT_APP_API_URL`

#### Backend en Render
1. **Build Command:** `npm install`
2. **Start Command:** `npm start`
3. **Root Directory:** `backend`
4. Añadir PostgreSQL database

## 🗄️ Base de Datos

### Inicialización
1. Ejecutar `enhanced_database_schema.sql`
2. Ejecutar `setup_database.sql`
3. Ejecutar `update_iracing_data.js`

### Railway PostgreSQL
```bash
# Conectar a la base de datos
psql $DATABASE_URL

# Ejecutar scripts
\i enhanced_database_schema.sql
\i setup_database.sql
```

## ⚙️ Configuración CORS

Asegúrate de que el backend tenga configurado CORS correctamente:

```javascript
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));
```

## 🔒 Seguridad

### JWT Secret
Generar un secreto seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variables de Entorno
- ✅ Nunca commitear archivos `.env`
- ✅ Usar `.env.example` como plantilla
- ✅ Rotar secretos regularmente

## 🚀 Deployment Automático

### GitHub Actions (Opcional)
Crear `.github/workflows/deploy.yml` para CI/CD automático.

## 📊 Monitoreo

### Health Check
El backend incluye endpoint `/health` para monitoreo:
```
GET /health
```

### Logs
- Railway: Dashboard → Logs
- Vercel: Dashboard → Functions → Logs

## 🔧 Troubleshooting

### Errores Comunes

1. **CORS Error**
   - Verificar `FRONTEND_URL` en backend
   - Comprobar configuración CORS

2. **Database Connection**
   - Verificar `DATABASE_URL`
   - Comprobar firewall/whitelist

3. **Build Errors**
   - Verificar variables de entorno
   - Comprobar dependencias

### URLs de Ejemplo
- Frontend: `https://iracing-setup.vercel.app`
- Backend: `https://iracing-api.railway.app`
- Health: `https://iracing-api.railway.app/health`

## 📱 PWA (Opcional)

La app ya tiene configuración PWA básica en `public/manifest.json`.

## 🎯 Próximos Pasos

1. ✅ Configurar dominio personalizado
2. ✅ Implementar SSL/HTTPS
3. ✅ Configurar CDN
4. ✅ Añadir analytics
5. ✅ Implementar error tracking

---

**¡Tu app estará online en menos de 30 minutos!** 🚀