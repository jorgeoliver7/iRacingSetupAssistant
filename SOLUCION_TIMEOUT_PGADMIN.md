# Solución Error: Connection Timeout Expired en pgAdmin

## 🚨 Problema
Error: **"Unable to connect to server: connection timeout expired"**

## 🔍 Causas Posibles

### 1. **Host Incorrecto**
- Estás usando el host interno de Railway (`postgres-w_j3.railway.internal`)
- Railway no permite conexiones externas al host interno

### 2. **Configuración de Red**
- Firewall bloqueando la conexión
- Proxy corporativo interfiriendo
- ISP bloqueando el puerto 5432

### 3. **Credenciales o Puerto Incorrecto**
- Puerto mal configurado
- Host externo no disponible

## ✅ Soluciones

### Solución 1: Verificar Host Externo (RECOMENDADO)

1. **En Railway Dashboard:**
   - Ve a tu proyecto
   - Selecciona el servicio PostgreSQL
   - Ve a "Settings" → "Networking"
   - Busca "Public Networking" o "External URL"

2. **Si encuentras URL externa:**
   ```
   Host: [host-externo].railway.app
   Port: 5432
   ```

3. **Si NO hay URL externa:**
   - Ve a "Variables"
   - Busca `DATABASE_PUBLIC_URL` o similar
   - Usa ese host en lugar del interno

### Solución 2: Usar Railway CLI (ALTERNATIVA)

```powershell
# Conectar a través de Railway CLI
railway login
railway link [tu-proyecto-id]
railway connect postgres
```

### Solución 3: Configuración de pgAdmin Correcta

**Parámetros de Conexión:**
```
Host: roundhouse.proxy.rlwy.net (o el host externo correcto)
Port: 5432
Database: railway
Username: postgres
Password: ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI
SSL Mode: Prefer
Connection Timeout: 30 segundos
```

### Solución 4: Verificar Conectividad

```powershell
# Probar conectividad al host
Test-NetConnection -ComputerName roundhouse.proxy.rlwy.net -Port 5432

# Si falla, probar con telnet
telnet roundhouse.proxy.rlwy.net 5432
```

### Solución 5: Usar DBeaver (Alternativa)

```powershell
# Instalar DBeaver (mejor manejo de timeouts)
winget install dbeaver.dbeaver
```

DBeaver tiene mejor manejo de conexiones problemáticas.

## 🔧 Configuración Avanzada pgAdmin

### Aumentar Timeout
1. En pgAdmin, al crear la conexión
2. Pestaña "Advanced"
3. **Connection timeout:** 30 segundos
4. **Command timeout:** 30 segundos

### SSL Configuration
1. Pestaña "SSL"
2. **SSL mode:** Prefer
3. **SSL compression:** No

## 🆘 Diagnóstico Paso a Paso

### 1. Verificar Host
```sql
-- En Railway Dashboard, ejecutar:
SELECT inet_server_addr(), inet_server_port();
```

### 2. Probar desde Terminal
```powershell
# Probar conexión directa
psql "postgresql://postgres:ICHQfforuHWwvYFAVrXfmdAiAVZZAtLI@[HOST_CORRECTO]:5432/railway"
```

### 3. Verificar Variables Railway
1. Ve a tu servicio PostgreSQL
2. Pestaña "Variables"
3. Busca:
   - `DATABASE_URL`
   - `DATABASE_PUBLIC_URL`
   - `PGHOST`
   - `PGPORT`

## 🎯 Host Correcto para Railway

**INCORRECTO (Interno):**
```
postgres-w_j3.railway.internal
```

**CORRECTO (Externo):**
```
roundhouse.proxy.rlwy.net
```

## 📝 Checklist de Verificación

- [ ] Usar host externo, no interno
- [ ] Puerto 5432 correcto
- [ ] Credenciales correctas
- [ ] SSL mode en "Prefer"
- [ ] Timeout aumentado a 30 segundos
- [ ] Firewall no bloqueando puerto 5432
- [ ] Probar con DBeaver si pgAdmin falla

## 🚀 Próximos Pasos

1. **Verificar host externo en Railway**
2. **Actualizar configuración pgAdmin**
3. **Probar conexión**
4. **Si funciona, ejecutar railway_init.sql**
5. **Verificar con test_railway_connection.sql**

¡Con estos pasos deberías poder conectarte exitosamente!