# 🔧 Solución de Problemas de Despliegue

## 🚨 Problema: Dropdowns Vacíos en Producción

### Síntomas
- Los dropdowns de coches y circuitos aparecen vacíos en la aplicación desplegada
- La aplicación funciona correctamente en desarrollo local
- No hay errores visibles en la interfaz

### Causas Posibles

#### 1. **Problema de CORS**
- El backend no permite solicitudes desde el dominio de producción
- **Solución**: Verificar configuración CORS en `backend/index.js`

#### 2. **Variables de Entorno Incorrectas**
- `REACT_APP_API_URL` no apunta al backend correcto
- `FRONTEND_URL` en el backend no coincide con el dominio de producción

#### 3. **Base de Datos No Inicializada**
- Las tablas `cars` y `tracks` están vacías
- La conexión a la base de datos falla

## 🛠️ Pasos de Diagnóstico

### 1. Verificar Health Check
```bash
curl https://tu-backend.railway.app/health
```
**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Probar APIs Directamente
```bash
# Probar endpoint de coches
curl https://tu-backend.railway.app/api/cars

# Probar endpoint de circuitos
curl https://tu-backend.railway.app/api/tracks
```

### 3. Verificar Logs del Backend
- En Railway: Dashboard → Logs
- Buscar mensajes como:
  - `GET /api/cars - Origin: https://tu-frontend.vercel.app`
  - `Cars fetched from DB: X items`
  - `CORS blocked origin: ...`

### 4. Verificar Variables de Entorno

#### En Railway (Backend):
- `DATABASE_URL`: ✅ Configurado automáticamente
- `FRONTEND_URL`: ❗ **DEBE ser la URL exacta de Vercel**
- `JWT_SECRET`: ✅ Cualquier string de 32+ caracteres
- `NODE_ENV`: ✅ `production`

#### En Vercel (Frontend):
- `REACT_APP_API_URL`: ❗ **DEBE ser la URL exacta de Railway**

## 🔧 Soluciones

### Solución 1: Corregir CORS

1. **Verificar que `FRONTEND_URL` esté configurado correctamente en Railway:**
   ```
   FRONTEND_URL=https://tu-app.vercel.app
   ```

2. **El código ya incluye configuración CORS mejorada que permite:**
   - Múltiples orígenes (localhost + producción)
   - Logging de orígenes bloqueados
   - Manejo de requests sin origin

### Solución 2: Verificar URLs

1. **En Vercel, configurar:**
   ```
   REACT_APP_API_URL=https://tu-backend.railway.app
   ```

2. **En Railway, configurar:**
   ```
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```

### Solución 3: Inicializar Base de Datos

1. **Conectar a Railway PostgreSQL:**
   ```bash
   psql $DATABASE_URL
   ```

2. **Ejecutar scripts en orden:**
   ```sql
   \i enhanced_database_schema.sql
   \i setup_database.sql
   ```

3. **Poblar datos:**
   ```bash
   node update_iracing_data.js
   ```

## 🚀 Script de Verificación Rápida

```bash
# Verificar health check
echo "=== HEALTH CHECK ==="
curl -s https://tu-backend.railway.app/health | jq

# Verificar datos
echo "\n=== CARS DATA ==="
curl -s https://tu-backend.railway.app/api/cars | jq 'length'

echo "\n=== TRACKS DATA ==="
curl -s https://tu-backend.railway.app/api/tracks | jq 'length'
```

## 📋 Checklist de Despliegue

- [ ] ✅ Código subido a GitHub
- [ ] ✅ Railway desplegado automáticamente
- [ ] ✅ Vercel desplegado automáticamente
- [ ] ❗ Variables de entorno configuradas
- [ ] ❗ Health check responde OK
- [ ] ❗ APIs devuelven datos
- [ ] ❗ CORS permite el origen de producción
- [ ] ❗ Base de datos inicializada
- [ ] ✅ Dropdowns funcionan en producción

## 🆘 Si Nada Funciona

1. **Revisar logs detallados en Railway**
2. **Verificar que las URLs no tengan trailing slashes**
3. **Probar con herramientas de desarrollo del navegador**
4. **Verificar que no hay cache del navegador**
5. **Contactar soporte de Railway/Vercel si es necesario**

---

**💡 Tip**: Los logs del backend ahora incluyen información detallada sobre cada request, incluyendo el origen y la cantidad de datos devueltos.