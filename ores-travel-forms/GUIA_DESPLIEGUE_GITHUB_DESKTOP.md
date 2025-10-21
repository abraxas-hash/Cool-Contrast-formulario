# 🚀 Guía de Despliegue - ORES Travel Peru
## Usando GitHub Desktop y Vercel

---

## 📋 ARCHIVOS INCLUIDOS EN ESTE PROYECTO

```
ores-travel-deploy/
├── login.html                              # Página de inicio de sesión
├── dashboard.html                          # Panel principal
├── formulario-programas-fijos.html         # Formulario tours fijos
├── formulario-tour-personalizado.html      # Formulario tours personalizados
├── vercel.json                             # Configuración Vercel
└── README.md                               # Documentación del proyecto
```

---

## 🔧 PASO 1: PREPARAR TU COMPUTADORA LOCAL

### 1.1 Descargar los archivos
1. **Descarga toda la carpeta `ores-travel-deploy`** a tu computadora local
2. Guárdala en una ubicación fácil de encontrar (por ejemplo: `C:\Proyectos\ores-travel-deploy`)

### 1.2 Verificar archivos
Asegúrate de tener estos 6 archivos:
- ✅ login.html
- ✅ dashboard.html
- ✅ formulario-programas-fijos.html
- ✅ formulario-tour-personalizado.html
- ✅ vercel.json
- ✅ README.md

---

## 📦 PASO 2: CREAR REPOSITORIO CON GITHUB DESKTOP

### 2.1 Abrir GitHub Desktop
1. Abre **GitHub Desktop** en tu computadora
2. Si no lo tienes instalado, descárgalo desde: https://desktop.github.com/

### 2.2 Crear nuevo repositorio
1. En GitHub Desktop, haz clic en **"File" → "New Repository"**
2. Configura lo siguiente:
   - **Name:** `ores-travel-forms`
   - **Description:** `Sistema de cotizaciones ORES Travel Peru`
   - **Local Path:** Selecciona la carpeta PADRE donde guardaste `ores-travel-deploy`
   - **Initialize with README:** ❌ **NO** marcar esta opción (ya tenemos un README.md)
   - **Git ignore:** None
   - **License:** None
3. Haz clic en **"Create Repository"**

### 2.3 Mover los archivos al repositorio
1. GitHub Desktop habrá creado una carpeta vacía `ores-travel-forms`
2. **Copia TODOS los archivos** desde `ores-travel-deploy` a `ores-travel-forms`:
   ```
   Copiar desde: ores-travel-deploy/
   Pegar en:    ores-travel-forms/
   ```
3. Los archivos deberían verse así:
   ```
   ores-travel-forms/
   ├── login.html
   ├── dashboard.html
   ├── formulario-programas-fijos.html
   ├── formulario-tour-personalizado.html
   ├── vercel.json
   └── README.md
   ```

---

## ✍️ PASO 3: HACER COMMIT Y PUBLICAR

### 3.1 Hacer commit inicial
1. Vuelve a **GitHub Desktop**
2. Verás todos los archivos listados en el panel izquierdo
3. En la parte inferior izquierda:
   - **Summary:** `Initial commit - ORES Travel forms`
   - **Description:** `Sistema de cotizaciones con integración n8n y PDFShift`
4. Haz clic en **"Commit to main"**

### 3.2 Publicar a GitHub
1. Haz clic en **"Publish repository"** en la barra superior
2. Configura:
   - **Name:** `ores-travel-forms` (debería estar pre-llenado)
   - **Description:** `Sistema de cotizaciones ORES Travel Peru`
   - **Keep this code private:** ✅ **SÍ** (recomendado para seguridad)
   - **Organization:** Ninguna (a menos que trabajes en una organización)
3. Haz clic en **"Publish Repository"**
4. ✅ **¡Listo!** Tu código ahora está en GitHub

---

## 🌐 PASO 4: DESPLEGAR EN VERCEL

### 4.1 Acceder a Vercel
1. Ve a: https://vercel.com/
2. Haz clic en **"Sign Up"** o **"Log In"**
3. **Importante:** Inicia sesión con **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tu cuenta de GitHub

### 4.2 Importar el proyecto
1. Una vez dentro de Vercel, haz clic en **"Add New..." → "Project"**
2. Verás una lista de tus repositorios de GitHub
3. Busca **`ores-travel-forms`** y haz clic en **"Import"**

### 4.3 Configurar el proyecto
1. En la página de configuración:
   - **Project Name:** `ores-travel-forms` (o personalízalo)
   - **Framework Preset:** None (déjalo en "Other")
   - **Root Directory:** `./` (raíz del proyecto)
   - **Build Settings:** No cambiar nada
