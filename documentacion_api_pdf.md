# Documentación: Microservicio Generador de PDF (Puppeteer + Express)

## 📌 1. Objetivo y Arquitectura
Este microservicio fue diseñado para reemplazar APIs externas de generación de PDF. Toma código HTML dinámico mediante una petición HTTP POST, utiliza Chrome Headless (Puppeteer) para renderizarlo y devuelve el archivo binario del PDF puro.

- **Ventajas:** Cero costo por generación, sin límite de peticiones (sujeto al hardware propio), máxima flexibilidad de diseño con motores de plantillas HTML/CSS.
- **Hardware recomendado:** VPS con al menos 2GB-4GB de RAM.
- **Seguridad y Estabilidad:**
  - **Control de concurrencia:** Procesa 1 petición a la vez para no colapsar la memoria RAM.
  - **Límite de payload:** Ampliado a 50MB en el cuerpo del JSON para procesar reportes en HTML muy pesados sin lanzar error de conexión.

---

## ⚙️ 2. Prerrequisitos e Instalación en VPS (Ubuntu/Debian)

### Prepara el Entorno (Node.js y Dependencias)
```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar dependencias gráficas que exige Puppeteer/Chromium en entornos Linux sin pantalla
apt install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

### Inicializa el Proyecto
```bash
# Crear directorio principal
mkdir ~/api-pdf && cd ~/api-pdf

# Iniciar package.json e instalar los conectores
npm init -y
npm install express puppeteer
npm install -g pm2
```

---

## 📝 3. Código Fuente (`index.js`)

Se debe crear el archivo principal en `/root/api-pdf/index.js` (siendo administrador) con este código.

```javascript
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 4000;

// Configuración para recibir JSON grande (hasta 50mb de HTML)
app.use(express.json({ limit: '50mb' }));

// Prevención de cuellos de botella: mantener un solo navegador activo y limitar procesos en paralelo
let browserInstance = null;
let isProcessing = false;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new', // Modo Headless nativo
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
    }
    return browserInstance;
}

app.post('/pdf', async (req, res) => {
    const html = req.body.html;

    if (!html) {
        return res.status(400).send('Error: Falta el campo "html" en la entrada del JSON.');
    }

    if (isProcessing) {
        return res.status(429).send('Error: El servidor está ocupado generando otro documento. Inténtelo en breve.');
    }

    isProcessing = true;
    let page = null;

    try {
        const browser = await getBrowser();
        page = await browser.newPage();

        // Carga el código HTML con un máximo de tolerancia de 30 segundos
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

        // Imprime el bloque en formado A4 estándar
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Crucial para mostrar colores y CSS correctamente
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        // Configuración de Headers indicando que es un archivo PDF de descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
        res.send(Buffer.from(pdfBuffer)); // Salida de la data binaria

    } catch (error) {
        console.error('Error procesando el archivo:', error);
        res.status(500).send('Error interno al generar el PDF.');
    } finally {
        // Cierre mandatorio de la pestaña para EVITAR fugas de memoria (RAM Leaks)
        if (page) await page.close(); 
        isProcessing = false;
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Generador interno de PDFs escuchando sobre el puerto ${PORT}`);
});
```

---

## 🚀 4. Despliegue Continuo con PM2 (24/7)

Hacemos que el programa viva de forma silenciosa para que esté disponible a todas horas incluso si el ingeniero cierra la consola.

```bash
# Arrancar el servidor nombrándolo para ubicarlo fácil
pm2 start index.js --name "api-pdf"

# Forzar el encendido de esta API si el VPS Linux se reinicia físicamente
pm2 startup
pm2 save

# Comandos críticos para mantenimiento
pm2 status          # Ver el estado operativo
pm2 logs api-pdf    # Leer los logs o errores generados en vivo
pm2 restart api-pdf # Reiniciar manualmente el servicio
```

---

## 🌐 5. Consumo de la API Interna en n8n

Para empujar cualquier flujo HTML a la API desde `n8n`, se utiliza el clásico nodo **HTTP Request** con esta magia paramétrica específica:

### Interfaz del Nodo
- **Method:** `POST`
- **URL:** `http://[IP_PUBLICA_DEL_VPS]:4000/pdf`  *(Nota: Se usa el puerto 4000 en base al index.js para evitar conflictos con otras dBs)*.
- **Body Content Type:** `RAW/Custom`  *(Oligatorio, nunca poner JSON)*
- **Send Body:** Expresión cruda directamente como texto para emular un JSON:
```json
={{ { "html": $json.html } }}
```
*(Importante: Si envías como RAW JSON puro y tu HTML tiene saltos de línea y muchísimas propiedades, n8n suele trabarse al convertirlo desde el formato objeto al binario. Pasarlo por Object en Expression `{{}}` resuelve los strings.)*

### Configuración del Formato (`Options` / `Response`)
Para garantizar que la respuesta PDF generada no sea catalogada textualmente, debes:
1. Ir a **Options** (añadir Opción).
2. Seleccionar la sección **Response**.
3. **Response Format:** `File` (cambiar el Autodetect por este).
4. **Put Output File in Field** o **Output Data Property Name:** `data` (suele ser el default).

🔹 **Resultado:** En el output te va colar limpiamente el binario empaquetado bajo la propiedad "data". El siguiente bloque (sea Telegram, SendGrid o **Google Drive**) va a subir nativamente el PDF leyendo esa propiedad sin necesidad de hacer conversiones extras.
