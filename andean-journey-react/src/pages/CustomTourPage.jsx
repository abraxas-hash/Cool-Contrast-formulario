import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    ArrowLeft, Check, CheckCircle2, FileText, Share2, Download, Copy, Hotel, User, Users, Phone, Calendar, DollarSign, 
    Sparkles, AlertCircle, Search, ChevronRight, Info, Lock, Sun, Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import ElectricBorder from '../components/ui/ElectricBorder.jsx';

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';
const WEBHOOK_URL = 'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf';

// Definición oficial de actividades y metadatos
const ACTIVIDADES_CATALOGO = {
    'LLEGADA': { emoji: '🛬', categoria: 'traslados', incluye_machu_picchu: false, desc: 'Recepción en aeropuerto y traslado al hotel' },
    'LLEGADA+CITY': { emoji: '🛬🏛️', categoria: 'traslados', incluye_machu_picchu: false, desc: 'Llegada con tour guiado en la ciudad imperial' },
    'IDA-CUZ': { emoji: '🚂', categoria: 'traslados', incluye_machu_picchu: false, desc: 'Traslado en tren hacia Cusco' },
    'OLLANTAY-IDA': { emoji: '🚂', categoria: 'traslados', incluye_machu_picchu: false, desc: 'Traslado a estación Ollantaytambo' },
    'SALIDA': { emoji: '✈️', categoria: 'traslados', incluye_machu_picchu: false, desc: 'Traslado de salida al aeropuerto' },
    'CITY': { emoji: '🏛️', categoria: 'principales', incluye_machu_picchu: false, desc: 'Qoricancha, Sacsayhuaman, Qenqo y Tambomachay' },
    'MÍSTICO': { emoji: '🌟', categoria: 'principales', incluye_machu_picchu: false, desc: 'Morada de los Dioses, Valle de los Duendes y Humedal' },
    'MAPI': { emoji: '🏔️', categoria: 'principales', incluye_machu_picchu: true, desc: 'Visita guiada a la ciudadela sagrada de Machu Picchu' },
    'MAPI 3 AM': { emoji: '🌅', categoria: 'principales', incluye_machu_picchu: true, desc: 'Salida de madrugada para amanecer en Machu Picchu' },
    'FULL MAPI': { emoji: '🌅', categoria: 'principales', incluye_machu_picchu: true, desc: 'Full Day completo en Machu Picchu con trenes' },
    'FOTOGRAFIA': { emoji: '📸', categoria: 'principales', incluye_machu_picchu: false, desc: 'Sesión fotográfica en spots icónicos de Cusco' },
    'LIBRE-SIN GUIA': { emoji: '🆓', categoria: 'principales', incluye_machu_picchu: false, desc: 'Día libre para exploración personal en la ciudad' },
    'VALLE+MAPI': { emoji: '🌄', categoria: 'valle', incluye_machu_picchu: true, desc: 'Valle Sagrado completo conectado con Machu Picchu' },
    'VALLE+PISAC': { emoji: '🌾', categoria: 'valle', incluye_machu_picchu: false, desc: 'Mercado artesanal y ruinas sagradas de Pisac' },
    'VALLE+OLLANTAY': { emoji: '🏛️', categoria: 'valle', incluye_machu_picchu: false, desc: 'Fortaleza viviente de Ollantaytambo y poblado' },
    'MONTAÑA': { emoji: '🗻', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Trekking hacia Vinicunca (Montaña de 7 Colores)' },
    'SUR': { emoji: '⛰️', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Valle Sur: Tipón, Pikillacta y Andahuaylillas' },
    'WAQRAPUKARA': { emoji: '🏔️', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Aventura al enigmático templo fortaleza sobre el cañón' },
    'MONTAÑA+CUATRI': { emoji: '🏍️', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Montaña de Colores combinada con aventura ATV' },
    'PUENTE': { emoji: '🌉', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Visita al milenario puente inca de Qeswachaka' },
    'MORADA-BUS': { emoji: '🚌', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Morada de los Dioses en transporte panorámico' },
    'MORADA-CUATRI': { emoji: '🏍️', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Aventura en Cuatrimotos hacia Morada de los Dioses' },
    'PALCOYO': { emoji: '🎨', categoria: 'montanas', incluye_machu_picchu: false, desc: 'Cordillera de colores alternativa y bosque de piedras' },
    'LAGUNA': { emoji: '🌊', categoria: 'lagunas', incluye_machu_picchu: false, desc: 'Trekking a la espectacular Laguna Humantay' },
    '7 LAGUNA': { emoji: '💧', categoria: 'lagunas', incluye_machu_picchu: false, desc: 'Circuito de las 7 Lagunas al pie del nevado Ausangate' },
    'MORADA-CUATRI-LAGU': { emoji: '🏍️🌊', categoria: 'lagunas', incluye_machu_picchu: false, desc: 'Cuatrimotos y visita a la laguna Piuray/Huaypo' }
};

const CATEGORIAS = [
    { id: 'all', label: 'Todas', emoji: '🌟' },
    { id: 'principales', label: 'Principales', emoji: '⭐' },
    { id: 'montanas', label: 'Montañas', emoji: '🏔️' },
    { id: 'valle', label: 'Valle', emoji: '🌄' },
    { id: 'lagunas', label: 'Lagunas', emoji: '💧' },
    { id: 'traslados', label: 'Traslados', emoji: '✈️' }
];

export default function CustomTourPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const theme = localStorage.getItem('andean-theme');
        return theme !== 'light';
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('andean-theme', next ? 'dark' : 'light');
            return next;
        });
    };

    useEffect(() => {
        document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Estado de actividades
    const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);
    const [filtroCat, setFiltroCat] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Paso 2: Itinerario
    const [actividadInicial, setActividadInicial] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');

    // Paso 3: Transporte
    const [tipoTransporte, setTipoTransporte] = useState('local'); // local | turistico
    const [transporteConfig, setTransporteConfig] = useState({
        personas_tren: '',
        hora_tren: '07:05 AM',
        fecha_tren: '',
        precio_total_tren: ''
    });

    // Paso 4: Alojamiento
    const [alojamiento, setAlojamiento] = useState({
        tipo_habitacion: 'Matrimonial o Doble',
        categoria_hotel: '3 Estrellas Premium'
    });
    const [nochesPorDia, setNochesPorDia] = useState({});

    // Paso 5: Modalidad Precio
    const [modalidadPrecio, setModalidadPrecio] = useState('paquete'); // paquete | individual
    const [precioPaquete, setPrecioPaquete] = useState('');
    const [preciosIndividuales, setPreciosIndividuales] = useState({});

    // Paso 6: Cliente
    const [cliente, setCliente] = useState({
        nombre_cliente: '',
        telefono: '',
        numero_personas: '2 adultos',
        observaciones: '',
        adelanto_pagado: '0'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successResult, setSuccessResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [mostrarResumenConfirmacion, setMostrarResumenConfirmacion] = useState(false);

    // Detección de Machu Picchu
    const incluyeMachuPicchu = useMemo(() => {
        return actividadesSeleccionadas.some(act => ACTIVIDADES_CATALOGO[act]?.incluye_machu_picchu);
    }, [actividadesSeleccionadas]);

    // Filtrar lista de actividades
    const actividadesFiltradas = useMemo(() => {
        return Object.entries(ACTIVIDADES_CATALOGO).filter(([nombre, item]) => {
            const matchesCat = filtroCat === 'all' || item.categoria === filtroCat;
            const matchesSearch = nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.desc.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [filtroCat, searchQuery]);

    // Generar Itinerario Dinámico
    const itinerarioGenerado = useMemo(() => {
        if (!fechaInicio || actividadesSeleccionadas.length === 0) return [];
        
        let ordenadas = [...actividadesSeleccionadas];
        if (actividadInicial && ordenadas.includes(actividadInicial)) {
            ordenadas = [actividadInicial, ...ordenadas.filter(a => a !== actividadInicial)];
        }

        const baseDate = new Date(`${fechaInicio}T12:00:00`);
        return ordenadas.map((act, index) => {
            const curDate = new Date(baseDate);
            curDate.setDate(curDate.getDate() + index);
            return {
                dia: index + 1,
                fecha: curDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                fechaRaw: curDate.toISOString().split('T')[0],
                actividad: act
            };
        });
    }, [actividadesSeleccionadas, actividadInicial, fechaInicio]);

    // Sincronizar noches y precios por defecto
    useEffect(() => {
        if (actividadesSeleccionadas.length > 0 && !actividadInicial) {
            setActividadInicial(actividadesSeleccionadas[0]);
        }

        // Inicializar nochesPorDia
        const nuevasNoches = {};
        itinerarioGenerado.forEach(it => {
            nuevasNoches[`dia_${it.dia}`] = nochesPorDia[`dia_${it.dia}`] ?? 1;
        });
        setNochesPorDia(nuevasNoches);

        // Inicializar preciosIndividuales
        const nuevosPrecios = {};
        actividadesSeleccionadas.forEach(act => {
            nuevosPrecios[act] = preciosIndividuales[act] ?? '';
        });
        setPreciosIndividuales(nuevosPrecios);
    }, [actividadesSeleccionadas, fechaInicio]);

    const totalNoches = useMemo(() => {
        return Object.values(nochesPorDia).reduce((a, b) => a + (parseInt(b) || 0), 0);
    }, [nochesPorDia]);

    const subtotalIndividuales = useMemo(() => {
        return Object.values(preciosIndividuales).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    }, [preciosIndividuales]);

    const toggleActividad = (nombre) => {
        if (actividadesSeleccionadas.includes(nombre)) {
            setActividadesSeleccionadas(prev => prev.filter(a => a !== nombre));
        } else {
            setActividadesSeleccionadas(prev => [...prev, nombre]);
        }
    };

    const handleNocheChange = (diaKey, val) => {
        setNochesPorDia(prev => ({ ...prev, [diaKey]: parseInt(val) || 0 }));
    };

    const handlePrecioIndChange = (act, val) => {
        setPreciosIndividuales(prev => ({ ...prev, [act]: val }));
    };

    const handleClienteChange = (e) => {
        const { name, value } = e.target;
        setCliente(prev => ({ ...prev, [name]: value }));
    };

    const handlePreRevisar = (e) => {
        if (e) e.preventDefault();
        setError(null);

        if (actividadesSeleccionadas.length === 0) {
            setError('Por favor selecciona al menos una actividad en el Paso 1.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!fechaInicio) {
            setError('Por favor selecciona la Fecha de Inicio en el Paso 2.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!cliente.nombre_cliente || !cliente.telefono) {
            setError('Por favor completa el Nombre Completo y Teléfono del cliente en el Paso 6.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setMostrarResumenConfirmacion(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setError(null);

        if (actividadesSeleccionadas.length === 0) {
            setError('Por favor selecciona al menos una actividad en el Paso 1.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!fechaInicio) {
            setError('Por favor selecciona la Fecha de Inicio en el Paso 2.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!cliente.nombre_cliente || !cliente.telefono) {
            setError('Por favor completa el Nombre Completo y Teléfono del cliente en el Paso 6.');
            return;
        }

        setLoading(true);

        // Formatear noches para webhook
        const nochesObj = {};
        itinerarioGenerado.forEach(it => {
            nochesObj[`dia_${it.dia}`] = {
                actividad: it.actividad,
                fecha: it.fecha,
                noches: nochesPorDia[`dia_${it.dia}`] || 1
            };
        });

        // Formatear precios individuales
        const preciosObj = {};
        if (modalidadPrecio === 'individual') {
            actividadesSeleccionadas.forEach(act => {
                preciosObj[act] = parseFloat(preciosIndividuales[act]) || 0;
            });
        }

        const payload = {
            origen: 'formulario_web_react',
            tipo_tour: 'personalizado',
            tipo_cotizacion: 'TOUR PERSONALIZADO',
            programa: actividadesSeleccionadas.join(', '),
            actividades_seleccionadas: actividadesSeleccionadas,
            itinerario: itinerarioGenerado,

            nombre_cliente: cliente.nombre_cliente,
            telefono: cliente.telefono,
            numero_personas: cliente.numero_personas || '2',

            fecha_tour: fechaInicio,
            actividad_inicial: actividadInicial,

            tipo_transporte: incluyeMachuPicchu ? tipoTransporte : 'No Aplica',
            personas_tren: transporteConfig.personas_tren || cliente.numero_personas,
            hora_tren: transporteConfig.hora_tren,
            fecha_tren: transporteConfig.fecha_tren || fechaInicio,
            precio_total_tren: transporteConfig.precio_total_tren || null,

            tipo_habitacion: alojamiento.tipo_habitacion,
            categoria_hotel: alojamiento.categoria_hotel,
            noches_por_dia: nochesObj,
            total_noches: totalNoches,

            modalidad_precio: modalidadPrecio,
            precio_total: modalidadPrecio === 'paquete' ? parseFloat(precioPaquete) || 0 : subtotalIndividuales,
            precios_individuales: preciosObj,
            adelanto_pagado: parseFloat(cliente.adelanto_pagado) || 0,
            observaciones: cliente.observaciones || 'Ninguna',

            fecha_creacion: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            estado: 'PENDIENTE'
        };

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Error del servidor n8n: ${res.status}`);
            const result = await res.json();

            // Aceptamos success, pdf, o la respuesta por defecto de n8n para pruebas
            if (result.success || result.pdf || result.code === 0 || result.message) {
                const pdfObj = result.pdf || {
                    nombre: `Tour_Personalizado_${cliente.nombre_cliente.replace(/\s+/g, '_')}.pdf`,
                    download_url: result.download_url || result.public_url || '',
                    public_url: result.public_url || result.download_url || ''
                };

                const newCotizacion = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    tipo: 'personalizado',
                    tipo_cotizacion: 'TOUR PERSONALIZADO',
                    cliente: cliente.nombre_cliente,
                    nombre_cliente: cliente.nombre_cliente,
                    programa: payload.programa,
                    fecha: fechaInicio,
                    fecha_tour: fechaInicio,
                    personas: cliente.numero_personas,
                    numero_personas: cliente.numero_personas,
                    telefono: cliente.telefono,
                    hotel: alojamiento.categoria_hotel,
                    pdf_url: pdfObj.public_url || pdfObj.download_url,
                    pdf: pdfObj,
                    precio_total: payload.precio_total,
                    adelanto_pagado: payload.adelanto_pagado,
                    observaciones: payload.observaciones,
                    estado: 'PENDIENTE'
                };

                // Guardar en Supabase
                try {
                    const { error: dbError } = await supabase
                        .from('andean_journey_cotizaciones')
                        .insert({
                            user_id: user?.id,
                            tipo: 'personalizado',
                            datos: newCotizacion,
                            pdf_url: newCotizacion.pdf_url
                        });
                    
                    if (dbError) {
                        console.error('Error de Supabase:', dbError);
                        throw dbError;
                    }
                } catch (err) {
                    console.error('Error guardando en BD:', err);
                    let cotizaciones = [];
                    const saved = localStorage.getItem('andean_cotizaciones');
                    if (saved) cotizaciones = JSON.parse(saved);
                    cotizaciones.unshift(newCotizacion);
                    localStorage.setItem('andean_cotizaciones', JSON.stringify(cotizaciones.slice(0, 100)));
                }

                // Sincronizar Google Sheets en segundo plano
                fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: newCotizacion.id,
                        fecha_creacion: newCotizacion.timestamp,
                        nombre_cliente: newCotizacion.nombre_cliente,
                        telefono: newCotizacion.telefono,
                        programa: newCotizacion.programa,
                        fecha_tour: newCotizacion.fecha_tour,
                        num_adultos: newCotizacion.numero_personas,
                        hotel: newCotizacion.hotel,
                        pdf_url: newCotizacion.pdf_url,
                        tipo_cotizacion: newCotizacion.tipo_cotizacion,
                        personas: newCotizacion.numero_personas
                    })
                }).catch(err => console.warn('Aviso: sync Google Sheets', err));

                setSuccessResult(newCotizacion);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(result.mensaje?.contenido || 'Error generando cotización en n8n');
            }
        } catch (err) {
            console.error('Error al cotizar:', err);
            setError(err.message || 'Error de conexión. Por favor verifica tu internet.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (url) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleWhatsAppShare = (item) => {
        if (!item || !item.pdf_url) return;
        const msg = `🎉 *TOUR PERSONALIZADO - Andean Journey*\n\n👤 *CLIENTE*\n• Nombre: ${item.nombre_cliente}\n• Teléfono: ${item.telefono}\n• Fecha Inicio: ${item.fecha_tour}\n• Pasajeros: ${item.numero_personas}\n\n🎯 *ITINERARIO A MEDIDA*\n• ${item.programa}\n• Hotel: ${item.hotel}\n\n📄 *DOCUMENTO PDF*\n${item.pdf_url}\n\n✅ Revisa y descarga el itinerario completo en el link de arriba.`;
        const phone = item.telefono.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className={`min-h-screen pb-10 px-4 sm:px-6 lg:px-8 relative transition-colors duration-500 ${isDarkMode ? 'bg-inca-pattern-dark text-white' : 'bg-inca-pattern text-slate-800'}`}>
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full relative z-10">
                {/* Sticky Header with Android Material 3 Style */}
                <div className={`sticky top-0 z-50 pt-8 pb-3 mb-6 border-b flex items-center justify-between gap-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#001a2c]/95 backdrop-blur-md border-white/5 shadow-sm' : 'bg-white/40 backdrop-blur-xl border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}`}>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className={`p-2 rounded-full transition-all cursor-pointer -ml-2 ${isDarkMode ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-black/5 text-slate-600 hover:text-slate-900'}`}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className={`text-xl sm:text-2xl font-bold font-outfit tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Tour Personalizado
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all duration-300 cursor-pointer border ${
                                isDarkMode
                                    ? 'bg-slate-800/50 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800 shadow-sm'
                            }`}
                            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                            A Medida
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-300 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Pantalla de Éxito */}
                {successResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`relative w-full max-w-md backdrop-blur-3xl rounded-[24px] p-6 sm:p-8 text-center border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0a192f]/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]' : 'bg-white/60 backdrop-blur-2xl border-white/60 shadow-[6px_6px_15px_rgba(0,0,0,0.05),-6px_-6px_15px_rgba(255,255,255,0.8)]'}`}
                        >
                            {/* Decorative glows */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5 relative z-10"
                            >
                                <Check className="w-8 h-8 text-white stroke-[3]" />
                            </motion.div>

                            <h2 className={`text-2xl font-extrabold font-outfit mb-2 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>¡Listo!</h2>
                            <p className={`text-sm mb-6 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                Tour guardado y PDF dinámico premium generado.
                            </p>

                            <div className={`rounded-xl p-4 text-left mb-6 relative z-10 ${isDarkMode ? 'bg-black/30 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cliente</span>
                                        <p className={`text-sm font-bold truncate max-w-[180px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{successResult.nombre_cliente}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Actividades</span>
                                        <p className="text-sm font-bold text-emerald-500 truncate max-w-[180px]">{actividadesSeleccionadas.length} seleccionadas</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fecha & Pax</span>
                                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{successResult.fecha_tour} • {successResult.numero_personas} pax</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                                <a 
                                    href={successResult.pdf_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar PDF Premium
                                </a>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleWhatsAppShare(successResult)}
                                        className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        WhatsApp
                                    </button>

                                    <button 
                                        onClick={() => handleCopyLink(successResult.pdf_url)}
                                        className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setSuccessResult(null);
                                    setActividadesSeleccionadas([]);
                                    setMostrarResumenConfirmacion(false);
                                }}
                                className="mt-6 text-xs text-slate-400 hover:text-emerald-500 font-bold transition-colors underline relative z-10"
                            >
                                Cerrar ventana y crear nuevo
                            </button>
                        </motion.div>
                    </div>
                )}
                
                {mostrarResumenConfirmacion ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="w-full mx-auto space-y-8 text-left"
                    >
                        {/* Header of review */}
                        <div className="bg-gradient-to-br from-[#0c1f30] to-[#05111c] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="space-y-2">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
                                    Paso Final: Verificación de Cotización
                                </span>
                                <h2 className="text-3xl font-extrabold font-outfit text-white">Resumen y Confirmación</h2>
                                <p className="text-sm text-slate-300">Por favor revisa detenidamente los datos antes de continuar y generar el PDF final.</p>
                            </div>
                            <Sparkles className="w-12 h-12 text-emerald-400 opacity-60 animate-pulse shrink-0" />
                        </div>

                        {/* Grid with 2 columns: Left for client/options, Right for Itinerary timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* Column 1: Client details & prices (7 cols on md) */}
                            <div className="md:col-span-7 space-y-6">
                                
                                {/* Client Info Card */}
                                <div className="bg-black/30 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                                    <h3 className="text-lg font-bold font-outfit text-orange-400 pb-3 border-b border-white/10 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        <span>Datos Registrados del Cliente</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nombre Completo</span>
                                            <span className="text-base font-extrabold text-white">{cliente.nombre_cliente}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp / Teléfono</span>
                                            <span className="text-base font-extrabold text-white">{cliente.telefono}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Número de Personas</span>
                                            <span className="text-base font-extrabold text-white">{cliente.numero_personas}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Adelanto Pagado</span>
                                            <span className="text-base font-extrabold text-emerald-400">S/. {parseFloat(cliente.adelanto_pagado || 0).toFixed(2)}</span>
                                        </div>
                                        {cliente.observaciones && (
                                            <div className="sm:col-span-2">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Observaciones</span>
                                                <p className="text-sm text-slate-200 mt-1 italic">"{cliente.observaciones}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hotel & Train Card */}
                                <div className="bg-black/30 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                                    <h3 className="text-lg font-bold font-outfit text-emerald-400 pb-3 border-b border-white/10 flex items-center gap-2">
                                        <Hotel className="w-5 h-5" />
                                        <span>Alojamiento y Transporte</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hotel Categoría</span>
                                            <span className="text-base font-extrabold text-white">{alojamiento.categoria_hotel}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo Habitación</span>
                                            <span className="text-base font-extrabold text-white">{alojamiento.tipo_habitacion}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Días / Noches</span>
                                            <span className="text-base font-extrabold text-white">{itinerarioGenerado.length} Días / {totalNoches} Noches</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Transporte a Machu Picchu</span>
                                            <span className={`text-base font-extrabold ${incluyeMachuPicchu ? 'text-orange-400' : 'text-slate-400'}`}>
                                                {incluyeMachuPicchu ? (tipoTransporte === 'local' ? '🚂 Tren Local (Incluido)' : '🚂 Tren Turístico Vistadome') : 'No Incluye Machu Picchu'}
                                            </span>
                                        </div>
                                    </div>

                                    {incluyeMachuPicchu && tipoTransporte === 'turistico' && (
                                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-2 mt-2">
                                            <span className="text-[10px] uppercase font-bold text-orange-400 block">Configuración Tren Turístico</span>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <span className="text-slate-400 block">Pasajeros</span>
                                                    <span className="font-bold text-white">{transporteConfig.personas_tren || cliente.numero_personas}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block">Horario</span>
                                                    <span className="font-bold text-white">{transporteConfig.hora_tren}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block">Precio Total</span>
                                                    <span className="font-bold text-white">USD ${transporteConfig.precio_total_tren || '0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pricing Breakdown Card */}
                                <ElectricBorder color="#10b981" speed={2} chaos={0.1} borderRadius={24} className="w-full">
                                    <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 transition-colors ${isDarkMode ? 'bg-[#0b1b2b]/95 border-white/10' : 'bg-white/50 border border-white/60 shadow-[6px_6px_15px_rgba(0,0,0,0.05),-6px_-6px_15px_rgba(255,255,255,0.8)]'}`}>
                                        <h3 className="text-lg font-bold font-outfit text-emerald-500 pb-3 border-b border-white/10 flex items-center justify-between">
                                            <span>Tarifas y Modalidad de Precios</span>
                                            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-300">
                                                {modalidadPrecio === 'paquete' ? '💎 Paquete Privado' : '🧮 Precios Desglosados'}
                                            </span>
                                        </h3>

                                        {modalidadPrecio === 'paquete' ? (
                                            <div className="flex items-center justify-between py-2">
                                                <div>
                                                    <span className="text-xs text-slate-400 font-medium block">Precio Global Consolidado</span>
                                                    <span className="text-xs text-slate-300">Un único valor neto por el total del recorrido.</span>
                                                </div>
                                                <span className="text-3xl font-black text-emerald-400 font-outfit">
                                                    S/. {(parseFloat(precioPaquete) || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">Desglose actividad por actividad</span>
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                    {actividadesSeleccionadas.map(act => (
                                                        <div key={act} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0 text-sm">
                                                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                                                <span>{ACTIVIDADES_CATALOGO[act]?.emoji}</span>
                                                                <span>{act}</span>
                                                            </span>
                                                            <span className="font-bold text-white">S/. {parseFloat(preciosIndividuales[act] || 0).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-3 border-t border-white/10 flex justify-between items-center font-bold text-lg text-emerald-400">
                                                    <span>Subtotal Consolidado:</span>
                                                    <span>S/. {subtotalIndividuales.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ElectricBorder>

                            </div>

                            {/* Column 2: Day-by-day Itinerary Preview (5 cols on md) */}
                            <div className="md:col-span-5 space-y-6">
                                <div className={`border rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0b1b2b]/95 border-white/10' : 'bg-white/50 border border-white/60 shadow-[6px_6px_15px_rgba(0,0,0,0.05),-6px_-6px_15px_rgba(255,255,255,0.8)]'}`}>
                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                                    
                                    <h3 className="text-lg font-bold font-outfit text-amber-400 pb-3 border-b border-white/10 flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>Itinerario Día por Día</span>
                                    </h3>

                                    <div className="relative pl-6 border-l border-white/10 space-y-5 ml-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                                        {itinerarioGenerado.map((it) => (
                                            <div key={it.dia} className="relative group" style={{ contentVisibility: 'auto' }}>
                                                {/* Timeline node dot with pulsing neon effect */}
                                                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1b2b] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                                                
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Día {it.dia}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">{it.fecha}</span>
                                                    </div>
                                                    <p className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                        <span>{ACTIVIDADES_CATALOGO[it.actividad]?.emoji}</span>
                                                        <span className="truncate">{it.actividad}</span>
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <span>🏠 Alojamiento: {nochesPorDia[`dia_${it.dia}`] || 1} {nochesPorDia[`dia_${it.dia}`] === 1 ? 'noche' : 'noches'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Action HUD / Panel de Acciones Finales */}
                        <div className={`border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0c1f30] border-white/10' : 'bg-white/60 border-white/80 shadow-[0_8px_32px_rgba(31,38,135,0.07)]'}`}>
                            <button
                                type="button"
                                onClick={() => setMostrarResumenConfirmacion(false)}
                                className="neumorphic-button w-full sm:w-auto text-white font-extrabold px-8 py-4.5 rounded-xl flex items-center justify-center gap-3 cursor-pointer text-sm active:scale-[0.98] transition-transform"
                            >
                                ✏️ Volver y Editar Datos
                            </button>

                            <motion.button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                whileHover={loading ? {} : { scale: 1.02 }}
                                whileTap={loading ? {} : { scale: 0.98 }}
                                className={`group relative w-full sm:w-auto min-w-[320px] rounded-[24px] neumorphic-button with-glow ${
                                    loading 
                                        ? 'bg-[#0a1f18] cursor-wait'
                                        : 'bg-gradient-to-br from-[#002844] to-[#001424] hover:from-[#003355] hover:to-[#001a2c] cursor-pointer'
                                }`}
                            >
                                <ElectricBorder 
                                    color={loading ? "#f59e0b" : "#38bdf8"} 
                                    speed={loading ? 6 : 4} 
                                    chaos={loading ? 0.3 : 0.15} 
                                    borderRadius={24}
                                >
                                    <div className={`relative flex items-center justify-center gap-4 py-4 px-8 rounded-[22px] transition-all duration-300 z-10 overflow-hidden bg-transparent ${
                                        loading ? 'text-amber-300' : 'text-white'
                                    }`}>
                                        
                                        {loading ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                                <span className="font-extrabold text-sm tracking-wide font-outfit">Generando PDF...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="font-extrabold text-sm sm:text-base tracking-wider font-outfit uppercase bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent group-hover:to-white transition-all duration-300">
                                                    Generar Cotización Final
                                                </span>
                                                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-300" />
                                            </>
                                        )}
                                    </div>
                                </ElectricBorder>
                            </motion.button>
                        </div>

                    </motion.div>
                ) : (
                    <div className="w-full">
                        {/* Formulario Interactivo */}
                        <form onSubmit={handlePreRevisar} className="space-y-10">
                            {/* Paso 1: Selección de Actividades */}
                            <ElectricBorder color="#f59e0b" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between px-1 mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                                                1
                                            </div>
                                            <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Actividades</h2>
                                        </div>
                                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                            {actividadesSeleccionadas.length} listas
                                        </span>
                                    </div>

                                    {/* Pestañas de Categoría */}
                                    <div className="flex overflow-x-auto gap-2 pb-2 mb-4 custom-scrollbar px-1">
                                        {CATEGORIAS.map((c) => (
                                            <button 
                                                key={c.id}
                                                type="button"
                                                onClick={() => setFiltroCat(c.id)}
                                                className={`px-4 py-1.5 rounded-full font-medium text-[12px] transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border-none ${
                                                    filtroCat === c.id 
                                                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-900/30' 
                                                        : isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-white/15' : 'bg-black/5 text-slate-600 hover:bg-black/10'
                                                }`}
                                            >
                                                <span className="text-[13px]">{c.emoji}</span>
                                                <span>{c.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Barra Búsqueda Actividades */}
                                    <div className="relative px-1">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar actividad..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full border-none rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all font-medium text-[13px] ${isDarkMode ? 'bg-white/10 text-white placeholder:text-slate-400 focus:bg-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                </div>

                                {/* Grid de Actividades */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {actividadesFiltradas.map(([nombre, item], index) => {
                                        const isSelected = actividadesSeleccionadas.includes(nombre);
                                        // Fondo suave pastel-oscuro para la imagen (parecido a la imagen de referencia pero adaptado)
                                        const bgColorStyle = isDarkMode
                                            ? (isSelected 
                                                ? { background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }
                                                : { background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' })
                                            : (isSelected 
                                                ? { background: 'rgba(56, 189, 248, 0.25)', color: '#0284c7' }
                                                : { background: 'rgba(0, 0, 0, 0.05)', color: '#64748b' });

                                        return (
                                            <ElectricBorder 
                                                key={nombre}
                                                color={isSelected ? "#38bdf8" : (isDarkMode ? "rgba(255, 255, 255, 0.08)" : "transparent")} 
                                                speed={isSelected ? 6 : 1.5} 
                                                chaos={isSelected ? 0.3 : 0.08}
                                                borderRadius={16}
                                                displacement={4}
                                                className="w-full h-full"
                                            >
                                                <motion.div 
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => toggleActividad(nombre)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            toggleActividad(nombre);
                                                        }
                                                    }}
                                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                    viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                                                    whileTap={{ scale: 0.96 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30, delay: Math.min(index * 0.05, 0.5) }}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer active:scale-[0.98] relative overflow-hidden group transition-all duration-300 ${
                                                        isDarkMode 
                                                            ? (isSelected ? 'neumorphic-card-dark border border-sky-500/30' : 'neumorphic-card-dark border border-transparent')
                                                            : (isSelected ? 'bg-white/70 border border-sky-400/50 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    }`}
                                                >
                                                    {/* Contenedor de Imagen Pastel/Oscuro */}
                                                    <div 
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 group-hover:scale-110"
                                                        style={bgColorStyle}
                                                    >
                                                        {item.emoji}
                                                    </div>

                                                    {/* Contenido de Texto */}
                                                    <div className="flex flex-col justify-center text-left flex-1 min-w-0 pr-6">
                                                        <h3 className={`font-bold text-[13px] truncate ${
                                                            isDarkMode ? (isSelected ? 'text-sky-400' : 'text-white') : (isSelected ? 'text-sky-600' : 'text-slate-800')
                                                        }`}>
                                                            {nombre}
                                                        </h3>
                                                        <span className={`text-[10px] font-semibold uppercase tracking-widest mt-1 truncate ${
                                                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                                        }`}>
                                                            {item.categoria}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Botón flotante derecho (similar al granate de la imagen pero adaptado) */}
                                                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                        isSelected 
                                                            ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-100 opacity-100' 
                                                            : (isDarkMode ? 'bg-white/5 text-slate-500 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:bg-white/10' : 'bg-black/5 text-slate-500 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:bg-black/10')
                                                    }`}>
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                </motion.div>
                                            </ElectricBorder>
                                        );
                                    })}
                                </div>
                                </div>
                            </ElectricBorder>

                            {/* Paso 2: Configuración del Itinerario */}
                            <ElectricBorder color="#10b981" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                            2
                                        </div>
                                        <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Configuración de Itinerario</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Actividad Inicial (Día 1) *
                                        </label>
                                        <select
                                            value={actividadInicial}
                                            onChange={(e) => setActividadInicial(e.target.value)}
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm cursor-pointer ${isDarkMode ? 'neumorphic-input text-white focus:border-emerald-500/50' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800'}`}
                                        >
                                            {actividadesSeleccionadas.length === 0 && (
                                                <option value="" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>Selecciona actividades primero</option>
                                            )}
                                            {actividadesSeleccionadas.map(a => (
                                                <option key={a} value={a} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>{a} ({ACTIVIDADES_CATALOGO[a]?.emoji})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`text-sm font-semibold mb-2 block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            Fecha de Inicio del Tour *
                                        </label>
                                        <input 
                                            type="date"
                                            required
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm cursor-pointer ${isDarkMode ? 'bg-slate-900 border border-white/10 text-white focus:border-emerald-500/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800'}`}
                                        />
                                    </div>
                                </div>

                                {/* Previsualización de Itinerario Dinámico */}
                                {itinerarioGenerado.length > 0 && (
                                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Orden Automático del Itinerario Calculado</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {itinerarioGenerado.map(it => (
                                                <div key={it.dia} className="flex items-center gap-3 text-sm py-1.5 border-b border-white/5 last:border-0">
                                                    <span className="w-16 font-bold text-amber-400 shrink-0">DÍA {it.dia}</span>
                                                    <span className="text-slate-400 text-xs shrink-0">({it.fecha})</span>
                                                    <span className="font-semibold text-white flex items-center gap-2">
                                                        <span>{ACTIVIDADES_CATALOGO[it.actividad]?.emoji}</span>
                                                <span>{it.actividad}</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>
                            </ElectricBorder>


                            {/* Paso 3: Transporte (Detección Automática) */}
                            <ElectricBorder color="#f97316" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                            3
                                        </div>
                                        <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Transporte a Machu Picchu</h2>
                                    </div>
                                </div>

                                {incluyeMachuPicchu ? (
                                    <div className="space-y-5">
                                        <div className="p-3 bg-orange-500/20 border-none rounded-xl text-orange-300 font-semibold text-sm flex items-center gap-3 shadow-sm">
                                            <Sparkles className="w-5 h-5 shrink-0 text-orange-400 animate-spin" />
                                            <span className="text-[13px]">¡Detección automática! Actividades a MAPI incluidas.</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <ElectricBorder 
                                                color={tipoTransporte === 'local' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}
                                                speed={tipoTransporte === 'local' ? 1.5 : 0.6}
                                                chaos={tipoTransporte === 'local' ? 0.12 : 0.04}
                                                borderRadius={12}
                                                displacement={4}
                                                className="w-full h-full"
                                            >
                                                <div 
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => setTipoTransporte('local')}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setTipoTransporte('local');
                                                        }
                                                    }}
                                                    className={`w-full h-auto flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden group ${
                                                        tipoTransporte === 'local'
                                                            ? (isDarkMode ? 'border-amber-500/40 bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]') 
                                                            : (isDarkMode ? 'bg-[#0b1b2b]/95 border-white/5 hover:border-white/20 hover:bg-white/5' : 'bg-white/50 border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shrink-0 transition-colors ${
                                                        tipoTransporte === 'local'
                                                            ? 'bg-amber-500 text-white shadow-md' 
                                                            : (isDarkMode ? 'bg-white/10 text-slate-300 group-hover:bg-white/20' : 'bg-black/5 text-slate-500 group-hover:bg-black/10')
                                                    }`}>
                                                        🚂
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 text-left pt-0.5">
                                                        <span className={`font-bold font-outfit text-[11px] uppercase tracking-wide ${
                                                            isDarkMode ? (tipoTransporte === 'local' ? 'text-amber-400' : 'text-white') : (tipoTransporte === 'local' ? 'text-amber-600' : 'text-slate-800')
                                                        }`}>
                                                            TREN LOCAL
                                                        </span>
                                                        <span className={`text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            Incluido automáticamente sin requerir configuración de costos adicionales.
                                                        </span>
                                                    </div>
                                                </div>
                                            </ElectricBorder>

                                            <ElectricBorder 
                                                color={tipoTransporte === 'turistico' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}
                                                speed={tipoTransporte === 'turistico' ? 1.5 : 0.6}
                                                chaos={tipoTransporte === 'turistico' ? 0.12 : 0.04}
                                                borderRadius={12}
                                                displacement={4}
                                                className="w-full h-full"
                                            >
                                                <div 
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => setTipoTransporte('turistico')}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setTipoTransporte('turistico');
                                                        }
                                                    }}
                                                    className={`w-full h-auto flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden group ${
                                                        tipoTransporte === 'turistico'
                                                            ? (isDarkMode ? 'border-amber-500/40 bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]') 
                                                            : (isDarkMode ? 'bg-[#0b1b2b]/95 border-white/5 hover:border-white/20 hover:bg-white/5' : 'bg-white/50 border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shrink-0 transition-colors ${
                                                        tipoTransporte === 'turistico'
                                                            ? 'bg-amber-500 text-white shadow-md' 
                                                            : (isDarkMode ? 'bg-white/10 text-slate-300 group-hover:bg-white/20' : 'bg-black/5 text-slate-500 group-hover:bg-black/10')
                                                    }`}>
                                                        🚈
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 text-left pt-0.5">
                                                        <span className={`font-bold font-outfit text-[11px] uppercase tracking-wide ${
                                                            isDarkMode ? (tipoTransporte === 'turistico' ? 'text-amber-400' : 'text-white') : (tipoTransporte === 'turistico' ? 'text-amber-600' : 'text-slate-800')
                                                        }`}>
                                                            TREN TURÍSTICO
                                                        </span>
                                                        <span className={`text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            Permite configurar horarios, cantidad de pasajeros y costos en dólares.
                                                        </span>
                                                    </div>
                                                </div>
                                            </ElectricBorder>
                                        </div>

                                        {tipoTransporte === 'turistico' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4"
                                            >
                                                <div>
                                                    <label className={`text-xs font-semibold mb-1.5 block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pasajeros en Tren</label>
                                                    <input 
                                                        type="text"
                                                        value={transporteConfig.personas_tren}
                                                        onChange={(e) => setTransporteConfig(prev => ({ ...prev, personas_tren: e.target.value }))}
                                                        placeholder="Ej: 2 adultos"
                                                        className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-orange-400' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`text-xs font-semibold mb-1.5 block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Horario Preferido</label>
                                                    <input 
                                                        type="text"
                                                        value={transporteConfig.hora_tren}
                                                        onChange={(e) => setTransporteConfig(prev => ({ ...prev, hora_tren: e.target.value }))}
                                                        placeholder="Ej: 07:05 AM"
                                                        className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-orange-400' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`text-xs font-semibold mb-1.5 block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Precio Total Tren (USD)</label>
                                                    <input 
                                                        type="number"
                                                        value={transporteConfig.precio_total_tren}
                                                        onChange={(e) => setTransporteConfig(prev => ({ ...prev, precio_total_tren: e.target.value }))}
                                                        placeholder="Ej: 250"
                                                        className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-orange-400' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-sm flex items-center gap-3">
                                        <Info className="w-5 h-5 shrink-0 text-amber-500" />
                                        <span>Tu selección actual de actividades no incluye visitas a Machu Picchu. Las opciones de tren aparecerán automáticamente al agregar MAPI o Valle+MAPI.</span>
                                    </div>
                                )}
                                </div>
                            </ElectricBorder>

                            {/* Paso 4: Alojamiento & Noches */}
                            <ElectricBorder color="#3b82f6" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            4
                                        </div>
                                        <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Alojamiento & Noches</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Hotel className="w-4 h-4 text-amber-400" />
                                            <span>Tipo de Habitación</span>
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={alojamiento.tipo_habitacion}
                                            onChange={(e) => setAlojamiento(prev => ({ ...prev, tipo_habitacion: e.target.value }))}
                                            placeholder="Ej: Matrimonial o Doble"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-amber-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span>Categoría del Hotel</span>
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={alojamiento.categoria_hotel}
                                            onChange={(e) => setAlojamiento(prev => ({ ...prev, categoria_hotel: e.target.value }))}
                                            placeholder="Ej: 3 Estrellas Premium"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                </div>

                                {itinerarioGenerado.length > 0 && (
                                    <div className="pt-4 border-t border-white/10 space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-between">
                                            <span>Configuración de Noches por Día</span>
                                            <span className="bg-amber-500/20 px-3 py-1 rounded-full text-amber-300 font-extrabold text-sm border border-amber-500/30">
                                                {totalNoches} Noches en Total
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {itinerarioGenerado.map(it => (
                                                <div key={it.dia} className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-white truncate">DÍA {it.dia}: {it.actividad}</p>
                                                        <span className="text-[10px] text-slate-400">{it.fecha}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Noches:</span>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            value={nochesPorDia[`dia_${it.dia}`] ?? 1}
                                                            onChange={(e) => handleNocheChange(it.dia, e.target.value)}
                                                            className={`w-16 rounded-lg px-2 py-1 text-center font-bold text-sm focus:outline-none ${isDarkMode ? 'neumorphic-input text-white' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>
                            </ElectricBorder>

                            {/* Paso 5: Modalidad de Precios */}
                            <ElectricBorder color="#10b981" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                            5
                                        </div>
                                        <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Modalidad de Precios</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <ElectricBorder 
                                        color={modalidadPrecio === 'paquete' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}
                                        speed={modalidadPrecio === 'paquete' ? 1.5 : 0.6}
                                        chaos={modalidadPrecio === 'paquete' ? 0.12 : 0.04}
                                        borderRadius={12}
                                        displacement={4}
                                        className="w-full h-full"
                                    >
                                        <div 
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setModalidadPrecio('paquete')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setModalidadPrecio('paquete');
                                                }
                                            }}
                                                    className={`w-full h-auto flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden group ${
                                                        modalidadPrecio === 'paquete'
                                                            ? (isDarkMode ? 'border-amber-500/40 bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]') 
                                                            : (isDarkMode ? 'bg-[#0b1b2b]/95 border-white/5 hover:border-white/20 hover:bg-white/5' : 'bg-white/50 border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    }`}
                                        >
                                            <div className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shrink-0 transition-colors ${
                                                modalidadPrecio === 'paquete'
                                                    ? 'bg-amber-500 text-white shadow-md' 
                                                    : (isDarkMode ? 'bg-white/10 text-slate-300 group-hover:bg-white/20' : 'bg-black/5 text-slate-500 group-hover:bg-black/10')
                                            }`}>
                                                💎
                                            </div>
                                            <div className="flex flex-col gap-0.5 text-left pt-0.5">
                                                <span className={`font-bold font-outfit text-[11px] uppercase tracking-wide ${
                                                    isDarkMode ? (modalidadPrecio === 'paquete' ? 'text-amber-400' : 'text-white') : (modalidadPrecio === 'paquete' ? 'text-amber-600' : 'text-slate-800')
                                                }`}>
                                                    PAQUETE PRIVADO
                                                </span>
                                                <span className={`text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Un único precio global consolidado para todo el recorrido.
                                                </span>
                                            </div>
                                        </div>
                                    </ElectricBorder>

                                    <ElectricBorder 
                                        color={modalidadPrecio === 'individual' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}
                                        speed={modalidadPrecio === 'individual' ? 1.5 : 0.6}
                                        chaos={modalidadPrecio === 'individual' ? 0.12 : 0.04}
                                        borderRadius={12}
                                        displacement={4}
                                        className="w-full h-full"
                                    >
                                        <div 
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setModalidadPrecio('individual')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setModalidadPrecio('individual');
                                                }
                                            }}
                                            className={`w-full h-auto flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden group ${
                                                modalidadPrecio === 'individual'
                                                    ? (isDarkMode ? 'border-amber-500/40 bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]') 
                                                    : (isDarkMode ? 'bg-[#0b1b2b]/95 border-white/5 hover:border-white/20 hover:bg-white/5' : 'bg-white/50 border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shrink-0 transition-colors ${
                                                modalidadPrecio === 'individual'
                                                    ? 'bg-amber-500 text-white shadow-md' 
                                                    : (isDarkMode ? 'bg-white/10 text-slate-300 group-hover:bg-white/20' : 'bg-black/5 text-slate-500 group-hover:bg-black/10')
                                            }`}>
                                                🧮
                                            </div>
                                            <div className="flex flex-col gap-0.5 text-left pt-0.5">
                                                <span className={`font-bold font-outfit text-[11px] uppercase tracking-wide ${
                                                    isDarkMode ? (modalidadPrecio === 'individual' ? 'text-amber-400' : 'text-white') : (modalidadPrecio === 'individual' ? 'text-amber-600' : 'text-slate-800')
                                                }`}>
                                                    PRECIOS INDIVIDUALES
                                                </span>
                                                <span className={`text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Desglose detallado del costo actividad por actividad.
                                                </span>
                                            </div>
                                        </div>
                                    </ElectricBorder>
                                </div>

                                {modalidadPrecio === 'paquete' ? (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
                                    >
                                        <label className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-2 block">
                                            Precio Total del Tour en Soles (S/.) *
                                        </label>
                                        <input 
                                            type="number"
                                            required={modalidadPrecio === 'paquete'}
                                            value={precioPaquete}
                                            onChange={(e) => setPrecioPaquete(e.target.value)}
                                            placeholder="Ingresa el precio total en soles"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-bold text-lg ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4"
                                    >
                                        <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-amber-500/20' : 'border-amber-600/20'}`}>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Desglose de Precios (S/.)</span>
                                            <span className={`text-lg font-extrabold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Subtotal: S/. {subtotalIndividuales.toFixed(2)}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {actividadesSeleccionadas.map(act => (
                                                <div key={act} className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                                                    <span className={`text-xs font-bold truncate flex-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{act}</span>
                                                    <div className="flex items-center gap-1.5 w-32">
                                                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>S/.</span>
                                                        <input 
                                                            type="number"
                                                            value={preciosIndividuales[act] ?? ''}
                                                            onChange={(e) => handlePrecioIndChange(act, e.target.value)}
                                                            placeholder="0.00"
                                                            className={`w-full rounded-lg px-2.5 py-1.5 text-right font-bold text-sm focus:outline-none ${isDarkMode ? 'neumorphic-input text-white' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                </div>
                            </ElectricBorder>

                            {/* Paso 6: Datos del Cliente */}
                            <ElectricBorder color="#f97316" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                            6
                                        </div>
                                        <h2 className={`text-[19px] font-bold font-outfit leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Datos del Cliente</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <User className="w-4 h-4 text-orange-400" />
                                            <span>Nombre Completo *</span>
                                        </label>
                                        <input 
                                            type="text"
                                            name="nombre_cliente"
                                            required
                                            value={cliente.nombre_cliente}
                                            onChange={handleClienteChange}
                                            placeholder="Ej: Elena Castro"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-orange-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <Phone className="w-4 h-4 text-orange-400" />
                                            <span>WhatsApp / Teléfono *</span>
                                        </label>
                                        <input 
                                            type="tel"
                                            name="telefono"
                                            required
                                            value={cliente.telefono}
                                            onChange={handleClienteChange}
                                            placeholder="+51 987 654 321"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-orange-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <Users className="w-4 h-4 text-amber-400" />
                                            <span>Número de Personas *</span>
                                        </label>
                                        <input 
                                            type="text"
                                            name="numero_personas"
                                            required
                                            value={cliente.numero_personas}
                                            onChange={handleClienteChange}
                                            placeholder="Ej: 2 adultos, 1 niño"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-amber-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                            <span>Adelanto Pagado (S/. - Opcional)</span>
                                        </label>
                                        <input 
                                            type="number"
                                            name="adelanto_pagado"
                                            value={cliente.adelanto_pagado}
                                            onChange={handleClienteChange}
                                            placeholder="0.00"
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={`text-sm font-semibold mb-2 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            Observaciones Adicionales
                                        </label>
                                        <textarea 
                                            rows="3"
                                            name="observaciones"
                                            value={cliente.observaciones}
                                            onChange={handleClienteChange}
                                            placeholder="Vuelos, alergias, requerimientos especiales..."
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-500 focus:border-amber-500' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-slate-800 placeholder:text-slate-400'}`}
                                        />
                                    </div>
                                </div>
                                </div>
                            </ElectricBorder>

                            {/* Botón de Envío */}
                            <div className="flex justify-center mt-10">
                                <motion.button
                                    type="submit"
                                    disabled={actividadesSeleccionadas.length === 0 || !fechaInicio}
                                    whileHover={(actividadesSeleccionadas.length === 0 || !fechaInicio) ? {} : { scale: 1.02 }}
                                    whileTap={(actividadesSeleccionadas.length === 0 || !fechaInicio) ? {} : { scale: 0.98 }}
                                    className={`group relative w-full sm:w-[480px] rounded-[24px] neumorphic-button with-glow ${
                                        (actividadesSeleccionadas.length === 0 || !fechaInicio)
                                            ? (isDarkMode ? 'bg-[#001a2c] cursor-not-allowed border border-white/5 opacity-70' : 'bg-white/30 cursor-not-allowed border border-black/5 opacity-70')
                                            : (isDarkMode ? 'bg-gradient-to-br from-[#002844] to-[#001424] hover:from-[#003355] hover:to-[#001a2c] cursor-pointer' : 'bg-[#824451] hover:bg-[#6b3541] cursor-pointer shadow-lg text-white border-none')
                                    }`}
                                >
                                    <ElectricBorder 
                                        color={(actividadesSeleccionadas.length === 0 || !fechaInicio) ? "rgba(255,255,255,0.05)" : "#38bdf8"} 
                                        speed={(actividadesSeleccionadas.length === 0 || !fechaInicio) ? 1 : 4} 
                                        chaos={(actividadesSeleccionadas.length === 0 || !fechaInicio) ? 0.05 : 0.15} 
                                        borderRadius={24}
                                    >
                                        <div className={`relative flex items-center justify-center gap-4 py-5 px-6 rounded-[22px] transition-all duration-300 z-10 overflow-hidden bg-transparent ${
                                            (actividadesSeleccionadas.length === 0 || !fechaInicio)
                                                ? 'text-slate-400'
                                                : 'text-white'
                                        }`}>
                                            
                                            {(actividadesSeleccionadas.length === 0 || !fechaInicio) ? (
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/5 shrink-0">
                                                        <Lock className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-bold text-[11px] text-slate-500 uppercase tracking-widest font-outfit">Paso Bloqueado</span>
                                                        <span className="text-sm font-semibold text-slate-400">Selecciona fechas y actividades</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-extrabold text-[15px] sm:text-lg tracking-wider font-outfit uppercase bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent group-hover:to-white transition-all duration-300">
                                                        Revisar Resumen del Tour
                                                    </span>
                                                    <ChevronRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-300" />
                                                </>
                                            )}
                                        </div>
                                    </ElectricBorder>
                                </motion.button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

