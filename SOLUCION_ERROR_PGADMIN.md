# Solución Error pgAdmin: 'idna' codec can't encode character

## 🚨 Problema
Error: `'idna' codec can't encode character '\x2e' in position 0: label empty`

## 🔍 Causa
Este error ocurre cuando pgAdmin no puede procesar correctamente la URL de conexión de Railway, típicamente por:
- Caracteres especiales en la URL
- Formato incorrecto de la URL
- Problemas con el hostname interno de Railway

## ✅ Soluciones

### Solución 1: Usar Parámetros Individuales (RECOMENDADO)

En lugar de usar la URL completa, configura la conexión con parámetros separados:

1. **Abrir pgAdmin**
2. **Crear Nueva Conexión:**
   - Clic derecho en "Servers" → "Register" → "Server"

3. **Pestaña General:**
   - **Name:** `Railway PostgreSQL`

4. **Pestaña Connection:**
   - **Host:** `roundhouse.proxy.rlwy.net` (o el host externo de Railway)
   - **Port:** `5432`
   - **Maintenance database:** `railway`
   - **Username:** `postgres`
   - **Password:** `ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI`

### Solución 2: Encontrar URL Externa

1. **En Railway Dashboard:**
   - Ve a tu proyecto
   - Selecciona el servicio PostgreSQL
   - Ve a "Settings" → "Networking"
   - Busca "Public Networking" o "External URL"

2. **Si no hay URL pública:**
   - Ve a "Variables"
   - Busca una variable que termine en `.railway.app`
   - Usa esa URL en lugar de la interna

### Solución 3: Usar Railway CLI (Alternativa)

```powershell
# Conectar directamente con Railway CLI
railway connect

# Ejecutar script SQL
railway run psql -f backend\railway_init.sql
```

### Solución 4: Usar DBeaver (Alternativa a pgAdmin)

```powershell
# Instalar DBeaver
winget install dbeaver.dbeaver
```

DBeaver maneja mejor las URLs complejas de Railway.

## 🔧 Configuración Correcta para pgAdmin

### Formato de Conexión Seguro:
```
Host: roundhouse.proxy.rlwy.net
Port: 5432
Database: railway
Username: postgres
Password: ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI
```

### ⚠️ NO usar directamente:
```
postgresql://postgres:ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI@postgres-w_j3.railway.internal:5432/railway
```

## 📝 Pasos Después de Conectar

1. **Abrir Query Tool**
2. **Cargar Script:**
   - File → Open → `backend\railway_init.sql`
3. **Ejecutar Script:**
   - Clic en botón Execute (▶️)
4. **Verificar:**
   - Ejecutar `SELECT COUNT(*) FROM cars;`

## 🆘 Si Persiste el Error

1. **Reiniciar pgAdmin**
2. **Limpiar caché de conexiones**
3. **Usar DBeaver como alternativa**
4. **Usar Railway Dashboard directamente**

¡Con estos pasos deberías poder conectarte sin problemas!