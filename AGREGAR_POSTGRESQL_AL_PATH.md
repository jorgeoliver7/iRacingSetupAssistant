# Cómo Añadir PostgreSQL al PATH en Windows

Este documento te guiará paso a paso para añadir PostgreSQL al PATH de Windows, lo que permitirá ejecutar comandos como `psql` directamente desde la línea de comandos sin necesidad de especificar la ruta completa.

## Pasos para Añadir PostgreSQL al PATH

### 1. Localizar la Carpeta bin de PostgreSQL

Primero, necesitas saber dónde está instalado PostgreSQL en tu sistema. La ubicación típica es:

```
C:\Program Files\PostgreSQL\[versión]\bin
```

Donde `[versión]` es el número de versión de PostgreSQL que has instalado (por ejemplo, 14, 15, 16, etc.).

### 2. Abrir las Variables de Entorno del Sistema

1. Presiona la tecla `Windows + S` para abrir la búsqueda de Windows.
2. Escribe "variables de entorno" y selecciona "Editar las variables de entorno del sistema" <mcreference link="https://remot-technologies.com/como-anadir-postgresql-a-las-variables-de-entorno-de-windows-10/" index="1">1</mcreference>.
3. En la ventana "Propiedades del sistema" que aparece, haz clic en el botón "Variables de entorno..." que se encuentra en la parte inferior <mcreference link="https://www.commandprompt.com/education/how-to-set-windows-path-for-postgres-tools/" index="5">5</mcreference>.

### 3. Editar la Variable PATH

1. En la ventana "Variables de entorno", busca la variable "Path" en la sección "Variables del sistema" (no en "Variables de usuario") <mcreference link="https://sqlbackupandftp.com/blog/setting-windows-path-for-postgres-tools/" index="2">2</mcreference>.
2. Selecciona la variable "Path" y haz clic en el botón "Editar...".
3. En la nueva ventana, haz clic en "Nuevo" para añadir una nueva entrada.
4. Escribe la ruta completa a la carpeta bin de PostgreSQL. Por ejemplo:
   ```
   C:\Program Files\PostgreSQL\14\bin
   ```
   (Asegúrate de reemplazar "14" con tu versión de PostgreSQL) <mcreference link="https://remot-technologies.com/como-anadir-postgresql-a-las-variables-de-entorno-de-windows-10/" index="1">1</mcreference>.
5. Haz clic en "Aceptar" en todas las ventanas para guardar los cambios.

### 4. Verificar la Configuración

1. Cierra todas las ventanas de línea de comandos (CMD o PowerShell) que tengas abiertas.
2. Abre una nueva ventana de línea de comandos.
3. Escribe el siguiente comando y presiona Enter:
   ```
   psql --version
   ```
4. Si ves información sobre la versión de PostgreSQL, ¡felicidades! Has añadido correctamente PostgreSQL al PATH <mcreference link="https://www.commandprompt.com/education/how-to-set-windows-path-for-postgres-tools/" index="5">5</mcreference>.

## Solución de Problemas

Si después de seguir estos pasos sigues sin poder ejecutar comandos de PostgreSQL, intenta lo siguiente:

1. **Reinicia tu computadora**: A veces, los cambios en las variables de entorno requieren un reinicio completo del sistema.

2. **Verifica la ruta**: Asegúrate de que la ruta que has añadido es correcta. Puedes navegar manualmente a la carpeta bin de PostgreSQL para confirmar su ubicación.

3. **Usa la ruta completa temporalmente**: Si necesitas usar PostgreSQL urgentemente, puedes usar la ruta completa al ejecutable:
   ```
   "C:\Program Files\PostgreSQL\14\bin\psql.exe" --version
   ```

## Próximos Pasos

Una vez que hayas añadido PostgreSQL al PATH, puedes continuar con la configuración de la base de datos para la aplicación iRacing Setup Assistant ejecutando el script `configurar_base_datos.bat` desde la línea de comandos:

```
.\configurar_base_datos.bat
```

Este script creará la base de datos necesaria y configurará todo lo necesario para que la aplicación funcione correctamente con PostgreSQL.