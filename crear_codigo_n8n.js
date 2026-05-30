const fs = require('fs');

// Leer la base de datos de programas fijos
const dbContent = fs.readFileSync('db_programas_fijos.json', 'utf8');

// Código del nodo para n8n
const codigoN8n = `// 1. Base de Datos Maestra de Programas Fijos
const DB_PROGRAMAS_FIJOS = ${dbContent};

// 2. Obtener datos del webhook / typeform
const item = (Array.isArray(items) && items[0]) ? items[0] : items;
const body = item.json.body || item.json || item;

// 3. Capturar el identificador del programa
const programaInput = body.codigo_programa || body.programa_seleccionado || 'aventura_cusqueña_3d2n_s420_basico_machu_picchu';

// Función de normalización mejorada
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9\\s]/g, '').replace(/\\s+/g, ' ').trim();
}

function extraerPalabrasClave(texto) {
    return normalizarTexto(texto).split(' ').filter(palabra => palabra.length > 1);
}

let codigo_programa = null;

if (DB_PROGRAMAS_FIJOS[programaInput]) {
    codigo_programa = programaInput;
} else {
    // Casos especiales directos (v7.19)
    const programaLimpio = normalizarTexto(programaInput);
    const casosEspeciales = {
        "3d2n basico": "aventura_cusqueña_3d2n_s420_basico_machu_picchu",
        "4d3n valle vip": "aventura_cusqueña_4d3n_s520_valle_vip_machu_picchu",
        "5d4n montaña": "aventura_cusqueña_5d4n_s590_montaña_colores_completo",
        "6d5n mistico": "aventura_cusqueña_6d5n_s690_mistico_valle_sur",
        "6d5n laguna": "aventura_cusqueña_6d5n_s690_laguna_humantay_completo",
        "7d6n valle sur": "aventura_cusqueña_7d6n_s790_valle_sur_completo",
        "8d7n mistico": "aventura_cusqueña_8d7n_s890_mistico_sur_premium",
        "10d9n premium": "aventura_cusqueña_10d9n_s1180_premium_completo_tren_local",
        "4d4n sin ingreso": "tours_sin_mapi_4d4n_s550_valle_vip_sin_ingreso",
        "5d5n ida aguas": "tours_sin_mapi_5d5n_s550_ida_aguas_calientes",
        "valle sur": "aventura_cusqueña_6d5n_s690_mistico_valle_sur",
        "mistico": "aventura_cusqueña_8d7n_s890_mistico_sur_premium"
    };

    let casoEncontrado = false;
    for (const [caso, clave] of Object.entries(casosEspeciales)) {
        if (programaLimpio.includes(caso)) {
            codigo_programa = clave;
            casoEncontrado = true;
            break;
        }
    }

    if (!casoEncontrado) {
        // Scoring Inteligente v7.19
        const palabrasClavePrograma = extraerPalabrasClave(programaInput);
        const candidatosConScore = [];
        
        for (const clavePrograma of Object.keys(DB_PROGRAMAS_FIJOS)) {
            const programaInfo = DB_PROGRAMAS_FIJOS[clavePrograma];
            const palabrasClaveMapeo = extraerPalabrasClave(clavePrograma);
            const nombreProgramaNormalizado = normalizarTexto(programaInfo.titulo_programa);
            
            let score = 0;
            for (const palabraUsuario of palabrasClavePrograma) {
                if (palabrasClaveMapeo.includes(palabraUsuario)) score += 30;
                else if (palabrasClaveMapeo.some(p => p.includes(palabraUsuario) || palabraUsuario.includes(p))) score += 15;
                if (nombreProgramaNormalizado.includes(palabraUsuario)) score += 5;
            }
            
            const incluyeMistico = palabrasClavePrograma.includes('mistico');
            const nombreTieneMistico = nombreProgramaNormalizado.includes('mistico');
            if (incluyeMistico && nombreTieneMistico) score += 50;
            if (palabrasClavePrograma.includes('6d5n') && incluyeMistico) score += 25;
            
            if (clavePrograma.includes('_') && palabrasClavePrograma.length === 1) score -= 10;
            
            if (score > 0) {
                candidatosConScore.push({ clave: clavePrograma, score: score });
            }
        }
        
        if (candidatosConScore.length > 0) {
            candidatosConScore.sort((a, b) => b.score - a.score);
            codigo_programa = candidatosConScore[0].clave;
        } else {
            codigo_programa = 'aventura_cusqueña_3d2n_s420_basico_machu_picchu';
        }
    }
}

// 4. Seleccionar la plantilla del programa
const programa = DB_PROGRAMAS_FIJOS[codigo_programa];

// 5. Cálculos Financieros y de Variables
const numeroPersonas = parseInt(body.numero_personas) || 2;

let precioTotalPrograma;
if (body.precio_total && !isNaN(parseFloat(body.precio_total))) {
    precioTotalPrograma = parseFloat(body.precio_total);
} else {
    // Extraer automáticamente el precio del código del programa (ej: ..._s590_...)
    const matchPrecio = codigo_programa.match(/_s(\\d+)_/);
    if (matchPrecio) {
        const precioExtraidoPorPersona = parseFloat(matchPrecio[1]);
        precioTotalPrograma = precioExtraidoPorPersona * numeroPersonas;
    } else {
        precioTotalPrograma = 840; // Fallback por defecto si no se encuentra
    }
}

const adelantoPagado = parseFloat(body.adelanto_pagado) || 400;
const saldoPendiente = precioTotalPrograma - adelantoPagado;
const precioPorPersona = precioTotalPrograma / numeroPersonas;

// 5.1. Lógica de Fechas (Auto-cálculo)
let fechaInput = body.fecha_viaje || body.fecha_inicio || body.fecha_tour;
let fechaInicioStr = fechaInput || "Por confirmar";
let fechaFinStr = body.fecha_fin || "Por confirmar";
let dateObjInicio = null;

if (fechaInput) {
    // Si la fecha de inicio viene en formato YYYY-MM-DD
    dateObjInicio = new Date(fechaInput + "T12:00:00Z");
    if (!isNaN(dateObjInicio.getTime())) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaInicioStr = dateObjInicio.toLocaleDateString('es-PE', opciones);
        
        // Extraer los días de duracionPrograma (ej. "3 Días / 2 Noches")
        const diasMatch = programa.dias_noches.match(/(\\d+)\\s*[Dd]/);
        let diasNum = 1;
        if (diasMatch) {
            diasNum = parseInt(diasMatch[1], 10);
        }
        
        // Calcular fecha fin = fecha_inicio + (dias - 1)
        const dateFin = new Date(dateObjInicio.getTime());
        dateFin.setDate(dateFin.getDate() + (diasNum - 1));
        fechaFinStr = dateFin.toLocaleDateString('es-PE', opciones);
    }
}

// Base URL de Supabase para las imágenes de sistema
const BASE_URL = 'https://nqouocmxfvcpyemxvobm.supabase.co/storage/v1/object/public/ores-travel-pdf/';

// 6. Preparar Datos de Salida (Estructura para el Generador HTML)
const datosSalida = {
    NOMBRE_CLIENTE: body.nombre_cliente || 'Cotización Andean Journey',
    TELEFONO_CLIENTE: body.telefono || 'No especificado',
    EMAIL_CLIENTE: body.email || 'info@andeanjourney.com',
    NUMERO_PERSONAS: numeroPersonas,
    TIPO_HABITACION: body.tipo_habitacion || 'Doble/Matrimonial',
    observaciones: body.observaciones || 'Sin observaciones adicionales',
    NOMBRE_ASESOR: body.nombre_asesor || 'Equipo Andean Journey',
    EMAIL_ASESOR: body.email_asesor || 'info@andeanjourney.com',
    
    NOMBRE_PROGRAMA: programa.titulo_programa,
    DURACION_PROGRAMA: programa.dias_noches,
    FECHA_INICIO: fechaInicioStr,
    FECHA_FIN: fechaFinStr,
    PRECIO_TOTAL: precioTotalPrograma.toFixed(2),
    PRECIO_POR_PERSONA: precioPorPersona.toFixed(2),
    ADELANTO_RESERVA: adelantoPagado.toFixed(2),
    SALDO_PENDIENTE: saldoPendiente.toFixed(2),

    PRECIO_TREN: body.precio_tren || 'Aplica tren local',
    HORA_IDA_TREN: body.hora_ida_tren || 'Por confirmar',
    HORA_RETORNO_TREN: body.hora_retorno_tren || 'Por confirmar',
    PRECIO_TOTAL_TREN: body.precio_total_tren || 'incluye programa',
    TIPO_TREN: body.tipo_tren || 'Tren Local',

    json_estructura: {
      actividades: { tarjetas: programa.itinerario.map(dia => {
        // Calcular la fecha exacta de cada día del itinerario
        let fechaDiaStr = "Día " + dia.dia + " del tour";
        if (typeof dateObjInicio !== 'undefined' && dateObjInicio && !isNaN(dateObjInicio.getTime())) {
            const dateDia = new Date(dateObjInicio.getTime());
            dateDia.setDate(dateDia.getDate() + (dia.dia - 1));
            fechaDiaStr = dateDia.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }

        return {
          titulo_dia: dia.titulo,
          fecha_dia: fechaDiaStr,
          descripcion: "<ul>" + dia.actividades.map(act => "<li>" + act + "</li>").join("") + "</ul>",
          imagen: dia.imagen,
          incluye: "", 
          no_incluye: "" 
        };
      })}
    },

    // APLICAMOS EL NUEVO DISEÑO MINIMALISTA DIRECTAMENTE EN EL HTML GENERADO
    PROGRAMA_INCLUYE: programa.incluye && programa.incluye.length > 0 
      ? \`<h3>NUESTRO PROGRAMA INCLUYE POR PERSONA:</h3><ul>\` + programa.incluye.map(i => \`<li>\${i}</li>\`).join("") + \`</ul>\` 
      : "",
      
    PROGRAMA_NO_INCLUYE: programa.no_incluye && programa.no_incluye.length > 0 
      ? \`<h3>NO INCLUYE:</h3><ul>\` + programa.no_incluye.map(i => \`<li>\${i}</li>\`).join("") + \`</ul>\` 
      : "",
      
    SUGERENCIAS_GENERALES: programa.sugerencias_llevar && programa.sugerencias_llevar.length > 0 
      ? \`<h3>SUGERENCIAS QUE DEBE LLEVAR:</h3><ul>\` + programa.sugerencias_llevar.map(i => \`<li>\${i}</li>\`).join("") + \`</ul>\` 
      : "",
      
    SUGERENCIAS_CAMINATAS: programa.sugerencias_caminatas && programa.sugerencias_caminatas.length > 0 
      ? \`<h3>SUGERENCIAS PARA TOUR DE CAMINATAS:</h3><ul>\` + programa.sugerencias_caminatas.map(i => \`<li>\${i}</li>\`).join("") + \`</ul>\` 
      : "",
      
    INFO_TREN_LOCAL: (() => {
      const tipoTren = (body.tipo_transporte || "local").toLowerCase();
      if (tipoTren === "turistico" || tipoTren === "vistadome") {
        const personas = body.numero_personas || 0;
        const precio = parseFloat(body.precio_por_persona_tren || "100");
        const horaIda = body.horario_ida_tren || body.hora_ida_tren || "Por confirmar";
        const horaRetorno = body.horario_retorno_tren || body.hora_retorno_tren || "Por confirmar";
        const total = body.precio_total_tren || (personas * precio);
        
        return \`<h3>DETALLES DEL TREN TURÍSTICO:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 10pt; background: transparent; border: 1px solid rgba(234, 234, 234, 0.8); border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 12px; overflow: hidden;">
            <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5; width: 35%;">NÚMERO DE PERSONAS</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">\${personas}</td></tr>
            <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">PRECIO DEL TREN</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">USD \${precio} (tren turistico)</td></tr>
            <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">HORA IDA</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">\${horaIda}</td></tr>
            <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: 1px solid #f0f0f0; color: #003366; border-right: 1px solid #e5e5e5;">HORA RETORNO</td><td style="padding: 4px 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">\${horaRetorno}</td></tr>
            <tr><td style="font-weight: bold; padding: 4px 10px; border-bottom: none; color: #003366; border-right: 1px solid #e5e5e5;">TOTAL TREN</td><td style="padding: 4px 10px; border-bottom: none; font-weight: bold;">USD \${total}</td></tr>
          </table>\`;
      } else {
        return programa.respecto_tren_local && programa.respecto_tren_local.length > 0 
          ? \`<h3>RESPECTO AL TREN LOCAL:</h3><div style="font-weight: bold; font-size: 9.5pt; text-align: justify; line-height: 1.4;">\` + 
            programa.respecto_tren_local.map(item => item.match(/^[0-9]\\./) ? \`<p style="margin-bottom: 10px;"><strong>\${item}</strong></p>\` : \`<p style="margin-bottom: 10px;">\${item}</p>\`).join("") + 
            \`</div>\` 
          : "";
      }
    })(),
      
    INFO_HOTELES: programa.info_hoteles && programa.info_hoteles.length > 0 
      ? \`<h3>EN HOTELES</h3><ul>\` + programa.info_hoteles.map(i => \`<li>\${i}</li>\`).join("") + \`</ul>\` 
      : "",

    IMAGEN_LOGO: BASE_URL + 'LOGO_ORES_TRAVELA.png',
    IMAGEN_CUENTA_BANCARIA: BASE_URL + 'CUENTA-BANCARIA.png',
    IMAGEN_CIRCUITO_1: BASE_URL + 'CIRCUITO1.jpg',
    IMAGEN_CIRCUITO_2: BASE_URL + 'CIRCUITO2.jpg',
    IMAGEN_CIRCUITO_3: BASE_URL + 'CIRCUITO3.jpg',
    IMAGEN_HOTELES: BASE_URL + 'HOTELES.png',
    IMAGEN_TOURS_ADICIONALES: BASE_URL + 'TUR-ADICIONAL1Y2.png'
};

return [{ json: datosSalida }];
`;

fs.writeFileSync('CODIGO_N8N_FIJOS.js', codigoN8n);
console.log("Archivo creado: CODIGO_N8N_FIJOS.js");
