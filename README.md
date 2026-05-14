# ORES Travel Peru - Sistema de Cotizaciones Turísticas

Sistema web completo de cotizaciones para tours en Cusco, Perú, con integración a n8n para generación automática de PDFs y almacenamiento en Google Drive.

## 📦 Descripción del Proyecto

Sistema integral que incluye:
- 🔐 **Login** con autenticación de usuarios
- 📊 **Dashboard** con calendario de tours y estadísticas
- 📝 **Formulario de Programas Fijos** (10 programas predefinidos)
- 🎨 **Formulario de Tours Personalizados** (26 actividades disponibles)
- 🤖 **Integración con n8n** para procesamiento automático
- 📄 **Generación automática de PDFs** personalizados
- ☁️ **Almacenamiento en Google Drive** organizado por año/mes

---

## 📋 Estructura del Proyecto

```
ores-travel-forms/
├── login.html                  # Página de inicio de sesión
├── dashboard.html              # Panel principal con calendario
├── programas-fijos.html        # Formulario de programas fijos
├── tour-personalizado.html     # Formulario de tours personalizados
├── vercel.json                 # Configuración de Vercel
├── README.md                   # Este archivo
└── docs/                       # Documentación adicional
    ├── WORKFLOW_N8N.md        # Documentación del workflow n8n
    ├── INTEGRACION.md         # Guía de integración
    └── API.md                 # Documentación de la API
```

---

## 🚀 Despliegue a Vercel

### Opción 1: Desde la Web de Vercel (Recomendado)

1. **Crear cuenta en Vercel** (si no la tienes)
   - Ve a: [https://vercel.com][def]
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
     - Framework Preset: `Other`
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

---

## 🔗 URLs del Sistema

Una vez desplegado, las rutas serán:
- **Login**: `https://tu-dominio.vercel.app/` o `/login`
- **Dashboard**: `https://tu-dominio.vercel.app/dashboard`
- **Programas Fijos**: `https://tu-dominio.vercel.app/programas-fijos`
- **Tour Personalizado**: `https://tu-dominio.vercel.app/tour-personalizado`

---

## 🔐 Credenciales de Acceso

**Usuario**: `admin` o `cotizador`  
**Contraseña**: `ores2024`

---

## ⚙️ Integración con n8n

### Webhook Endpoint

Los formularios están configurados para enviar datos a:

```
https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf
```

### Flujo del Workflow

1. **Recepción de datos** del formulario (webhook)
2. **Clasificación** del tipo de tour (personalizado o fijo)
3. **Procesamiento** según el tipo:
   - **Tours Personalizados**: Generación de HTML → PDF → Google Drive
   - **Programas Fijos**: Copia de template Google Docs → Actualización de placeholders
4. **Almacenamiento** en Google Drive (organizado por año/mes)
5. **Respuesta** con enlaces de descarga

### Respuesta Esperada del Webhook

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

---

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
  "numero_personas": "2",
  "fecha_viaje": "2025-12-01",
  "tipo_habitacion": "Doble",
  "categoria_hotel": "3 estrellas",
  "tipo_transporte": "local",
  "precio_por_persona_tren": "100",
  "precio_total_tren": "200",
  "horario_ida_tren": "09:50",
  "horario_retorno_tren": "18:30",
  "adelanto_pagado": "300",
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
  "precio_total": 1500,
  "nombre_cliente": "María García",
  "telefono": "+51 987 654 321",
  "numero_personas": "2",
  "adelanto_pagado": 450,
  "timestamp": "2025-10-22T01:00:00.000Z"
}
```

---

## 🎯 Características del Sistema

### Programas Fijos (10 programas disponibles)

| Código | Nombre | Días/Noches | Precio Base |
|--------|--------|-------------|-------------|
| 3D2N | Aventura Cusqueña - Básico Machu Picchu | 3D/2N | S/. 420 |
| 4D3N | Aventura Cusqueña - Valle VIP Machu Picchu | 4D/3N | S/. 520 |
| 5D4N | Aventura Cusqueña - Montaña Colores Completo | 5D/4N | S/. 590 |
| 6D5N_HUMANTAY | Aventura Cusqueña - Laguna Humantay Completo | 6D/5N | S/. 690 |
| 6D5N | Aventura Cusqueña - Místico Valle Sur | 6D/5N | S/. 690 |
| 7D6N | Aventura Cusqueña - Valle Sur Completo | 7D/6N | S/. 790 |
| 8D7N | Aventura Cusqueña - Místico Sur Premium | 8D/7N | S/. 890 |
| 10D9N | Aventura Cusqueña - Premium Completo Tren Local | 10D/9N | S/. 1,180 |
| TOURS_SIN_MAPI_4D4N | Tours Sin Mapi - Valle VIP Sin Ingreso | 4D/4N | S/. 550 |
| TOURS_SIN_MAPI_5D5N | Tours Sin Mapi - Ida Aguas Calientes | 5D/5N | S/. 550 |

### Tours Personalizados (26 actividades disponibles)

- ✈️ **LLEGADA** - Recepción en aeropuerto
- 🏛️ **CITY** - City Tour Cusco
- 🏔️ **MONTAÑA** - Montaña de 7 Colores
- 💧 **LAGUNA** - Laguna Humantay
- 🏰 **WAQRAPUKARA** - Fortaleza Waqrapukara
- 🌊 **7 LAGUNA** - 7 Lagunas de Ausangate
- 🚂 **VALLE+MAPI** - Valle Sagrado + Machu Picchu
- 🌅 **MAPI 3 AM** - Machu Picchu amanecer
- 🎨 **MISTICO** - Tour Místico
- 🌄 **SUR** - Tour Valle Sur
- 🚶 **LIBRE-SIN GUIA** - Día libre
- 📸 **FOTOGRAFIA** - Tour fotográfico
- 👋 **SALIDA** - Traslado salida
- Y más...

---

## 🔧 Actualizaciones Futuras

Para actualizar el sitio después del primer despliegue:

1. Edita los archivos en tu editor de código
2. **GitHub Desktop**:
   - Verás los cambios en "Changes"
   - Summary: Describe tus cambios
   - Click "Commit to main"
   - Click "Push origin"
3. **Vercel**: Detectará los cambios automáticamente y redesplegará

---

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

### El webhook no responde
- **Solución**: Verifica que el servidor n8n esté activo
- Revisa los logs del workflow en n8n
- Confirma que la URL del webhook sea correcta

---

## 📚 Documentación Adicional

- [Documentación del Workflow n8n](./docs/WORKFLOW_N8N.md) - Detalles técnicos del workflow
- [Guía de Integración](./docs/INTEGRACION.md) - Cómo integrar nuevos formularios
- [API Reference](./docs/API.md) - Documentación de endpoints y datos

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: n8n (workflow automation)
- **Almacenamiento**: Google Drive
- **Generación PDF**: html2pdf.app API
- **Hosting**: Vercel
- **Autenticación**: LocalStorage (sesiones)

---

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: reservasorestravelperu@gmail.com
- **Teléfono**: +51 918 818 503
- **Dirección**: Calle Coquimbo A3 — Cusco, Perú

---

## 📄 Licencia

© 2025 ORES Travel Peru. Todos los derechos reservados.

---

## 🔄 Versión

**Versión actual**: 2.0.0  
**Última actualización**: Noviembre 2025  
**Workflow n8n**: v7.19 (Programas Fijos) / v7.3 (Tours Personalizados)


[def]: https://vercel.com