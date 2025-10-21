# ORES Travel Peru - Sistema de Cotizaciones

## 📦 Proyecto
Sistema web de cotizaciones para tours en Cusco, Perú. Incluye:
- Login con autenticación
- Dashboard con calendario de tours
- Formulario de programas fijos
- Formulario de tours personalizados
- Integración con n8n para generación de PDFs

## 📋 Archivos del Proyecto

```
ores-travel-forms/
├── login.html                      # Página de inicio de sesión
├── dashboard.html                  # Panel principal
├── programas-fijos.html            # Formulario de programas fijos
├── tour-personalizado.html         # Formulario de tours personalizados
└── vercel.json                     # Configuración de Vercel
```

## 🚀 Despliegue a Vercel

### Opción 1: Desde la Web de Vercel (Recomendado)

1. **Crear cuenta en Vercel** (si no la tienes)
   - Ve a: https://vercel.com
   - Inicia sesión con tu cuenta de GitHub

2. **Crear repositorio en GitHub**
   - Abre GitHub Desktop
   - File → New Repository
   - Nombre: `ores-travel-forms`
   - Local Path: Selecciona la carpeta de tu proyecto
   - Click "Create Repository"

3. **Subir archivos al repositorio**
   - En GitHub Desktop verás los archivos en "Changes"
   - Summary: `Initial commit - ORES Travel Forms`
   - Click "Commit to main"
   - Click "Publish repository" (arriba)
   - Desmarca "Keep this code private" si quieres que sea público
   - Click "Publish Repository"

4. **Importar a Vercel**
   - En Vercel, click "Add New..." → "Project"
   - Busca tu repositorio `ores-travel-forms`
   - Click "Import"
   - En "Configure Project":
     - Framework Preset: **Other**
     - Root Directory: `./` (dejar por defecto)
     - Build Command: (dejar vacío)
     - Output Directory: (dejar vacío)
   - Click "Deploy"

5. **¡Listo!**
   - Vercel te dará una URL como: `https://ores-travel-forms.vercel.app`
   - Tu aplicación estará disponible en esa URL

### Opción 2: Desde la Terminal (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta del proyecto
cd ores-travel-forms

# Desplegar
vercel

# Seguir los prompts:
# - Set up and deploy? Y
# - Which scope? [tu cuenta]
# - Link to existing project? N
# - What's your project's name? ores-travel-forms
# - In which directory is your code located? ./
```

## 🔗 URLs del Sistema

Una vez desplegado, las rutas serán:

- **Login**: `https://tu-dominio.vercel.app/` o `/login`
- **Dashboard**: `https://tu-dominio.vercel.app/dashboard`
- **Programas Fijos**: `https://tu-dominio.vercel.app/programas-fijos`
- **Tour Personalizado**: `https://tu-dominio.vercel.app/tour-personalizado`

## 🔐 Credenciales de Acceso

**Usuario**: `admin` o `cotizador`
**Contraseña**: `ores2024`

## ⚙️ Integración con n8n

Los formularios están configurados para enviar datos a:
```
https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf
```

Este webhook debe:
1. Recibir los datos del formulario
2. Generar el PDF
3. Guardarlo en Google Drive
4. Devolver una respuesta con:
   ```json
   {
     "success": true,
     "mensaje": {
       "titulo": "✅ Cotización Generada",
       "contenido": "Tu cotización ha sido generada exitosamente"
     },
     "pdf": {
       "nombre": "Cotizacion_ORES_Travel.pdf",
       "download_url": "https://drive.google.com/...",
       "public_url": "https://drive.google.com/..."
     },
     "acciones": {
       "descargar": { "texto": "📥 Descargar PDF" },
       "compartir": { "texto": "🔗 Compartir" },
       "nueva_cotizacion": { "texto": "➕ Nueva Cotización" }
     }
   }
   ```

## 📝 Datos Enviados al Webhook

### Programas Fijos
```json
{
  "origen": "formulario",
  "tipo_tour": "fijo",
  "programa_seleccionado": "3D2N",
  "nombre_cliente": "Juan Pérez",
  "telefono": "+51 999 999 999",
  "email": "juan@email.com",
  "numero_personas": "2 adultos",
  "fecha_viaje": "2025-12-01",
  "tipo_habitacion": "Doble",
  "categoria_hotel": "3 estrellas",
  "tipo_tren": "expedition",
  "observaciones": "...",
  "timestamp": "2025-10-22T01:00:00.000Z"
}
```

### Tour Personalizado
```json
{
  "origen": "formulario",
  "tipo_tour": "personalizado",
  "actividades_seleccionadas": ["LLEGADA", "CITY", "MAPI", "SALIDA"],
  "itinerario": [
    { "dia": 1, "fecha": "01/12/2025", "actividad": "LLEGADA" },
    { "dia": 2, "fecha": "02/12/2025", "actividad": "CITY" }
  ],
  "fecha_inicio": "2025-12-01",
  "tipo_transporte": "local",
  "tipo_habitacion": "Doble",
  "categoria_hotel": "3 estrellas",
  "modalidad_precio": "paquete",
  "precio_total": 1500,
  "nombre_cliente": "María García",
  "telefono": "+51 987 654 321",
  "numero_personas": "2 adultos",
  "adelanto_pagado": 450,
  "timestamp": "2025-10-22T01:00:00.000Z"
}
```

## 🔧 Actualizaciones Futuras

Para actualizar el sitio después del primer despliegue:

1. **Edita los archivos** en tu editor de código
2. **GitHub Desktop**:
   - Verás los cambios en "Changes"
   - Summary: Describe tus cambios
   - Click "Commit to main"
   - Click "Push origin"
3. **Vercel**: Detectará los cambios automáticamente y redesplegará

## ❓ Solución de Problemas

### Error: "404 - This page could not be found"
- **Solución**: Verifica que `vercel.json` esté en la raíz del proyecto

### Error: "CORS" al hacer fetch
- **Solución**: Los headers CORS ya están configurados en `vercel.json`
- Si persiste, configura CORS en tu workflow de n8n

### La sesión expira muy rápido
- **Solución**: La sesión dura 8 horas por defecto
- Para cambiar, edita en `login.html` la línea:
  ```javascript
  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
  //                                 ^ horas
  ```

### Los estilos no se cargan
- **Solución**: Los estilos están embebidos en cada HTML, no hay archivos CSS externos

## 📞 Soporte

**Email**: info@orestravel.com
**Teléfono**: +51 984 123 456

---

**Última actualización**: 22 de Octubre, 2025
**Versión**: 1.0.0
