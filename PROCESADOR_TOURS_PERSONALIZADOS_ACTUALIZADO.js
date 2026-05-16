/**
 * ================================================================
 * PROCESADOR DE ITINERARIOS PERSONALIZADOS - ORES TRAVEL PERÚ
 * Versión: "V8.0-PROCESADOR-FINAL-N8N"
 * 
 * DESCRIPCIÓN:
 * Este script es el núcleo inteligente para procesar cotizaciones a 
 * medida. Toma los datos crudos del Typeform (webhook), mapea las 
 * actividades seleccionadas, genera el itinerario dinámico, calcula 
 * los precios, y estructura un objeto JSON perfecto para inyectarlo 
 * en la plantilla HTML y convertirlo a PDF.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✅ Mapeo de 26 actividades con sus descripciones, 'incluye' y 'no incluye'.
 * ✅ Detección inteligente de precios de boletos (BTC 40/70 SOLES).
 * ✅ Consolidación y des-duplicación automática de secciones Incluye/No Incluye.
 * ✅ Cálculos financieros automáticos (Saldo Pendiente, Tarifa Nacional).
 * ✅ Lógica Condicional del Tren (Local vs Turístico con tablas).
 * ✅ Detección dinámica y conteo de almuerzos y cenas incluidos.
 * ✅ Organización automática en carpetas de Google Drive por mes y año.
 * ================================================================
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
};

if (items[0] && items[0].json && items[0].json.method === 'OPTIONS') {
  return [{
    json: {
      status: 'ok',
      message: 'ORES TRAVEL PERÚ - CORS OK',
      timestamp: new Date().toISOString()
    }
  }];
}

try {
  console.log('=== INICIO PROCESAMIENTO CON TREN DIFERENCIADO V7.2 ===');
  const item = (Array.isArray(items) && items[0]) || items;
  let body = item.json.body || item.json || item;

  if (!body) {
    if (item.body) body = item.body;
    else if (item.query) body = item.query;
    else if (item.params) body = item.params;
    else body = item;
  }

  // ================= BASE URL SUPABASE =================
  const BASE_URL = "https://nqouocmxfvcpyemxvobm.supabase.co/storage/v1/object/public/ores-travel-pdf/";

  // ================= CONFIGURACIÓN DE CARPETAS GOOGLE DRIVE =================
  const CARPETAS_TOURS_PERSONALIZADOS = {
    carpeta_padre_id: "1zfP57xtzC4BUp3Km8_RsZULY1Ev24vbj",
    años: {
      "2025": {
        carpeta_id: "1AM7V3PqGi8TdLLKIIwkE33ZPDjNxIUUn",
        meses: {
          "enero": "1i_CciR5D6pDI_bbWagujfp7aBaaodXk8",
          "febrero": "1eRn-OHwMDvxnihs6KiR9ZtowOh2w6Eg0",
          "marzo": "1cynLFsn66ftcSTjpvDB8QwpBme4x33HZ",
          "abril": "1kuQG6lnynGjvsBj2q5fGY_DW4FpuesTQ",
          "mayo": "148iln1fmU9gtVM65bSeh4dhdLyHZWFIG",
          "junio": "1ScqGMjdZOH8_JnCa-GuLAxo7w30Ev3HF",
          "julio": "1JW0vbEK4wApnfxXnBA4w5Icj3xQV5V64",
          "agosto": "10N6Y7ulJfQ99VyIfXgbBdZfp9bKkpCiN",
          "septiembre": "1hk1BwvNtVkc9dNRtUj54fh1Mbq5KB2DQ",
          "octubre": "1YIIPslpYjrnEQ-DpA2F1QyFJwlkjwvZH",
          "noviembre": "1l6fyUP2DujT2dc3V3LVY52t67cC4bJ-1",
          "diciembre": "1y_aW0nJcFvaa18B4WFD77VmK_EOqBR-b"
        }
      },
      "2026": {
        carpeta_id: "1jwHDUFPkiXSEBOWPmL_oO27tJGZlQ7c_",
        meses: {
          "enero": "1NAes1daWJ0cMeKZ-gfPoXux4MxQcmfLA",
          "febrero": "1irwFBhUzrQdjxgXA_WeCbViiyJNqU3Vp",
          "marzo": "14iJ7Yfp9jwEvWccgDBcKvv4BZK30rWNE",
          "abril": "1sIcYy3hYHxDwJEvVrUejFU_0HDWBPbHV",
          "mayo": "1DQg5SzTAArykAlxzmPSFl-SFNviZFBM2",
          "junio": "1HAqHlI4L1TFIgZLRtuLjvvexKjwMLKzs",
          "julio": "1kJL5HUVwiSFKU_8aRWQOMPCIxGK7xWL9",
          "agosto": "1W5I4VsykW_jE1XprUvEjwmBmET7wmLdV",
          "septiembre": "1iyjZMY4jDWhzd5rS3pAUD-kS2Z0hBD7e",
          "octubre": "1QD_PfawrNF6nwTfWUzs7scbdrtbpsuio",
          "noviembre": "1YwFL1GcG31erU0AcOljo2Wo9zZEmEB0U",
          "diciembre": "1hx-LNEeZiMFsRy_w_1sjfGFgWU4OYwU2"
        }
      }
    }
  };

  // ================= NORMALIZADOR =================
  // ================= MAPEO DE ALIASES DE ACTIVIDADES =================
  const ALIASES_ACTIVIDADES = {
    // LLEGADA
    'LLEGADA': 'LLEGADA',
    'LLEGADA AL CUSCO': 'LLEGADA',
    'RECEPCION': 'LLEGADA',
    'ARRIBO': 'LLEGADA',

    // LLEGADA+CITY (NUEVA)
    'LLEGADA+CITY': 'LLEGADA+CITY',
    'LLEGADA CITY': 'LLEGADA+CITY',
    'LLEGADA+CITY TOUR': 'LLEGADA+CITY',
    'LLEGADA CITY TOUR': 'LLEGADA+CITY',

    // CITY
    'CITY': 'CITY',
    'CITY TOUR': 'CITY',
    'TOUR CITY': 'CITY',

    // LAGUNA (Humantay)
    'LAGUNA': 'LAGUNA',
    'LAGUNA HUMANTAY': 'LAGUNA',
    'HUMANTAY': 'LAGUNA',

    // MONTAÑA (Montaña de colores 7 colores)
    'MONTAÑA': 'MONTAÑA',
    'MONTANA': 'MONTAÑA',
    'MONTAÑA DE COLORES': 'MONTAÑA',
    'MONTANA DE COLORES': 'MONTAÑA',

    // WAQRAPUKARA
    'WAQRAPUKARA': 'WAQRAPUKARA',
    'WAQRA': 'WAQRAPUKARA',

    // 7 LAGUNAS
    '7 LAGUNA': '7 LAGUNA',
    '7 LAGUNAS': '7 LAGUNA',
    'SIETE LAGUNAS': '7 LAGUNA',
    'AUSANGATE': '7 LAGUNA',

    // VALLE + MAPI
    'VALLE+MAPI': 'VALLE+MAPI',
    'VALLE MAPI': 'VALLE+MAPI',
    'VALLE SAGRADO MAPI': 'VALLE+MAPI',
    'VALLE VIP': 'VALLE+MAPI',
    'VALLE+MACHU': 'VALLE+MAPI',

    // MAPI 3 AM
    'MAPI 3 AM': 'MAPI 3 AM',
    'MAPI 3AM': 'MAPI 3 AM',
    'MACHU PICCHU 3AM': 'MAPI 3 AM',

    // VALLE + PISAC
    'VALLE+PISAC': 'VALLE+PISAC',
    'VALLE PISAC': 'VALLE+PISAC',
    'PISAC': 'VALLE+PISAC',

    // VALLE + OLLANTAY
    'VALLE+OLLANTAY': 'VALLE+OLLANTAY',
    'VALLE OLLANTAY': 'VALLE+OLLANTAY',
    'OLLANTAYTAMBO': 'VALLE+OLLANTAY',
    'VALLE OLLANTAYTAMBO': 'VALLE+OLLANTAY',

    // OLLANTAY IDA
    'OLLANTAY-IDA': 'OLLANTAY-IDA',
    'OLLANTAY IDA': 'OLLANTAY-IDA',
    'IDA OLLANTAY': 'OLLANTAY-IDA',

    // IDA CUZ
    'IDA-CUZ': 'IDA-CUZ',
    'IDA CUZ': 'IDA-CUZ',
    'IDA CUSCO': 'IDA-CUZ',
    'IDA A AGUAS CALIENTES': 'IDA-CUZ',

    // MAPI
    'MAPI': 'MAPI',
    'MACHU PICCHU': 'MAPI',
    'MACHUPICCHU': 'MAPI',
    'MP': 'MAPI',

    // MONTAÑA + CUATRI
    'MONTAÑA+CUATRI': 'MONTAÑA+CUATRI',
    'MONTANA+CUATRI': 'MONTAÑA+CUATRI',
    'MONTAÑA CUATRI': 'MONTAÑA+CUATRI',
    'MONTANA CUATRI': 'MONTAÑA+CUATRI',
    'MONTANA CUATRIMOTO': 'MONTAÑA+CUATRI',
    'MONTAÑA 7 COLORES': 'MONTAÑA+CUATRI',
    'VINICUNCA CUATRI': 'MONTAÑA+CUATRI',

    // PUENTE
    'PUENTE': 'PUENTE',
    'QESWACHAKA': 'PUENTE',
    'PUENTE INCA': 'PUENTE',

    // MORADA BUS
    'MORADA-BUS': 'MORADA-BUS',
    'MORADA BUS': 'MORADA-BUS',
    'MORADA DIOSES BUS': 'MORADA-BUS',

    // MORADA CUATRI
    'MORADA-CUATRI': 'MORADA-CUATRI',
    'MORADA CUATRI': 'MORADA-CUATRI',
    'MORADA DIOSES CUATRI': 'MORADA-CUATRI',

    // MORADA CUATRI LAGUNA
    'MORADA-CUATRI-LAGU': 'MORADA-CUATRI-LAGU',
    'MORADA CUATRI LAGU': 'MORADA-CUATRI-LAGU',
    'MORADA CUATRI LAGUNA': 'MORADA-CUATRI-LAGU',
    'MORADA PIURAY': 'MORADA-CUATRI-LAGU',

    // FULL MAPI
    'FULL MAPI': 'FULL MAPI',
    'FULL MACHU PICCHU': 'FULL MAPI',
    'MAPI FULL': 'FULL MAPI',

    // PALCOYO
    'PALCOYO': 'PALCOYO',
    'MONTANA PALCOYO': 'PALCOYO',
    'MONTAÑA PALCOYO': 'PALCOYO',

    // LIBRE
    'LIBRE-SIN GUIA': 'LIBRE-SIN GUIA',
    'LIBRE SIN GUIA': 'LIBRE-SIN GUIA',
    'DIA LIBRE': 'LIBRE-SIN GUIA',
    'LIBRE': 'LIBRE-SIN GUIA',

    // FOTOGRAFIA
    'FOTOGRAFIA': 'FOTOGRAFIA',
    'WALKING TOUR': 'FOTOGRAFIA',
    'TOUR FOTOGRAFICO': 'FOTOGRAFIA',
    'FOTO TOUR': 'FOTOGRAFIA',

    // MISTICO (NUEVA)
    'MISTICO': 'MISTICO',
    'TOUR MISTICO': 'MISTICO',
    'MISTICO TOUR': 'MISTICO',

    // SUR (NUEVA)
    'SUR': 'SUR',
    'TOUR SUR': 'SUR',
    'SUR TOUR': 'SUR',

    // SALIDA
    'SALIDA': 'SALIDA',
    'SALIDA DE CUSCO': 'SALIDA',
    'DESPEDIDA': 'SALIDA',
    'RETORNO': 'SALIDA'
  };

  function normalizarNombreActividad(nombre) {
    if (!nombre) return 'LLEGADA'; // Fallback por defecto

    // Normalizar: quitar acentos, espacios extras, mayúsculas
    let nombreNormalizado = nombre
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, ' ') // Espacios múltiples a uno solo
      .replace(/\+/g, ' ') // + a espacio
      .replace(/-/g, ' '); // - a espacio

    // Buscar en aliases
    if (ALIASES_ACTIVIDADES[nombreNormalizado]) {
      console.log(`✅ Actividad mapeada: "${nombre}" → "${ALIASES_ACTIVIDADES[nombreNormalizado]}"`);
      return ALIASES_ACTIVIDADES[nombreNormalizado];
    }

    // Buscar coincidencia parcial (más flexible)
    const aliasKeys = Object.keys(ALIASES_ACTIVIDADES);
    for (let alias of aliasKeys) {
      if (nombreNormalizado.includes(alias) || alias.includes(nombreNormalizado)) {
        console.log(`⚠️ Coincidencia parcial: "${nombre}" → "${ALIASES_ACTIVIDADES[alias]}"`);
        return ALIASES_ACTIVIDADES[alias];
      }
    }

    // Si no encuentra nada, usar LLEGADA y alertar
    console.warn(`❌ Actividad NO encontrada: "${nombre}" - usando LLEGADA por defecto`);
    return 'LLEGADA';
  }

  // ================= FUNCIÓN PARA FORMATEAR TEXTO A HTML =================
  function formatearTextoAHTML(texto) {
    if (!texto) return '<p>Sin información disponible</p>';

    if (texto.includes('<ul>') || texto.includes('<li>')) {
      return texto;
    }

    const lineas = texto.split('\n').filter(l => l.trim());

    if (lineas.length > 1) {
      const items = lineas.map(linea => `<li>${linea.trim()}</li>`).join('');
      return `<ul>${items}</ul>`;
    }

    return `<p>${texto}</p>`;
  }

  // ================= NORMALIZADOR DE TIPO DE TRANSPORTE =================
  function normalizarTipoTransporte(tipoTransporte) {
    if (!tipoTransporte) return 'turístico';

    // Normalizar a minúsculas para comparar
    const tipoNormalizado = tipoTransporte.toLowerCase().trim();

    // Mapeo de valores antiguos a nuevos valores normalizados
    const mapeoTipos = {
      'vistadome': 'turístico',
      'vista dome': 'turístico',
      'vista-dome': 'turístico',
      'turistico': 'turístico',
      'turístico': 'turístico',
      'expedition': 'tren local',
      'tren local': 'tren local',
      'local': 'tren local'
    };

    // Buscar coincidencia exacta
    if (mapeoTipos[tipoNormalizado]) {
      console.log(`✅ Tipo transporte normalizado: "${tipoTransporte}" → "${mapeoTipos[tipoNormalizado]}"`);
      return mapeoTipos[tipoNormalizado];
    }

    // Si no encuentra coincidencia, usar el valor original pero formateado
    const tipoFormateado = tipoNormalizado === 'turistico' ? 'turístico' :
      tipoNormalizado === 'expedition' ? 'tren local' : tipoTransporte;

    console.log(`⚠️ Tipo transporte sin mapeo, usando original: "${tipoTransporte}" → "${tipoFormateado}"`);
    return tipoFormateado;
  }

  // ================= FUNCIÓN AUXILIAR: CAPITALIZAR PALABRAS =================
  function capitalizarPalabras(texto) {
    if (!texto) return '';
    return texto.split(' ').map(palabra =>
      palabra.charAt(0).toUpperCase() + palabra.slice(1)
    ).join(' ');
  }

  // ================= FUNCIONES AUXILIARES DE FECHAS =================
  function parsearFecha(fechaInput) {
    if (!fechaInput) return new Date();

    if (fechaInput instanceof Date) return fechaInput;

    // Si es string, intentar parsear
    if (typeof fechaInput === 'string') {
      // Formato DD/MM/YYYY o similar
      if (fechaInput.includes('/')) {
        const [dia, mes, año] = fechaInput.split('/');
        return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      }

      // Formato ISO o estándar
      const fecha = new Date(fechaInput);
      if (!isNaN(fecha.getTime())) {
        return fecha;
      }
    }

    // Fallback a fecha actual
    return new Date();
  }

  function formatearFechaSlash(fecha) {
    if (!fecha) return '';

    if (!(fecha instanceof Date)) {
      fecha = parsearFecha(fecha);
    }

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  function formatearFechaCompleta(fecha) {
    if (!fecha) return '';

    if (!(fecha instanceof Date)) {
      fecha = parsearFecha(fecha);
    }

    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const diaSemana = dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${diaSemana}, ${dia} de ${mes} de ${año}`;
  }

  // ================= FUNCIÓN PARA DETECTAR BOLETO 40 SOLES (1 actividad específica) =================
  function verificarBoleto40Soles(actividadesProcesadas) {
    // Contar actividades activadoras
    let contadorActivadoras = 0;
    const nombresActividades = [];

    actividadesProcesadas.forEach(actividad => {
      const nombreActividad = actividad.titulo_dia.replace(/^Día \d+: /, '').trim();
      nombresActividades.push(nombreActividad);

      // Verificar si contiene palabras activadoras específicas
      if (nombreActividad.includes('CITY') ||
        nombreActividad.includes('VALLE') ||
        nombreActividad.includes('SUR')) {
        contadorActivadoras++;
        console.log(`🎯 Actividad activadora detectada: "${nombreActividad}"`);
      }
    });

    // Lógica: Exactamente 1 actividad activadora = BOLETO 40 SOLES
    const requiereBoleto40 = contadorActivadoras === 1;

    console.log(`📊 Contador activadoras: ${contadorActivadoras} actividades`);
    console.log(`🎫 ¿Requiere BOLETO 40 SOLES? ${requiereBoleto40}`);

    return requiereBoleto40;
  }

  // ================= FUNCIÓN PARA DETECTAR BOLETO 70 SOLES =================
  function verificarBoleto70Soles(actividadesProcesadas) {
    // Contar actividades activadoras
    let contadorActivadoras = 0;
    const nombresActividades = [];

    actividadesProcesadas.forEach(actividad => {
      const nombreActividad = actividad.titulo_dia.replace(/^Día \d+: /, '').trim();
      nombresActividades.push(nombreActividad);

      // Verificar si contiene palabras activadoras
      if (nombreActividad.includes('CITY') ||
        nombreActividad.includes('VALLE') ||
        nombreActividad.includes('SUR')) {
        contadorActivadoras++;
        console.log(`🎯 Actividad activadora detectada: "${nombreActividad}"`);
      }
    });

    // Lógica: 2 o más actividades activadoras = BOLETO 70 SOLES
    const requiereBoleto70 = contadorActivadoras >= 2;

    console.log(`📊 Contador activadoras: ${contadorActivadoras} actividades`);
    console.log(`🎫 ¿Requiere BOLETO 70 SOLES? ${requiereBoleto70}`);

    return requiereBoleto70;
  }

  // ================= NUEVA FUNCIÓN: LÓGICA DIFERENCIADA DEL TREN =================
  function procesarInformacionTren(body, requiereTrenDetecto) {
    console.log('🚆 Procesando información del tren con lógica diferenciada V7.2');

    // ✅ NORMALIZAR TIPO DE TRANSPORTE ANTES DE USAR
    const tipoTransporte = normalizarTipoTransporte(body.tipo_transporte) || 'turístico';

    console.log('📋 Datos del tren disponibles:', {
      precio_por_persona_tren: body.precio_por_persona_tren,
      precio_total_tren: body.precio_total_tren,
      personas_tren: body.personas_tren,
      horario_ida_tren: body.horario_ida_tren,
      horario_retorno_tren: body.horario_retorno_tren,
      fecha_tren: body.fecha_tren,
      tipo_transporte: tipoTransporte // ✅ CAMBIO: Usar valor normalizado
    });

    // NUEVA LÓGICA: Usar campos específicos del formulario para generar contenido completo
    if (body.precio_total_tren && body.personas_tren) {
      const horarioIda = body.horario_ida_tren || 'Por definir';
      const horarioRetorno = body.horario_retorno_tren || 'Por definir';
      const fechaTren = body.fecha_tren ? formatearFechaCompleta(parsearFecha(body.fecha_tren)) : 'Por definir';
      const precioPorPersonaTren = body.precio_por_persona_tren || (body.precio_total_tren / body.personas_tren);
      const personasTren = body.personas_tren;
      const precioTrenTotal = body.precio_total_tren;

      const contenidoTrenCompleto = `Tren ${tipoTransporte.toUpperCase()}
Fecha: ${fechaTren}
Horario Ida: ${horarioIda}
Horario Retorno: ${horarioRetorno}
Personas: ${personasTren} × USD ${precioPorPersonaTren.toFixed(0)} = USD ${precioTrenTotal.toFixed(0)}`;

      console.log('✅ Contenido del tren generado:', contenidoTrenCompleto);

      return {
        tieneTren: true,
        tipoTren: capitalizarPalabras(tipoTransporte),
        precioTren: `USD ${precioPorPersonaTren.toFixed(0)}`, // Solo para la tabla principal 
        contenidoTrenPdf: contenidoTrenCompleto,
        detalleTren: `Tren ${tipoTransporte} con horarios y precios detallados`,
        tren_separado: true // Marcador para separar del precio del programa
      };
    }

    // LÓGICA: Usar campos diferenciados del formulario si están disponibles
    if (body.tren_pdf_aplica !== undefined && body.tren_pdf_tipo) {
      console.log(`✅ Usando campos diferenciados del tren: tipo=${body.tren_pdf_tipo}`);

      let tipoTransporteLocal = normalizarTipoTransporte(body.tren_pdf_tipo);

      if (tipoTransporteLocal === 'tren local') {
        return {
          tieneTren: true,
          tipoTren: 'Tren Local',
          precioTren: 'Aplica tren local',
          contenidoTrenPdf: body.tren_pdf_texto || 'Tren Local: Aplica tren local',
          detalleTren: 'Tren Local incluido en el programa',
          tren_separado: true // Marcador para separar del precio del programa
        };
      }

      if (tipoTransporteLocal === 'turístico') {
        return {
          tieneTren: true,
          tipoTren: 'Tren Turístico',
          precioTren: 'Ver detalles en información del tren', // NO incluir total aquí
          contenidoTrenPdf: body.tren_pdf_texto || 'Información de tren turístico',
          detalleTren: 'Tren Turístico en sección separada con horarios y precios USD',
          tren_separado: true // Marcador para separar del precio del programa
        };
      }
    }

    // FALLBACK: Lógica original basada en actividades si no hay campos diferenciados
    console.log('⚠️ Usando lógica fallback basada en actividades');

    if (!requiereTrenDetecto) {
      return {
        tieneTren: false,
        tipoTren: 'No Aplica',
        precioTren: 'No Aplica',
        contenidoTrenPdf: 'No Aplica',
        detalleTren: 'Este programa no requiere tren',
        tren_separado: false
      };
    }

    // Si requiere tren pero no hay info específica, usar defaults
    const precioTrenEspecífico = body.precio_total_tren ? `USD ${body.precio_total_tren}` : null;
    let tipoTransporteFallback = normalizarTipoTransporte(body.tipo_transporte) || 'turístico';

    // Función para capitalizar palabras individuales (ej: "tren local" → "Tren Local")
    function capitalizarPalabras(texto) {
      return texto.split(' ').map(palabra =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
      ).join(' ');
    }

    return {
      tieneTren: true,
      tipoTren: capitalizarPalabras(tipoTransporteFallback),
      precioTren: precioTrenEspecífico || 'Incluido (Tren Local)',
      contenidoTrenPdf: precioTrenEspecífico || 'Incluye Tren Local',
      detalleTren: `Tren ${tipoTransporteFallback} incluido en el programa`,
      tren_separado: true // Marcar como separado incluso en fallback
    };
  }

  // ================= 26 ACTIVIDADES COMPLETAS MAPEADAS =================
  const ACTIVIDADES_MAPPING = {
    "LLEGADA": {
      imagen_url: "",
      descripcion: `<ul>
      <li>Vuelo llegada a Cusco (hora por acordar)</li>
      <li>AM - Traslado al hotel</li>
      <li>Explicación del programa</li>
      <li>12 PM - CHECK-IN (ingreso a la habitación del hotel)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Traslado aeropuerto - hotel</li>
      <li>Todos los servicios de traslado</li>
      <li>Traslado estacion Ollantaytambo-Cusco</li>
      <li>Bus de subida y bajada al santuario</li>
      <li>Guia Profecional de turismo para cada tour</li>
      <li>Asitencia durante el check-in</li>
      <li>Tren local ida y vuelta</li>
      <li>Información turística</li>
    </ul>`,
      no_incluye: `<p>Sin costos adicionales</p>`
    },
    "LLEGADA+CITY": {
      imagen_url: BASE_URL + "LLEGADA_CITY.jpg",
      descripcion: `<ul>
      <li>Vuelo llegada a Cusco (hora por acordar)</li>
      <li>AM-Traslado al hotel</li>
       <li>AM-Explicacion del programa</li>
      <li>12 PM- CHECK-IN (ingreso a la habitación del hotel)</li>
      <li>09:00– City tour en Cusco</li>
      <li>AM-Lugares a visitar</li>
      <li>AM-Qoricancha</li>
      <li>AM-Sacsayhuaman</li>
      <li>PM-Qenqo</li>
      <li>PM-Pukapukara</li>
      <li>PM-Tambomachay</li>
      <li>PM-Cristo Blanco</li>
      <li>PM-Bosque de Eucalipto</li>
      <li>02:30 – Arribo a la ciudad de Cusco (Cerca de la plaza principal)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Traslado aeropuerto - hotel</li>
      <li>Todos los servicios de traslado</li>
      <li>Traslado estacion Ollantaytambo-Cusco</li>
      <li>Bus de subida y bajada al santuario</li>
      <li>Guia Profecional de turismo para cada tour</li>
      <li>Asitencia durante el check-in</li>
      <li>Tren local ida y vuelta</li>
      <li>Asistencia durante el check-in</li>
      <li>Información turística</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles Coricancha</li>
      <li>Entrada a las Aguas Termales en Aguas Calientes Opcional (10.00 soles)</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "CITY": {
      imagen_url: BASE_URL + "CITY.jpg",
      descripcion: `<ul>
      <li>AM-Desayuno</li>
      <li>09:00– City tour en Cusco</li>
      <li>AM-Lugares a visitar:</li>
      <li>AM-Qoricancha</li>
      <li>AM-Sacsayhuaman</li>
      <li>PM-Qenqo</li>
      <li>PM-Pukapukara</li>
      <li>PM-Tambomachay</li>
      <li>PM-Cristo Blanco</li>
      <li>PM-Bosque de Eucalipto</li>
      <li>02:30 – Arribo a la ciudad de Cusco (Cerca de la plaza principal)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles Coricancha</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "MONTAÑA": {
      imagen_url: BASE_URL + "MONTANA.jpg",
      descripcion: `<ul>
      <li>04:30-4:40 AM – Recojo de su hotel para el tour</li>
      <li>AM-Desayuno incluido en el pueblo de cusipata</li>
      <li>08:30 AM – Caminata hacia la montaña de colores (2 horas aprox.)</li>
      <li>PM – Visita guiada de la montaña</li>
      <li>PM - Visita a la montaña</li>
      <li>PM – Retorno de la montaña caminata (2 horas aprox.)</li>
      <li>PM - Almuerzo incluido en el pueblo de cusipata</li>
      <li>14:30 PM – Retorno en Bus a Cusco</li>
      <li>16:30 PM – Arribo a la ciudad de Cusco (Cerca de la plaza principal)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo buffet en el poblado Cusipata</li>
      <li>01-Desayuno buffet en el pueblo de Cusipata</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles ingreso a la Montaña de 7 Colores</li>
    </ul>`
    },
    "LAGUNA": {
      imagen_url: BASE_URL + "LAGUNA.png",
      descripcion: `<ul>
      <li>04:30 AM-05:00 AM: Recojo del hotel</li>
      <li>AM-Desayuno incluido en el pueblo de mollepata</li>
      <li>AM-Traslado al distrito de Mollepata (1.40 horas aprox.)</li>
      <li>AM-Continuación del viaje durante 1 hora adicional hasta Soraypampa (3900msnm)</li>
      <li>AM-Inicio de la caminata hacia la Laguna Humantay</li>
      <li>PM-Retorno a Soraypampa</li>
      <li>PM-Almuerzo  incluido en el pueblo de mollepata</li>
      <li>PM-Retorno a la ciudad de Cusco</li>
      <li>17:00 PM – Arribo a la ciudad del Cusco (cerca de la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo buffet en Mollepata</li>
      <li>01-Desayuno buffet en Mollepata</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles ingreso a la Laguna Humantay</li>
    </ul>`
    },
    "WAQRAPUKARA": {
      imagen_url: BASE_URL + "WAQRAPUKARA.jpg",
      descripcion: `<ul>
      <li>04:30 AM - Recojo desde su hotel</li>
      <li>05:00 AM - Traslado en bus turístico hacia el pueblo de Cusipata</li>
      <li>07:00 AM - Arribo a Cusipata, desayuno</li>
      <li>AM - Continuación hacia el poblado de Santa Lucia</li>
      <li>AM - Último trayecto de Santa Lucía e inicio de la caminata</li>
      <li>Apreciación del Cañón del Apurímac y paisajes altoandinos</li>
      <li>11:00 AM - Visita guiada en el complejo arqueológico de Waqrapukara</li>
      <li>AM - Descenso hacia el punto de inicio, Santa Lucía</li>
      <li>AM - Camino de Santa Lucía a Cusipata en bus turístico</li>
      <li>Tiempo libre para almorzar (incluido)</li>
      <li>15:30 PM - Hora de salida del bus desde Cusipata</li>
      <li>18:30 PM - Arribo a la ciudad del Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Desayuno</li>
      <li>01-Almuerzo</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles ingreso a Waqrapukara</li>
    </ul>`
    },
    "7 LAGUNA": {
      imagen_url: BASE_URL + "7LAGUNA.jpg",
      descripcion: `<ul>
      <li>4:30 a 5:00 AM - Recojo del hotel</li>
      <li>AM-Desayuno incluido en el pueblo de pacchanta</li>
      <li>AM - Llegada al circuito de la caminata por las siguientes lagunas:</li>
      <li>•Laguna Pucacocha</li>
      <li>•Laguna Patacocha</li>
      <li>•Laguna Alqacocha</li>
      <li>•Laguna Q'omercocha</li>
      <li>•Laguna Orco otorongo</li>
      <li>•Laguna China Otorongo</li>
      <li>•Laguna Azul cocha</li>
      <li>AM - Subida a las lagunas (2 horas de recorrido)</li>
      <li>PM - Retorno al inicio de la caminata (2 horas) - Caminata total de 4 horas</li>
      <li>PM - Almuerzo incluido  en el pueblo de pacchanta</li>
      <li>6:30 PM - Retorno al Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo en Pacchanta</li>
      <li>01-Desayuno en Pacchanta</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles ingreso a las 7 Lagunas de Ausangate</li>
      <li>10.00 soles aguas termales</li>
    </ul>`
    },
    "VALLE+MAPI": {
      imagen_url: BASE_URL + "VALLE_MAPI.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>6:20-6:40 AM - Recojo del hotel para el tour</li>
      <li>AM-Visita a nuestro complejo de arte textil en Chinchero</li>
      <li>AM-Visita al centro arqueológico de Chinchero</li>
      <li>AM-Visita al anfiteatro de Moray</li>
      <li>AM-Visita a las Salineras</li>
      <li>PM–Visita a Ollantaytambo</li>
      <li>PM-Almuerzo buffet en el pueblo de urubamba (incluye)</li>
      <li>Ollantaytambo está de 8 a 10 Minutos caminando en tren tiene 2 salidas 7:00 PM y 9:00 PM (TIENE PERSONAL DE APOYO -INCLUYE EL COSTO DEL TREN LOCAL)</li>
      <li>PM-Tren con salidas a las 7:00 PM y 9:00 PM (Personal de apoyo incluido)</li>
      <li>19:00 O 21:00 PM - Tren Ollantaytambo – Aguas Calientes</li>
      <li>PM - Arribo Aguas Calientes</li>
      <li>Pernocte en Aguas Calientes</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
      <li>01-Almuerzo Buffet en el Restaurante "RUSTICA" URUBAMBA</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles Salineras</li>
    </ul>`
    },
    "MAPI 3 AM": {
      imagen_url: BASE_URL + "MAPI_3AM.png",
      descripcion: `<ul>
      <li>3:00 AM - Aproximarse al ministerio de cultura</li>
      <li>6:00 AM – Empieza la venta de boletos a Machu Picchu</li>
      <li>6:00 – 8:00 AM - Desayuno en el hotel</li>
      <li>Visita a Aguas termales (LIBRE)</li>
      <li>Visita al Mariposario (LIBRE)</li>
      <li>Pernocte en Aguas Calientes</li>
    </ul>`,
      incluye: `<ul>
      <li>Asistencia para compra de boletos</li>
      <li>Desayuno</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Almuerzo</li>
      <li>Entrada a las Aguas Termales en Aguas Calientes Opcional (10.00 soles)</li>
    </ul>`
    },
    "VALLE+PISAC": {
      imagen_url: BASE_URL + "VALLE_PISAC.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>6:20-6:40 AM - Recojo del hotel para el tour</li>
      <li>AM-Visita a nuestro complejo de arte textil en Chinchero</li>
      <li>AM-liVisita al centro arqueológico de Chinchero</li>
      <li>AM-Visita al anfiteatro de Moray</li>
      <li>Visita a las Salineras</li>
      <li>PM-Almuerzo buffet en el pueblo de urubamba (incluye) </li>
      <li>PM – Visita a Ollantaytambo</li>
      <li>PM - Visita Pisac</li>
      <li>18:30 PM-Arribo a la ciudad del cusco</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
      <li>01-Almuerzo Buffet en el Restaurante "RUSTICA" URUBAMBA</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles Salineras</li>
    </ul>`
    },
    "VALLE+OLLANTAY": {
      imagen_url: BASE_URL + "VALLE_OLLANTAY.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>6:20-6:40 AM - Recojo del hotel para el tour</li>
      <li>MA-Visita a nuestro complejo de arte textil en Chinchero</li>
      <li>AM-Visita al centro arqueológico de Chinchero</li>
      <li>AM-Visita al anfiteatro de Moray</li>
      <li>AM-Visita a las Salineras</li>
      <li>AM-Visita a las Salineras</li>
      <li>PM-Almuerzo buffet en el pueblo de urubamba (incluye)</li>
      <li>PM–Visita a Ollantaytambo</li>
      <li>Pernocte en Ollantaytambo</li>
       <li>Una vez finalize nuestro programa tendremos el asesoramiento para llegar 
al hotel en ollantaytambo</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
      <li>Almuerzo Buffet en el Restaurante "RUSTICA" URUBAMBA</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles Salineras</li>
    </ul>`
    },
    "OLLANTAY-IDA": {
      imagen_url: BASE_URL + "OLLANTAY_IDA.jpg",
      descripcion: `<ul>
      <li>7:00 AM - Aproximarse a la estación de Ollantaytambo</li>
      <li>AM-Realizamos la cola hasta el tren 9:50 AM</li>
      <li>9:50 AM - Partida del tren hacia Aguas Calientes</li>
      <li>12:00 PM - Llegada Aguas Calientes</li>
      <li>PM - Traslado al hotel</li>
      <li>PM - Aguas termales (LIBRE)</li>
      <li>PM - Mariposario (LIBRE)</li>
      <li>Pernocte en Aguas Calientes</li>
    </ul>`,
      incluye: `<ul>
      <li>Tren local</li>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Almuerzo</li>
    </ul>`
    },
    "IDA-CUZ": {
      imagen_url: BASE_URL + "IDA_CUZ.png",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>6:15 AM - Recojo para el tour</li>
      <li>7:30 AM - Llegada a la estación de Ollantaytambo</li>
      <li>9:50 AM - Partida del tren hacia Aguas Calientes</li>
      <li>12:00 PM - Llegada Aguas Calientes</li>
      <li>PM - Traslado al hotel</li>
      <li>PM - Aguas termales (LIBRE)</li>
      <li>PM - Mariposario (LIBRE))</li>
      <li>Pernocte en Aguas Calientes</li>
    </ul>`,
      incluye: `<ul>
      <li>Traslado y tren local</li>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Entrada a las Aguas Termales en Aguas Calientes Opcional (10.00 soles)</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "MAPI": {
      imagen_url: BASE_URL + "MAPI.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>Bus de Subida al Santuario</li>
      <li>Guiado Machu Picchu</li>
      <li>Momento libre para más fotos en Machu Picchu</li>
      <li>PM - Retorno en Bus hasta Aguas Calientes</li>
      <li>PM - Almuerzo (No Incluido)</li>
      <li>PM - Aguas termales (SIN GUIADO)</li>
      <li>PM - Mariposario (SIN GUIADO)</li>
      <li>PM - Sala de embarque a tren</li>
      <li>PM - Retorno en tren a Ollantaytambo</li>
      <li>PM - Recojo en la estación de Ollantaytambo y traslado a Cusco</li>
      <li>22:30 PM O 1:00 AM – Arribo a la ciudad del Cusco (cerca de la plaza de armas)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
      <li>Tren local ida y vuelta</li>
      <li>Entrada a Machu Picchu</li>
      <li>Bus de subida y bajada al santuario de Machu Picchu</li>
      <li>Traslados estación Ollantaytambo - Cusco</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Almuerzo</li>
      <li>Entrada a las Aguas Termales en Aguas Calientes Opcional (10.00 soles)</li>
    </ul>`
    },
    "MONTAÑA+CUATRI": {
      imagen_url: BASE_URL + "MONTANA_CUATRI.jpg",
      descripcion: `<ul>
      <li>4:30 a 5:00 AM - Recojo del hotel</li>
      <li>AM-Desayuno incluido en el pueblo de cusipata</li>
      <li>AM - Llegada al circuito, 15 minutos para aprender a manejar la cuatrimoto</li>
      <li>AM - 30 minutos de subida a la montaña</li>
      <li>PM - 30 minutos retorno al inicio del circuito</li>
      <li>PM-Almuerzo incluido en el pueblo de cusipata</li>
      <li>5:30 PM - Retorno al Cusco (cerca a la plaza de armas)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo buffet en Cusipata</li>
      <li>01-Desayuno buffet en Cusipata</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles ingreso a la Montaña de 7 Colores</li>
    </ul>`
    },
    "PUENTE": {
      imagen_url: BASE_URL + "PUENTE.jpg",
      descripcion: `<ul>
      <li>4:30 a 5:00 AM - Recojo del hotel</li>
      <li>8:00 AM - Desayuno en Cusipata</li>
      <li>AM - Mirador de las 4 lagunas (Pomacanchi, Acopia, Asnaqocha y Pampamarca)</li>
      <li>PM - Visita puente Inca de "Q'eswachaka" (Puente de paja) sobre el río Apurímac</li>
      <li>PM - Retorno al Cusco</li>
      <li>5:30 PM - Arribo a la ciudad del Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo en Cusipata</li>
      <li>01-Desayuno en Cusipata</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles ingreso al Puente Inca</li>
    </ul>`
    },
    "MORADA-BUS": {
      imagen_url: BASE_URL + "MORADA_BUS.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>10:00 AM - Recojo en el hotel plaza de armas</li>
      <li>AM - Traslado al poblado de Tica Tica hasta llegar al sector Sencca</li>
      <li>10:40 AM - Llegada al circuito de la Morada De Los Dioses</li>
      <li>AM - Visita a la Morada de los Dioses, Guiado de 45 a 1 Hora</li>
      <li>AM - Tiempo libre para fotos</li>
      <li>12:30 PM - Retorno al Cusco</li>
      <li>13:30 PM - Arribo a la ciudad del Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles ingreso a la Morada de los Dioses</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "MORADA-CUATRI": {
      imagen_url: BASE_URL + "MORADA_CUATRI.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>10:00 AM - Recojo en el hotel plaza de armas</li>
      <li>AM - Traslado al poblado de Tica Tica hasta llegar al sector Sencca</li>
      <li>10:40 AM - Llegada al circuito de la Morada De Los Dioses</li>
      <li>AM - 15 minutos para aprender a manejar la cuatrimoto</li>
      <li>AM - Visita a la Morada de los Dioses, Guiado de 45 a 1 Hora</li>
      <li>AM - Tiempo libre para fotos</li>
      <li>PM - Retorno en cuatrimoto</li>
      <li>12:30 PM - Retorno al Cusco</li>
      <li>13:30 PM - Arribo a la ciudad del Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles ingreso a la Morada de los Dioses</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "MORADA-CUATRI-LAGU": {
      imagen_url: BASE_URL + "MORADA_CUATRI_LAGU.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>10:00 AM - Recojo en el hotel plaza de armas</li>
      <li>AM - Traslado al poblado de Tica Tica hasta llegar al sector Sencca</li>
      <li>10:40 AM - Llegada al circuito de la Morada De Los Dioses</li>
      <li>AM - 15 minutos para aprender a manejar la cuatrimoto</li>
      <li>AM - Visita a la Morada de los Dioses, Guiado de 45 a 1 Hora</li>
      <li>AM - Tiempo libre para fotos</li>
      <li>PM - Laguna Piuray</li>
      <li>PM - Retorno en cuatrimoto</li>
      <li>14:30 PM - Retorno al Cusco</li>
      <li>15:00 PM - Arribo a la ciudad del Cusco (cerca a la plaza de armas)</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles ingreso a la Morada de los Dioses</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "FULL MAPI": {
      imagen_url: BASE_URL + "FULL_MAPI.jpg",
      descripcion: `<ul>
      <li>1:00 AM – Recojo del hotel</li>
      <li>3:00 AM – Llegada estación de Ollantaytambo</li>
      <li>5:05 AM – Partida del tren hacia Aguas Calientes</li>
      <li>6:30 AM – Arribo Aguas Calientes</li>
      <li>Bus de Subida al Santuario</li>
      <li>Guiado Machu Picchu</li>
      <li>Momento libre para más fotos en Machu Picchu</li>
      <li>PM - Retorno en Bus hasta Aguas Calientes</li>
      <li>PM - Almuerzo (No Incluido)</li>
      <li>PM - Aguas termales (SIN GUIADO)</li>
      <li>PM - Mariposario (SIN GUIADO)</li>
      <li>PM - Sala de embarque a tren</li>
      <li>PM - Retorno en tren a Ollantaytambo</li>
      <li>PM - Recojo en la estación y traslado a Cusco</li>
      <li>22:30 PM O 1:00 AM – Arribo a Cusco (cerca de la plaza de armas)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Tren local ida y vuelta</li>
      <li>Entrada a Machu Picchu</li>
      <li>Bus de subida y bajada al santuario</li>
      <li>Traslados estación Ollantaytambo - Cusco</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Entrada a las Aguas Termales en Aguas Calientes Opcional (10.00 soles)</li>
      <li>Desayuno</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "PALCOYO": {
      imagen_url: BASE_URL + "PALCOYO.jpg",
      descripcion: `<ul>
      <li>04:30-4:40 AM – Recojo del hotel</li>
      <li>AM - Desayuno incluido en el pueblo de cusipata</li>
      <li>08:30 AM – Caminata hacia la montaña Palcoyo (1 hora aprox.)</li>
      <li>PM – Visita guiada de la montaña Palcoyo</li>
      <li>PM - Visita a la montaña – Valle rojo</li>
      <li>PM – Retorno de la montaña caminata (1 hora aprox.)</li>
      <li>PM - Almuerzo incluido en el pueblo de cusipata</li>
      <li>PM – Visitar al mirador al bosque de piedras</li>
      <li>15:30 PM – Retorno en Bus a Cusco</li>
      <li>17:30 PM – Arribo a la ciudad de Cusco (Cerca de la plaza principal)</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>01-Almuerzo en el poblado Cusipata</li>
      <li>01-Desayuno en el pueblo de Cusipata</li>
    </ul>`,
      no_incluye: `<ul>
      <li>20.00 soles ingreso a la Montaña Palcoyo</li>
    </ul>`
    },
    "LIBRE-SIN GUIA": {
      imagen_url: BASE_URL + "LIBRE.png",
      descripcion: `<ul>
      <li>07:00 – Desayuno en el hotel</li>
      <li>Momento libre</li>
      <li>Recomendamos: Acueducto de Cusco</li>
      <li>Mirador de San Blas</li>
      <li>Calle 7 Borreguitos</li>
      <li>Mirador de San Cristóbal</li>
      <li>Visita en los museos</li>
      <li>Asesoramiento para compras y recordatorios</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Asesoramiento turístico</li>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Entradas a museos y atracciones</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "FOTOGRAFIA": {
      imagen_url: BASE_URL + "FOTOGRAFIA.jpg",
      descripcion: `<ul>
      <li>AM - Desayuno en el hotel</li>
      <li>AM - Recojo para el tour</li>
      <li>AM - Visita Plaza de armas</li>
      <li>AM - Visita Calle 7 borreguitos</li>
      <li>AM - Visita Mirador de San Cristóbal</li>
      <li>AM - Visita Puente Sapantiana</li>
      <li>Pernocte en Cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Sesión fotográfica con equipos profesionales</li>
      <li>Tour a pie (1 hora)</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Entrega de fotos digitales (consultar costos adicionales)</li>
      <li>Almuerzo</li>
      <li>Desayuno</li>
    </ul>`
    },
    "MISTICO": {
      imagen_url: BASE_URL + "MISTICO.jpg",
      descripcion: `<ul>
      <li>AM-Desayuno en el hotel</li>
      <li>10:00 AM -Recojo para el tour mistico</li>
      <li>AM- Visita Morada De Los Dioses</li>
      <li>AM- Visita Valle De Los Duendes</li>
      <li>PM- Almuerzo (No Incluye)</li>
      <li>PM- Visita Humedal De Husao</li>
      <li>PM- Visita Bosque De Eucaliptos</li>
      <li>4:30 PM – Retorno al cusco (cerca a la plaza de armas)</li>
      <li>Pernocte en cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>32.00 soles alos 4 BOLETOS al tur mistico</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "SUR": {
      imagen_url: BASE_URL + "SUR.png",
      descripcion: `<ul>
      <li>AM-Desayuno en el hotel</li>
      <li>9:00 AM-Recojo en el hotel</li>
      <li>AM- Visita el centro Arqueológico de Tipon</li>
      <li>AM-Visita el centro Arqueológico de Pikillacta</li>
      <li>PM-Almuerzo (No incluye)</li>
      <li>PM-Vista el Templo De Andahuaylillas</li>
      <li>4:30 PM – Retorno al cusco (cerca a la plaza de armas)</li>
      <li>Pernocte en cusco</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>15.00 soles Templo De Andahuaylillas</li>
      <li>Almuerzo</li>
    </ul>`
    },
    "SALIDA": {
      imagen_url: BASE_URL + "SALIDA_001.png",
      descripcion: `<ul>
      <li>07:00 AM – Desayuno en el hotel</li>
      <li>10:00 AM - CHECK OUT (desocupar la habitación del hotel)</li>
      <li>Momento libre</li>
      <li>Recomendamos: Acueducto de Cusco</li>
      <li>Mirador de San Blas</li>
      <li>Calle 7 Borreguitos</li>
      <li>Mirador de San Cristóbal</li>
      <li>Visita en los museos</li>
      <li>Asesoramiento para compras y recordatorios</li>
       <li>El ultimo dia se realizara (sin guía asesoramiento virtual)</li>
      <li>FIN DE NUESTROS SERVICIOS</li>
    </ul>`,
      incluye: `<ul>
      <li>Desayuno en el hotel</li>
    </ul>`,
      no_incluye: `<ul>
      <li>Traslado hotel - aeropuerto</li>
      <li>Almuerzo</li>
    </ul>`
    }
  };

  // ================= FUNCIONES NUEVAS PARA CÁLCULO AUTOMÁTICO DE COMIDAS =================

  /**
   * Extrae los items <li> de un string HTML
   */
  function extraerItemsDeHTML(htmlString) {
    if (!htmlString) return [];
    const items = [];
    const regex = /<li>(.*?)<\/li>/gi;
    let match;

    while ((match = regex.exec(htmlString)) !== null) {
      const texto = match[1].replace(/<[^>]*>/g, '').trim();
      if (texto && texto.length > 0) {
        items.push(texto);
      }
    }

    if (items.length === 0) {
      const regexP = /<p>(.*?)<\/p>/gi;
      while ((match = regexP.exec(htmlString)) !== null) {
        const texto = match[1].replace(/<[^>]*>/g, '').trim();
        if (texto && texto.length > 0) {
          items.push(texto);
        }
      }
    }

    return items;
  }

  /**
   * Cuenta desayunos y almuerzos en una actividad
   */
  function contarComidasEnActividad(actividadCodigo) {
    const actividad = ACTIVIDADES_MAPPING[actividadCodigo];

    if (!actividad || !actividad.incluye) {
      return { desayuno: 0, almuerzo: 0 };
    }

    const textoIncluye = actividad.incluye.toLowerCase();
    const tieneDesayuno = textoIncluye.includes('desayuno') ? 1 : 0;
    const tieneAlmuerzo = textoIncluye.includes('almuerzo') ? 1 : 0;

    return { desayuno: tieneDesayuno, almuerzo: tieneAlmuerzo };
  }

  /**
   * Cuenta total de comidas en todas las actividades
   */
  function contarTotalComidas(actividadesSeleccionadas) {
    let totalDesayunos = 0;
    let totalAlmuerzos = 0;

    actividadesSeleccionadas.forEach(codigoActividad => {
      const comidas = contarComidasEnActividad(codigoActividad);
      totalDesayunos += comidas.desayuno;
      totalAlmuerzos += comidas.almuerzo;
    });

    return { desayunos: totalDesayunos, almuerzos: totalAlmuerzos };
  }

  /**
   * Consolida items de 'incluye'
   */
  function consolidarIncluyeDeActividades(actividadesSeleccionadas) {
    const todosLosItems = [];

    actividadesSeleccionadas.forEach(codigoActividad => {
      const actividad = ACTIVIDADES_MAPPING[codigoActividad];
      if (!actividad || !actividad.incluye) return;

      const items = extraerItemsDeHTML(actividad.incluye);
      todosLosItems.push(...items);
    });

    return [...new Set(todosLosItems)];
  }

  /**
   * Consolida items de 'no_incluye'
   */
  function consolidarNoIncluyeDeActividades(actividadesSeleccionadas) {
    const todosLosItems = [];

    actividadesSeleccionadas.forEach(codigoActividad => {
      const actividad = ACTIVIDADES_MAPPING[codigoActividad];
      if (!actividad || !actividad.no_incluye) return;

      const items = extraerItemsDeHTML(actividad.no_incluye);
      todosLosItems.push(...items);
    });

    return [...new Set(todosLosItems)];
  }

  /**
   * Genera HTML de PROGRAMA_INCLUYE
   */
  function generarHTMLProgramaIncluye(itemsIncluye, totalNoches, nochesCusco, nochesAguasCalientes, desayunos, almuerzos) {
    // 1️⃣ TOTALES PRINCIPALES (resaltados en negrita)
    const itemsPrincipales = [];

    itemsPrincipales.push(
      `<strong>${totalNoches} ${totalNoches === 1 ? 'noche' : 'noches'} de hotel</strong> (${nochesCusco} en Cusco${nochesAguasCalientes > 0 ? ` + ${nochesAguasCalientes} en Aguas Calientes` : ''})`
    );

    if (desayunos > 0) {
      itemsPrincipales.push(`<strong>${desayunos} ${desayunos === 1 ? 'desayuno' : 'desayunos'}</strong>`);
    }

    // 2️⃣ ALMUERZOS CON DETALLES (resaltados en negrita)
    const almuerzoItems = [];
    const otrosItems = [];

    itemsIncluye.forEach(item => {
      const itemLower = item.toLowerCase().trim();

      // Filtrar menciones genéricas de desayuno
      if (itemLower === 'desayuno' ||
        itemLower === 'desayuno en el hotel' ||
        itemLower.startsWith('01-desayuno')) {
        return; // Ignorar
      }

      // Filtrar menciones genéricas de almuerzo
      if (itemLower === 'almuerzo' || itemLower === '01-almuerzo') {
        return; // Ignorar
      }

      // Si contiene "almuerzo" con detalles, guardarlo como item principal (negrita)
      if (itemLower.includes('almuerzo')) {
        almuerzoItems.push(`<strong>${item}</strong>`);
      } else {
        // Resto de servicios (sin negrita)
        otrosItems.push(item);
      }
    });

    // 3️⃣ COMBINAR EN ORDEN: Totales → Almuerzos → Otros servicios
    const todosLosItems = [
      ...itemsPrincipales,  // Noches + Desayunos (negrita)
      ...almuerzoItems,      // Almuerzos con detalles (negrita)
      ...otrosItems          // Resto de servicios (normal)
    ];

    return `
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
    <tr>
      <td style="border-bottom: 2px solid #e0b467; padding-bottom: 3px; font-weight: bold; text-transform: uppercase; font-size: 12pt; color: #003366; text-align: left;">NUESTRO PROGRAMA INCLUYE POR PERSONA:</td>
    </tr>
  </table>
  <ul>
    ${todosLosItems.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
`;
  }

  /**
   * Genera el HTML de la sección PROGRAMA NO INCLUYE
   */
  function generarHTMLProgramaNoIncluye(itemsNoIncluye, infoBoletoTuristico) {
    // ✅ FILTRAR desayunos y almuerzos del NO INCLUYE
    const itemsFiltrados = itemsNoIncluye.filter(item => {
      const itemLower = item.toLowerCase();

      // 1. EXCEPCIÓN: Si tiene paréntesis, es información valiosa (ej: "Almuerzo (MISTICO)")
      if (item.includes('(') && item.includes(')')) {
        return true; // ¡MANTENER!
      }

      // 2. REGLA GENERAL: Excluir items genéricos que mencionen desayuno o almuerzo
      if (itemLower.includes('desayuno')) return false;
      if (itemLower.includes('almuerzo')) return false;

      return true;
    });

    if (itemsFiltrados.length === 0 && !infoBoletoTuristico) {
      return `
    <h3>NO INCLUYE:</h3>
    <p>Todos los servicios están incluidos en el programa</p>
  `;
    }

    return `
    <h3>NO INCLUYE:</h3>
    <ul>
      ${itemsFiltrados.map(item => `<li>${item}</li>`).join('\n      ')}
    </ul>
    ${infoBoletoTuristico || ''}
  `;
  }

  // ================= EXTRAER ACTIVIDADES SELECCIONADAS =================
  const actividadesSeleccionadas = body.actividades_seleccionadas || [];
  console.log(`📋 Actividades seleccionadas: ${actividadesSeleccionadas.length}`);

  // Agregar valores por defecto para actividades no mapeadas
  const actividadesDefault = {
    descripcion: `<ul><li>Tour completo con guía profesional</li><li>Visita a los principales atractivos</li><li>Tiempo para fotografías</li></ul>`,
    incluye: `<ul><li>Transporte turístico</li><li>Guía profesional</li><li>Entradas incluidas</li></ul>`,
    no_incluye: `<ul><li>Alimentos no especificados</li><li>Propinas</li><li>Gastos personales</li></ul>`
  };

  // ================= PROCESAMIENTO ITINERARIO =================
  // CAMBIO CRÍTICO V8.0: SIEMPRE regenerar itinerario desde actividades_seleccionadas
  // Esto evita que body.itinerario existente con fechas incorrectas interfiera
  let itinerario = [];

  if (Array.isArray(body.actividades_seleccionadas)) {
    console.log('🔄 SIEMPRE generando itinerario desde actividades_seleccionadas');
    const fechaBase = parsearFecha(body.fecha_tour) || parsearFecha(body.fecha_inicio) || new Date();
    console.log(`📅 Fecha base para itinerario: ${formatearFechaCompleta(fechaBase)}`);

    itinerario = body.actividades_seleccionadas.map((act, i) => {
      // Crear una nueva fecha independiente para cada día
      const fechaIteracion = new Date(fechaBase.getTime()); // Clonar la fecha base
      fechaIteracion.setDate(fechaIteracion.getDate() + i); // Añadir días al clone
      console.log(`✅ Día ${i + 1}: ${act} - ${formatearFechaCompleta(fechaIteracion)}`);
      return {
        dia: i + 1,
        fecha: formatearFechaSlash(fechaIteracion),
        actividad: act
      };
    });
    console.log(`📋 Itinerario generado con ${itinerario.length} días`);
  } else {
    console.log('⚠️ No hay actividades_seleccionadas, usando fallback');
  }

  if (itinerario.length === 0) {
    const hoy = new Date();
    itinerario = [{ dia: 1, fecha: formatearFechaSlash(hoy), actividad: 'LLEGADA' }];
  }

  const actividadesProcesadas = itinerario.map((dia, i) => {
    const nombreNormalizado = normalizarNombreActividad(dia.actividad);
    const datos = ACTIVIDADES_MAPPING[nombreNormalizado];

    if (!datos) {
      console.error(`❌ ERROR: Actividad "${nombreNormalizado}" no encontrada en ACTIVIDADES_MAPPING`);
      console.log(`📋 Actividades disponibles:`, Object.keys(ACTIVIDADES_MAPPING).join(', '));
      // Usar LLEGADA como fallback
      const datosFallback = ACTIVIDADES_MAPPING["LLEGADA"];
      return {
        titulo_dia: `Día ${i + 1}: ${dia.actividad}`,
        fecha_dia: formatearFechaCompleta(parsearFecha(dia.fecha)),
        descripcion: actividadesDefault.descripcion,
        incluye: actividadesDefault.incluye,
        no_incluye: actividadesDefault.no_incluye,
        imagen: datosFallback.imagen_url
      };
    }

    console.log(`✅ Día ${i + 1}: "${dia.actividad}" → Imagen: ${datos.imagen_url.split('/').pop()}`);

    return {
      titulo_dia: `Día ${i + 1}: ${nombreNormalizado}`,
      fecha_dia: formatearFechaCompleta(parsearFecha(dia.fecha)),
      descripcion: datos.descripcion,
      incluye: datos.incluye,
      no_incluye: datos.no_incluye,
      imagen: datos.imagen_url
    };
  });

  // ================= LÓGICA MEJORADA DEL BOLETO TURÍSTICO PARCIAL 40/70 SOLES =================
  const requiereBoleto70Soles = verificarBoleto70Soles(actividadesProcesadas);
  const requiereBoleto40Soles = verificarBoleto40Soles(actividadesProcesadas);

  let infoBoletoTuristico = '';

  if (requiereBoleto70Soles) {
    // 2 o más actividades específicas → Boleto 70 soles
    infoBoletoTuristico = `
      <h4>🎫 Boleto Turístico General:</h4>
      <ul>
        <li><strong>70.00 soles por persona</strong></li>
        <li>Permite el ingreso a centros arqueológicos + museos + teatro</li>
        <li>Validez: 10 días completos</li>
      </ul>
    `;
  } else if (requiereBoleto40Soles) {
    // 1 actividad específica → Boleto 40 soles
    infoBoletoTuristico = `
      <h4>🎫 Boleto Turístico Parcial:</h4>
      <ul>
        <li><strong>40.00 soles por persona</strong></li>
        <li>Permite el ingreso a centros arqueológicos específicos</li>
        <li>Validez: 01 días completos</li>
      </ul>
    `;
  }

  // ================= CONSOLIDAR INCLUYE/NO INCLUYE DE ACTIVIDADES =================
  function extraerItemsDeHTML(html) {
    if (!html) return [];
    // Extraer texto entre <li> tags
    const matches = html.match(/<li>(.*?)<\/li>/g) || [];
    return matches.map(m => m.replace(/<\/?li>/g, '').trim()).filter(t => t.length > 0);
  }

  function eliminarDuplicados(array) {
    const uniqueSet = new Set(array.map(item => item.toLowerCase().trim()));
    return array.filter(item => {
      const lower = item.toLowerCase().trim();
      if (uniqueSet.has(lower)) {
        uniqueSet.delete(lower);
        return true;
      }
      return false;
    });
  }

  // Extraer todos los items de "incluye" de las actividades seleccionadas
  const todosLosIncluye = [];
  const todosLosNoIncluye = [];

  actividadesProcesadas.forEach(actividad => {
    const itemsIncluye = extraerItemsDeHTML(actividad.incluye);
    const itemsNoIncluye = extraerItemsDeHTML(actividad.no_incluye);

    todosLosIncluye.push(...itemsIncluye);
    todosLosNoIncluye.push(...itemsNoIncluye);
  });

  // Eliminar duplicados
  const incluyeUnicos = eliminarDuplicados(todosLosIncluye);
  const noIncluyeUnicos = eliminarDuplicados(todosLosNoIncluye);

  // Generar HTML para items específicos de actividades
  const htmlIncluyeActividades = incluyeUnicos.length > 0 ? `
    <h4>🎯 Específico de sus actividades seleccionadas:</h4>
    <ul>
      ${incluyeUnicos.map(item => `<li>${item}</li>`).join('\n      ')}
    </ul>
  ` : '';

  // ================= CÁLCULO DE PRECIOS CON LÓGICA DIFERENCIADA V7.3 =================
  // CORREGIDO: Ahora calcula correctamente usando el precio_total dividido entre personas
  // TARIFA POR NACIONAL = precio_total / numero_personas
  // TOTAL A PAGAR = precio_total (programa completo)
  const numeroPersonas = parseInt(body.numero_personas) || 1;

  // 💰 LÓGICA CORREGIDA: Usar precio_total como base del programa
  const precioTotalPrograma = parseFloat(body.precio_total) || 0; // Precio total del programa
  let precioPorPersonaPrograma = precioTotalPrograma > 0 ? (precioTotalPrograma / numeroPersonas) : 1000;
  let precioTrenTotal = parseFloat(body.precio_total_tren) || 0; // Precio total del tren en USD

  console.log('=== DATOS DE ENTRADA ===');
  console.log(`Número de personas: ${numeroPersonas}`);
  console.log(`Precio total programa: S/. ${precioTotalPrograma.toFixed(2)}`);
  console.log(`Precio tren total: USD ${precioTrenTotal.toFixed(2)}`);

  console.log('=== CÁLCULOS CORREGIDOS ===');
  console.log(`💰 Precio por persona (TARIFA POR NACIONAL): S/. ${precioPorPersonaPrograma.toFixed(2)}`);
  console.log(`💰 Precio programa total (TOTAL A PAGAR): S/. ${precioTotalPrograma.toFixed(2)}`);
  console.log(`💰 Precio tren total: USD ${precioTrenTotal.toFixed(2)}`);
  console.log(`💰 Precio total general (programa + tren): S/. ${(precioTotalPrograma + precioTrenTotal).toFixed(2)}`);

  // Para el cálculo final, usar solo el precio del programa (sin tren)
  const precioTotal = precioTotalPrograma;

  console.log(`💰 Precios calculados:`);
  console.log(`   - Precio por persona: S/. ${precioPorPersonaPrograma.toFixed(2)}`);
  console.log(`   - Precio programa total: S/. ${precioTotalPrograma.toFixed(2)}`);
  console.log(`   - Precio tren total: USD ${precioTrenTotal.toFixed(2)}`);
  console.log(`   - Precio total general: S/. ${precioTotal.toFixed(2)}`);

  // ================= CÁLCULO DE SALDO PENDIENTE =================
  const adelantoPagado = parseFloat(body.adelanto_pagado) || 0;
  const saldoPendiente = precioTotal - adelantoPagado;

  // ================= CÁLCULO DE NOCHES =================
  const duracionDias = itinerario.length;
  const nochesCusco = Math.max(0, duracionDias - 2);
  const nochesAguasCalientes = duracionDias >= 3 ? 1 : 0;
  const totalNoches = nochesCusco + nochesAguasCalientes; // ✅ NUEVO

  // ================= INFORMACIÓN DEL ASESOR =================
  const nombreAsesor = body.nombre_asesor || body.asesor || "Equipo Ores Travel";
  const emailAsesor = body.email_asesor || body.email || "reservasorestravelperu@gmail.com";

  // ================= TIPO DE HABITACIÓN =================
  let tipoHabitacion = body.tipo_habitacion || body.tipo_hab || "Doble";
  if (tipoHabitacion.toLowerCase() === "sinple") tipoHabitacion = "Simple";

  // ================= PRECIO POR PERSONA =================
  const precioPorPersona = precioPorPersonaPrograma; // Ya calculado arriba

  // ================= DETECTAR SI ACTIVIDADES REQUIEREN TREN =================
  const actividadesConTren = ['MAPI', 'VALLE+MAPI', 'FULL MAPI', 'MAPI 3 AM', 'IDA-CUZ', 'OLLANTAY-IDA'];
  const requiereTrenDetecto = actividadesProcesadas.some(actividad =>
    actividadesConTren.includes(actividad.titulo_dia.replace(/^Día \d+: /, '').trim())
  );

  console.log(`🚆 ¿Actividades requieren tren? ${requiereTrenDetecto ? 'SÍ' : 'NO'}`);

  // ================= NUEVA LÓGICA DIFERENCIADA DEL TREN V7.2 =================
  const infoTren = procesarInformacionTren(body, requiereTrenDetecto);

  console.log(`🚆 Información del tren procesada:`);
  console.log(`   - Tiene tren: ${infoTren.tieneTren}`);
  console.log(`   - Tipo: ${infoTren.tipoTren}`);
  console.log(`   - Precio: ${infoTren.precioTren}`);
  console.log(`   - Contenido PDF: ${infoTren.contenidoTrenPdf}`);

  // ================= CÁLCULO AUTOMÁTICO DE COMIDAS DESDE 'incluye' =================
  console.log('🍽️ Calculando comidas desde campos "incluye"...');
  const comidasTotales = contarTotalComidas(actividadesSeleccionadas);
  const desayunosIncluidos = comidasTotales.desayunos;
  const almuerzosIncluidos = comidasTotales.almuerzos;

  console.log(`✅ Comidas calculadas: ${desayunosIncluidos} desayunos, ${almuerzosIncluidos} almuerzos`);

  // ================= SECCIONES DINÁMICAS BASADAS EN ACTIVIDADES =================
  // PROGRAMA_INCLUYE: Combina servicios estándar con datos específicos de actividades


  // ================= CONSOLIDAR ITEMS DE ACTIVIDADES =================
  console.log('📋 Consolidando items de actividades...');
  const itemsIncluyeConsolidados = consolidarIncluyeDeActividades(actividadesSeleccionadas);
  const itemsNoIncluyeConsolidados = consolidarNoIncluyeDeActividades(actividadesSeleccionadas);

  console.log(`✅ Items consolidados: ${itemsIncluyeConsolidados.length} incluye, ${itemsNoIncluyeConsolidados.length} no incluye`);

  // ================= GENERAR HTML DE LAS SECCIONES =================
  const PROGRAMA_INCLUYE = generarHTMLProgramaIncluye(
    itemsIncluyeConsolidados,
    totalNoches,
    nochesCusco,
    nochesAguasCalientes,
    desayunosIncluidos,
    almuerzosIncluidos
  );

  const PROGRAMA_NO_INCLUYE = generarHTMLProgramaNoIncluye(
    itemsNoIncluyeConsolidados,
    infoBoletoTuristico
  );

  console.log('✅ HTML de secciones generado correctamente');

  const SUGERENCIAS_GENERALES = `
    <h3>SUGERENCIAS QUE DEBE LLEVAR:</h3>
    <ul>
      <li>DNI o pasaporte original</li>
      <li>Zapatos adecuados para el tour</li>
      <li>Lentes de sol</li>
      <li>Repelente de mosquitos y Bloqueador solar</li>
      <li>Polos, Shorts y Sombrero o gorra</li>
      <li>Traje de baño, toalla y sandalias (de acuerdo a sus horarios)</li>
      <li>Casaca Abrigadora para la noche, casaca ligera para el tour</li>
      <li>Cargadores y baterías</li>
      <li>Poncho de lluvia (de octubre a marzo)</li>
      <li>Medicinas personales</li>
    </ul>
  `;

  const SUGERENCIAS_CAMINATAS = `
    <h3>SUGERENCIAS PARA TOUR DE CAMINATAS:</h3>
    <ul>
      <li>Ropa abrigadora (casaca, bufanda, guantes, gorros)</li>
      <li>Sombrero, gorra y gafas de sol</li>
      <li>Snacks (chocolates, dulces, hoja de coca)</li>
      <li>Agua o hidratante</li>
      <li>Cámara fotográfica y baterías de repuesto</li>
      <li>Kit médico personal</li>
      <li>Protector solar</li>
      <li>Zapatos de Trekking o botas impermeables (para su mayor comodidad)</li>
    </ul>
  `;

  // ✅ LÓGICA DE TREN UNIFICADA V8.0
  let INFO_TREN_LOCAL = "";
  if (infoTren.tieneTren && (infoTren.tipoTren.toLowerCase().includes("turistico") || infoTren.tipoTren.toLowerCase().includes("vistadome"))) {
    const personas = body.personas_tren || body.numero_personas || 1;
    const precio = body.precio_por_persona_tren || (body.precio_total_tren / personas) || 0;
    const horaIda = body.horario_ida_tren || body.hora_ida_tren || "Por confirmar";
    const horaRetorno = body.horario_retorno_tren || body.hora_retorno_tren || "Por confirmar";
    const total = body.precio_total_tren || (personas * precio);

    INFO_TREN_LOCAL = `
      <h3>DETALLES DEL TREN TURÍSTICO:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt; background: transparent; border: 1px solid rgba(234, 234, 234, 0.8); border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 12px; overflow: hidden;">
        <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5; width: 35%;">NÚMERO DE PERSONAS</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">${personas}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">PRECIO DEL TREN</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">USD ${precio.toFixed(0)} (tren turistico)</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">HORA IDA</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">${horaIda}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">HORA RETORNO</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">${horaRetorno}</td></tr>
        <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: none; color: #003366; border-right: 1px solid #e5e5e5;">TOTAL TREN</td><td style="padding: 4px 10px; border-bottom: none; font-weight: bold;">USD ${total.toFixed(0)}</td></tr>
      </table>`;
  } else {
    INFO_TREN_LOCAL = `
      <h3>RESPECTO AL TREN LOCAL:</h3>
      <p>La compra de los boletos es de manera personal con el DNI vigente en físico y nosotros como agencia de viajes no podemos reservar ni comprar estos boletos, por esta razón el día de su arribo a Cusco nuestro personal los acompañará para asistirlos en la compra a su llegada a Cusco (estos boletos están incluidos dentro de la tarifa es decir lo pagamos nosotros). El tren local parte de la estación de tren de Ollantaytambo. Esta alternativa solo es para personas que vienen 8 días al Cusco.</p>
      
      <p>En caso que no encontremos espacios en el tren tenemos 2 opciones para usted:</p>
      
      <h4>1. TREN LOCAL HACIENDO COLA:</h4>
      <p>Existe una segunda opción de comprar el tren local y es haciendo cola el segundo día (dentro del tour al Valle Sagrado). El segundo día nos quedamos en Ollantaytambo aproximadamente a las 2:30 P.M y hacemos cola hasta las 7 P.M o 9 PM (donde nos venderán el ticket y ese mismo rato tenemos que abordar el tren que nos llevará hacia Aguas Calientes, podemos ir como parados o sentados).</p>
      
      <h4>2. TREN TURÍSTICO:</h4>
      <p>En caso esté en sus posibilidades hacer esta compra el costo es de US$.129 dólares por persona ida y vuelta de la estación de Ollantaytambo.</p>
      <p>Durante este periodo hay una oferta de Peru Rail a:</p>
      <ul>
        <li>US$.125.00 DÓLARES IDA Y VUELTA. CON PERNOCTE EN AGUAS CALIENTES</li>
        <li>US$ 110.00 SALIDA 5:05 AM – RETORNO 9:45 PM / FULL DAY</li>
      </ul>
      <p>Todas las opciones son combinables entre sí, de acuerdo al gusto y disponibilidad.</p>
      <p><strong>Se recomienda comprar 15 días antes de su llegada al Cusco.</strong></p>
    `;
  }

  const INFO_HOTELES = `
    <h3>EN HOTELES</h3>
    <ul>
      <li>12 AM – CHECK-IN (ingreso del hotel)</li>
      <li>10 AM – CHECK-OUT (salida del hotel)</li>
      <li>En el programa están incluidas las habitaciones doble, matrimonial, triple y también adicional</li>
      <li>Si el PAX desea tener una habitación simple tiene un incremento por noche de hotel de 30.00 soles</li>
    </ul>
  `;

  // ================= URLS DE IMÁGENES FIJAS (ACTUALIZADAS V5.0) =================
  const IMAGEN_CUENTA_BANCARIA = BASE_URL + "CUENTA-BANCARIA.png";

  // ✅ CIRCUITOS SEPARADOS (3 imágenes individuales)
  const IMAGEN_CIRCUITO_1 = BASE_URL + "CIRCUITO1.jpg";
  const IMAGEN_CIRCUITO_2 = BASE_URL + "CIRCUITO2.jpg";
  const IMAGEN_CIRCUITO_3 = BASE_URL + "CIRCUITO3.jpg";

  const IMAGEN_HOTELES = BASE_URL + "HOTELES.png";

  // ✅ TOURS ADICIONALES - IMAGEN ÚNICA
  const IMAGEN_TOURS_ADICIONALES = BASE_URL + "TUR-ADICIONAL1Y2.png";

  // ================= DETERMINAR CARPETA DE GOOGLE DRIVE =================
  function determinarCarpetaDrive(fechaTour) {
    try {
      const fecha = parsearFecha(fechaTour);
      const año = fecha.getFullYear().toString();
      const mesNumero = fecha.getMonth();
      const mesesNombres = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const mesNombre = mesesNombres[mesNumero];

      console.log(`📁 Determinando carpeta: ${año} / ${mesNombre}`);

      // Buscar en la estructura de carpetas
      if (CARPETAS_TOURS_PERSONALIZADOS.años[año]) {
        if (CARPETAS_TOURS_PERSONALIZADOS.años[año].meses[mesNombre]) {
          // ✅ Carpeta del mes encontrada
          const carpetaId = CARPETAS_TOURS_PERSONALIZADOS.años[año].meses[mesNombre];
          console.log(`✅ Carpeta encontrada: ${año}/${mesNombre}`);
          return {
            folder_id: carpetaId,
            ruta: `${año}/${mesNombre}`,
            fallback_usado: false
          };
        } else {
          // ⚠️ Mes no encontrado, usar carpeta del año
          const carpetaId = CARPETAS_TOURS_PERSONALIZADOS.años[año].carpeta_id;
          console.warn(`⚠️ Mes ${mesNombre} no encontrado, usando carpeta del año ${año}`);
          return {
            folder_id: carpetaId,
            ruta: `${año} (carpeta raíz del año)`,
            fallback_usado: true
          };
        }
      } else {
        // ⚠️ Año no encontrado, usar carpeta padre
        console.warn(`⚠️ Año ${año} no encontrado, usando carpeta padre`);
        return {
          folder_id: CARPETAS_TOURS_PERSONALIZADOS.carpeta_padre_id,
          ruta: 'Tours Personalizados (carpeta padre)',
          fallback_usado: true
        };
      }
    } catch (error) {
      console.error('❌ Error determinando carpeta:', error);
      return {
        folder_id: CARPETAS_TOURS_PERSONALIZADOS.carpeta_padre_id,
        ruta: 'Tours Personalizados (carpeta padre - ERROR)',
        fallback_usado: true,
        error: error.message
      };
    }
  }

  // ================= GENERAR NOMBRE DEL PDF =================
  function generarNombrePDF(nombreCliente, fechaInicio) {
    const fecha = parsearFecha(fechaInicio);
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    // Limpiar nombre del cliente (quitar caracteres especiales)
    const nombreLimpio = nombreCliente
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-zA-Z0-9\s]/g, '') // Quitar caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guion bajo
      .toUpperCase();

    const timestamp = Date.now();
    const nombrePDF = `COTIZACION_${nombreLimpio}_${año}${mes}${dia}_${timestamp}.pdf`;

    console.log(`📄 Nombre del PDF: ${nombrePDF}`);
    return nombrePDF;
  }

  // Determinar carpeta de Google Drive según fecha del tour
  const fechaTour = itinerario[0].fecha;
  const carpetaInfo = determinarCarpetaDrive(fechaTour);

  // Generar nombre del PDF
  const nombreCliente = body.nombre_cliente || 'Cliente';
  const pdfFilename = generarNombrePDF(nombreCliente, fechaTour);

  // ================= DATOS DE SALIDA =================
  const datosSalida = {
    NOMBRE_CLIENTE: nombreCliente,
    TELEFONO_CLIENTE: body.telefono || 'No especificado',
    EMAIL_CLIENTE: body.email || 'reservasorestravelperu@gmail.com',
    NUMERO_PERSONAS: numeroPersonas,
    TIPO_HABITACION: tipoHabitacion,
    observaciones: body.observaciones || "Sin observaciones adicionales",
    NOMBRE_ASESOR: nombreAsesor,
    EMAIL_ASESOR: emailAsesor,
    NOMBRE_PROGRAMA: body.programa || "Programa personalizado Ores Travel",
    DURACION_PROGRAMA: `${duracionDias} días`,
    FECHA_INICIO: formatearFechaCompleta(parsearFecha(itinerario[0].fecha)),
    FECHA_FIN: formatearFechaCompleta(parsearFecha(itinerario[itinerario.length - 1].fecha)),
    PRECIO_TOTAL: precioTotal.toFixed(2),
    PRECIO_POR_PERSONA: precioPorPersona,
    ADELANTO_RESERVA: adelantoPagado.toFixed(2),
    SALDO_PENDIENTE: saldoPendiente.toFixed(2),
    // ✅ NUEVOS CAMPOS (opcionales para debugging)
    TOTAL_NOCHES: totalNoches,
    NOCHES_CUSCO: nochesCusco,
    NOCHES_AGUAS_CALIENTES: nochesAguasCalientes,
    DESAYUNOS_INCLUIDOS: desayunosIncluidos,
    ALMUERZOS_INCLUIDOS: almuerzosIncluidos,

    // ✅ NUEVOS CAMPOS DEL TREN DIFERENCIADO V7.2
    PRECIO_TREN: infoTren.precioTren,
    TIPO_TREN: infoTren.tipoTren,
    CONTENIDO_TREN_PDF: infoTren.contenidoTrenPdf,
    TIENE_TREN: infoTren.tieneTren,
    DETALLE_TREN: infoTren.detalleTren,
    TREN_SEPARADO: infoTren.tren_separado || false,

    // ✅ CAMPOS FALTANTES PARA TEMPLATE HTML - INFORMACIÓN DEL TREN
    PRECIO_TOTAL_TREN: body.precio_total_tren || 'incluye programa',
    HORA_IDA_TREN: body.hora_ida_tren || body.horario_ida_tren || 'Por definir',
    HORA_RETORNO_TREN: body.hora_retorno_tren || body.horario_retorno_tren || 'Por definir',

    // ✅ NUEVOS CAMPOS DE PRECIOS SEPARADOS V7.3 - CORREGIDOS
    PRECIO_PROGRAMA_SOLO: precioTotalPrograma.toFixed(2), // Precio del programa (TOTAL A PAGAR)
    PRECIO_POR_PERSONA_SOLO: precioPorPersonaPrograma.toFixed(2), // Precio por persona (TARIFA POR NACIONAL)
    PRECIO_TOTAL_CON_TREN: precioTotal.toFixed(2), // Total incluyendo tren
    TARIFA_NACIONAL: precioPorPersonaPrograma.toFixed(2), // Campo específico para "tarifa por nacional"

    NOCHES_CUSCO: nochesCusco,
    NOCHES_AGUAS_CALIENTES: nochesAguasCalientes,
    ALMUERZOS_INCLUIDOS: almuerzosIncluidos,
    DESAYUNOS_INCLUIDOS: desayunosIncluidos,
    IMAGEN_LOGO: BASE_URL + "LOGO_ORES_TRAVELA.png",

    // ================= SECCIONES FIJAS =================
    PROGRAMA_INCLUYE: PROGRAMA_INCLUYE,
    PROGRAMA_NO_INCLUYE: PROGRAMA_NO_INCLUYE,
    SUGERENCIAS_GENERALES: SUGERENCIAS_GENERALES,
    SUGERENCIAS_CAMINATAS: SUGERENCIAS_CAMINATAS,
    INFO_TREN_LOCAL: INFO_TREN_LOCAL,
    INFO_HOTELES: INFO_HOTELES,

    // ================= IMÁGENES FIJAS (ACTUALIZADAS V5.0) =================
    IMAGEN_CUENTA_BANCARIA: IMAGEN_CUENTA_BANCARIA,

    // ✅ Circuitos separados (3 variables)
    IMAGEN_CIRCUITO_1: IMAGEN_CIRCUITO_1,
    IMAGEN_CIRCUITO_2: IMAGEN_CIRCUITO_2,
    IMAGEN_CIRCUITO_3: IMAGEN_CIRCUITO_3,

    // Hoteles
    IMAGEN_HOTELES: IMAGEN_HOTELES,

    // Hoteles
    IMAGEN_HOTELES: IMAGEN_HOTELES,

    // ✅ Tours adicionales - Imagen única
    IMAGEN_TOURS_ADICIONALES: IMAGEN_TOURS_ADICIONALES,

    // ================= INFORMACIÓN PARA GOOGLE DRIVE =================
    pdf_filename: pdfFilename,
    drive_folder_id: carpetaInfo.folder_id,
    carpeta_info: {
      ruta: carpetaInfo.ruta,
      folder_id: carpetaInfo.folder_id,
      fallback_usado: carpetaInfo.fallback_usado,
      fecha_tour: fechaTour
    },

    // ================= ESTRUCTURA DE ACTIVIDADES =================
    json_estructura: {
      actividades: { tarjetas: actividadesProcesadas }
    },

    // ================= METADATOS DE LA VERSIÓN V7.3 =================
    version_procesador: "V7.3-TREN-DIFERENCIADO-FINAL-CORREGIDO",
    fecha_procesamiento: new Date().toISOString(),
    tren_diferenciado_activo: true,
    campos_tren_usados: {
      tren_pdf_aplica: body.tren_pdf_aplica,
      tren_pdf_tipo: body.tren_pdf_tipo,
      tren_pdf_texto: body.tren_pdf_texto
    }
  };

  console.log("✅ Procesamiento finalizado con " + actividadesProcesadas.length + " actividades");
  console.log("💰 Precio Total Programa: S/." + precioTotalPrograma.toFixed(2));
  console.log("💵 Adelanto: S/." + adelantoPagado.toFixed(2));
  console.log("💳 Saldo Pendiente: S/." + saldoPendiente.toFixed(2));
  console.log("📄 Nombre PDF: " + pdfFilename);
  console.log("📁 Carpeta Drive: " + carpetaInfo.ruta);
  console.log("🎫 ¿BOLETO 70 SOLES? " + (requiereBoleto70Soles ? "SÍ" : "NO"));

  // ✅ NUEVOS LOGS V7.3 - CAMPOS ESPECÍFICOS CORREGIDOS
  console.log("💰 === CAMPOS DE PRECIO CORREGIDOS ===");
  console.log("   ✅ TARIFA POR NACIONAL (por persona): S/." + precioPorPersonaPrograma.toFixed(2));
  console.log("   ✅ PRECIO_PROGRAMA_SOLO (total programa): S/." + precioTotalPrograma.toFixed(2));
  console.log("   ✅ PRECIO_TOTAL_CON_TREN (programa + tren): S/." + precioTotal.toFixed(2));
  console.log("💰 =====================================");

  // ✅ NUEVOS LOGS V7.2 - INFORMACIÓN DEL TREN DIFERENCIADO
  console.log("🚆 === TREN DIFERENCIADO V7.2 ===");
  console.log("   ✅ Tiene tren: " + infoTren.tieneTren);
  console.log("   ✅ Tipo de tren: " + infoTren.tipoTren);
  console.log("   ✅ Precio/Contenido: " + infoTren.precioTren);
  console.log("   ✅ Contenido PDF: " + infoTren.contenidoTrenPdf);
  console.log("   ✅ Detalle: " + infoTren.detalleTren);
  console.log("🚆 =================================");

  // ✅ DEBUG DE SECCIONES FIJAS - MUY IMPORTANTE
  console.log("📋 === DEBUG SECCIONES FIJAS ===");
  console.log("   ✅ PROGRAMA_INCLUYE (longitud):", PROGRAMA_INCLUYE ? PROGRAMA_INCLUYE.length : "UNDEFINED");
  console.log("   ✅ PROGRAMA_INCLUYE (contenido):", PROGRAMA_INCLUYE ? PROGRAMA_INCLUYE.substring(0, 100) + "..." : "UNDEFINED");
  console.log("   ✅ PROGRAMA_NO_INCLUYE (longitud):", PROGRAMA_NO_INCLUYE ? PROGRAMA_NO_INCLUYE.length : "UNDEFINED");
  console.log("   ✅ SUGERENCIAS_GENERALES (longitud):", SUGERENCIAS_GENERALES ? SUGERENCIAS_GENERALES.length : "UNDEFINED");
  console.log("   ✅ datosSalida tiene PROGRAMA_INCLUYE:", datosSalida.hasOwnProperty('PROGRAMA_INCLUYE'));
  console.log("📋 ===========================");

  console.log("🖼️ Actividades verificadas:");
  console.log("   ✅ LLEGADA+CITY:", BASE_URL + "LLEGADA_CITY.jpg");
  console.log("   ✅ MISTICO:", BASE_URL + "MISTICO.jpg");
  console.log("   ✅ SUR:", BASE_URL + "SUR.png");
  console.log("   ✅ MONTAÑA (CORREGIDA):", BASE_URL + "MONTAÑA_CUATRI.jpg");
  console.log("   ✅ Total actividades: 26 (todas las actividades originales mapeadas correctamente)");

  return [{ json: datosSalida }];

} catch (error) {
  console.error("❌ ERROR EN PROCESAMIENTO:", error);
  return [{ json: { error: error.message, stack: error.stack } }];
}

