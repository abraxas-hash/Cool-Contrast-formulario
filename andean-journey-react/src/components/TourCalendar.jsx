import { useRef, useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ExternalLink, X, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  format,
  isAfter,
  isBefore,
  startOfYear,
} from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ElectricBorder from './ui/ElectricBorder';

// Custom DayButton override — Neumorphism keyboard-style day cells
function CustomCalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  toursByDate,
  selectedDate: _selectedDate,
  isDarkMode = true,
  ...props
}) {
  const dateKey = format(day.date, 'yyyy-MM-dd');
  const dayTours = toursByDate[dateKey] || [];
  const hasTours = dayTours.length > 0;
  const isToday = modifiers.today;
  const isSelected = modifiers.selected;
  const isOutside = modifiers.outside;

  // Base neumorphic button classes — symmetric square keys
  const baseSize = "!w-[95%] !aspect-square mx-auto rounded-2xl text-[13px] sm:text-[15px] font-bold flex items-center justify-center relative transition-all duration-200 select-none cursor-pointer";

  if (isOutside) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          baseSize,
          "!bg-transparent !text-slate-600/30 !border-0 !shadow-none cursor-default pointer-events-none",
          className
        )}
        {...props}
      >
        <span className="leading-none">{day.date.getDate()}</span>
      </Button>
    );
  }

  if (isSelected) {
    return (
      <div className="relative w-full aspect-square mx-auto flex items-center justify-center p-1">
        <ElectricBorder
          color="#f97316"
          borderRadius={14}
          chaos={0.12}
          speed={3}
          className="w-full h-full p-0 flex items-center justify-center"
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "!w-full !h-full !max-w-none !rounded-xl !border-0 font-black flex flex-col items-center justify-center",
              "!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white",
              "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]",
              "focus:outline-none focus:ring-0 active:scale-95 transition-transform",
              className
            )}
            {...props}
          >
            <span className="text-sm leading-none drop-shadow-sm">{day.date.getDate()}</span>
            {hasTours && (
              <div className="absolute -bottom-0.5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
              </div>
            )}
          </Button>
        </ElectricBorder>
      </div>
    );
  }

  const neumorphicClass = cn(
    baseSize,
    "!border-0",
    isToday
      ? [
          isDarkMode ? "!bg-[#1a2a35] !text-amber-300" : "!bg-[#cae1d9] !text-amber-600 shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb] border-none",
          "!font-black",
          isDarkMode ? "shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.03),inset_0_0_0_1px_rgba(245,158,11,0.2)]" : "",
          isDarkMode ? "hover:!bg-[#1e3040]" : "hover:!text-amber-700"
        ]
      : hasTours
        ? [
            isDarkMode ? "!bg-[#182530] !text-orange-300" : "!bg-[#cae1d9] !text-orange-600 shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] border-none",
            "!font-bold",
            isDarkMode ? "shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.03)]" : "hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb]",
            isDarkMode ? "hover:!bg-[#1e2e3a]" : "hover:!text-orange-700"
          ]
        : [
            isDarkMode ? "!bg-[#162029] !text-slate-400" : "!bg-[#cae1d9] !text-slate-600 shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] border-none hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb]",
            isDarkMode ? "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)]" : "",
            isDarkMode ? "hover:!bg-[#1a2833] hover:!text-slate-300" : "hover:!text-slate-800"
          ]
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(neumorphicClass, className)}
      {...props}
    >
      <span className="leading-none">{day.date.getDate()}</span>
      {hasTours && (
        <div className="absolute bottom-1 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        </div>
      )}
    </Button>
  );
}

function CaptionLabel({ children, isYearView, setIsYearView, isDarkMode }) {
  return (
    <Button
      className={cn(
        "data-[state=open]:text-orange-400 -ms-2 flex items-center gap-2 text-sm font-bold tracking-tight hover:bg-transparent [&[data-state=open]>svg]:rotate-180 hover:text-orange-300 font-outfit",
        isDarkMode ? "text-orange-400" : "text-orange-600"
      )}
      data-state={isYearView ? "open" : "closed"}
      onClick={() => setIsYearView((prev) => !prev)}
      size="sm"
      variant="ghost">
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="text-orange-400 shrink-0 transition-transform duration-200" />
    </Button>
  );
}

