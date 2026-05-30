# Instrucciones: Agregar Logo y Pie de Página al PDF

## 🎯 Objetivo
Agregar logo en esquina superior izquierda y pie de página en todas las hojas del PDF, sin romper el diseño actual.

## ✅ Cambios a Realizar

### 1. Agregar estos estilos CSS (después de la línea 30 del HTML original)

```css
/* ========== LOGO EN ESQUINA SUPERIOR IZQUIERDA ========== */
.logo-esquina {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 60px;
  height: auto;
  opacity: 0.9;
  z-index: 999;
}

/* ========== PIE DE PÁGINA FIJO ========== */
.footer-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 8pt;
  color: #003366;
  border-top: 1px solid #ccc;
  padding: 6px 15px;
  background: white;
  z-index: 1000;
}
```

### 2. Agregar padding al body (modificar línea 12-19)

Cambiar:
```css
body {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #fff;
  margin: 0;
  padding: 10px;
  font-size: 10.5pt;
  line-height: 1.35;
}
```

Por:
```css
body {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #fff;
  margin: 0;
  padding: 10px;
  padding-bottom: 35px; /* ← AGREGAR ESTA LÍNEA */
  font-size: 10.5pt;
  line-height: 1.35;
}
```

### 3. Agregar elementos HTML (después de `<body>`, línea 282)

Agregar:
```html
<body>

  <!-- Logo en esquina superior izquierda -->
  <img class="logo-esquina" src="{{ $json.IMAGEN_LOGO }}" alt="Logo Andean Journey">

  <!-- Pie de página fijo -->
  <div class="footer-fixed">
    <strong>AGENCIA OPERADORA DE TURISMO SOSTENIBLE</strong><br>
    Office: Calle Coquimbo A3 — Cusco, Perú | Phones: +51 918 818 503 | info@andeanjourney.com
  </div>

  <img class="marca-agua" src="{{ $json.IMAGEN_LOGO }}" alt="Marca de agua Andean Journey Perú">
  
  <!-- Resto del contenido... -->
```

### 4. Eliminar el footer del final (líneas 442-447)

Eliminar:
```html
<footer>
  AGENCIA OPERADORA DE TURISMO SOSTENIBLE<br>
  Office: Calle Coquimbo A3 — Cusco, Perú<br>
  Phones: +51 918 818 503<br>
  info@andeanjourney.com
</footer>
```

## ✅ Resultado Esperado

- Logo pequeño en esquina superior izquierda de todas las páginas
- Pie de página con información de contacto en todas las páginas
- Diseño original intacto, sin texto roto

## ⚠️ Nota sobre Numeración de Página

La numeración automática de páginas NO funciona con `html2pdf.app`. Si la necesitas, deberás cambiar a un generador de PDF diferente como Puppeteer o wkhtmltopdf.

---

**Archivo a modificar**: `plantilla-cotizacion-personalizada.html`
