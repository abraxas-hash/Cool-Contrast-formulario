# Guía de Integración - ORES Travel Forms

## 📋 Índice

1. [Introducción](#introducción)
2. [Integración de Formularios](#integración-de-formularios)
3. [Estructura de Datos](#estructura-de-datos)
4. [Validaciones](#validaciones)
5. [Manejo de Respuestas](#manejo-de-respuestas)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Testing](#testing)

---

## 🎯 Introducción

Esta guía explica cómo integrar nuevos formularios o modificar los existentes para que funcionen correctamente con el workflow de n8n.

### Requisitos Previos

- Conocimientos básicos de HTML, CSS y JavaScript
- Acceso al repositorio del proyecto
- URL del webhook de n8n
- Credenciales de acceso al sistema

---

## 🔗 Integración de Formularios

### Paso 1: Estructura HTML del Formulario

Todos los formularios deben seguir esta estructura básica:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario - ORES Travel</title>
    <style>
        /* Estilos del formulario */
    </style>
</head>
<body>
    <form id="miFormulario">
        <!-- Campos del formulario -->
        <button type="submit">Generar Cotización</button>
    </form>

    <script>
        // Lógica del formulario
    </script>
</body>
</html>
```

### Paso 2: Configurar el Endpoint

Define la URL del webhook al inicio del script:

```javascript
const WEBHOOK_URL = 'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf';
```

### Paso 3: Capturar el Evento Submit

```javascript
document.getElementById('miFormulario').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar datos
    if (!validarFormulario()) {
        return;
    }
    
    // Recopilar datos
    const datos = recopilarDatos();
    
    // Enviar al webhook
    await enviarAlWebhook(datos);
});
```

### Paso 4: Función de Validación

```javascript
function validarFormulario() {
    const nombreCliente = document.getElementById('nombre_cliente').value.trim();
    const email = document.getElementById('email').value.trim();
    const fechaViaje = document.getElementById('fecha_viaje').value;
    
    if (!nombreCliente) {
        alert('Por favor ingresa el nombre del cliente');
        return false;
    }
    
    if (!email) {
        alert('Por favor ingresa el email');
        return false;
    }
    
    if (!validarEmail(email)) {
        alert('Por favor ingresa un email válido');
        return false;
    }
    
    if (!fechaViaje) {
        alert('Por favor selecciona la fecha del viaje');
        return false;
    }
    
    return true;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

### Paso 5: Recopilar Datos

#### Para Programas Fijos:

```javascript
function recopilarDatos() {
    return {
        origen: 'formulario',
        tipo_tour: 'fijo',
        programa_seleccionado: document.getElementById('programa').value,
        nombre_cliente: document.getElementById('nombre_cliente').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        numero_personas: document.getElementById('numero_personas').value,
        fecha_viaje: document.getElementById('fecha_viaje').value,
        tipo_habitacion: document.getElementById('tipo_habitacion').value,
        categoria_hotel: document.getElementById('categoria_hotel').value,
        tipo_transporte: document.getElementById('tipo_transporte').value,
        precio_por_persona_tren: document.getElementById('precio_tren').value || '100',
        precio_total_tren: calcularPrecioTotalTren(),
        horario_ida_tren: document.getElementById('horario_ida').value || 'Por definir',
        horario_retorno_tren: document.getElementById('horario_retorno').value || 'Por definir',
        adelanto_pagado: document.getElementById('adelanto').value || '0',
        observaciones: document.getElementById('observaciones').value.trim(),
        timestamp: new Date().toISOString()
    };
}

function calcularPrecioTotalTren() {
    const precioPersona = parseFloat(document.getElementById('precio_tren').value) || 100;
    const numPersonas = parseInt(document.getElementById('numero_personas').value) || 1;
    return (precioPersona * numPersonas).toString();
}
```

#### Para Tours Personalizados:

```javascript
function recopilarDatos() {
    const actividadesSeleccionadas = obtenerActividadesSeleccionadas();
    const itinerario = generarItinerario(actividadesSeleccionadas);
    
    return {
        origen: 'formulario',
        tipo_tour: 'personalizado',
        actividades_seleccionadas: actividadesSeleccionadas,
        itinerario: itinerario,
        fecha_inicio: document.getElementById('fecha_inicio').value,
        tipo_transporte: document.getElementById('tipo_transporte').value,
        tipo_habitacion: document.getElementById('tipo_habitacion').value,
        categoria_hotel: document.getElementById('categoria_hotel').value,
        precio_total: parseFloat(document.getElementById('precio_total').value),
        nombre_cliente: document.getElementById('nombre_cliente').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        numero_personas: document.getElementById('numero_personas').value,
        adelanto_pagado: parseFloat(document.getElementById('adelanto').value) || 0,
        observaciones: document.getElementById('observaciones').value.trim(),
        timestamp: new Date().toISOString()
    };
}

function obtenerActividadesSeleccionadas() {
    const checkboxes = document.querySelectorAll('input[name="actividades"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function generarItinerario(actividades) {
    const fechaInicio = new Date(document.getElementById('fecha_inicio').value);
    return actividades.map((actividad, index) => {
        const fecha = new Date(fechaInicio);
        fecha.setDate(fecha.getDate() + index);
        return {
            dia: index + 1,
            fecha: formatearFecha(fecha),
            actividad: actividad
        };
    });
}

function formatearFecha(fecha) {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
}
```

### Paso 6: Enviar al Webhook

```javascript
async function enviarAlWebhook(datos) {
    // Mostrar loading
    mostrarLoading(true);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        // Ocultar loading
        mostrarLoading(false);
        
        // Manejar respuesta exitosa
        manejarRespuestaExitosa(resultado);
        
    } catch (error) {
        console.error('Error al enviar datos:', error);
        mostrarLoading(false);
        manejarError(error);
    }
}

function mostrarLoading(mostrar) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = mostrar ? 'flex' : 'none';
    }
}

function manejarRespuestaExitosa(resultado) {
    if (resultado.success) {
        // Mostrar modal de éxito
        mostrarModalExito(resultado);
    } else {
        // Mostrar error
        alert('Error al generar la cotización: ' + (resultado.mensaje || 'Error desconocido'));
    }
}

function manejarError(error) {
    alert('Error al conectar con el servidor. Por favor intenta nuevamente.');
    console.error('Detalles del error:', error);
}
```

### Paso 7: Modal de Respuesta

```javascript
function mostrarModalExito(resultado) {
    const modal = document.getElementById('modalExito');
    
    // Actualizar contenido del modal
    document.getElementById('tituloModal').textContent = resultado.mensaje.titulo;
    document.getElementById('contenidoModal').textContent = resultado.mensaje.contenido;
    document.getElementById('nombrePDF').textContent = resultado.pdf.nombre;
    
    // Configurar botones
    document.getElementById('btnDescargar').onclick = function() {
        window.open(resultado.pdf.download_url, '_blank');
    };
    
    document.getElementById('btnCompartir').onclick = function() {
        copiarAlPortapapeles(resultado.pdf.public_url);
    };
    
    document.getElementById('btnNuevaCotizacion').onclick = function() {
        cerrarModal();
        limpiarFormulario();
    };
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function copiarAlPortapapeles(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        alert('Enlace copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

function cerrarModal() {
    document.getElementById('modalExito').style.display = 'none';
}

function limpiarFormulario() {
    document.getElementById('miFormulario').reset();
}
```

---

## 📊 Estructura de Datos

### Campos Obligatorios (Todos los Formularios)

```javascript
{
  "origen": "formulario",              // Siempre "formulario"
  "tipo_tour": "fijo|personalizado",   // Tipo de tour
  "nombre_cliente": string,             // Nombre completo
  "email": string,                      // Email válido
  "telefono": string,                   // Teléfono con código país
  "numero_personas": string|number,     // Número de personas
  "fecha_viaje": string,                // Formato: YYYY-MM-DD
  "timestamp": string                   // ISO 8601
}
```

### Campos Específicos - Programas Fijos

```javascript
{
  "programa_seleccionado": string,      // Código del programa (ej: "3D2N")
  "tipo_habitacion": string,            // "Simple", "Doble", "Triple"
  "categoria_hotel": string,            // "3 estrellas", "4 estrellas", "5 estrellas"
  "tipo_transporte": string,            // "local" o "turistico"
  "precio_por_persona_tren": string,    // Precio por persona (USD)
  "precio_total_tren": string,          // Precio total tren (USD)
  "horario_ida_tren": string,           // Horario ida (HH:MM)
  "horario_retorno_tren": string,       // Horario retorno (HH:MM)
  "adelanto_pagado": string|number,     // Adelanto en soles
  "observaciones": string               // Observaciones adicionales
}
```

### Campos Específicos - Tours Personalizados

```javascript
{
  "actividades_seleccionadas": array,   // Array de códigos de actividades
  "itinerario": array,                  // Array de objetos {dia, fecha, actividad}
  "fecha_inicio": string,               // Fecha inicio (YYYY-MM-DD)
  "tipo_transporte": string,            // "local" o "turistico"
  "tipo_habitacion": string,            // Tipo de habitación
  "categoria_hotel": string,            // Categoría del hotel
  "precio_total": number,               // Precio total del programa
  "adelanto_pagado": number,            // Adelanto pagado
  "observaciones": string               // Observaciones
}
```

---

## ✅ Validaciones

### Validaciones del Cliente (JavaScript)

```javascript
const validaciones = {
    nombre_cliente: {
        requerido: true,
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        mensaje: 'El nombre debe contener solo letras y espacios'
    },
    
    email: {
        requerido: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        mensaje: 'Ingresa un email válido'
    },
    
    telefono: {
        requerido: true,
        pattern: /^\+?[0-9\s\-()]+$/,
        minLength: 9,
        mensaje: 'Ingresa un teléfono válido'
    },
    
    numero_personas: {
        requerido: true,
        min: 1,
        max: 20,
        type: 'number',
        mensaje: 'El número de personas debe estar entre 1 y 20'
    },
    
    fecha_viaje: {
        requerido: true,
        type: 'date',
        minDate: 'today',
        mensaje: 'La fecha debe ser futura'
    },
    
    precio_total: {
        requerido: true,
        min: 100,
        type: 'number',
        mensaje: 'El precio debe ser mayor a 100'
    }
};

function validarCampo(campo, valor) {
    const reglas = validaciones[campo];
    
    if (!reglas) return true;
    
    // Requerido
    if (reglas.requerido && !valor) {
        return { valido: false, mensaje: `${campo} es requerido` };
    }
    
    // Longitud mínima
    if (reglas.minLength && valor.length < reglas.minLength) {
        return { 
            valido: false, 
            mensaje: `${campo} debe tener al menos ${reglas.minLength} caracteres` 
        };
    }
    
    // Longitud máxima
    if (reglas.maxLength && valor.length > reglas.maxLength) {
        return { 
            valido: false, 
            mensaje: `${campo} no puede tener más de ${reglas.maxLength} caracteres` 
        };
    }
    
    // Patrón
    if (reglas.pattern && !reglas.pattern.test(valor)) {
        return { valido: false, mensaje: reglas.mensaje };
    }
    
    // Valor mínimo (números)
    if (reglas.min !== undefined && parseFloat(valor) < reglas.min) {
        return { 
            valido: false, 
            mensaje: `${campo} debe ser mayor o igual a ${reglas.min}` 
        };
    }
    
    // Valor máximo (números)
    if (reglas.max !== undefined && parseFloat(valor) > reglas.max) {
        return { 
            valido: false, 
            mensaje: `${campo} debe ser menor o igual a ${reglas.max}` 
        };
    }
    
    // Fecha mínima
    if (reglas.minDate === 'today') {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaIngresada = new Date(valor);
        
        if (fechaIngresada < hoy) {
            return { valido: false, mensaje: 'La fecha debe ser futura' };
        }
    }
    
    return { valido: true };
}
```

### Validaciones del Servidor (n8n)

El workflow valida automáticamente:

- ✅ Campos requeridos presentes
- ✅ Formato de fechas correcto
- ✅ Números válidos
- ✅ Programas existentes
- ✅ Actividades válidas

---

## 📥 Manejo de Respuestas

### Respuesta Exitosa

```javascript
{
  "success": true,
  "mensaje": {
    "titulo": "¡Cotización Generada Exitosamente!",
    "contenido": "Tu cotización para TOUR PERSONALIZADO ha sido generada."
  },
  "pdf": {
    "nombre": "Cotizacion_MARIA_GARCIA_20251201_1732567890123.pdf",
    "tipo": "TOUR PERSONALIZADO",
    "download_url": "https://docs.google.com/document/d/ABC123/export?format=pdf",
    "public_url": "https://docs.google.com/document/d/ABC123/edit",
    "id": "ABC123"
  },
  "acciones": {
    "descargar": { "texto": "📥 Descargar PDF" },
    "compartir": { "texto": "🔗 Compartir enlace" },
    "nueva_cotizacion": { "texto": "➕ Nueva cotización" }
  },
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

### Respuesta de Error

```javascript
{
  "success": false,
  "error": true,
  "mensaje": "Error en el procesamiento: Campo requerido faltante",
  "detalles": {
    "campo_faltante": "nombre_cliente",
    "tipo_error": "validacion"
  },
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

---

## 💻 Ejemplos de Código

### Ejemplo Completo: Formulario de Programa Fijo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Programa Fijo - ORES Travel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #0056b3;
        }
        .loading {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <h1>Cotización - Programa Fijo</h1>
    
    <form id="formProgramaFijo">
        <div class="form-group">
            <label>Programa:</label>
            <select id="programa" required>
                <option value="">Selecciona un programa</option>
                <option value="3D2N">3D/2N - Básico Machu Picchu (S/. 420)</option>
                <option value="4D3N">4D/3N - Valle VIP (S/. 520)</option>
                <option value="5D4N">5D/4N - Montaña Colores (S/. 590)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Nombre del Cliente:</label>
            <input type="text" id="nombre_cliente" required>
        </div>
        
        <div class="form-group">
            <label>Email:</label>
            <input type="email" id="email" required>
        </div>
        
        <div class="form-group">
            <label>Teléfono:</label>
            <input type="tel" id="telefono" required>
        </div>
        
        <div class="form-group">
            <label>Número de Personas:</label>
            <input type="number" id="numero_personas" min="1" max="20" required>
        </div>
        
        <div class="form-group">
            <label>Fecha de Viaje:</label>
            <input type="date" id="fecha_viaje" required>
        </div>
        
        <div class="form-group">
            <label>Tipo de Habitación:</label>
            <select id="tipo_habitacion" required>
                <option value="Simple">Simple</option>
                <option value="Doble">Doble</option>
                <option value="Triple">Triple</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Tipo de Transporte:</label>
            <select id="tipo_transporte" required>
                <option value="local">Tren Local</option>
                <option value="turistico">Tren Turístico</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Observaciones:</label>
            <textarea id="observaciones" rows="4"></textarea>
        </div>
        
        <button type="submit">Generar Cotización</button>
    </form>
    
    <div id="loading" class="loading">
        <div>Generando cotización...</div>
    </div>
    
    <script>
        const WEBHOOK_URL = 'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf';
        
        document.getElementById('formProgramaFijo').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const datos = {
                origen: 'formulario',
                tipo_tour: 'fijo',
                programa_seleccionado: document.getElementById('programa').value,
                nombre_cliente: document.getElementById('nombre_cliente').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                email: document.getElementById('email').value.trim(),
                numero_personas: document.getElementById('numero_personas').value,
                fecha_viaje: document.getElementById('fecha_viaje').value,
                tipo_habitacion: document.getElementById('tipo_habitacion').value,
                categoria_hotel: '3 estrellas',
                tipo_transporte: document.getElementById('tipo_transporte').value,
                observaciones: document.getElementById('observaciones').value.trim(),
                timestamp: new Date().toISOString()
            };
            
            document.getElementById('loading').style.display = 'flex';
            
            try {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datos)
                });
                
                const resultado = await response.json();
                
                document.getElementById('loading').style.display = 'none';
                
                if (resultado.success) {
                    alert('¡Cotización generada exitosamente!');
                    window.open(resultado.pdf.download_url, '_blank');
                } else {
                    alert('Error: ' + resultado.mensaje);
                }
                
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                alert('Error al conectar con el servidor');
                console.error(error);
            }
        });
    </script>
