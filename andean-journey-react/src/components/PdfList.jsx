"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { Badge } from "@/components/reui/badge";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";



import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GripVerticalIcon, FileText, Share2, RefreshCw, Search, Calendar, Mountain, Sparkles } from 'lucide-react';
import ElectricBorder from "@/components/ui/ElectricBorder";

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';

const COLUMN_TITLES = {
  backlog: "📥 Nuevas Solicitudes",
  inProgress: "⚙️ En Ajustes / Cotizando",
  done: "🚀 Listos para Enviar",
};

const COLUMN_COLORS = {
  backlog: "#38bdf8",
  inProgress: "#eab308",
  done: "#10b981",
};

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
  "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80"
];

// Dynamic Travel Cover Image selection based on itinerary keywords
const getCoverImage = (description = "") => {
  const desc = description.toLowerCase();
  if (desc.includes("mapi") || desc.includes("machu") || desc.includes("picchu")) {
    return "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?w=400&auto=format&fit=crop&q=80"; // Machu Picchu
  }
  if (desc.includes("montaña") || desc.includes("arcoiris") || desc.includes("colores") || desc.includes("palcoyo")) {
    return "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&auto=format&fit=crop&q=80"; // Rainbow Mountain
  }
  if (desc.includes("humantay") || desc.includes("laguna")) {
    return "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&auto=format&fit=crop&q=80"; // Humantay
  }
  if (desc.includes("valle") || desc.includes("pisac") || desc.includes("moray") || desc.includes("salineras")) {
    return "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&auto=format&fit=crop&q=80"; // Sacred Valley
  }
  return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&auto=format&fit=crop&q=80"; // Premium travel default
};