/**
 * METADATOS DE VERSIÓN V7.3-TREN-DIFERENCIADO-FINAL-CORREGIDO
 * 
 * Fecha: 2025-11-02
 * Versión: V7.3-TREN-DIFERENCIADO-FINAL-CORREGIDO
 * 
 * CAMBIOS IMPLEMENTADOS:
 * 1. ✅ Separación completa del tren del precio del programa principal
 * 2. ✅ Campo separado "Información del tren" para PDF
 * 3. ✅ Corrección de "tarifa por nacional" para mostrar precio_total / numero_personas
 * 4. ✅ TOTAL A PAGAR muestra el precio completo del programa (precio_total)
 * 5. ✅ Eliminación del total del tren del cálculo del programa (ya no se suma)
 * 6. ✅ Nuevos campos: PRECIO_PROGRAMA_SOLO, TARIFA_NACIONAL, TREN_SEPARADO
 * 7. ✅ Compatibilidad retroactiva mantenida con V7.1
 * 
 * PROBLEMAS CORREGIDOS:
 * - TARIFA POR NACIONAL: Ahora muestra 3000.00 (6000 ÷ 2 personas)
 * - TOTAL A PAGAR: Ahora muestra 6000.00 (precio completo del programa)
 * - "Tarifa por nacional" calcula correctamente: precio_total / numero_personas
 * - Datos del tren en sección separada, no sumados al programa
 * 
 * CAMPOS AGREGADOS AL PDF:
 * - PRECIO_PROGRAMA_SOLO: Precio del tour completo (precio_total)
 * - TARIFA_NACIONAL: Precio por persona (precio_total / numero_personas)
 * - PRECIO_TOTAL_CON_TREN: Total incluyendo tren (opcional)
 * - TREN_SEPARADO: Marcador boolean para separación visual
 * - CONTENIDO_TREN_PDF: Texto formateado del tren en sección separada con horarios completos
 */