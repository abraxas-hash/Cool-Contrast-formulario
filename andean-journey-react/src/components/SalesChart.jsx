import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  Cell, 
  Pie, 
  PieChart 
} from "recharts"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from "lucide-react"

// Data for monthly comparative bar chart (c-chart-3 pattern)
const monthlyChartData = [
  { month: "Ene", fijos: 186, personalizados: 80 },
  { month: "Feb", fijos: 305, personalizados: 200 },
  { month: "Mar", fijos: 237, personalizados: 120 },
  { month: "Abr", fijos: 73, personalizados: 190 },
  { month: "May", fijos: 209, personalizados: 130 },
  { month: "Jun", fijos: 214, personalizados: 140 },
]

// Configuration for Bar Chart
const barChartConfig = {
  fijos: {
    label: "Tours Fijos",
    color: "var(--chart-orange)",
  },
  personalizados: {
    label: "Tours Personalizados",
    color: "var(--chart-gold)",
  },
}

// Data for distribution breakdown donut chart (c-chart-21 pattern)
// Total Fijos: 1224 | Total Personalizados: 860
const distributionData = [
  { category: "fijos", value: 1224, fill: "url(#pie-fijos-pattern)" },
  { category: "personalizados", value: 860, fill: "url(#pie-personalizados-pattern)" },
]

// Configuration for Pie Chart
const pieChartConfig = {
  value: { label: "Cotizaciones" },
  fijos: { 
    label: "Tours Fijos", 
    color: "#00A884" 
  },
  personalizados: { 
    label: "Tours Personalizados", 
    color: "#25D366" 
  },
}

export function SalesChart({ isDarkMode = true }) {
  return (
    <div 
      className={`p-5 rounded-3xl flex flex-col justify-between h-full w-full select-none transition-colors duration-500 border ${
        isDarkMode 
          ? 'bg-[#111b21]/70 backdrop-blur-xl border-white/5 text-white shadow-2xl' 
          : 'bg-white/40 backdrop-blur-xl border-white/60 text-slate-800 shadow-[0_8px_32px_rgba(31,38,135,0.07)]'
      }`}
      style={{
        "--chart-orange": "#00A884",
        "--chart-gold": "#25D366"
      }}
    >
      {/* Header General */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-200/50'}`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#00A884]/10 text-[#00A884] rounded-lg border border-[#00A884]/20 shadow-sm">
            <Activity className="w-4 h-4 text-[#00A884] animate-pulse" />
          </div>
          <div>
            <span className={`text-sm sm:text-base font-bold tracking-tight font-outfit block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Análisis y Distribución de Cotizaciones
            </span>
            <p className={`text-[10px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Rendimiento mensual y participación de mercado de programas fijos vs personalizados.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#00A884]/10 border border-[#00A884]/20 px-2 py-0.5 rounded-full shrink-0 shadow-sm">
          <TrendingUp className="w-3 h-3 text-[#00A884]" />
          <span className="text-[10px] text-[#25D366] font-bold">+28.4% este mes</span>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
        
        {/* Gráfico 1: Comparativa Mensual de Ventas (Bar Chart c-chart-3) */}
        <div className="lg:col-span-7 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              <BarChart3 className="w-3.5 h-3.5 text-[#00A884]" /> Comparativa Mensual
            </h4>
          </div>

          <div className="flex-grow w-full h-[180px] relative">
            <ChartContainer config={barChartConfig} className="h-full w-full">
              <BarChart 
                accessibilityLayer 
                data={monthlyChartData} 
                margin={{ top: 15, bottom: 5, left: 5, right: 5 }}
              >
                <defs>
                  {/* Patrón diagonal estilo c-chart-3 */}
                  <pattern
                    id="chart3-diagonal-stripe"
                    patternUnits="userSpaceOnUse"
                    width="8"
                    height="8"
                  >
                    <rect width="8" height="8" fill="var(--chart-orange)" opacity="0.12" />
                    <path
                      d="M0,8 L8,0 M4,12 L12,4 M-4,4 L4,-4"
                      stroke="var(--chart-orange)"
                      strokeWidth="1.2"
                      opacity="0.8" 
                    />
                  </pattern>
                  
                  {/* Patrón de puntos estilo c-chart-21 */}
                  <pattern
                    id="chart3-dots"
                    patternUnits="userSpaceOnUse"
                    width="6"
                    height="6"
                  >
                    <rect width="6" height="6" fill="var(--chart-gold)" opacity="0.12" />
                    <circle cx="3" cy="3" r="1.2" fill="var(--chart-gold)" opacity="0.8" />
                  </pattern>
                </defs>

                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#ffffff08" />
                
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={6}
                  axisLine={false}
                  stroke="#94a3b8"
                  style={{ fontSize: '10px', fontWeight: '500' }}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className={`min-w-[140px] gap-2 ${isDarkMode ? 'bg-[#202c33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      labelFormatter={(value) => `${value} 2026`}
                    />
                  }
                />

                <Bar 
                  dataKey="fijos" 
                  fill="url(#chart3-diagonal-stripe)" 
                  stroke="var(--chart-orange)"
                  strokeWidth={1}
                  radius={[3, 3, 0, 0]} 
                />
                
                <Bar 
                  dataKey="personalizados" 
                  fill="url(#chart3-dots)" 
                  stroke="var(--chart-gold)"
                  strokeWidth={1}
                  radius={[3, 3, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribución del Mercado (Pie/Donut Chart c-chart-21) */}
        <div className="lg:col-span-5 flex flex-col justify-between min-h-[180px] border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              <PieIcon className="w-3.5 h-3.5 text-[#25D366] animate-pulse" /> Participación de Mercado
            </h4>
          </div>

          <div className="flex-grow flex items-center justify-center h-[180px] relative">
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-full w-full max-h-[170px]">
              <PieChart accessibilityLayer>
                <defs>
                  {/* Patrón de líneas para Pie Fijos */}
                  <pattern
                    id="pie-fijos-pattern"
                    patternUnits="userSpaceOnUse"
                    width="6"
                    height="6"
                  >
                    <rect width="6" height="6" fill="#00A884" opacity="0.15" />
                    <path
                      d="M0,6 L6,0 M-2,2 L2,-2 M4,8 L8,4"
                      stroke="#00A884"
                      strokeWidth="1.2"
                      opacity="0.8" 
                    />
                  </pattern>

                  {/* Patrón de puntos para Pie Personalizados */}
                  <pattern
                    id="pie-personalizados-pattern"
                    patternUnits="userSpaceOnUse"
                    width="5"
                    height="5"
                  >
                    <rect width="5" height="5" fill="#25D366" opacity="0.15" />
                    <circle cx="2.5" cy="2.5" r="1" fill="#25D366" opacity="0.8" />
                  </pattern>
                </defs>

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className={`min-w-[150px] gap-2 ${isDarkMode ? 'bg-[#202c33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-2 text-[10px]">
                          <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} capitalize`}>{name}:</span>
                          <span className="font-extrabold">{value} cotizaciones</span>
                        </div>
                      )}
                    />
                  }
                />

                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={36}
                  outerRadius={58}
                  cornerRadius={4}
                  paddingAngle={4}
                  stroke="rgba(0, 34, 56, 0.9)"
                  strokeWidth={2.5}
                >
                  {distributionData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>

                <ChartLegend
                  content={<ChartLegendContent nameKey="category" />}
                  className="text-[9px] -translate-y-1 gap-1"
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
