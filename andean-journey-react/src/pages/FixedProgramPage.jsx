import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    ArrowLeft, Check, CheckCircle2, Share2, Download, Copy, 
    Train, Hotel, User, Users, Phone, Mail, Calendar, DollarSign, 
    Info, Sparkles, Mountain, AlertCircle, Search, ChevronRight, MapPin, Lock, Sun, Moon 
} from 'lucide-react';
import { motion } from 'framer-motion';
import dbProgramas from '../data/db_programas_fijos.json';

import { Field, FieldLabel } from '../components/ui/field.jsx';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '../components/ui/input-group.jsx';
import ElectricBorder from '../components/ui/ElectricBorder.jsx';

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';
const WEBHOOK_URL = 'https://hvh-n8n.2ulbdq.easypanel.host/webhook/generar-pdf';

// ─── Memoized program card ──────────────────────────────────────────────────
// Only the SELECTED card runs the heavy ElectricBorder canvas animation.
// All other cards use a lightweight CSS border + hover shadow — zero canvas overhead.
const ProgramCard = memo(function ProgramCard({ p, isSelected, isDarkMode, onClick }) {
    const tLow = p.titulo.toLowerCase();
    let TourIcon = MapPin;
    let iconColor = 'text-blue-400';
    if (tLow.includes('montaña') || tLow.includes('humantay')) { TourIcon = Mountain; iconColor = 'text-emerald-400'; }
    else if (tLow.includes('mistico') || tLow.includes('místico')) { TourIcon = Sparkles; iconColor = 'text-purple-400'; }
    else if (tLow.includes('valle')) { TourIcon = Sun; iconColor = 'text-amber-400'; }
    else if (tLow.includes('sin mapi')) { TourIcon = MapPin; iconColor = 'text-slate-400'; }
    else if (tLow.includes('aventura')) { TourIcon = Mountain; iconColor = 'text-orange-400'; }

    const innerContent = (
        <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`group relative flex items-center justify-between p-3 rounded-2xl transition-all min-h-[64px] ${
                isSelected
                    ? (isDarkMode ? 'bg-[#00A884]/15 shadow-xl shadow-[#00A884]/30 border border-[#00A884]/50' : 'bg-[#00A884]/10 shadow-[0_8px_24px_rgba(0,168,132,0.2)] border border-[#00A884]/50')
                    : (isDarkMode ? 'bg-slate-900/60 hover:bg-slate-800/80' : 'bg-white/60 hover:bg-white/80 border border-white/80 hover:border-[#00A884]/30 hover:shadow-[0_8px_32px_rgba(0,168,132,0.15)]')
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <TourIcon className={`w-5 h-5 opacity-80 ${iconColor}`} />
                    </div>
                    {p.imagen && p.imagen.trim() !== '' ? (
                        <img
                            src={p.imagen}
                            alt={p.titulo}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 relative z-10"
                        />
                    ) : null}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 font-extrabold text-[10px] rounded-lg border whitespace-nowrap transition-colors ${isDarkMode ? 'bg-[#00A884]/15 text-[#00A884] border-[#00A884]/30' : 'bg-[#00A884]/10 text-[#00A884] border-[#00A884]/20 group-hover:bg-[#00A884]/20'}`}>
                            {p.dias}
                        </span>
                        <span className={`text-[11px] font-bold flex items-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-700'}`}>
                            <Sparkles className={`w-3 h-3 transition-colors ${isDarkMode ? 'text-[#00A884]' : 'text-[#00A884]/70 group-hover:text-[#00A884]'}`} />
                            {p.incluye.length} servicios
                        </span>
                    </div>
                    <h3 className={`font-bold font-outfit text-xs sm:text-sm line-clamp-1 transition-colors leading-tight ${isDarkMode ? 'text-white group-hover:text-[#00A884]' : 'text-slate-800 group-hover:text-[#00A884]'}`}>
                        {p.titulo}
                    </h3>
                </div>
            </div>
            <div className="pl-2 shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                        ? 'bg-gradient-to-r from-[#25D366] to-[#00A884] text-white shadow-[0_0_12px_rgba(0,168,132,0.4)] scale-110'
                        : (isDarkMode ? 'border border-white/20 text-slate-600 group-hover:border-[#00A884]/50 group-hover:text-[#00A884]/80 bg-black/20' : 'border border-[#00A884]/20 text-[#00A884]/40 group-hover:border-[#00A884]/60 group-hover:text-[#00A884] bg-white/50')
                }`}>
                    <Check className={`w-3.5 h-3.5 stroke-[3] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div 
            onClick={onClick} 
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
            role="button"
            tabIndex={0}
            className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
        >
            {isSelected ? (
                <ElectricBorder color="#00A884" speed={4} chaos={0.15} borderRadius={14} className="w-full">
                    {innerContent}
                </ElectricBorder>
            ) : (
                <div className={`rounded-[16px] border transition-all duration-200 ${
                    isDarkMode
                        ? 'border-white/8 hover:border-[#00A884]/30'
                        : 'border-[#00A884]/20 hover:border-[#00A884]/50'
                }`}>
                    {innerContent}
                </div>
            )}
        </div>
    );
});


