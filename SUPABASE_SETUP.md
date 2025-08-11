# Configuración de Supabase para iRacing Setup Assistant

## Pasos para configurar la base de datos PostgreSQL gratuita

### 1. Crear cuenta en Supabase
1. Ve a https://supabase.com/dashboard
2. Haz clic en "Start your project" o "Sign up"
3. Regístrate con tu email o GitHub
4. Verifica tu email si es necesario

### 2. Crear nuevo proyecto
1. Una vez en el dashboard, haz clic en "New Project"
2. Selecciona tu organización (o crea una nueva)
3. Completa los datos del proyecto:
   - **Project name**: `iracing-setup-assistant`
   - **Database Password**: Genera una contraseña segura y **GUÁRDALA** (la necesitarás después)
   - **Region**: Selecciona la región más cercana a ti
   - **Pricing Plan**: Asegúrate de que esté en "Free" (gratis)
4. Haz clic en "Create new project"
5. Espera 1-2 minutos mientras se crea el proyecto

### 3. Ejecutar el esquema de base de datos
1. En el dashboard de tu proyecto, ve a la sección **"SQL Editor"** en el menú lateral
2. Haz clic en "New query"
3. Copia y pega todo el contenido del archivo `database_schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Deberías ver el mensaje "Tablas creadas exitosamente"

### 4. Obtener la URL de conexión
1. Ve a **"Settings"** > **"Database"** en el menú lateral
2. En la sección "Connection string", copia la **"URI"**
3. La URL se verá así: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
4. Reemplaza `[YOUR-PASSWORD]` con la contraseña que guardaste en el paso 2

### 5. Configurar variables de entorno en Vercel
Una vez que tengas la URL de conexión completa, ejecuta:
```bash
npx vercel env add DATABASE_URL
```
Cuando te pida el valor, pega la URL completa de conexión.

### 6. Redesplegar la aplicación
```bash
npx vercel --prod --yes
```

## ¡Listo!
Tu aplicación ahora debería funcionar correctamente con la base de datos PostgreSQL de Supabase.

## Verificación
Puedes verificar que todo funciona:
1. Ve a tu aplicación desplegada
2. Los dropdowns de coches y circuitos deberían mostrar datos
3. Revisa la consola del navegador para confirmar que no hay errores 500

---

**Nota**: Supabase ofrece 500MB de almacenamiento y 2GB de transferencia mensual en el plan gratuito, más que suficiente para este proyecto.