</body>
</html>
```

---

## 🧪 Testing

### Test Manual

1. **Abrir el formulario** en el navegador
2. **Llenar todos los campos** requeridos
3. **Enviar el formulario**
4. **Verificar**:
   - Loading aparece
   - Respuesta exitosa
   - PDF se genera
   - Enlaces funcionan

### Test con Postman

```json
POST https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf

Headers:
Content-Type: application/json

Body:
{
  "origen": "formulario",
  "tipo_tour": "fijo",
  "programa_seleccionado": "3D2N",
  "nombre_cliente": "Test Usuario",
  "email": "test@example.com",
  "telefono": "+51 999 999 999",
  "numero_personas": "2",
  "fecha_viaje": "2025-12-01",
  "tipo_habitacion": "Doble",
  "categoria_hotel": "3 estrellas",
  "tipo_transporte": "local",
  "observaciones": "Test",
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

### Checklist de Testing

- [ ] Validaciones del cliente funcionan
- [ ] Datos se envían correctamente
- [ ] Loading aparece y desaparece
- [ ] Respuesta exitosa muestra modal
- [ ] PDF se genera correctamente
- [ ] Enlaces de descarga funcionan
- [ ] Botón compartir copia enlace
- [ ] Botón nueva cotización limpia formulario
- [ ] Errores se manejan correctamente
- [ ] CORS configurado correctamente

---

## 📞 Soporte

Si tienes problemas con la integración:

1. Revisa los logs del navegador (F12 → Console)
2. Verifica los logs de n8n
3. Contacta al equipo técnico

---

**Última actualización**: Noviembre 2025  
**Mantenido por**: ORES Travel Peru
