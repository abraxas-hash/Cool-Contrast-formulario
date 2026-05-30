import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../lib/utils.js';
import { SalesChart } from '../components/SalesChart.jsx';
import PdfList from '../components/PdfList.jsx';
import { TourCalendar } from '../components/TourCalendar.jsx';
import Prism from '../components/ui/Prism.jsx';
import ElectricBorder from '../components/ui/ElectricBorder.jsx';
import ScrollFloat from '../components/ui/ScrollFloat.jsx';
import Dock from '../components/ui/Dock.jsx';
import { 
    LayoutDashboard, FileText, Calendar, LogOut, Users, DollarSign, 
    TrendingUp, Plus, Sparkles, ChevronRight, ChevronLeft, ArrowUpRight, Mountain, ExternalLink, Compass, Sun, Moon, CloudRain, Wind, Home, Info, Code, Zap, Download,
    Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourGuide } from '../components/TourGuide.jsx';

// =========================================================
// SUB-COMPONENTE: PAISAJE ANDINO ANIMADO (ESTADO VACÍO)
// =========================================================
function AndeanLandscape({ onNavigate, isDarkMode = true }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "w-full mx-auto p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 border-0",
                isDarkMode 
                    ? "bg-[#162029] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)]" 
                    : "bg-[#cae1d9] shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb]"
            )}
        >
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] text-white mb-2">
                <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
                <h5 className={cn("text-base font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>Cero salidas para esta fecha</h5>
                <p className={cn("text-xs mt-1.5 leading-relaxed font-medium max-w-[250px] mx-auto", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    Tus asesores están libres de operaciones hoy. ¡Diseña un nuevo itinerario!
                </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2 w-full">
                <button 
                    onClick={() => onNavigate('/cotizar/personalizado')}
                    className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] transition-all cursor-pointer active:scale-95 border-0 uppercase tracking-wider"
                >
                    + Personalizado
                </button>
                <button 
                    onClick={() => onNavigate('/cotizar/fijo')}
                    className={cn(
                        "w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 border-0 uppercase tracking-wider",
                        isDarkMode 
                            ? "bg-[#1a2833] text-slate-300 shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.02)] hover:bg-[#1e3040] hover:text-white" 
                            : "bg-[#b8d1c8] text-slate-700 shadow-[inset_2px_2px_4px_#aabebd,inset_-2px_-2px_4px_#eafffb] hover:bg-[#a5c2b8] hover:text-slate-900"
                    )}
                >
                    + Programa Fijo
                </button>
            </div>
        </motion.div>
    );
}

// =========================================================
// SUB-COMPONENTE: PAISAJE DEL AMANECER ANDINO (ESTADO VACÍO)
// =========================================================
function NearbyLandscape({ onNavigate }) {
    return (
        <div className="relative overflow-hidden w-full h-[270px] bg-gradient-to-b from-[#0c2445] via-[#1b436e] via-[#b35e3b] to-[#e89058] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center justify-center group select-none">
            {/* Sunrise Aura / Sun Rays */}
            <div className="absolute bottom-[40px] left-[50%] -translate-x-1/2 w-[220px] h-[220px] rounded-full bg-gradient-to-b from-[#25D366]/30 via-[#00A884]/20 to-transparent opacity-40 blur-2xl pointer-events-none" />
            
            {/* Rising Sun */}
            <div className="absolute bottom-[35px] left-[50%] -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-gradient-to-b from-yellow-100 to-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] z-0" />

            {/* Clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
                <div className="absolute w-[180px] h-[30px] bg-white rounded-full blur-xl top-[15%] left-[-40px] animate-drift" style={{ animationDuration: '40s' }} />
                <div className="absolute w-[140px] h-[25px] bg-white rounded-full blur-xl top-[30%] right-[-20px] animate-drift-reverse" style={{ animationDuration: '30s' }} />
            </div>

            {/* Condor SVG flying */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <svg viewBox="0 0 100 40" className="absolute w-10 h-6 text-[#180a05] fill-current opacity-85" style={{ animation: 'soar 18s ease-in-out infinite' }}>
                    <path d="M 5,20 C 15,5 35,5 50,15 C 65,5 85,5 95,20 C 80,22 65,15 50,22 C 35,15 20,22 5,20 Z" />
                </svg>
            </div>

            {/* Valley / Mountains SVGs with warm dawn colors */}
            <div className="absolute bottom-0 inset-x-0 w-full h-[90px] pointer-events-none overflow-hidden z-0">
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="w-full h-full">
                    {/* Layer 1 (Back Valleys) */}
                    <path 
                        d="M 0 120 L 0 75 Q 80 50 160 85 T 320 60 Q 360 80 400 70 L 400 120 Z" 
                        fill="#5c3522" 
                        opacity="0.35"
                    />
                    {/* Layer 2 (Middle Hills) */}
                    <path 
                        d="M 0 120 L 0 90 Q 90 70 200 100 T 400 80 L 400 120 Z" 
                        fill="#3a1e16" 
                        opacity="0.7"
                    />
                    {/* Layer 3 (Front Valley Silhouette) */}
                    <path 
                        d="M 0 120 L 0 105 Q 110 85 240 110 T 400 95 L 400 120 Z" 
                        fill="#1f0e0a" 
                        opacity="1"
                    />
                </svg>
            </div>

            {/* Glassmorphic card */}
            <div className="relative z-10 mx-4 p-3.5 bg-slate-950/45 backdrop-blur-md border border-white/10 rounded-2xl text-center max-w-[280px] shadow-2xl flex flex-col items-center gap-2">
                <div className="p-1.5 bg-[#00A884]/10 rounded-xl border border-[#00A884]/20 text-[#00A884]">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                    <h5 className="text-[10px] font-bold text-white tracking-tight">Próximos días libres de salidas</h5>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed font-outfit font-semibold">
                        No hay operaciones programadas para los siguientes 5 días. ¡Excelente momento para captar nuevos clientes!
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('/cotizar/personalizado')}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-[#25D366] to-[#00A884] hover:from-[#128C7E] hover:to-[#075E54] border border-[#00A884]/30 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-[0.98] select-none shadow-[0_0_10px_rgba(0,168,132,0.25)] hover:shadow-[0_0_15px_rgba(0,168,132,0.4)]"
                >
                    + Cotizar Nuevo Tour
                </button>
            </div>

            <style>{`
                @keyframes drift {
                    0% { transform: translateX(-40px); }
                    50% { transform: translateX(80px); }
                    100% { transform: translateX(-40px); }
                }
                @keyframes drift-reverse {
                    0% { transform: translateX(40px); }
                    50% { transform: translateX(-80px); }
                    100% { transform: translateX(40px); }
                }
                @keyframes soar {
                    0% { transform: translate(5%, 15%) scale(0.65) rotate(4deg); }
                    25% { transform: translate(45%, 5%) scale(0.9) rotate(0deg); }
                    50% { transform: translate(85%, 20%) scale(0.75) rotate(-6deg); }
                    75% { transform: translate(40%, 15%) scale(0.85) rotate(-2deg); }
                    100% { transform: translate(5%, 15%) scale(0.65) rotate(4deg); }
                }
            `}</style>
        </div>
    );
}

// =========================================================
// UTILIDAD: SANITIZADOR DE NOMBRES DE CLIENTE
// =========================================================
function sanitizeName(raw) {
    if (!raw) return 'Pasajero';
    // Strip leading dashes, tildes, underscores, spaces
    return raw.replace(/^[\-~_\s]+/, '').trim() || 'Pasajero';
}

// =========================================================
// SUB-COMPONENTE: CARRUSEL INTERACTIVO DE SALIDAS CERCANAS
// =========================================================
function NearbyCarousel({ nearbyTours, isDarkMode = true }) {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(nearbyTours.length / itemsPerPage);

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const startIndex = currentPage * itemsPerPage;
    const visibleTours = nearbyTours.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            {/* ── Header: icono + título corto + badge + flechas en una sola línea ── */}
            <div className="flex items-center gap-1.5 mb-3.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#00A884] animate-pulse shrink-0" />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    Próximas
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap ${isDarkMode ? 'bg-[#00A884]/15 text-[#00A884]' : 'bg-[#00A884]/10 text-[#00A884]'}`}>
                    {nearbyTours.length} salida{nearbyTours.length !== 1 ? 's' : ''}
                </span>

                {/* spacer */}
                <div className="flex-1" />

                {/* Arrow navigation — always visible when multi-page */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={prevPage}
                            className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Anterior"
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                            onClick={nextPage}
                            className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Siguiente"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Tour cards with slide transition ── */}
            <div className="flex-grow overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="space-y-2"
                    >
                        {visibleTours.map((tour, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all duration-300 group ${isDarkMode ? 'border-0 bg-[#1a2530] shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.03)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.04)]' : 'bg-white/50 backdrop-blur-md border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}
                            >
                                <div className="min-w-0 flex-grow">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className={`font-black text-[10px] truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#25D366]' : 'text-slate-800 group-hover:text-[#00A884]'}`}>
                                            {sanitizeName(tour.nombre_cliente)}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00A884]/10 text-[#00A884] font-extrabold shrink-0 group-hover:bg-[#00A884]/20 transition-all">
                                            +{tour.diffDays}d
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5 text-[#00A884]/70 shrink-0" />
                                        {(tour.fecha_tour || tour.fecha || '').split('T')[0].split('-').reverse().join('/')}
                                    </p>
                                </div>

                                {tour.link && (
                                    <a
                                        href={tour.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 bg-[#00A884]/5 hover:bg-[#00A884] text-[#00A884] hover:text-slate-950 rounded-md transition-all border border-[#00A884]/10 opacity-50 group-hover:opacity-100 shrink-0 cursor-pointer"
                                        title="Ver PDF"
                                    >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Page dot indicator ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-2.5 shrink-0">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`rounded-full transition-all cursor-pointer ${
                                i === currentPage
                                    ? 'w-3 h-1.5 bg-[#00A884]'
                                    : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// =========================================================
// SUB-COMPONENTE: MAPA CONCEPTUAL DE RUTAS (CON SALIDAS)
// =========================================================
function InteractiveRouteMap({ dayTours, isDarkMode = true }) {
    const [hoveredNode, setHoveredNode] = useState(null);

    // Dynamic destination matcher
    const getActiveDestinations = (toursList) => {
        const active = { MP: false, VS: false, CU: false, PU: false, AQ: false };
        
        toursList.forEach(tour => {
            const prog = (tour.programa || '').toLowerCase();
            const name = (tour.nombre_cliente || '').toLowerCase();
            const combined = `${prog} ${name}`;
            
            if (combined.includes('machu') || combined.includes('picchu') || combined.includes('mapi') || combined.includes('inca')) {
                active.MP = true;
            }
            if (combined.includes('valle') || combined.includes('sagrado') || combined.includes('pisac') || combined.includes('ollanta') || combined.includes('maras') || combined.includes('moray')) {
                active.VS = true;
            }
            if (combined.includes('puno') || combined.includes('titicaca') || combined.includes('taquile') || combined.includes('uros')) {
                active.PU = true;
            }
            if (combined.includes('arequipa') || combined.includes('colca') || combined.includes('misti') || combined.includes('chivay')) {
                active.AQ = true;
            }
            if (combined.includes('cusco') || combined.includes('cuzco') || combined.includes('city') || combined.includes('sacsayhuaman') || active.MP || active.VS) {
                active.CU = true;
            }
        });
        
        // If there are tours but none matched, default to Cusco as the active hub
        if (toursList.length > 0 && !Object.values(active).some(Boolean)) {
            active.CU = true;
        }
        
        return active;
    };

    const active = getActiveDestinations(dayTours);

    // Weather metadata
    const weatherData = {
        MP: { temp: '17°C', cond: 'Lluvia leve', icon: CloudRain, label: 'Machu Picchu' },
        VS: { temp: '20°C', cond: 'Soleado', icon: Sun, label: 'Valle Sagrado' },
        CU: { temp: '14°C', cond: 'Despejado', icon: Sun, label: 'Cusco' },
        AQ: { temp: '22°C', cond: 'Soleado', icon: Sun, label: 'Arequipa' },
        PU: { temp: '11°C', cond: 'Frío / Viento', icon: Wind, label: 'Puno' }
    };

    // Extract list of clients for each node
    const getClientsForNode = (nodeId) => {
        const matchingClients = [];
        dayTours.forEach(tour => {
            const prog = (tour.programa || '').toLowerCase();
            const name = (tour.nombre_cliente || 'Pasajero General');
            const matchStr = `${prog} ${name.toLowerCase()}`;

            let match = false;
            if (nodeId === 'MP' && (matchStr.includes('machu') || matchStr.includes('picchu') || matchStr.includes('mapi') || matchStr.includes('inca'))) match = true;
            if (nodeId === 'VS' && (matchStr.includes('valle') || matchStr.includes('sagrado') || matchStr.includes('pisac') || matchStr.includes('ollanta') || matchStr.includes('maras') || matchStr.includes('moray'))) match = true;
            if (nodeId === 'PU' && (matchStr.includes('puno') || matchStr.includes('titicaca') || matchStr.includes('taquile') || matchStr.includes('uros'))) match = true;
            if (nodeId === 'AQ' && (matchStr.includes('arequipa') || matchStr.includes('colca') || matchStr.includes('misti') || matchStr.includes('chivay'))) match = true;
            if (nodeId === 'CU' && (matchStr.includes('cusco') || matchStr.includes('cuzco') || matchStr.includes('city') || matchStr.includes('sacsayhuaman') || (!matchStr.includes('machu') && !matchStr.includes('picchu') && !matchStr.includes('valle') && !matchStr.includes('sagrado') && !matchStr.includes('puno') && !matchStr.includes('arequipa')))) match = true;

            if (match) {
                matchingClients.push(name);
            }
        });
        return [...new Set(matchingClients)]; // unique
    };

    // SVG Layout Dimensions
    const nodes = [
        { id: 'MP', x: 50, y: 40, label: 'M. Picchu' },
        { id: 'VS', x: 95, y: 80, label: 'Valle Sagrado' },
        { id: 'CU', x: 120, y: 120, label: 'Cusco (Hub)' },
        { id: 'AQ', x: 55, y: 180, label: 'Arequipa' },
        { id: 'PU', x: 165, y: 175, label: 'Puno' }
    ];

    // Connectivity
    const connections = [
        { from: 'MP', to: 'VS', active: active.MP && active.VS },
        { from: 'VS', to: 'CU', active: active.VS && active.CU },
        { from: 'CU', to: 'PU', active: active.CU && active.PU },
        { from: 'CU', to: 'AQ', active: active.CU && active.AQ },
        { from: 'AQ', to: 'PU', active: active.AQ && active.PU }
    ];

    return (
        <div className={`relative overflow-hidden w-full rounded-2xl p-3.5 flex flex-col justify-between select-none transition-colors duration-500 ${isDarkMode ? 'border bg-[#162029] border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.02)]' : 'bg-white/50 border border-black/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#00A884]' : 'text-[#00A884]'}`}>Mapa conceptual de rutas</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${isDarkMode ? 'text-slate-450 bg-[#111b21] border-white/5' : 'text-slate-500 bg-white border-black/5'}`}>Hover interactivo</span>
            </div>

            {/* SVG Routing Map Canvas */}
            <div className="relative flex justify-center items-center h-[160px] w-full">
                <svg viewBox="35 20 150 180" className="w-full h-full max-w-[240px]">
                    <defs>
                        <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Paths / Connections */}
                    {connections.map((c, idx) => {
                        const fromNode = nodes.find(n => n.id === c.from);
                        const toNode = nodes.find(n => n.id === c.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <g key={idx}>
                                <line 
                                    x1={fromNode.x} 
                                    y1={fromNode.y} 
                                    x2={toNode.x} 
                                    y2={toNode.y} 
                                    stroke={c.active ? '#00A884' : (isDarkMode ? '#ffffff' : '#475569')} 
                                    strokeOpacity={c.active ? 0.35 : (isDarkMode ? 0.08 : 0.2)}
                                    strokeWidth={c.active ? 2 : 1.5}
                                    strokeDasharray={c.active ? 'none' : '4 4'}
                                />
                                {c.active && (
                                    <line 
                                        x1={fromNode.x} 
                                        y1={fromNode.y} 
                                        x2={toNode.x} 
                                        y2={toNode.y} 
                                        stroke="#00A884" 
                                        strokeWidth={2}
                                        strokeDasharray="5, 5"
                                        className="active-route-line"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Nodes / Destinations */}
                    {nodes.map((node) => {
                        const isNodeActive = active[node.id];
                        const weather = weatherData[node.id];
                        const clients = getClientsForNode(node.id);

                        return (
                            <g 
                                key={node.id} 
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredNode({ id: node.id, ...node, weather, clients, isActive: isNodeActive })}
                                onMouseLeave={() => setHoveredNode(null)}
                            >
                                {isNodeActive && (
                                    <circle 
                                        cx={node.x} 
                                        cy={node.y} 
                                        r={12} 
                                        fill="none" 
                                        stroke="#00A884" 
                                        strokeWidth={1}
                                        strokeOpacity={0.6}
                                        filter="url(#glow-active)"
                                        className="animate-pulse"
                                    />
                                )}

                                <circle 
                                    cx={node.x} 
                                    cy={node.y} 
                                    r={6} 
                                    fill={isNodeActive ? '#00A884' : (isDarkMode ? '#1e293b' : '#94a3b8')} 
                                    stroke={isNodeActive ? '#25D366' : (isDarkMode ? '#475569' : '#cbd5e1')} 
                                    strokeWidth={1.5}
                                    className="transition-colors duration-300"
                                />

                                {isNodeActive && (
                                    <circle 
                                        cx={node.x} 
                                        cy={node.y} 
                                        r={2} 
                                        fill="#ffffff" 
                                    />
                                )}

                                <text 
                                    x={node.x} 
                                    y={node.y - 10} 
                                    textAnchor="middle" 
                                    fill={isNodeActive ? (isDarkMode ? '#00A884' : '#047857') : (isDarkMode ? '#94a3b8' : '#475569')} 
                                    className="text-[10px] font-bold font-outfit"
                                    style={{ letterSpacing: '0.02em' }}
                                >
                                    {node.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Crystal Glassmorphic Tooltip */}
                <AnimatePresence>
                    {hoveredNode && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-20 top-2 left-2 right-2 p-3 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl flex items-start gap-2.5 max-w-[210px] pointer-events-none"
                        >
                            {React.createElement(hoveredNode.weather.icon, { 
                                className: `w-5 h-5 shrink-0 mt-0.5 ${hoveredNode.isActive ? 'text-[#00A884]' : 'text-slate-400'}` 
                            })}
                            <div className="flex-grow min-w-0">
                                <h6 className="text-[10px] font-bold text-white truncate font-outfit">
                                    {hoveredNode.weather.label}
                                </h6>
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 leading-none font-semibold">
                                    <span>{hoveredNode.weather.temp}</span> • <span>{hoveredNode.weather.cond}</span>
                                </p>
                                
                                <div className="mt-1.5 pt-1.5 border-t border-white/5 space-y-1">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Pasajeros hoy</span>
                                    {hoveredNode.isActive && hoveredNode.clients.length > 0 ? (
                                        hoveredNode.clients.map((c, idx) => (
                                            <span key={idx} className="block text-[10px] font-bold text-[#a3e4d7] truncate">
                                                • {c}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="block text-[10px] text-slate-500 italic">Ningún grupo programado</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .active-route-line {
                    stroke-dasharray: 4, 3;
                    animation: dashflow 1s linear infinite;
                }
                @keyframes dashflow {
                    to {
                        stroke-dashoffset: -14;
                    }
                }
            `}</style>
        </div>
    );
}

export default function DashboardPage() {
    const { user, logout, isDemo, displayName } = useAuth();
    const navigate = useNavigate();
    const [runTour, setRunTour] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [, setMobileMenuOpen] = useState(false);
    const [tours, setTours] = useState([]);
    
    useEffect(() => {
        const loadTours = async () => {
            let loadedTours = [];
            try {
                const { data, error } = await supabase.from('andean_journey_cotizaciones').select('datos').order('created_at', { ascending: false });
                if (!error && data && data.length > 0) {
                    loadedTours = data.map(d => d.datos);
                }
            } catch (err) {
                console.warn('Supabase tours load error', err);
            }
            
            try {
                const localData = localStorage.getItem('andean_cotizaciones');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        loadedTours = [...loadedTours, ...parsed];
                    }
                }
            } catch (e) { }
            
            setTours(loadedTours);
        };
        
        loadTours();
    }, []);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('andean-theme');
        return saved ? saved === 'dark' : true;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('andean-theme', next ? 'dark' : 'light');
            return next;
        });
    };

    // Mostrar nombre legible del usuario Supabase
    const usernameStr = displayName ?? user?.email ?? 'Asesor';
    const roleStr = isDemo ? 'Invitado' : 'Administrador';
    const initials = usernameStr.substring(0, 2).toUpperCase();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };


    // Métricas de ventas ficticias realistas
    const stats = [
        { 
            id: 'sales', 
            label: 'Total de Ventas', 
            value: '$12,480 USD', 
            change: '+14.2%', 
            icon: DollarSign, 
            color: '#00A884',
            borderColor: '#059669'
        },
        { 
            id: 'quotes', 
            label: 'Cotizaciones Generadas', 
            value: '184', 
            change: '+28.5%', 
            icon: FileText, 
            color: '#25D366',
            borderColor: '#128C7E'
        },
        { 
            id: 'conversion', 
            label: 'Tasa de Conversión', 
            value: '68.5%', 
            change: '+4.8%', 
            icon: TrendingUp, 
            color: '#00A884',
            borderColor: '#059669'
        },
        { 
            id: 'clients', 
            label: 'Clientes Activos', 
            value: '42', 
            change: '+12.1%', 
            icon: Users, 
            color: '#25D366',
            borderColor: '#128C7E'
        }
    ];

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'quotations', label: 'Cotizaciones', icon: FileText },
        { id: 'about', label: 'Info. Sistema', icon: Info }
    ];

    // Cerrar menú móvil al cambiar de pestaña
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false);
    };

    // Últimas 6 cotizaciones con PDF
    const recentPdfs = tours
        .filter(t => t.pdf_url || (t.pdf && (t.pdf.public_url || t.pdf.download_url)))
        .sort((a, b) => {
            const dateA = new Date(a.created_at || a.timestamp || a.fecha_creacion || 0);
            const dateB = new Date(b.created_at || b.timestamp || b.fecha_creacion || 0);
            return dateB - dateA;
        })
        .slice(0, 6);

    // Formateador de fecha seleccionada
    const formatSelectedDate = (dateStr) => {
        if (!dateStr) return { day: '', month: '', year: '' };
        try {
            const parsed = new Date(dateStr + 'T12:00:00');
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            return {
                day: String(parsed.getDate()).padStart(2, '0'),
                month: monthNames[parsed.getMonth()],
                year: parsed.getFullYear()
            };
        } catch (e) {
            return { day: '', month: '', year: '' };
        }
    };


    // Filtrar salidas del día exacto seleccionado
    const dayTours = tours.filter(t => {
        const dateStr = t.fecha_tour || t.fecha;
        if (!dateStr) return false;
        return dateStr.split('T')[0] === selectedDate;
    });

    // Filtrar salidas de los próximos 5 días
    const nearbyTours = tours.filter(t => {
        const dateStr = t.fecha_tour || t.fecha;
        if (!dateStr) return false;
        const cleanDate = dateStr.split('T')[0];
        if (cleanDate === selectedDate) return false; // Excluir día exacto ya mostrado
        
        try {
            const baseDate = new Date(selectedDate + 'T12:00:00');
            const tDate = new Date(cleanDate + 'T12:00:00');
            const diffTime = tDate.getTime() - baseDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays > 0 && diffDays <= 5;
        } catch (e) {
            return false;
        }
    }).map(t => {
        const cleanDate = (t.fecha_tour || t.fecha).split('T')[0];
        const baseDate = new Date(selectedDate + 'T12:00:00');
        const tDate = new Date(cleanDate + 'T12:00:00');
        const diffDays = Math.round((tDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        return { ...t, diffDays };
    }).sort((a, b) => a.diffDays - b.diffDays);

    return (
        <div className={`min-h-screen flex flex-col font-sans pb-10 transition-colors duration-500 ${isDarkMode ? 'bg-inca-pattern-dark text-white' : 'bg-inca-pattern text-slate-800'}`}>
            <TourGuide run={runTour} setRun={setRunTour} />
            {/* =========================================================
                HEADER PREMIUM CON PRISM WEBGL & NAVEGACIÓN ANIMADA
            ========================================================= */}
            <header className={`sticky top-0 w-full overflow-hidden backdrop-blur-2xl z-50 transition-colors duration-500 ${isDarkMode ? 'bg-[#111b21]/90 border-b border-white/8' : 'bg-white/90 border-b border-black/8'}`}>
                {/* Subtle prism glow — reduced opacity for elegance */}
                <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                    <Prism
                        animationType="rotate"
                        timeScale={0.15}
                        height={2.5}
                        baseWidth={5}
                        scale={4}
                        hueShift={0.1}
                        colorFrequency={0.6}
                        noise={0.15}
                        glow={0.6}
                        bloom={0.9}
                        transparent={true}
                    />
                </div>
                {/* Left-side brand gradient accent */}
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#25D366] via-[#00A884] to-transparent z-10" />
                {/* Bottom border glow */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00A884]/40 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center justify-between h-16">

                        {/* ── BRAND ── */}
                        <button
                            className="flex items-center gap-2.5 cursor-pointer group outline-none"
                            onClick={() => handleTabChange('dashboard')}
                        >
                            {/* Icon mark */}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25D366] to-[#00A884] flex items-center justify-center shadow-[0_0_16px_rgba(0,168,132,0.35)] border border-[#25D366]/30 group-hover:shadow-[0_0_22px_rgba(0,168,132,0.5)] transition-all duration-300 shrink-0">
                                <Mountain className="w-5 h-5 text-white" />
                            </div>
                            {/* Wordmark */}
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <span className={`text-sm font-black tracking-[0.12em] uppercase transition-all ${isDarkMode ? 'text-white drop-shadow-sm group-hover:text-[#25D366]' : 'text-slate-800 group-hover:text-[#00A884]'}`}>
                                    Andean Journey
                                </span>
                                <span className={`text-[10px] font-semibold tracking-[0.18em] uppercase group-hover:text-[#00A884]/80 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Cotizaciones
                                </span>
                            </div>
                        </button>


                        {/* ── ACTION BUTTONS ── */}
                        <div className="hidden lg:flex flex-1 justify-center items-center gap-2">
                            {/* Tour Button */}
                            <button
                                onClick={() => {
                                    setActiveTab('dashboard');
                                    setTimeout(() => setRunTour(true), 100);
                                }}
                                className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-all duration-300 cursor-pointer active:scale-[0.98] border ${
                                    isDarkMode
                                        ? 'bg-blue-900/30 border-blue-500/30 text-blue-300 hover:bg-blue-800/50 hover:text-white'
                                        : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow-sm'
                                }`}
                                title="Ver Tutorial"
                            >
                                <Info className="w-4 h-4 text-blue-400" />
                                <span className="font-medium">Ver Tutorial</span>
                            </button>
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2 transition-all duration-300 cursor-pointer active:scale-[0.98] border ${
                                    isDarkMode
                                        ? 'bg-slate-800/50 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
                                }`}
                                title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                                <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                            </button>
                            <div className={`flex text-sm rounded-2xl px-4 py-2 items-center gap-2 border ${isDarkMode ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200 shadow-sm'}`}>
                                <Sparkles className="w-4 h-4 text-[#00A884]" />
                                <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-emerald-700'}`}>Modo Producción Activo</span>
                            </div>
                        </div>

                        {/* ── DESKTOP USER CHIP ── */}
                        <div className={`hidden md:flex items-center backdrop-blur-xl border p-1 rounded-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#111B21]/40 border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]' : 'bg-white/80 border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.05)]'}`}>
                            <div className="flex items-center gap-3 pl-1 pr-3 cursor-default">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25D366] to-[#00A884] flex items-center justify-center text-white font-black text-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#00A884]/40 shrink-0 ring-2 ring-[#00A884]/20">
                                    {initials}
                                </div>
                                <div className="flex flex-col items-start leading-tight gap-0.5 justify-center py-1">
                                    <span className={`text-[13px] font-bold capitalize tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{usernameStr}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00A884]/90">{roleStr}</span>
                                </div>
                            </div>
                            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 hover:shadow-[inset_0_0_12px_rgba(239,68,68,0.3)] text-slate-400 hover:text-red-400 rounded-xl transition-all duration-300 cursor-pointer group"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* ── MOBILE: avatar compacto + logout ── */}
                        <div className={`md:hidden flex items-center backdrop-blur-xl border p-1 rounded-2xl shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-[#111b21]/40 border-white/10' : 'bg-white/80 border-black/10'}`}>
                            <button
                                onClick={toggleTheme}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'text-amber-400 hover:bg-white/10' : 'text-indigo-500 hover:bg-black/5'}`}
                                title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            >
                                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            </button>
                            <div className={`w-px h-5 mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                            <div className="flex items-center gap-2 pl-1 pr-2 cursor-default">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#25D366] to-[#00A884] flex items-center justify-center text-white font-black text-[10px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#00A884]/40 shrink-0">
                                    {initials}
                                </div>
                                <span className={`text-[12px] font-bold capitalize tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{usernameStr}</span>
                            </div>
                            <div className={`w-px h-5 mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer group"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            {/* =========================================================
                CONTENIDO PRINCIPAL DINÁMICO SEGÚN PESTAÑA ACTIVA
            ========================================================= */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 pb-safe">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.45 }}
                            className="space-y-6"
                        >
                            {/* Saludo Premium con ScrollFloat */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <ScrollFloat
                                            animationDuration={0.8}
                                            ease="back.out(1.5)"
                                            stagger={0.025}
                                            textClassName={`text-xl sm:text-3xl font-bold tracking-tight capitalize font-outfit ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                                        >
                                            {`Hola, ${usernameStr} 👋`}
                                        </ScrollFloat>
                                        <span className={`text-xs mt-0.5 sm:hidden ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ==========================================
                                KPI GRID SYSTEM WITH ELECTRIC BORDERS
                            ========================================== */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tour-stats">
                                {stats.map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    return (
                                        <ElectricBorder 
                                            key={stat.id}
                                            color={stat.color} 
                                            borderRadius={20} 
                                            className="w-full"
                                            chaos={0.15}
                                            speed={4}
                                        >
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                viewport={{ once: true, margin: "0px 0px -20px 0px" }}
                                                whileHover={{ scale: 1.02, translateY: -2 }}
                                                whileTap={{ scale: 0.96 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 30, delay: Math.min(index * 0.05, 0.5) }}
                                                className={`p-4 sm:p-6 backdrop-blur-md rounded-2xl flex flex-col justify-between h-full min-h-[120px] transition-all duration-500 relative overflow-hidden group cursor-pointer active:scale-[0.98] border ${isDarkMode ? 'bg-[#202c33]/90 hover:bg-[#111b21]/90 border-transparent' : 'bg-white/40 border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(31,38,135,0.12)] hover:-translate-y-0.5'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {stat.label}
                                                    </span>
                                                    <div 
                                                        className="p-1.5 sm:p-2 rounded-xl transition-colors duration-300 group-hover:bg-white/10"
                                                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                                    >
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-baseline justify-between gap-1">
                                                    <span className={`text-lg sm:text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                        {stat.value}
                                                    </span>
                                                    <span className="text-[10px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                                                        {stat.change}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        </ElectricBorder>
                                    );
                                })}
                            </div>

                            {/* ==========================================
                                ACCIONES RÁPIDAS CON BORDES ELÉCTRICOS NEÓN
                            ========================================== */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cotización Fija */}
                                <ElectricBorder color="#00A884" borderRadius={24} chaos={0.15} speed={4} className="w-full">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                                        whileHover={{ scale: 1.015, translateY: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        onClick={() => navigate('/cotizar/fijo')}
                                        className={`group relative p-6 backdrop-blur-xl border rounded-3xl cursor-pointer active:scale-[0.98] overflow-hidden transition-all duration-500 h-full flex flex-col justify-between ${isDarkMode ? 'bg-gradient-to-br from-[#202c33]/90 to-[#111b21]/90 border-transparent shadow-2xl' : 'bg-white/40 border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] hover:bg-white/50'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00A884]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A884]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00A884]/20 transition-all duration-500" />
                                        
                                        <div className="flex items-start gap-4">
                                            <div className="p-4 bg-[#00A884]/10 text-[#00A884] rounded-2xl group-hover:bg-[#00A884]/20 transition-all duration-300 border border-[#00A884]/10">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold group-hover:text-[#00A884] transition-colors">
                                                        Cotizar Programa Fijo
                                                    </h3>
                                                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                                                </div>
                                                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Genera itinerarios estándar basados en nuestros programas fijos precargados (Cusco, Machu Picchu, Puno).
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs text-[#00A884] font-semibold group-hover:translate-x-1 transition-all duration-300">
                                            <span>Empezar cotización</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </motion.div>
                                </ElectricBorder>

                                {/* Cotización Personalizada */}
                                <ElectricBorder color="#25D366" borderRadius={24} chaos={0.15} speed={4} className="w-full tour-generate-btn">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                                        whileHover={{ scale: 1.015, translateY: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
                                        onClick={() => navigate('/cotizar/personalizado')}
                                        className={`group relative p-6 backdrop-blur-xl border rounded-3xl cursor-pointer active:scale-[0.98] overflow-hidden transition-all duration-500 h-full flex flex-col justify-between ${isDarkMode ? 'bg-gradient-to-br from-[#202c33]/90 to-[#111b21]/90 border-transparent shadow-2xl' : 'bg-white/40 border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] hover:bg-white/50'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#25D366]/20 transition-all duration-500" />
                                        
                                        <div className="flex items-start gap-4">
                                            <div className="p-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl group-hover:bg-[#25D366]/20 transition-all duration-300 border border-[#25D366]/10">
                                                <Sparkles className="w-8 h-8" />
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold group-hover:text-[#25D366] transition-colors">
                                                        Diseñar Tour Personalizado
                                                    </h3>
                                                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                                                </div>
                                                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Crea viajes a medida con itinerarios flexibles día por día, hoteles personalizados y trenes especiales.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs text-[#25D366] font-semibold group-hover:translate-x-1 transition-all duration-300">
                                            <span>Empezar cotización</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </motion.div>
                                </ElectricBorder>
                            </div>

                            {/* ==========================================
                                SECCIÓN DE ANÁLISIS & CALENDARIO INTEGRADO CON BORDES ELÉCTRICOS
                            ========================================== */}
                            <div className="grid grid-cols-1 gap-6 items-stretch">
                                <ElectricBorder color="#00A884" borderRadius={24} chaos={0.15} speed={4} className="w-full h-full flex flex-col tour-sales">
                                    <SalesChart />
                                </ElectricBorder>
                            </div>

                            <ElectricBorder color="#00A884" borderRadius={30} chaos={0.15} speed={4} className="w-full tour-calendar">
                                <div className={`p-6 border rounded-3xl relative overflow-hidden h-full transition-colors duration-500 ${isDarkMode ? 'bg-[#111b21]/90 border-transparent shadow-2xl' : 'bg-white/20 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05)]'}`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A884]/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                        
                                        {/* Bloque 1: Calendario Operativo Interactivo */}
                                        <div className="lg:col-span-5 flex flex-col justify-between">
                                            <TourCalendar 
                                                selectedDate={selectedDate} 
                                                onDateSelect={setSelectedDate} 
                                                dashboardMode={true} 
                                                inlineMode={true} 
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>

                                        {/* Bloque 2: Salidas del Día Exacto */}
                                        <div className={`lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l pt-5 lg:pt-0 lg:pl-6 ${isDarkMode ? 'border-white/5' : 'border-black/10'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    <Calendar className="w-4 h-4 text-[#00A884]" /> Salidas Programadas
                                                </h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] font-bold">
                                                    {dayTours.length} salida{dayTours.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div className="flex-grow flex flex-col justify-between">
                                                {dayTours.length > 0 ? (
                                                    <div className="flex flex-col gap-3 h-full">
                                                        {/* Interactive Route Map */}
                                                        <InteractiveRouteMap dayTours={dayTours} isDarkMode={isDarkMode} />
                                                        
                                                        {/* Compact List of PDF Departures */}
                                                        <div className="flex-grow space-y-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                                                            {dayTours.map((tour, idx) => {
                                                                const ItemWrapper = tour.link ? 'a' : 'div';
                                                                const wrapperProps = tour.link ? {
                                                                    href: tour.link,
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    title: "Descargar PDF"
                                                                } : {};

                                                                return (
                                                                    <ItemWrapper 
                                                                        key={idx} 
                                                                        {...wrapperProps}
                                                                        className={`px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-all text-[10px] group cursor-pointer active:scale-[0.98] border ${isDarkMode ? 'bg-[#1a2530] border-transparent shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.03)] hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.03)]' : 'bg-white/50 backdrop-blur-md border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}
                                                                    >
                                                                        <div className="min-w-0 flex-grow">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`font-black truncate max-w-[135px] transition-colors ${isDarkMode ? 'text-white drop-shadow-sm group-hover:text-[#00A884]' : 'text-slate-800 group-hover:text-[#00A884]'}`}>
                                                                                    {sanitizeName(tour.nombre_cliente)}
                                                                                </span>
                                                                                <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                                                    tour.tipo === 'personalizado' ? 'bg-[#00A884]/20 text-[#25D366]' : 'bg-[#00A884]/20 text-[#00A884]'
                                                                                }`}>
                                                                                    {tour.tipo === 'personalizado' ? 'A Medida' : 'Fijo'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {tour.link ? (
                                                                            <div className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 border ${isDarkMode ? 'bg-[#00A884]/10 border-[#00A884]/20 text-[#00A884] hover:bg-[#00A884] hover:text-slate-900 shadow-[2px_2px_4px_rgba(0,0,0,0.3)]' : 'bg-[#00A884]/10 border-[#00A884]/20 text-[#00A884] hover:bg-[#00A884] hover:text-white shadow-[2px_2px_4px_#d1d5db]'}`}>
                                                                                <Download className="w-3.5 h-3.5" />
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider pr-1">PDF</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className={`p-1.5 rounded-lg flex items-center gap-1.5 shrink-0 border cursor-not-allowed ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-black/5 border-black/5 text-slate-400'}`} title="PDF no disponible">
                                                                                <Download className="w-3.5 h-3.5 opacity-50" />
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider pr-1 opacity-50">PDF</span>
                                                                            </div>
                                                                        )}
                                                                    </ItemWrapper>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <AndeanLandscape onNavigate={navigate} isDarkMode={isDarkMode} />
                                                )}
                                            </div>
                                        </div>

                                        <div className={`lg:col-span-3 flex flex-col border-t lg:border-t-0 lg:border-l pt-5 lg:pt-0 lg:pl-6 justify-between h-full ${isDarkMode ? 'border-white/5' : 'border-black/10'}`}>
                                            {nearbyTours.length > 0 ? (
                                                <NearbyCarousel nearbyTours={nearbyTours} isDarkMode={isDarkMode} />
                                            ) : (
                                                <div className="flex flex-col h-full justify-between">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 mb-4 shrink-0">
                                                        <Sparkles className="w-4 h-4 text-[#00A884] animate-pulse" /> Salidas Cercanas (+5 Días)
                                                    </h4>
                                                    <NearbyLandscape onNavigate={navigate} />
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </ElectricBorder>

                            {/* RECENT PDFs WIDGET */}
                            {recentPdfs.length > 0 && (
                                <ElectricBorder color="#00A884" borderRadius={24} chaos={0.15} speed={4} className="w-full mt-6">
                                    <div className={`p-6 border rounded-3xl relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#111b21]/60 backdrop-blur-2xl border-white/10 shadow-2xl' : 'bg-white/40 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)]'}`}>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A884]/5 rounded-full blur-3xl pointer-events-none" />
                                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                            <h3 className={`text-lg sm:text-xl font-bold font-outfit tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                <FileText className="w-5 h-5 text-[#00A884]" /> Últimas Cotizaciones Generadas
                                            </h3>
                                            <button onClick={() => setActiveTab('quotations')} className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-[#00A884] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                Ver tablero Kanban &rarr;
                                            </button>
                                        </div>
                                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                            {recentPdfs.map((pdf, idx) => {
                                                const pdfLink = pdf.pdf_url || (pdf.pdf && (pdf.pdf.public_url || pdf.pdf.download_url));
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={pdfLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`group relative overflow-hidden p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-300 border ${isDarkMode ? 'bg-[#202c33]/40 backdrop-blur-md border-white/5 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.03)] hover:bg-[#111b21]/60 hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.03)] hover:border-[#00A884]/30' : 'bg-white/50 backdrop-blur-md border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}
                                                    >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className={`p-2 rounded-xl shrink-0 ${pdf.tipo === 'personalizado' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-[#00A884]/10 text-[#00A884]'}`}>
                                                            {pdf.tipo === 'personalizado' ? <Sparkles className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pdf.tipo === 'personalizado' ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-[#00A884]/20 text-[#00A884]'}`}>
                                                            {pdf.tipo === 'personalizado' ? 'A Medida' : 'Fijo'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold truncate mb-1 group-hover:text-[#00A884] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sanitizeName(pdf.nombre_cliente)}</h4>
                                                        <p className={`text-[10px] font-medium line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{pdf.programa}</p>
                                                    </div>
                                                    <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-slate-500' : 'border-black/5 text-slate-500'}`}>
                                                        <span>{pdf.fecha_tour || pdf.fecha || 'Sin fecha'}</span>
                                                        <span className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-[#00A884]/20 text-[#00A884]' : 'bg-[#00A884]/10 text-[#00A884]'} flex items-center gap-1 group-hover:bg-[#00A884] group-hover:text-white transition-colors`}>
                                                            <Download className="w-3 h-3" /> PDF
                                                        </span>
                                                    </div>
                                                    </a>
                                            )})}
                                        </div>
                                    </div>
                                </ElectricBorder>
                            )}

                        </motion.div>
                    )}

                    {activeTab === 'quotations' && (
                        <motion.div
                            key="quotations-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.45 }}
                        >
                            <div className="space-y-6">
                                <div>
                                    <h1 className={`text-xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white [text-shadow:_0_2px_15px_rgb(0_0_0_/_100%)]' : 'text-slate-900 [text-shadow:_0_0_20px_rgb(255_255_255_/_100%),_0_0_10px_rgb(255_255_255_/_100%)]'}`}>Cotizaciones</h1>
                                    <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-300 [text-shadow:_0_2px_10px_rgb(0_0_0_/_100%)]' : 'text-slate-800 font-bold [text-shadow:_0_0_15px_rgb(255_255_255_/_100%),_0_0_5px_rgb(255_255_255_/_100%)]'}`}>
                                        Gestión de cotizaciones, seguimiento del embudo de ventas y sincronización en tiempo real.
                                    </p>
                                </div>
                                <PdfList isDarkMode={isDarkMode} />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'about' && (
                        <motion.div
                            key="about-tab"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.45 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            <div className={`text-center space-y-4 mb-10 p-8 md:p-10 rounded-[2rem] border backdrop-blur-xl shadow-2xl relative overflow-hidden ${
                                isDarkMode 
                                    ? 'bg-slate-900/80 border-slate-700/50' 
                                    : 'bg-white/50 backdrop-blur-xl border-white/60 shadow-[6px_6px_15px_rgba(0,0,0,0.05),-6px_-6px_15px_rgba(255,255,255,0.8)]'
                            }`}>
                                {/* Optional glow effect behind text */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
                                
                                <div className="relative inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-2 shadow-inner">
                                    <Sparkles className="w-8 h-8 text-blue-500 drop-shadow-md" />
                                </div>
                                <h1 className={`relative text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-outfit drop-shadow-sm pb-2 ${
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                    Andean Journey Premium
                                </h1>
                                <p className={`relative text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed ${
                                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                    Tu plataforma inteligente para la generación automática de cotizaciones, gestión de tours y generación de PDFs de alta conversión.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Step 1 */}
                                <div className={`border rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 ${
                                    isDarkMode 
                                        ? 'bg-[#111b21]/60 backdrop-blur-md border-white/5 hover:border-emerald-500/30' 
                                        : 'bg-white/50 backdrop-blur-md border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'
                                }`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Compass className="w-24 h-24 text-emerald-500" />
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                                        <span className="font-bold text-xl font-outfit">1</span>
                                    </div>
                                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Arma el Tour</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Selecciona un programa fijo o construye un tour personalizado día a día agregando hoteles, trenes y traslados fácilmente.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className={`border rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 ${
                                    isDarkMode 
                                        ? 'bg-[#111b21]/60 backdrop-blur-md border-white/5 hover:border-amber-500/30' 
                                        : 'bg-white/50 backdrop-blur-md border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'
                                }`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Zap className="w-24 h-24 text-amber-500" />
                                    </div>
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
                                        <span className="font-bold text-xl font-outfit">2</span>
                                    </div>
                                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Calcula Precios</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        El sistema suma automáticamente los precios de cada actividad, calcula utilidades y te permite aplicar ajustes según el pasajero.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className={`border rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 ${
                                    isDarkMode 
                                        ? 'bg-[#111b21]/60 backdrop-blur-md border-white/5 hover:border-blue-500/30' 
                                        : 'bg-white/50 backdrop-blur-md border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:bg-white/70 hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'
                                }`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-24 h-24 text-blue-500" />
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                                        <span className="font-bold text-xl font-outfit">3</span>
                                    </div>
                                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Genera PDF</h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Con un solo clic, obtén un PDF premium e interactivo con el diseño de tu marca listo para enamorar a tu cliente y cerrar ventas.
                                    </p>
                                </div>
                            </div>

                            <div className={`w-full h-[600px] border rounded-3xl overflow-hidden relative shadow-2xl mb-8 tour-architecture transition-all duration-500 ${isDarkMode ? 'bg-[#0a1520]/40 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.02)]' : 'bg-white/60 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07),inset_4px_4px_10px_rgba(255,255,255,0.8)]'}`}>
                                <div className={`absolute top-0 w-full p-3 border-b text-center text-sm font-bold uppercase tracking-wider backdrop-blur-md z-10 ${isDarkMode ? 'bg-[#111b21]/60 border-white/10 text-white' : 'bg-white/60 border-slate-200 text-slate-800'}`}>
                                    Arquitectura del Sistema
                                </div>
                                <iframe src="/architecture-diagram.html" className="w-full h-full pt-12 bg-transparent" title="Diagrama de Arquitectura"></iframe>
                            </div>

                            <div className="tour-support">
                                <ElectricBorder color="#38bdf8" speed={4} chaos={0.15} borderRadius={24}>
                                <div className={`rounded-[22px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 z-10 w-full transition-all duration-500 ${isDarkMode ? 'bg-[#0a1520]/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.02)]' : 'bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07),inset_4px_4px_10px_rgba(255,255,255,0.8)]'}`}>
                                    {/* Fondos Glow */}
                                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
                                    
                                    {/* Lado Izquierdo: Branding y Descripción */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-4 max-w-md relative z-10">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl border flex items-center justify-center shadow-2xl mb-1 md:mb-2 transition-all ${isDarkMode ? 'border-white/10 bg-white/5 backdrop-blur-xl shadow-blue-500/20' : 'border-white/60 bg-white/50 backdrop-blur-xl shadow-[4px_4px_15px_rgba(0,0,0,0.05),-4px_-4px_15px_rgba(255,255,255,1)]'}`}>
                                            <Code className={`w-6 h-6 md:w-8 md:h-8 drop-shadow-md ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={`text-[10px] md:text-sm font-bold tracking-[0.15em] md:tracking-widest uppercase ${isDarkMode ? 'text-blue-400/90' : 'text-blue-600/90'}`}>Sistema Desarrollado Por</h3>
                                            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit pb-0 md:pb-1 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                Syncrom AI
                                            </h2>
                                        </div>
                                        <p className={`text-xs sm:text-sm md:text-base leading-relaxed px-2 md:px-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            Arquitectura a medida, flujos automatizados e interfaces inteligentes. Si buscas optimizar tu negocio o soporte técnico avanzado, somos tu partner tecnológico.
                                        </p>
                                    </div>
                                    
                                    {/* Lado Derecho: Acciones y Redes Sociales */}
                                    <div className="flex flex-col gap-5 w-full md:w-auto relative z-10">
                                        {/* Botones de Contacto Directo */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <a href="mailto:syncromai2@gmail.com" className={`flex-1 px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 group border ${isDarkMode ? 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-blue-900/40 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'bg-white/40 backdrop-blur-md border-white/80 hover:bg-blue-50 hover:border-blue-400/50 hover:shadow-[4px_4px_15px_rgba(56,189,248,0.15)] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8)]'}`}>
                                                <Mail className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                                <div className="flex flex-col text-left">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</span>
                                                    <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Contáctanos</span>
                                                </div>
                                            </a>
                                            <a href="https://wa.me/51908776199" target="_blank" rel="noreferrer" className={`flex-1 px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 group border ${isDarkMode ? 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-emerald-900/40 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/40 backdrop-blur-md border-white/80 hover:bg-emerald-50 hover:border-emerald-400/50 hover:shadow-[4px_4px_15px_rgba(16,185,129,0.15)] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8)]'}`}>
                                                <Phone className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                <div className="flex flex-col text-left">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>WhatsApp</span>
                                                    <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Escríbenos</span>
                                                </div>
                                            </a>
                                        </div>

                                        {/* Separador */}
                                        <div className="flex items-center gap-3 my-1 opacity-60">
                                            <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${isDarkMode ? 'via-white/30' : 'via-slate-400'}`}></div>
                                            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Redes & Web</span>
                                            <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${isDarkMode ? 'via-white/30' : 'via-slate-400'}`}></div>
                                        </div>

                                        {/* Fila de Redes Sociales */}
                                        <div className="flex justify-center md:justify-end gap-4">
                                            <a href="#" target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/40 border-white/80 hover:bg-blue-50 hover:border-blue-500/50 hover:text-blue-600 text-slate-500 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_15px_rgba(59,130,246,0.2)]'}`} aria-label="Facebook">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                                            </a>
                                            <a href="#" target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-pink-600/20 hover:border-pink-500/50 hover:text-pink-400 text-slate-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'bg-white/40 border-white/80 hover:bg-pink-50 hover:border-pink-500/50 hover:text-pink-600 text-slate-500 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_15px_rgba(236,72,153,0.2)]'}`} aria-label="Instagram">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                            </a>
                                            <a href="#" target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-300 text-slate-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.4)]' : 'bg-white/40 border-white/80 hover:bg-blue-50 hover:border-blue-500/50 hover:text-blue-600 text-slate-500 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_15px_rgba(96,165,250,0.2)]'}`} aria-label="LinkedIn">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                            </a>
                                            <a href="https://syncrom-landing3-7vqa.vercel.app/" target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-cyan-600/20 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-white/40 border-white/80 hover:bg-cyan-50 hover:border-cyan-500/50 hover:text-cyan-600 text-slate-500 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_15px_rgba(6,182,212,0.2)]'}`} title="Agencia Web">
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </ElectricBorder>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* =========================================================
                BOTTOM / DOCK NAVIGATION — mobile barra completa, desktop dock flotante
            ========================================================= */}

            {/* MOBILE: Floating Glass Pill Nav */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
                <nav className={`pointer-events-auto flex items-center justify-between px-2 py-2 rounded-3xl backdrop-blur-2xl border transition-colors duration-500 shadow-2xl ${
                    isDarkMode ? 'bg-[#111b21]/90 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-white/90 border-black/10 shadow-[0_8px_32px_rgba(0,168,132,0.15)]'
                }`}>
                    <button
                        onClick={() => handleTabChange('dashboard')}
                        className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? (isDarkMode ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        <Home className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">Inicio</span>
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('quotations')}
                        className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${activeTab === 'quotations' ? (isDarkMode ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        <FileText className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">Cots</span>
                    </button>

                    <div className="relative -mt-8 px-2 z-10">
                        <button
                            onClick={() => navigate('/cotizar/personalizado')}
                            className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#25D366] to-[#00A884] rounded-full shadow-[0_8px_20px_rgba(0,168,132,0.4)] text-white hover:scale-105 active:scale-95 transition-all outline-none"
                            title="Nuevo Tour"
                        >
                            <Plus className="w-7 h-7" />
                        </button>
                    </div>

                    <button
                        onClick={() => handleTabChange('about')}
                        className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${activeTab === 'about' ? (isDarkMode ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                    >
                        <Info className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">Info</span>
                    </button>
                </nav>
            </div>

            {/* DESKTOP: dock flotante centrado */}
            <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50 tour-dock">
                <Dock 
                    items={navigationItems.map(item => {
                        const IconComponent = item.icon;
                        const isActive = activeTab === item.id;
                        return {
                            label: item.label,
                            icon: <IconComponent className={`w-full h-full ${isActive ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />,
                            onClick: () => handleTabChange(item.id),
                            className: isActive ? (isDarkMode ? 'bg-white/10' : 'bg-black/5') : ''
                        };
                    })}
                    panelHeight={64}
                    baseItemSize={48}
                    magnification={70}
                    className={isDarkMode ? 'bg-[#111b21]/95 border border-white/10' : 'bg-white/95 border border-black/10'}
                />
            </div>
        </div>
    );
}
