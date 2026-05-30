# API Reference - Andean Journey Forms

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Endpoint Principal](#endpoint-principal)
3. [Autenticación](#autenticación)
4. [Tipos de Tour](#tipos-de-tour)
5. [Esquemas de Datos](#esquemas-de-datos)
6. [Respuestas](#respuestas)
7. [Códigos de Error](#códigos-de-error)
8. [Ejemplos](#ejemplos)

---

## 🎯 Descripción General

La API de Andean Journey Forms permite generar cotizaciones turísticas personalizadas en formato PDF a través de un webhook de n8n.

### Base URL

```
https://hvh-n8n.2ulbdq.easypanel.host
```

### Versión

**v1.0** (Noviembre 2025)

---

## 🔗 Endpoint Principal

### Generar PDF

Genera una cotización en formato PDF y la almacena en Google Drive.

```http
POST /webhook/generar-pdf
```

#### Headers

```http
Content-Type: application/json
Accept: application/json
```

#### CORS

El endpoint soporta CORS con los siguientes headers:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🔐 Autenticación

**No se requiere autenticación** para este endpoint público.

> **Nota**: En producción se recomienda implementar autenticación mediante API Key o JWT.

---

## 🎨 Tipos de Tour

### Tour Personalizado

Tours creados a medida con actividades seleccionadas por el cliente.

**Identificador**: `"tipo_tour": "personalizado"`

**Características**:
- 26 actividades disponibles
- Itinerario personalizado
- Fechas flexibles
- Precios calculados dinámicamente

### Programa Fijo

Programas predefinidos con itinerario y precio establecido.

**Identificador**: `"tipo_tour": "fijo"`

**Características**:
- 10 programas disponibles
- Itinerario predefinido
- Precios base fijos
- Templates de Google Docs

---

## 📊 Esquemas de Datos

### Programa Fijo

#### Request Body

```json
{
  "origen": "formulario",
  "tipo_tour": "fijo",
  "programa_seleccionado": "3D2N",
  "nombre_cliente": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+51 999 999 999",
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
  "observaciones": "Cliente prefiere hotel cerca del centro",
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `origen` | string | ✅ | Siempre "formulario" |
| `tipo_tour` | string | ✅ | "fijo" para programas fijos |
| `programa_seleccionado` | string | ✅ | Código del programa (ver tabla) |
| `nombre_cliente` | string | ✅ | Nombre completo del cliente |
| `email` | string | ✅ | Email válido |
| `telefono` | string | ✅ | Teléfono con código país |
| `numero_personas` | string | ✅ | Número de personas (1-20) |
| `fecha_viaje` | string | ✅ | Fecha en formato YYYY-MM-DD |
| `tipo_habitacion` | string | ✅ | "Simple", "Doble", "Triple" |
| `categoria_hotel` | string | ✅ | "3 estrellas", "4 estrellas", "5 estrellas" |
| `tipo_transporte` | string | ✅ | "local" o "turistico" |
| `precio_por_persona_tren` | string | ❌ | Precio por persona USD (default: "100") |
| `precio_total_tren` | string | ❌ | Precio total tren USD |
| `horario_ida_tren` | string | ❌ | Horario ida HH:MM |
| `horario_retorno_tren` | string | ❌ | Horario retorno HH:MM |
| `adelanto_pagado` | string | ❌ | Adelanto en soles (default: "0") |
| `observaciones` | string | ❌ | Observaciones adicionales |
| `timestamp` | string | ✅ | ISO 8601 timestamp |

#### Programas Disponibles

| Código | Nombre | Días/Noches | Precio Base |
|--------|--------|-------------|-------------|
| `3D2N` | Aventura Cusqueña - Básico Machu Picchu | 3D/2N | S/. 420 |
| `4D3N` | Aventura Cusqueña - Valle VIP Machu Picchu | 4D/3N | S/. 520 |
| `5D4N` | Aventura Cusqueña - Montaña Colores Completo | 5D/4N | S/. 590 |
| `6D5N_HUMANTAY` | Aventura Cusqueña - Laguna Humantay Completo | 6D/5N | S/. 690 |
| `6D5N` | Aventura Cusqueña - Místico Valle Sur | 6D/5N | S/. 690 |
| `7D6N` | Aventura Cusqueña - Valle Sur Completo | 7D/6N | S/. 790 |
| `8D7N` | Aventura Cusqueña - Místico Sur Premium | 8D/7N | S/. 890 |
| `10D9N` | Aventura Cusqueña - Premium Completo Tren Local | 10D/9N | S/. 1,180 |
| `TOURS_SIN_MAPI_4D4N` | Tours Sin Mapi - Valle VIP Sin Ingreso | 4D/4N | S/. 550 |
| `TOURS_SIN_MAPI_5D5N` | Tours Sin Mapi - Ida Aguas Calientes | 5D/5N | S/. 550 |

---

### Tour Personalizado

#### Request Body

```json
{
  "origen": "formulario",
  "tipo_tour": "personalizado",
  "actividades_seleccionadas": ["LLEGADA", "CITY", "MAPI", "SALIDA"],
  "itinerario": [
    { "dia": 1, "fecha": "01/12/2025", "actividad": "LLEGADA" },
    { "dia": 2, "fecha": "02/12/2025", "actividad": "CITY" },
    { "dia": 3, "fecha": "03/12/2025", "actividad": "MAPI" },
    { "dia": 4, "fecha": "04/12/2025", "actividad": "SALIDA" }
  ],
  "fecha_inicio": "2025-12-01",
  "tipo_transporte": "local",
  "tipo_habitacion": "Doble",
  "categoria_hotel": "3 estrellas",
  "precio_total": 1500,
  "nombre_cliente": "María García",
  "email": "maria@example.com",
  "telefono": "+51 987 654 321",
  "numero_personas": "2",
  "adelanto_pagado": 450,
  "observaciones": "Cliente vegetariano",
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `origen` | string | ✅ | Siempre "formulario" |
| `tipo_tour` | string | ✅ | "personalizado" para tours custom |
| `actividades_seleccionadas` | array | ✅ | Array de códigos de actividades |
| `itinerario` | array | ✅ | Array de objetos {dia, fecha, actividad} |
| `fecha_inicio` | string | ✅ | Fecha inicio YYYY-MM-DD |
| `tipo_transporte` | string | ✅ | "local" o "turistico" |
| `tipo_habitacion` | string | ✅ | Tipo de habitación |
| `categoria_hotel` | string | ✅ | Categoría del hotel |
| `precio_total` | number | ✅ | Precio total del programa |
| `nombre_cliente` | string | ✅ | Nombre completo |
| `email` | string | ✅ | Email válido |
| `telefono` | string | ✅ | Teléfono con código país |
| `numero_personas` | string | ✅ | Número de personas |
| `adelanto_pagado` | number | ❌ | Adelanto pagado (default: 0) |
| `observaciones` | string | ❌ | Observaciones |
| `timestamp` | string | ✅ | ISO 8601 timestamp |

#### Actividades Disponibles

| Código | Nombre |
|--------|--------|
| `LLEGADA` | Llegada al Cusco |
| `LLEGADA+CITY` | Llegada + City Tour |
| `CITY` | City Tour Cusco |
| `MONTAÑA` | Montaña de 7 Colores |
| `LAGUNA` | Laguna Humantay |
| `WAQRAPUKARA` | Waqrapukara |
| `7 LAGUNA` | 7 Lagunas de Ausangate |
| `VALLE+MAPI` | Valle Sagrado + Machu Picchu |
| `MAPI 3 AM` | Machu Picchu Amanecer |
| `VALLE+PISAC` | Valle + Pisac |
| `VALLE+OLLANTAY` | Valle + Ollantaytambo |
| `OLLANTAY-IDA` | Ollantaytambo Ida |
| `IDA-CUZ` | Ida Cusco - Aguas Calientes |
| `MAPI` | Machu Picchu |
| `MONTAÑA+CUATRI` | Montaña + Cuatrimoto |
| `PUENTE` | Puente Inca Q'eswachaka |
| `MORADA-BUS` | Morada de los Dioses Bus |
| `MORADA-CUATRI` | Morada de los Dioses Cuatri |
| `MORADA-CUATRI-LAGU` | Morada Cuatri + Laguna |
| `FULL MAPI` | Full Day Machu Picchu |
| `PALCOYO` | Montaña Palcoyo |
| `LIBRE-SIN GUIA` | Día Libre |
| `FOTOGRAFIA` | Tour Fotográfico |
| `MISTICO` | Tour Místico |
| `SUR` | Valle Sur |
| `SALIDA` | Salida de Cusco |

---

## ✅ Respuestas

### Respuesta Exitosa

**Status Code**: `200 OK`

```json
{
  "success": true,
  "mensaje": {
    "titulo": "¡Cotización Generada Exitosamente!",
    "contenido": "Tu cotización para TOUR PERSONALIZADO ha sido generada.\nPuedes descargar el PDF o compartirlo directamente."
  },
  "pdf": {
    "nombre": "Cotizacion_MARIA_GARCIA_20251201_1732567890123.pdf",
    "tipo": "TOUR PERSONALIZADO",
    "download_url": "https://docs.google.com/document/d/ABC123/export?format=pdf&usp=drivesdk",
    "public_url": "https://docs.google.com/document/d/ABC123/edit",
    "id": "ABC123"
  },
  "acciones": {
    "descargar": {
      "texto": "📥 Descargar PDF"
    },
    "compartir": {
      "texto": "🔗 Compartir enlace"
    },
    "nueva_cotizacion": {
      "texto": "➕ Nueva cotización"
    }
  },
  "timestamp": "2025-11-25T23:00:00.000Z"
}
```

### Respuesta de Error

**Status Code**: `400 Bad Request` o `500 Internal Server Error`

```json
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

## ❌ Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Bad Request - Datos inválidos | Verificar formato de datos |
| `404` | Not Found - Endpoint no existe | Verificar URL |
| `422` | Unprocessable Entity - Validación fallida | Revisar campos requeridos |
| `500` | Internal Server Error - Error del servidor | Contactar soporte |
| `503` | Service Unavailable - Servicio no disponible | Reintentar más tarde |

### Errores Comunes

#### Campo Requerido Faltante

```json
{
  "error": true,
  "mensaje": "Campo requerido faltante: nombre_cliente"
}
```

#### Programa No Encontrado

```json
{
  "error": true,
  "mensaje": "Programa no encontrado: INVALID_CODE"
}
```

#### Actividad No Válida

```json
{
  "error": true,
  "mensaje": "Actividad no válida: INVALID_ACTIVITY"
}
```

#### Fecha Inválida

```json
{
  "error": true,
  "mensaje": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

---

## 💡 Ejemplos

### Ejemplo 1: Programa Fijo con cURL

```bash
curl -X POST https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "origen": "formulario",
    "tipo_tour": "fijo",
    "programa_seleccionado": "3D2N",
    "nombre_cliente": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+51 999 999 999",
    "numero_personas": "2",
    "fecha_viaje": "2025-12-01",
    "tipo_habitacion": "Doble",
    "categoria_hotel": "3 estrellas",
    "tipo_transporte": "local",
    "observaciones": "Test",
    "timestamp": "2025-11-25T23:00:00.000Z"
  }'
```

### Ejemplo 2: Tour Personalizado con JavaScript

```javascript
const datos = {
  origen: 'formulario',
  tipo_tour: 'personalizado',
  actividades_seleccionadas: ['LLEGADA', 'CITY', 'MAPI', 'SALIDA'],
  itinerario: [
    { dia: 1, fecha: '01/12/2025', actividad: 'LLEGADA' },
    { dia: 2, fecha: '02/12/2025', actividad: 'CITY' },
    { dia: 3, fecha: '03/12/2025', actividad: 'MAPI' },
    { dia: 4, fecha: '04/12/2025', actividad: 'SALIDA' }
  ],
  fecha_inicio: '2025-12-01',
  tipo_transporte: 'local',
  tipo_habitacion: 'Doble',
  categoria_hotel: '3 estrellas',
  precio_total: 1500,
  nombre_cliente: 'María García',
  email: 'maria@example.com',
  telefono: '+51 987 654 321',
  numero_personas: '2',
  adelanto_pagado: 450,
  timestamp: new Date().toISOString()
};

fetch('https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(datos)
})
.then(response => response.json())
.then(resultado => {
  if (resultado.success) {
    console.log('PDF generado:', resultado.pdf.download_url);
  } else {
    console.error('Error:', resultado.mensaje);
  }
})
.catch(error => console.error('Error de red:', error));
```

### Ejemplo 3: Python

```python
import requests
import json
from datetime import datetime

url = 'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf'

datos = {
    'origen': 'formulario',
    'tipo_tour': 'fijo',
    'programa_seleccionado': '4D3N',
    'nombre_cliente': 'Carlos Rodríguez',
    'email': 'carlos@example.com',
    'telefono': '+51 999 888 777',
    'numero_personas': '3',
    'fecha_viaje': '2025-12-15',
    'tipo_habitacion': 'Triple',
    'categoria_hotel': '4 estrellas',
    'tipo_transporte': 'turistico',
    'precio_por_persona_tren': '100',
    'precio_total_tren': '300',
    'timestamp': datetime.now().isoformat()
}

headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, json=datos, headers=headers)

if response.status_code == 200:
    resultado = response.json()
    if resultado['success']:
        print(f"PDF generado: {resultado['pdf']['download_url']}")
    else:
        print(f"Error: {resultado['mensaje']}")
else:
    print(f"Error HTTP: {response.status_code}")
```

---

## 📝 Notas Adicionales

### Rate Limiting

Actualmente **no hay límite de requests**, pero se recomienda no exceder **10 requests por minuto** por IP.

### Timeout

El timeout del webhook es de **120 segundos**. Si la generación del PDF toma más tiempo, se retornará un error de timeout.

### Tamaño Máximo

El tamaño máximo del request body es **10 MB**.

### Formato de Fechas

Todas las fechas deben estar en formato **ISO 8601** (`YYYY-MM-DD`) o formato local (`DD/MM/YYYY`).

---

## 📞 Soporte

Para soporte técnico de la API:

- **Email**: info@andeanjourney.com
- **Teléfono**: +51 918 818 503

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Mantenido por**: Andean Journey Peru