function TaskCard({ task, asHandle, isOverlay, columnId, isDarkMode = true, ...props }) {
  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const tourTypeLabel = task.priority === "high" ? "Tour a Medida" : "Programa Fijo";
    const text = `🎉 *¡Hola ${task.title}!* Adjunto el enlace a tu cotización de *${tourTypeLabel}* (${task.description}):\n\n📄 *Documento PDF:* ${task.link || 'Aún no generado'}\n\nQuedo atento a tus comentarios para coordinar tu viaje andino. ¡Saludos! 🏔️✨`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const borderColor = COLUMN_COLORS[columnId] || "#38bdf8";
  const isCustomTour = task.priority === "high";

  // Cursor follow spotlight logic inspired by ChromaGrid card behavior
  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const cardContent = (
    <>
      {/* Self-contained styling for Chroma spotlight overlay */}
      <style dangerouslySetInnerHTML={{__html: `
        .chroma-card {
          position: relative;
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
        .chroma-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.12), transparent 80%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 10;
        }
        .chroma-card:hover::before {
          opacity: 1;
        }
      `}} />

      <ElectricBorder
        color={borderColor}
        speed={0.8}
        chaos={0.07}
        borderRadius={16}
        className="w-full"
      >
        <div 
          onMouseMove={handleCardMove}
          className={`chroma-card transition-all duration-300 rounded-[16px] overflow-hidden group flex flex-col shadow-md text-left border ${isDarkMode ? 'bg-[#0b1b2b]/95 hover:bg-[#0f2438]/95 border-white/5' : 'bg-white/70 hover:bg-white/90 backdrop-blur-md border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.05)]'}`}
          style={{
            background: isDarkMode 
              ? (isCustomTour ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 20, 36, 0.95) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(0, 20, 36, 0.95) 100%)')
              : (isCustomTour ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0.7) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0.7) 100%)')
          }}
        >
          {/* Top cover image banner with profile picture overlay */}
          <div className="h-20 relative overflow-hidden rounded-[10px] m-1.5 shrink-0 bg-slate-900 border border-white/5">
            <img 
              src={getCoverImage(task.description)} 
              alt={task.description} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
            />
            {/* Elegant dark shadow map overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b2b]/90 via-transparent to-black/35 pointer-events-none" />
            
            {/* Floating Client Avatar overlay bottom-left */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-20">
              <div className="w-6 h-6 rounded-full border border-[#0b1b2b] overflow-hidden shadow-lg bg-slate-800">
                <img src={task.assigneeAvatar} alt={task.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-extrabold text-white drop-shadow-md truncate uppercase tracking-tight max-w-[120px]">
                {task.title}
              </span>
            </div>

            {/* Floating tour type badge top-left */}
            <div className="absolute top-2 left-2 z-20">
              {isCustomTour ? (
                <div className="bg-emerald-500/90 backdrop-blur-md text-white font-outfit font-extrabold tracking-wider uppercase text-[7px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-sm border border-emerald-400/30">
                  <Sparkles className="w-2 h-2 text-white animate-pulse" />
                  <span>A Medida</span>
                </div>
              ) : (
                <div className="bg-blue-500/90 backdrop-blur-md text-white font-outfit font-extrabold tracking-wider uppercase text-[7px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-sm border border-blue-400/30">
                  <FileText className="w-2 h-2 text-white" />
                  <span>Fijo</span>
                </div>
              )}
            </div>

            {/* Floating Price Tag top-right */}
            {task.precio && (
              <div className={`absolute top-2 right-2 backdrop-blur-md font-extrabold font-outfit text-[9px] px-1.5 py-0.5 rounded-sm shadow-sm border z-20 transition-colors ${isDarkMode ? 'bg-[#202c33]/95 text-white border-[#00A884]/35' : 'bg-white/80 text-slate-800 border-emerald-500/40'}`}>
                S/. {parseFloat(task.precio).toFixed(2)}
              </div>
            )}
          </div>

          {/* Card main body content */}
          <div className="px-3 pb-3 space-y-2.5 flex-1 flex flex-col justify-between">
            {/* Itinerary Container */}
            <div className={`border rounded-xl p-2 space-y-1 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white/50 border-white/60'}`}>
              <div className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Mountain className="w-3 h-3 text-[#00A884] shrink-0" />
                <span className={`text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Programa / Destino</span>
              </div>
              <p className={`text-[10px] font-bold leading-snug line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                {task.description}
              </p>
            </div>

            <div className="flex justify-between items-end gap-2">
              <div className="space-y-0.5">
                <span className={`block text-[8px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Fecha Viaje</span>
                <div className={`flex items-center gap-1 font-bold font-outfit ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Calendar className="w-3 h-3 text-[#00A884] shrink-0" />
                  <span className="text-[10px] tabular-nums">{task.dueDate}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="block text-[8px] text-slate-500 font-semibold uppercase tracking-wider">Estado</span>
                <span className={`inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                  columnId === 'done' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                    : columnId === 'inProgress' 
                      ? 'bg-[#00A884]/10 text-[#00A884] border border-[#00A884]/25' 
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                }`}>
                  {columnId === 'done' ? 'Listo' : columnId === 'inProgress' ? 'Cotizando' : 'Nuevo'}
                </span>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              {task.link ? (
                <a
                  href={task.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 flex-1 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 transition-all border border-white/10 cursor-pointer shadow-sm z-20"
                >
                  <FileText className="w-3 h-3 text-[#00A884] shrink-0" /> Ver PDF
                </a>
              ) : (
                <button
                  disabled
                  className="h-7 flex-1 bg-black/40 border border-white/5 text-slate-500 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 cursor-not-allowed opacity-60 z-20"
                >
                  Sin Archivo
                </button>
              )}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="h-7 flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-extrabold text-[9px] tracking-wide flex items-center justify-center gap-1 transition-all shadow-sm shadow-emerald-950/20 cursor-pointer active:scale-95 z-20"
              >
                <Share2 className="w-3 h-3 shrink-0" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </ElectricBorder>
    </>
  );

  return (
    <KanbanItem value={task.id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle className="block">{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}

function TaskColumn({ value, tasks, isOverlay, isDarkMode = true, ...props }) {
  return (
    <KanbanColumn value={value} className="h-full flex flex-col" {...props}>
      <div className={`mb-4 flex flex-col h-full rounded-[28px] transition-colors duration-500`}>
        <div className={`flex flex-row items-center justify-between p-2 mb-4`}>
          <div className="flex items-center gap-3">
            <span className={`text-base sm:text-lg font-extrabold font-outfit tracking-tight ${isDarkMode ? 'text-white [text-shadow:_0_2px_15px_rgb(0_0_0_/_100%)]' : 'text-slate-900 [text-shadow:_0_0_20px_rgb(255_255_255_/_100%),_0_0_10px_rgb(255_255_255_/_100%)]'}`}>
              {COLUMN_TITLES[value]}
            </span>
            <Badge variant="outline" className={`border-[#00A884]/40 font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-sm backdrop-blur-sm ${isDarkMode ? 'bg-[#00A884]/20 text-[#25D366]' : 'bg-white/90 text-[#00A884]'}`}>
              {tasks.length}
            </Badge>
          </div>
          <KanbanColumnHandle
            render={(props) => (
              <Button {...props} size="icon-sm" variant="ghost" className={`rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'}`}>
                <GripVerticalIcon className="w-5 h-5" />
              </Button>
            )}
          />
        </div>
        <div className="flex-1 overflow-y-auto max-h-[650px] custom-scrollbar px-2">
          <KanbanColumnContent value={value} className="flex flex-col gap-4 min-h-[150px]">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={value}
                asHandle={!isOverlay}
                isOverlay={isOverlay}
                isDarkMode={isDarkMode}
              />
            ))}
          </KanbanColumnContent>
        </div>
      </div>
    </KanbanColumn>
  );
}

export function PdfList({ isDarkMode = true }) {
  const [columns, setColumns] = useState({
    backlog: [],
    inProgress: [],
    done: [],
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoading(true);

    try {
      let rawQuotes = [];
      let supabaseQuotes = [];

      try {
        const { data, error } = await supabase.from('andean_journey_cotizaciones').select('datos').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          supabaseQuotes = data.map(d => d.datos);
        }
      } catch(err) {
        console.warn('Supabase fetch failed', err);
      }

      const localData = localStorage.getItem('andean_cotizaciones');
      if (localData) {
        const localQuotes = JSON.parse(localData);
        // Merge without duplicates (using id)
        const uniqueIds = new Set(supabaseQuotes.map(q => q.id));
        rawQuotes = [...supabaseQuotes];
        localQuotes.forEach(q => {
          if (!uniqueIds.has(q.id)) {
            rawQuotes.push(q);
            uniqueIds.add(q.id);
          }
        });
      } else {
        rawQuotes = supabaseQuotes;
      }

      if (rawQuotes.length > 0) {
        distributeIntoColumns(rawQuotes);
        if (!forceSync) setLoading(false);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(GOOGLE_SHEETS_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const validData = json.data.filter(item => item && typeof item === 'object' && item.nombre_cliente);
          localStorage.setItem('andean_cotizaciones', JSON.stringify(validData));
          
          // Merge with what we already have in rawQuotes
          const merged = [...rawQuotes];
          const existingIds = new Set(merged.map(q => q.id));
          validData.forEach(q => {
             if (!existingIds.has(q.id)) {
                merged.push(q);
             }
          });
          distributeIntoColumns(merged);
        }
      }
    } catch (err) {
      console.warn('Sincronización en Sheets falló:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const distributeIntoColumns = (quotes) => {
    const backlog = [];
    const inProgress = [];
    const done = [];

    quotes.forEach((q, idx) => {
      const taskObj = {
        id: String(q.id || `quote-${idx}`),
        title: q.nombre_cliente || "Viajero Andino",
        priority: q.tipo === "personalizado" ? "high" : "medium",
        description: q.programa || "Programa de Aventura Cusco",
        assignee: q.tipo === "personalizado" ? "A Medida" : "Fijo",
        assigneeAvatar: AVATARS[idx % AVATARS.length],
        dueDate: q.fecha_tour || q.fecha || "Fecha Abierta",
        link: q.pdf_url || q.pdf?.public_url || q.link || "",
        precio: q.precio_total || "",
        pasajeros: q.pasajeros || ""
      };

      if (idx % 3 === 0) backlog.push(taskObj);
      else if (idx % 3 === 1) inProgress.push(taskObj);
      else done.push(taskObj);
    });

    setColumns({ backlog, inProgress, done });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado reactivo en las columnas
  const filterTasks = (taskList) => {
    if (!searchTerm) return taskList;
    return taskList.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredColumns = {
    backlog: filterTasks(columns.backlog),
    inProgress: filterTasks(columns.inProgress),
    done: filterTasks(columns.done)
  };

  return (
    <div className="w-full mt-10 tour-kanban">
      {/* Cabecera Principal */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6`}>
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold font-outfit tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white [text-shadow:_0_2px_15px_rgb(0_0_0_/_100%)]' : 'text-slate-900 [text-shadow:_0_0_20px_rgb(255_255_255_/_100%),_0_0_10px_rgb(255_255_255_/_100%)]'}`}>
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#00A884] shadow-[0_0_15px_rgba(0,168,132,0.4)]">
              <FileText className="text-white w-6 h-6" />
            </div>
            Tablero Kanban de Cotizaciones
          </h2>
          <p className={`text-sm font-medium mt-2 ${isDarkMode ? 'text-slate-300 [text-shadow:_0_2px_10px_rgb(0_0_0_/_100%)]' : 'text-slate-800 font-bold [text-shadow:_0_0_15px_rgb(255_255_255_/_100%),_0_0_5px_rgb(255_255_255_/_100%)]'}`}>
            Organiza tus cotizaciones andinas arrastrándolas de columna y compártelas al instante.
          </p>
        </div>
        
        <div className="flex items-center gap-3 tour-kanban-sync">
          <Button 
            onClick={() => loadData(true)} 
            disabled={syncing}
            variant="outline"
            className={`h-11 rounded-2xl font-bold text-sm px-5 cursor-pointer shadow-md transition-all border backdrop-blur-md ${isDarkMode ? 'bg-[#111b21]/80 border-white/20 hover:bg-[#111b21]/100 text-white' : 'bg-white/90 border-slate-300/80 hover:bg-white text-slate-800'}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin text-[#25D366]' : 'text-[#00A884]'}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Tablero'}
          </Button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mb-8">
        <div className="relative group max-w-2xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-[#00A884] transition-colors pointer-events-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de cliente o aventura..."
            className={`w-full h-13 border rounded-2xl pl-12 pr-4 focus:outline-none focus:border-[#00A884] focus:ring-2 focus:ring-[#00A884]/40 text-sm font-bold shadow-md transition-all backdrop-blur-md ${isDarkMode ? 'bg-[#0f1922]/90 border-white/20 text-white placeholder:text-slate-400' : 'bg-white/95 border-slate-300 text-slate-900 placeholder:text-slate-500'}`}
          />
        </div>
      </div>

      {/* Tablero Kanban */}
      {loading ? (
        <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border ${isDarkMode ? 'bg-black/20 border-white/5 text-slate-300' : 'bg-white/30 border-white/60 text-slate-600'}`}>
          <RefreshCw className="w-10 h-10 animate-spin text-[#00A884] mb-4" />
          <p className="font-bold text-base tracking-wide">Cargando tablero desde la nube...</p>
        </div>
      ) : (
        <Kanban
          value={columns}
          onValueChange={setColumns}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="grid auto-rows-fr gap-6 grid-cols-1 md:grid-cols-3">
            {Object.entries(filteredColumns).map(([columnValue, tasks]) => (
              <TaskColumn key={columnValue} value={columnValue} tasks={tasks} isDarkMode={isDarkMode} />
            ))}
          </KanbanBoard>
          <KanbanOverlay className="bg-[#00A884]/10 rounded-2xl border-2 border-dashed border-[#00A884]/50 shadow-2xl backdrop-blur-md" />
        </Kanban>
      )}
    </div>
  );
}

export default PdfList;