export default function FixedProgramPage() {
    const { user, isDemo } = useAuth();
    const navigate = useNavigate();

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

    // Estado del formulario
    const [selectedProgramKey, setSelectedProgramKey] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Campos del formulario
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        email: '',
        numero_personas: '2 adultos',
        fecha_viaje: '',
        tipo_habitacion: 'Matrimonial o Doble',
        categoria_hotel: '3 Estrellas Premium',
        tipo_tren: 'expedition', // expedition | vistadome
        tren_horario: '',
        personas_tren: '',
        precio_tren: '',
        nombre_asesor: '',
        email_asesor: '',
        telefono_asesor: '',
        adelanto_pagado: '0',
        observaciones: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successResult, setSuccessResult] = useState(null);
    const [copied, setCopied] = useState(false);

    // Lista de programas formateada
    const programsList = useMemo(() => {
        return Object.entries(dbProgramas).map(([key, data]) => ({
            key,
            titulo: data.titulo_programa || key.toUpperCase().replace(/_/g, ' '),
            dias: data.dias_noches || 'N/A',
            imagen: data.itinerario?.[0]?.imagen || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800&auto=format&fit=crop',
            incluye: data.incluye || [],
            no_incluye: data.no_incluye || []
        }));
    }, []);

    // Filtrar programas
    const filteredPrograms = useMemo(() => {
        if (!searchQuery) return programsList;
        const q = searchQuery.toLowerCase();
        return programsList.filter(p => p.titulo.toLowerCase().includes(q) || p.dias.toLowerCase().includes(q));
    }, [programsList, searchQuery]);

    const selectedProgramData = useMemo(() => {
        if (!selectedProgramKey) return null;
        return dbProgramas[selectedProgramKey];
    }, [selectedProgramKey]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectProgram = useCallback((key) => {
        setSelectedProgramKey(key);
        setError(null);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedProgramKey) {
            setError('Por favor selecciona un programa fijo antes de continuar.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.nombre_cliente || !formData.telefono || !formData.fecha_viaje) {
            setError('Por favor completa los datos obligatorios del cliente (Nombre, Teléfono y Fecha de Viaje).');
            return;
        }

        setLoading(true);

        const trenFinal = formData.tipo_tren === 'expedition' ? 'Expedition (Local)' : 'Vistadome (Turístico)';
        const payload = {
            origen: 'formulario_web_react',
            tipo_tour: 'fijo',
            programa_seleccionado: selectedProgramData?.titulo_programa || selectedProgramKey,
            nombre_cliente: formData.nombre_cliente,
            telefono: formData.telefono,
            email: formData.email || 'N/A',
            numero_personas: formData.numero_personas,
            fecha_viaje: formData.fecha_viaje,
            tipo_habitacion: formData.tipo_habitacion,
            categoria_hotel: formData.categoria_hotel,
            tipo_tren: trenFinal,
            tren_horario: formData.tren_horario || 'N/A',
            personas_tren: formData.personas_tren || formData.numero_personas,
            precio_tren: formData.precio_tren ? parseFloat(formData.precio_tren) : null,
            adelanto_pagado: parseFloat(formData.adelanto_pagado) || 0,
            observaciones: formData.observaciones || 'Ninguna',
            nombre_asesor: formData.nombre_asesor || 'N/A',
            email_asesor: formData.email_asesor || 'N/A',
            telefono_asesor: formData.telefono_asesor || 'N/A',
            timestamp: new Date().toISOString()
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
                    nombre: `Cotizacion_${formData.nombre_cliente.replace(/\s+/g, '_')}.pdf`,
                    download_url: result.download_url || result.public_url || '',
                    public_url: result.public_url || result.download_url || ''
                };

                const newCotizacion = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    tipo: 'fijo',
                    tipo_cotizacion: 'PROGRAMA FIJO',
                    cliente: formData.nombre_cliente,
                    nombre_cliente: formData.nombre_cliente,
                    programa: payload.programa_seleccionado,
                    fecha: formData.fecha_viaje,
                    fecha_tour: formData.fecha_viaje,
                    personas: formData.numero_personas,
                    numero_personas: formData.numero_personas,
                    telefono: formData.telefono,
                    hotel: formData.categoria_hotel,
                    pdf_url: pdfObj.public_url || pdfObj.download_url,
                    pdf: pdfObj,
                    precio_total: formData.precio_tren ? parseFloat(formData.precio_tren) : 0,
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
                            tipo: 'fijo',
                            datos: newCotizacion,
                            pdf_url: newCotizacion.pdf_url
                        });
                    
                    if (dbError) {
                        console.error('Error de Supabase:', dbError);
                        throw dbError;
                    }
                } catch (err) {
                    console.error('Error guardando en BD:', err);
                    // Fallback a localStorage por si falla la red
                    let cotizaciones = [];
                    const saved = localStorage.getItem('andean_cotizaciones');
                    if (saved) cotizaciones = JSON.parse(saved);
                    cotizaciones.unshift(newCotizacion);
                    localStorage.setItem('andean_cotizaciones', JSON.stringify(cotizaciones.slice(0, 100)));
                }
                fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: newCotizacion.id,
                        fecha_creacion: newCotizacion.timestamp,
                        nombre_cliente: newCotizacion.nombre_cliente,
                        email: formData.email || '',
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
        const msg = `🎉 *COTIZACIÓN GENERADA - Andean Journey*\n\n👤 *DATOS DEL CLIENTE*\n• Cliente: ${item.nombre_cliente}\n• Teléfono: ${item.telefono}\n• Fecha Viaje: ${item.fecha_tour}\n• Personas: ${item.numero_personas}\n\n🎯 *PROGRAMA*\n• ${item.programa}\n• Hotel: ${item.hotel}\n\n📄 *DOCUMENTO PDF*\n${item.pdf_url}\n\n✅ Descarga tu cotización completa en el link de arriba.`;
        const phone = item.telefono.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className={`min-h-screen pb-10 px-4 sm:px-6 lg:px-8 relative transition-colors duration-500 ${isDarkMode ? 'bg-inca-pattern-dark text-white' : 'bg-inca-pattern text-slate-800'}`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full relative z-10">
                <div className={`sticky top-0 z-50 backdrop-blur-xl flex items-center justify-between pb-4 pt-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b mb-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#001a2c]/95 border-white/10' : 'bg-white/40 border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}`}>
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white' : 'bg-black/5 hover:bg-black/10 border-slate-200 text-slate-600 hover:text-slate-900'}`}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="min-w-0">
                            <h1 className={`text-lg sm:text-2xl md:text-3xl font-extrabold font-outfit tracking-tight leading-tight sm:leading-none ${isDarkMode ? 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent' : 'text-slate-800'}`}>
                                Programas Fijos Organizados
                            </h1>
                        </div>
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
                        <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Andean Journey Premium</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-300 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

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
                            className={`relative w-full max-w-md backdrop-blur-3xl rounded-[24px] p-6 sm:p-8 text-center border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0a192f]/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]' : 'bg-white/80 border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.15)]'}`}
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
                                Cotización guardada y PDF premium generado.
                            </p>

                            <div className={`rounded-xl p-4 text-left mb-6 relative z-10 ${isDarkMode ? 'bg-black/30 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cliente</span>
                                        <p className={`text-sm font-bold truncate max-w-[180px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{successResult.nombre_cliente}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Programa</span>
                                        <p className="text-sm font-bold text-amber-500 truncate max-w-[180px]">{successResult.programa}</p>
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
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
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
                                onClick={() => setSuccessResult(null)}
                                className="mt-6 text-xs text-slate-400 hover:text-orange-500 font-bold transition-colors underline relative z-10"
                            >
                                Cerrar ventana
                            </button>
                        </motion.div>
                    </div>
                )}
                    <div className="w-full">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Paso 1: Selección de Programa Fijo */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                            <ElectricBorder color="#f59e0b" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg font-outfit shadow-md shrink-0 ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'}`}>
                                            1
                                        </div>
                                        <h2 className={`text-xl sm:text-2xl font-bold font-outfit leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Selección de Programa Fijo</h2>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 whitespace-nowrap self-start sm:self-auto w-fit">
                                        {programsList.length} Programas en BD
                                    </span>
                                </div>

                                <div className="relative mb-6">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar por título, destino o duración (Ej: Aventura, Cusco, 5D4N)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-amber-500/50 transition-all font-medium text-sm ${isDarkMode ? 'neumorphic-input text-white placeholder:text-slate-400' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-[slate-800] placeholder:text-[slate-400]'}`}
                                        />
                                    </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-2 overflow-visible">
                                    {filteredPrograms.map((p) => (
                                        <ProgramCard
                                            key={p.key}
                                            p={p}
                                            isSelected={selectedProgramKey === p.key}
                                            isDarkMode={isDarkMode}
                                            onClick={() => handleSelectProgram(p.key)}
                                        />
                                    ))}
                                </div>
                                </div>
                            </ElectricBorder>
                            </motion.div>

                            {/* Paso 2: Datos */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                            <ElectricBorder color="#00A884" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg font-outfit shadow-md shrink-0 ${isDarkMode ? 'bg-[#00A884]/20 text-[#00A884]' : 'bg-gradient-to-br from-[#25D366] to-[#00A884] text-white'}`}>
                                        2
                                    </div>
                                    <h2 className={`text-xl sm:text-2xl font-bold font-outfit leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tren a Machu Picchu</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 overflow-visible">
                                    <div 
                                        onClick={() => setFormData(prev => ({ ...prev, tipo_tren: 'local' }))} 
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFormData(prev => ({ ...prev, tipo_tren: 'local' })); } }}
                                        role="radio"
                                        aria-checked={formData.tipo_tren === 'local'}
                                        tabIndex={0}
                                        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
                                    >
                                        <ElectricBorder
                                            color={formData.tipo_tren === 'local' ? "#38bdf8" : "rgba(255, 255, 255, 0.08)"}
                                            speed={formData.tipo_tren === 'local' ? 8 : 1}
                                            chaos={formData.tipo_tren === 'local' ? 0.55 : 0.08}
                                            borderRadius={14}
                                            className="w-full"
                                        >
                                            <div className={`p-3.5 rounded-2xl transition-all flex items-center gap-3 active:scale-[0.98] ${
                                                formData.tipo_tren === 'local'
                                                    ? (isDarkMode ? 'bg-amber-500/15 shadow-lg shadow-amber-900/20' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    : (isDarkMode ? 'bg-slate-900/60 hover:bg-slate-800/80' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                            }`}>
                                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                                                    <Train className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-bold text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Tren Local / Expedition</span>
                                                        {formData.tipo_tren === 'local' && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
                                                    </div>
                                                    <p className={`text-[11px] leading-tight mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Incluido en la tarifa del paquete.</p>
                                                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-500/20 border-emerald-600/30'}`}>
                                                        Incluido en Tarifa
                                                    </span>
                                                </div>
                                            </div>
                                        </ElectricBorder>
                                    </div>

                                    <div 
                                        onClick={() => setFormData(prev => ({ ...prev, tipo_tren: 'vistadome' }))} 
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFormData(prev => ({ ...prev, tipo_tren: 'vistadome' })); } }}
                                        role="radio"
                                        aria-checked={formData.tipo_tren === 'vistadome'}
                                        tabIndex={0}
                                        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
                                    >
                                        <ElectricBorder
                                            color={formData.tipo_tren === 'vistadome' ? "#38bdf8" : "rgba(255, 255, 255, 0.08)"}
                                            speed={formData.tipo_tren === 'vistadome' ? 8 : 1}
                                            chaos={formData.tipo_tren === 'vistadome' ? 0.55 : 0.08}
                                            borderRadius={14}
                                            className="w-full"
                                        >
                                            <div className={`p-3.5 rounded-2xl transition-all flex items-center gap-3 active:scale-[0.98] ${
                                                formData.tipo_tren === 'vistadome'
                                                    ? (isDarkMode ? 'bg-orange-500/15 shadow-lg shadow-orange-900/20' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                                    : (isDarkMode ? 'bg-slate-900/60 hover:bg-slate-800/80' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]')
                                            }`}>
                                                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-bold text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Tren Turístico Vistadome</span>
                                                        {formData.tipo_tren === 'vistadome' && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
                                                    </div>
                                                    <p className={`text-[11px] leading-tight mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Premium panorámico con show a bordo.</p>
                                                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${isDarkMode ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-orange-700 bg-orange-500/20 border-orange-600/30'}`}>
                                                        + USD $125 por persona
                                                    </span>
                                                </div>
                                            </div>
                                        </ElectricBorder>
                                    </div>
                                </div>

                                {formData.tipo_tren === 'vistadome' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-6 rounded-2xl space-y-4 ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}
                                    >
                                        <h3 className={`text-xs sm:text-sm font-bold flex items-start sm:items-center gap-2 uppercase tracking-wide ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                            <Info className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                                            <span className="leading-tight">Configuración del Tren Turístico</span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Field>
                                                <FieldLabel className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pasajeros en Tren</FieldLabel>
                                                <InputGroup className={`h-11 rounded-xl focus-within:border-orange-400 ${isDarkMode ? 'bg-black/40 border-orange-500/40' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                    <InputGroupAddon><Users className="w-4 h-4 text-orange-400" /></InputGroupAddon>
                                                    <InputGroupInput 
                                                        name="personas_tren"
                                                        value={formData.personas_tren}
                                                        onChange={handleInputChange}
                                                        placeholder="Ej: 2 adultos"
                                                        className={`text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                    />
                                                </InputGroup>
                                            </Field>
                                            <Field>
                                                <FieldLabel className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Horario Preferido</FieldLabel>
                                                <InputGroup className={`h-11 rounded-xl focus-within:border-orange-400 ${isDarkMode ? 'bg-black/40 border-orange-500/40' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                    <InputGroupAddon><Calendar className="w-4 h-4 text-orange-400" /></InputGroupAddon>
                                                    <InputGroupInput 
                                                        name="tren_horario"
                                                        value={formData.tren_horario}
                                                        onChange={handleInputChange}
                                                        placeholder="Ej: 07:05 AM"
                                                        className={`text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                    />
                                                </InputGroup>
                                            </Field>
                                            <Field>
                                                <FieldLabel className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Precio Total (USD)</FieldLabel>
                                                <InputGroup className={`h-11 rounded-xl focus-within:border-orange-400 ${isDarkMode ? 'bg-black/40 border-orange-500/40' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                    <InputGroupAddon><DollarSign className="w-4 h-4 text-amber-400" /></InputGroupAddon>
                                                    <InputGroupInput 
                                                        type="number"
                                                        name="precio_tren"
                                                        value={formData.precio_tren}
                                                        onChange={handleInputChange}
                                                        placeholder="Ej: 250"
                                                        className={`text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                    />
                                                </InputGroup>
                                            </Field>
                                        </div>
                                    </motion.div>
                                )}
                                </div>
                            </ElectricBorder>
                            </motion.div>

                            {/* Paso 3: Alojamiento */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                            <ElectricBorder color="#3b82f6" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-6 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg font-outfit shadow-md shrink-0 ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'}`}>
                                        3
                                    </div>
                                    <h2 className={`text-xl sm:text-2xl font-bold font-outfit leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Alojamiento Premium</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Hotel className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                            <span>Tipo de Habitación</span>
                                        </label>
                                        <select 
                                            name="tipo_habitacion"
                                            value={formData.tipo_habitacion}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-500/50 font-medium text-sm cursor-pointer ${isDarkMode ? 'neumorphic-input text-white' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-[slate-800]'}`}
                                        >
                                            <option value="Matrimonial o Doble" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>Habitación Matrimonial / Doble</option>
                                            <option value="Habitación Triple" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>Habitación Triple</option>
                                            <option value="Habitación Simple (+ S/. 30/noche)" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>Habitación Simple (+ S/. 30/noche)</option>
                                            <option value="Suite Premium" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>Suite Premium Andean</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                            <span>Categoría del Hotel</span>
                                        </label>
                                        <select 
                                            name="categoria_hotel"
                                            value={formData.categoria_hotel}
                                            onChange={handleInputChange}
                                            className={`w-full rounded-xl px-4 py-3.5 focus:outline-none focus:border-amber-500/50 font-medium text-sm cursor-pointer ${isDarkMode ? 'neumorphic-input text-white' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] text-[slate-800]'}`}
                                        >
                                            <option value="3 Estrellas Premium" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>3 Estrellas Premium (Incluido)</option>
                                            <option value="4 Estrellas Superior" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>4 Estrellas Superior Superior</option>
                                            <option value="Boutique Histórico" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-[slate-800]'}>Boutique Histórico Cusco</option>
                                        </select>
                                    </div>
                                </div>
                                </div>
                            </ElectricBorder>
                            </motion.div>

                            {/* Paso 4: Datos del Cliente (Estética Shadcn ReUI Premium) */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                            <ElectricBorder color="#f97316" speed={1.5} chaos={0.08} borderRadius={24}>
                                <div className={`p-6 sm:p-8 rounded-[22px] z-10 relative space-y-8 ${isDarkMode ? 'bg-[#0b1b2b] shadow-xl border border-white/5' : 'bg-white/50 border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg font-outfit shadow-md shrink-0 ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'}`}>
                                            4
                                        </div>
                                        <h2 className={`text-xl sm:text-2xl font-bold font-outfit leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Datos del Cliente y Viaje</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel htmlFor="nombre_cliente" className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Nombre Completo *</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><User className="text-orange-500 w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="nombre_cliente"
                                                    name="nombre_cliente"
                                                    required
                                                    value={formData.nombre_cliente}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej: Carlos Mendoza"
                                                    className={`font-medium text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="telefono" className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>WhatsApp / Teléfono *</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><Phone className="text-orange-500 w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="telefono"
                                                    type="tel"
                                                    name="telefono"
                                                    required
                                                    value={formData.telefono}
                                                    onChange={handleInputChange}
                                                    placeholder="+51 987 654 321"
                                                    className={`font-medium text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="fecha_viaje" className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Fecha de Salida *</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><Calendar className="text-amber-500 w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="fecha_viaje"
                                                    type="date"
                                                    name="fecha_viaje"
                                                    required
                                                    value={formData.fecha_viaje}
                                                    onChange={handleInputChange}
                                                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                                                    className={`font-medium text-sm cursor-pointer w-full ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-800'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="numero_personas" className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Número de Personas *</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><Users className="text-amber-500 w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="numero_personas"
                                                    name="numero_personas"
                                                    required
                                                    value={formData.numero_personas}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej: 2 adultos, 1 niño"
                                                    className={`font-medium text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="email" className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Correo Electrónico (Opcional)</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><Mail className="text-[slate-400] w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="ejemplo@correo.com"
                                                    className={`font-medium text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="adelanto_pagado" className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Adelanto Pagado (S/. - Opcional)</FieldLabel>
                                            <InputGroup className={`h-13 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupAddon><DollarSign className="text-emerald-500 w-5 h-5" /></InputGroupAddon>
                                                <InputGroupInput 
                                                    id="adelanto_pagado"
                                                    type="number"
                                                    name="adelanto_pagado"
                                                    value={formData.adelanto_pagado}
                                                    onChange={handleInputChange}
                                                    placeholder="0.00"
                                                    className={`font-medium text-sm bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>

                                        <Field className="sm:col-span-2">
                                            <FieldLabel htmlFor="observaciones" className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Observaciones Adicionales</FieldLabel>
                                            <InputGroup className={`h-auto rounded-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 p-1 transition-colors ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
                                                <InputGroupTextarea 
                                                    id="observaciones"
                                                    rows="3"
                                                    name="observaciones"
                                                    value={formData.observaciones}
                                                    onChange={handleInputChange}
                                                    placeholder="Requerimientos dietéticos, restricciones médicas, vuelos de llegada, etc..."
                                                    className={`font-medium text-sm p-3 border-0 focus:ring-0 bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                                />
                                            </InputGroup>
                                        </Field>
                                    </div>
                                </div>

                                {/* Sección Asesor Comercial */}
                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-4 flex items-start sm:items-center gap-2">
                                        <User className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                                        <span className="leading-tight">Datos del Asesor Comercial (Opcional)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputGroup className={`h-11 rounded-xl focus-within:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-slate-300'}`}>
                                            <InputGroupAddon><User className="w-4 h-4 text-[slate-400]" /></InputGroupAddon>
                                            <InputGroupInput 
                                                name="nombre_asesor"
                                                value={formData.nombre_asesor}
                                                onChange={handleInputChange}
                                                placeholder="Nombre del Asesor"
                                                className={`text-xs font-medium bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                            />
                                        </InputGroup>
                                        <InputGroup className={`h-11 rounded-xl focus-within:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-slate-300'}`}>
                                            <InputGroupAddon><Mail className="w-4 h-4 text-[slate-400]" /></InputGroupAddon>
                                            <InputGroupInput 
                                                type="email"
                                                name="email_asesor"
                                                value={formData.email_asesor}
                                                onChange={handleInputChange}
                                                placeholder="Correo del Asesor"
                                                className={`text-xs font-medium bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                            />
                                        </InputGroup>
                                        <InputGroup className={`h-11 rounded-xl focus-within:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-slate-300'}`}>
                                            <InputGroupAddon><Phone className="w-4 h-4 text-[slate-400]" /></InputGroupAddon>
                                            <InputGroupInput 
                                                type="tel"
                                                name="telefono_asesor"
                                                value={formData.telefono_asesor}
                                                onChange={handleInputChange}
                                                placeholder="Teléfono del Asesor"
                                                className={`text-xs font-medium bg-transparent ${isDarkMode ? 'text-white placeholder:text-[slate-400]' : 'text-[slate-800] placeholder:text-[slate-400]'}`}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                </div>
                            </ElectricBorder>
                            </motion.div>

                            <div className="flex justify-center mt-8">
                                <motion.button
                                    type="submit"
                                    disabled={loading || !selectedProgramKey}
                                    whileHover={!selectedProgramKey || loading ? {} : { scale: 1.02 }}
                                    whileTap={!selectedProgramKey || loading ? {} : { scale: 0.98 }}
                                    className={`group relative w-full sm:w-[480px] rounded-[24px] neumorphic-button with-glow ${
                                        !selectedProgramKey
                                            ? (isDarkMode ? 'bg-[#001a2c] cursor-not-allowed opacity-70 border border-white/5' : 'bg-white/30 cursor-not-allowed opacity-70 border border-black/5')
                                            : loading 
                                            ? (isDarkMode ? 'bg-[#0a1f18] cursor-wait border border-emerald-500/30' : 'bg-emerald-50/50 cursor-wait border border-emerald-500/30')
                                            : (isDarkMode ? 'bg-gradient-to-br from-[#002844] to-[#001424] hover:from-[#003355] hover:to-[#001a2c] cursor-pointer' : 'bg-[#824451] hover:bg-[#6b3541] cursor-pointer shadow-lg text-white border-none')
                                    }`}
                                >
                                    <ElectricBorder 
                                        color={!selectedProgramKey ? "rgba(255,255,255,0.05)" : loading ? "#f59e0b" : "#38bdf8"} 
                                        speed={!selectedProgramKey ? 1 : loading ? 6 : 4} 
                                        chaos={!selectedProgramKey ? 0.05 : loading ? 0.3 : 0.15} 
                                        borderRadius={24}
                                    >
                                        <div className={`relative flex items-center justify-center gap-4 py-5 px-6 rounded-[22px] transition-all duration-300 z-10 overflow-hidden bg-transparent ${
                                            !selectedProgramKey
                                                ? 'text-slate-400'
                                                : loading 
                                                ? 'text-amber-300'
                                                : 'text-white'
                                        }`}>
                                            
                                            {!selectedProgramKey ? (
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[slate-400] border border-white/5 shrink-0">
                                                        <Lock className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-bold text-[11px] text-slate-500 uppercase tracking-widest font-outfit">Paso 1 Obligatorio</span>
                                                        <span className="text-sm font-semibold text-slate-400">Selecciona un tour para cotizar</span>
                                                    </div>
                                                </div>
                                            ) : loading ? (
                                                <>
                                                    <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                                    <span className="font-extrabold text-base tracking-wide font-outfit">Procesando Cotización...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                    <span className="font-extrabold text-sm sm:text-lg tracking-wider font-outfit uppercase leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent group-hover:to-white transition-all duration-300">
                                                        Generar Cotización
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-300" />
                                                </>
                                            )}
                                        </div>
                                    </ElectricBorder>
                                </motion.button>
                            </div>
                        </form>
                    </div>
            </div>
        </div>
    );
}