function MonthGrid({
  className,
  children,
  isYearView,
  years,
  currentYear,
  currentMonth,
  onMonthSelect,
  selectedYear,
  setSelectedYear,
  startDate,
  endDate,
  isDarkMode
}) {
  const scrollAreaRef = useRef(null)

  useEffect(() => {
    if (isYearView && scrollAreaRef.current) {
      const activeElement = scrollAreaRef.current.querySelector("[data-active='true']")
      if (activeElement) {
        activeElement.scrollIntoView({ block: "center" })
      }
    }
  }, [isYearView, selectedYear])

  return (
    <div className="relative">
      <table className={className}>{children}</table>
      {isYearView && (
        <div className={cn(
          "absolute top-0 left-0 right-0 z-20 -m-2 rounded-3xl border backdrop-blur-xl p-3 shadow-2xl transition-all duration-300", 
          isDarkMode ? "bg-[#0f172a]/95 border-white/10" : "bg-[#cae1d9]/95 border-white/60 shadow-[8px_8px_16px_#aabebd,-8px_-8px_16px_#eafffb]"
        )}>
          <div ref={scrollAreaRef}>
            <ScrollArea className="max-h-[220px]">
              <div className="px-1.5 pt-1 pb-1">
                {selectedYear === null ? (
                  <div className="grid grid-cols-4 gap-3">
                    {years.map((year) => {
                      const y = year.getFullYear()
                      const isCurrent = y === currentYear
                      return (
                        <Button
                          key={y}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-10 border-0 font-bold transition-all duration-200 rounded-xl",
                            isCurrent 
                              ? "!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white !font-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]" 
                              : isDarkMode 
                                ? "!bg-[#162029] !text-slate-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] hover:!bg-[#1a2833] hover:!text-slate-300" 
                                : "!bg-[#cae1d9] !text-slate-600 shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb]"
                          )}
                          data-active={isCurrent}
                          onClick={() => setSelectedYear(y)}>
                          {y}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center pb-2 border-b border-black/10 dark:border-white/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("px-4 font-black text-lg transition-colors rounded-xl", isDarkMode ? "text-orange-400 hover:text-orange-300 hover:bg-white/5" : "text-orange-600 hover:text-orange-700 hover:bg-black/5")}
                        onClick={() => setSelectedYear(null)}>
                        <ChevronDownIcon className="mr-2 size-5 rotate-90" />
                        {selectedYear}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {eachMonthOfInterval({
                        start: startOfYear(new Date(selectedYear, 0)),
                        end: endOfYear(new Date(selectedYear, 0)),
                      }).map((month) => {
                        const isCurrent = month.getMonth() === currentMonth && selectedYear === currentYear
                        const isDisabled = isBefore(month, startOfYear(startDate)) || isAfter(month, endOfYear(endDate))
                        const monthsSpanish = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        return (
                          <Button
                            key={month.getTime()}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-10 border-0 font-bold transition-all duration-200 rounded-xl",
                              isDisabled ? "opacity-30 pointer-events-none" : "",
                              isCurrent 
                                ? "!bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white !font-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]" 
                                : isDarkMode 
                                  ? "!bg-[#162029] !text-slate-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] hover:!bg-[#1a2833] hover:!text-slate-300" 
                                  : "!bg-[#cae1d9] !text-slate-600 shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb]"
                            )}
                            data-active={isCurrent}
                            disabled={isDisabled}
                            onClick={() => onMonthSelect(month)}>
                            {monthsSpanish[month.getMonth()]}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

export function TourCalendar({ selectedDate, onDateSelect, dashboardMode = false, inlineMode = false, isDarkMode = true }) {
    const today = new Date();
    const [month, setMonth] = useState(today);
    const selectedDateObj = selectedDate ? new Date(selectedDate + 'T12:00:00') : undefined;
    const [tours, setTours] = useState([]);
    const [selectedDayTours, setSelectedDayTours] = useState(null);
    const [isYearView, setIsYearView] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const startYear = today.getFullYear() - 5;
    const endYear = today.getFullYear() + 5;
    const startDate = startOfYear(new Date(startYear, 0));
    const endDate = endOfYear(new Date(endYear, 11));
    const years = eachYearOfInterval({ end: endOfYear(endDate), start: startOfYear(startDate) });

    useEffect(() => {
        if (selectedDate) {
            try {
                const parsedDate = new Date(selectedDate + 'T12:00:00');
                if (!isNaN(parsedDate.getTime())) setMonth(parsedDate);
            } catch (e) { }
        }
    }, [selectedDate]);

    useEffect(() => {
        const loadCalendarTours = async () => {
            let loadedTours = [];
            try {
                const { data, error } = await supabase.from('andean_journey_cotizaciones').select('datos');
                if (!error && data && data.length > 0) {
                    loadedTours = data.map(d => d.datos);
                }
            } catch (err) {
                console.warn('Supabase calendar load error', err);
            }
            
            
            const localData = localStorage.getItem('andean_cotizaciones');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        loadedTours = [...loadedTours, ...parsed];
                    }
                } catch (e) { }
            }
            setTours(loadedTours);
        };
        loadCalendarTours();
    }, []);

    const toursByDate = tours.reduce((acc, t) => {
        const dateStr = t.fecha_tour || t.fecha;
        if (!dateStr) return acc;
        try {
            const cleanDate = dateStr.split('T')[0];
            if (!acc[cleanDate]) acc[cleanDate] = [];
            acc[cleanDate].push(t);
        } catch (e) { }
        return acc;
    }, {});

    const handleDayClick = (date) => {
        if (!date) return;
        const dateKey = format(date, 'yyyy-MM-dd');
        if (onDateSelect) {
            onDateSelect(dateKey);
        } else {
            const dayTours = toursByDate[dateKey] || [];
            if (dayTours.length > 0) {
                setSelectedDayTours({ dateStr: format(date, 'dd/MM/yyyy'), list: dayTours });
            }
        }
    };

    const containerClass = inlineMode 
      ? "h-full w-full"
      : `rounded-3xl p-3 sm:p-3.5 flex flex-col justify-between select-none border backdrop-blur-xl transition-colors duration-500 ${dashboardMode ? '' : 'mt-6'} ${isDarkMode ? 'bg-[#001a2c]/95 text-white border-transparent' : 'bg-white/40 border-white/60 text-slate-800 shadow-[0_8px_32px_rgba(31,38,135,0.07)] h-full'}`;

    return (
        <div className={containerClass}>
            {!inlineMode && (
              <div className="flex flex-col mb-4 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shadow-sm ${isDarkMode ? 'bg-[#1a2530] text-orange-400' : 'bg-white/50 text-orange-500 border border-white/60'}`}>
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight">Calendario Operativo</h2>
                            <p className={cn("text-[9px] font-medium", isDarkMode ? "text-slate-500" : "text-slate-500")}>Salidas programadas de pasajeros</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              <Calendar
                locale={es}
                className="!bg-transparent !w-full !h-full flex flex-col relative"
                classNames={{
                  root: "!w-full !h-full p-0 !bg-transparent relative flex flex-col",
                  months: "flex flex-col !w-full !h-full !bg-transparent relative",
                  month: "flex !w-full !h-full flex-col gap-2 !bg-transparent relative",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: cn("text-sm font-bold uppercase tracking-wider", isDarkMode ? 'text-white' : 'text-slate-800'),
                  nav: cn("flex items-center !w-full absolute inset-x-0 justify-end pointer-events-none [&>button]:pointer-events-auto hover:[&>button]:!bg-white/50 [&>button]:!border-0 [&>button]:!rounded-xl [&>button]:transition-all", isDarkMode ? '[&>button]:text-slate-400 hover:[&>button]:text-white [&>button]:!bg-[#1a2530] hover:[&>button]:!bg-[#1e3040] [&>button]:!shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.02)]' : '[&>button]:text-slate-500 hover:[&>button]:text-slate-800 [&>button]:!bg-white/40 [&>button]:!shadow-sm'),
                  month_grid: "!w-full !h-full flex-1 border-collapse flex flex-col",
                  weeks: "!w-full flex-1 flex flex-col",
                  weekdays: "grid grid-cols-7 !w-full gap-2 mt-1",
                  weekday: cn("!w-full text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-center pb-2", isDarkMode ? 'text-slate-400' : 'text-slate-500'),
                  week: "grid grid-cols-7 !w-full flex-1 gap-2 mt-2",
                  day: "!w-full !h-full p-0 flex items-center justify-center"
                }}
                components={{
                  CaptionLabel: (props) => (
                    <CaptionLabel
                      isDarkMode={isDarkMode}
                      isYearView={isYearView}
                      setIsYearView={(val) => {
                        setIsYearView(val);
                        if (!val) setSelectedYear(null);
                      }}
                      {...props} 
                    />
                  ),
                  MonthGrid: (props) => (
                    <MonthGrid
                      {...props}
                      isDarkMode={isDarkMode}
                      currentMonth={month.getMonth()}
                      currentYear={month.getFullYear()}
                      endDate={endDate}
                      isYearView={isYearView}
                      onMonthSelect={(selectedMonth) => {
                        setMonth(selectedMonth);
                        setIsYearView(false);
                        setSelectedYear(null);
                      }}
                      setIsYearView={setIsYearView}
                      startDate={startDate}
                      years={years}
                      selectedYear={selectedYear}
                      setSelectedYear={setSelectedYear}
                    />
                  ),
                  DayButton: (props) => (
                    <CustomCalendarDayButton 
                      isDarkMode={isDarkMode}
                      toursByDate={toursByDate} 
                      selectedDate={selectedDateObj} 
                      {...props} 
                    />
                  )
                }}
                defaultMonth={today}
                endMonth={endDate}
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => handleDayClick(date)}
                selected={selectedDateObj}
                startMonth={startDate} 
              />
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-medium">
                <div className="flex items-center gap-4">
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        <div className="w-3.5 h-3.5 rounded-md border border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm flex items-center justify-center text-white text-[6px] font-bold">HOY</div> Hoy
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.6)] animate-pulse" /> Con Salida
                    </div>
                </div>
                <span className={isDarkMode ? "text-slate-600" : "text-slate-500"}>Clic para ver agenda</span>
            </div>

            <AnimatePresence>
                {!dashboardMode && selectedDayTours && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn("absolute inset-0 backdrop-blur-sm", isDarkMode ? 'bg-black/60' : 'bg-white/40')}
                            onClick={() => setSelectedDayTours(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden relative border backdrop-blur-xl transition-all duration-300", 
                                isDarkMode ? "bg-[#0f172a]/95 border-white/10 text-white" : "bg-[#cae1d9]/95 border-white/60 text-slate-800 shadow-[8px_8px_16px_#aabebd,-8px_-8px_16px_#eafffb]"
                            )}
                        >
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/10 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black font-outfit tracking-tight">Salidas Programadas</h3>
                                        <p className="text-orange-500 dark:text-orange-400 text-xs font-bold">{selectedDayTours.dateStr}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedDayTours(null)}
                                    className={cn("p-2.5 rounded-xl transition-all duration-200 cursor-pointer font-bold border-0", isDarkMode ? "bg-[#162029] text-slate-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] hover:bg-[#1a2833] hover:text-white" : "bg-[#cae1d9] text-slate-600 shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb] hover:text-slate-900")}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedDayTours.list.map((tour, idx) => (
                                    <div key={`${tour.nombre_cliente || 'tour'}-${idx}`} className={cn("p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 border-0", isDarkMode ? "bg-[#162029] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] hover:bg-[#1a2833]" : "bg-[#cae1d9] shadow-[4px_4px_8px_#aabebd,-4px_-4px_8px_#eafffb] hover:shadow-[inset_4px_4px_8px_#aabebd,inset_-4px_-4px_8px_#eafffb]")}>
                                        <div className="flex items-center justify-between">
                                            <span className={cn("font-black text-lg", isDarkMode ? "text-white" : "text-slate-800")}>
                                                {tour.nombre_cliente || 'Cliente General'}
                                            </span>
                                            <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", tour.tipo === 'personalizado' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400')}>
                                                {tour.tipo === 'personalizado' ? 'A Medida' : 'Fijo'}
                                            </span>
                                        </div>

                                        <p className={cn("text-sm font-semibold flex items-center gap-2", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                                            {tour.programa || 'Programa Principal'}
                                        </p>

                                        {tour.link && (
                                            <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/5 flex justify-end">
                                                <a 
                                                    href={tour.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer !bg-gradient-to-br !from-orange-500 !to-orange-600 !text-white !border-0 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] active:scale-95"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" /> Descargar Itinerario
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