2. **No necesitas configurar variables de entorno** (todo está en el código)
3. Haz clic en **"Deploy"**

### 4.4 Esperar el despliegue
1. Vercel comenzará a construir tu proyecto
2. Verás un progreso con animación
3. **Tiempo estimado:** 30-60 segundos
4. ✅ Cuando termine, verás: **"Congratulations! Your project has been deployed"**

---

## 🎉 PASO 5: OBTENER LA URL Y PROBAR

### 5.1 Copiar la URL de producción
1. Vercel te mostrará la URL de tu proyecto:
   ```
   https://ores-travel-forms.vercel.app
   ```
   *(El nombre puede variar según disponibilidad)*

2. Haz clic en **"Visit"** para abrir tu sitio

### 5.2 Probar el sistema
1. **Página de login:**
   ```
   URL: https://tu-proyecto.vercel.app/login
   Usuario: admin
   Password: ores2024
   ```

2. **Verificar navegación:**
   - ✅ Login → Dashboard
   - ✅ Dashboard → Programas Fijos
   - ✅ Dashboard → Tour Personalizado
   - ✅ Botones de regreso
   - ✅ Logout

3. **Probar formularios:**
   - ✅ Llenar formulario de Programas Fijos
   - ✅ Generar PDF
   - ✅ Verificar que el webhook reciba los datos en n8n

---

## 🔗 URLs DEL PROYECTO

### URLs de Producción
- **Login:** `https://tu-proyecto.vercel.app/login`
- **Dashboard:** `https://tu-proyecto.vercel.app/dashboard`
- **Programas Fijos:** `https://tu-proyecto.vercel.app/programas-fijos`
- **Tour Personalizado:** `https://tu-proyecto.vercel.app/tour-personalizado`

### Webhook n8n (Ya configurado)
```
https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf
```

---

## 🔐 CREDENCIALES DE ACCESO

**Usuario:** `admin`  
**Contraseña:** `ores2024`

**Sesión:** 8 horas de duración automática

---

## 🔄 ACTUALIZACIONES FUTURAS

### Para actualizar el sitio:
1. Modifica los archivos en tu carpeta local `ores-travel-forms`
2. Abre **GitHub Desktop**
3. Verás los cambios listados automáticamente
4. Escribe un mensaje de commit (ejemplo: "Actualizar diseño del dashboard")
5. Haz clic en **"Commit to main"**
6. Haz clic en **"Push origin"** (arriba)
7. ✅ **Vercel detectará el cambio y redesplegará automáticamente** (30-60 seg)

---

## ❗ SOLUCIÓN DE PROBLEMAS

### Error: "404 - Page Not Found"
**Causa:** Probablemente estás usando `.html` en la URL  
**Solución:** Usa URLs sin extensión:
- ❌ `https://tu-proyecto.vercel.app/dashboard.html`
- ✅ `https://tu-proyecto.vercel.app/dashboard`

### Error: "Session expired" al refrescar
**Causa:** La sesión dura 8 horas  
**Solución:** Vuelve a hacer login en `/login`

### Error: "Network error" al generar PDF
**Causa:** El webhook de n8n no está respondiendo  
**Solución:** 
1. Verifica que el workflow de n8n esté **activo**
2. Prueba el webhook manualmente:
   ```bash
   curl -X POST https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf \
   -H "Content-Type: application/json" \
   -d '{"test": "data"}'
   ```

### Los cambios no se reflejan en Vercel
**Solución:**
1. Verifica que hiciste **commit** en GitHub Desktop
2. Verifica que hiciste **push** (botón "Push origin")
3. Ve a Vercel Dashboard → tu proyecto → pestaña "Deployments"
4. Deberías ver un nuevo despliegue en proceso

---

## 📞 SOPORTE

Si necesitas ayuda adicional:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica los logs de Vercel en el dashboard
3. Verifica los logs de n8n en el workflow

---

## ✅ CHECKLIST FINAL

- [ ] Archivos descargados en mi computadora local
- [ ] Repositorio creado en GitHub Desktop
- [ ] Archivos copiados al repositorio
- [ ] Commit inicial realizado
- [ ] Repositorio publicado en GitHub
- [ ] Cuenta de Vercel creada/iniciada con GitHub
- [ ] Proyecto importado en Vercel
- [ ] Despliegue completado exitosamente
- [ ] URL de producción copiada
- [ ] Login probado (admin/ores2024)
- [ ] Navegación verificada
- [ ] Formularios probados
- [ ] Generación de PDF verificada

---

🎊 **¡Felicitaciones! Tu sistema ORES Travel está en producción.**
