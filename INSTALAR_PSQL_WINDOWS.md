# Instalación de PostgreSQL y psql en Windows

## Problema
El comando `railway connect Postgres-w_J3` requiere que `psql` esté instalado en el sistema.

## Solución: Instalar PostgreSQL

### Opción 1: Instalador Oficial de PostgreSQL (Recomendado)

1. **Descargar PostgreSQL:**
   - Ir a: https://www.postgresql.org/download/windows/
   - Descargar la versión más reciente (16.x)
   - Ejecutar el instalador como administrador

2. **Durante la instalación:**
   - Instalar PostgreSQL Server
   - **IMPORTANTE:** Marcar "Command Line Tools" (incluye psql)
   - Configurar contraseña para usuario postgres
   - Puerto por defecto: 5432

3. **Verificar instalación:**
   ```powershell
   psql --version
   ```

### Opción 2: Solo psql (Más ligero)

1. **Descargar solo las herramientas:**
   - Ir a: https://www.enterprisedb.com/download-postgresql-binaries
   - Descargar "PostgreSQL Binaries"
   - Extraer en `C:\PostgreSQL\`

2. **Agregar al PATH:**
   ```powershell
   $env:PATH += ";C:\PostgreSQL\bin"
   [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
   ```

### Opción 3: Chocolatey (Si tienes Chocolatey instalado)

```powershell
choco install postgresql
```

## Después de la instalación

### 1. Reiniciar PowerShell
Cerrar y abrir una nueva ventana de PowerShell para que reconozca psql.

### 2. Verificar psql
```powershell
psql --version
```

### 3. Conectar a Railway
```powershell
cd C:\Users\jorge\iracing-setup-assistant\iRacingSetupAssistant\backend
railway connect Postgres-w_J3
```

### 4. Ejecutar el script de inicialización
Una vez conectado a la base de datos:
```sql
\i railway_init.sql
```

## Solución de problemas

### Si psql no se reconoce después de la instalación:

1. **Verificar PATH manualmente:**
   ```powershell
   $env:PATH -split ';' | Where-Object { $_ -like '*postgres*' }
   ```

2. **Agregar manualmente al PATH:**
   ```powershell
   # Buscar la instalación de PostgreSQL
   Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Name "psql.exe"
   
   # Agregar al PATH (ejemplo con PostgreSQL 16)
   $postgresPath = "C:\Program Files\PostgreSQL\16\bin"
   $env:PATH += ";$postgresPath"
   [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
   ```

3. **Reiniciar PowerShell completamente**

### Alternativa: Usar Railway CLI con variables de entorno

Si psql sigue sin funcionar, puedes obtener las credenciales y conectarte manualmente:

```powershell
# Obtener variables de entorno de Railway
railway variables

# Conectar manualmente (ejemplo)
psql -h [HOST] -p [PORT] -U [USER] -d [DATABASE]
```

## Próximos pasos

1. Instalar PostgreSQL/psql
2. Reiniciar PowerShell
3. Ejecutar `railway connect Postgres-w_J3`
4. Ejecutar `railway_init.sql` para inicializar la base de datos
5. Verificar con `railway_verify.sql`

¡Una vez instalado psql, podrás conectarte directamente a tu base de datos Railway!