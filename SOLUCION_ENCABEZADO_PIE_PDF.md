Lamento mucho el error. El archivo HTML se corrompió durante el reemplazo. 

## ⚠️ Problema

El generador de PDF `html2pdf.app` **NO soporta** CSS `@page` avanzado con `@top-left`, `@top-right` y `@bottom-center`. Por eso no funcionó la primera solución.

Los elementos `position: fixed` tampoco funcionan correctamente en todos los generadores de PDF.

## ✅ Solución Recomendada

Para agregar logo, numeración y pie de página en cada página del PDF, necesitas usar una de estas alternativas:

### Opción 1: Usar un generador de PDF diferente
- **Puppeteer** o **wkhtmltopdf** soportan mejor CSS avanzado
- Permiten usar `@page` con encabezados y pies personalizados

### Opción 2: Agregar elementos manualmente en cada sección
- Agregar el logo y número de página al inicio de cada `<div class="portada">`, `<div class="actividad-compacta">`, etc.
- Agregar el pie de página al final de cada sección
- **Desventaja**: Muy repetitivo y difícil de mantener

### Opción 3: Usar JavaScript para generar el PDF
- Usar una biblioteca como `jsPDF` o `pdfmake`
- Te da control total sobre encabezados, pies y numeración
- **Desventaja**: Requiere reescribir la lógica de generación

## 🔧 Recomendación Inmediata

Te recomiendo **mantener el HTML original** sin encabezado/pie fijo por ahora, y evaluar cambiar el generador de PDF a uno que soporte CSS `@page` correctamente.

Si necesitas implementar esto urgentemente, puedo ayudarte con la **Opción 2** (agregar elementos manualmente), pero será más código.

¿Qué opción prefieres?
