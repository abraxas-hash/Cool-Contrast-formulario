# Design

## Theme

**Dark mode default.** El agente de viaje trabaja en monitores de oficina o laptop, frecuentemente bajo luz artificial. El modo oscuro reduce la fatiga visual en jornadas largas. El modo claro existe como alternativa y usa un patrón Inca sutil (`bg-inca-pattern`) sobre fondo `slate`.

**Scene sentence:** Vendedor interno en una oficina de Cusco, frente a una laptop de 15", con iluminación artificial moderada, completando cotizaciones durante 6-8 horas al día.

---

## Color

**Strategy:** Committed. Un verde WhatsApp (#00A884 / #25D366) como color principal de marca que carga el 40-60% de los acentos de interacción. Un amber/orange andino (#fbbf24, #c2410c) como acento cálido para accionables de alta jerarquía.

### Palette (OKLCH preferred)

| Role | Dark token | Light token | Notes |
|---|---|---|---|
| Brand primary | `#00A884` | `#00A884` | WhatsApp teal — botones CTA, badges activos, íconos de estado |
| Brand secondary | `#25D366` | `#25D366` | WhatsApp green claro — hover, gradients |
| Accent warm | `#fbbf24` (amber-400) | `#c2410c` (orange-700) | Sección de días, numeración de pasos |
| Surface base | `#0b141a` | `bg-inca-pattern` | Fondo de página |
| Surface card dark | `#0b1b2b` | `rgba(255,255,255,0.4)` | Tarjetas principales |
| Surface card mid | `#202c33` | `rgba(255,255,255,0.6)` | Tarjetas secundarias |
| Surface input | `#001a2c` | `#cae1d9` | Inputs neumórficos |
| Border dark | `rgba(255,255,255,0.05–0.15)` | `rgba(255,255,255,0.6–0.8)` | Bordes glassmorphic |
| Text primary | `#ffffff` | `#1d3557` | Cuerpo principal |
| Text secondary | `oklch(0.708 0 0)` / `text-slate-400` | `text-slate-500` | Metadatos, labels |
| Text muted | `text-slate-500` | `text-slate-400` | Placeholders |
| Success / active | `#10b981` (emerald-500) | `#059669` | Estados positivos |
| Warning | `#f59e0b` (amber-500) | — | Alertas |
| Error | `#ef4444` | — | Errores |

### Banned
- `#000000` o `#ffffff` puros — siempre tintado hacia el azul-marino de la marca.
- Gradient text (`background-clip: text`) en contextos de datos o formularios. Solo en logo/brand wordmark.

---

## Typography

**Primary font:** `Geist Variable` (variable font, `@fontsource-variable/geist`). Cargado vía `--font-sans` en `@theme inline`.

**Secondary display font:** `font-outfit` — usado en títulos de sección, labels de destino en mapas SVG, numeración de pasos. Declarado inline como clase Tailwind (`font-outfit`).

### Scale (Material Design 3 adapted)

| Step | Token | Value |
|---|---|---|
| Display LG | `--type-display-lg` | `clamp(2.5rem, 6vw, 3.5rem)` |
| Display MD | `--type-display-md` | `clamp(2rem, 5vw, 2.8rem)` |
| Headline LG | `--type-headline-lg` | `clamp(1.5rem, 4vw, 2rem)` |
| Title LG | `--type-title-lg` | `1rem` |
| Body MD | `--type-body-md` | `0.875rem` |
| Label LG | `--type-label-lg` | `0.75rem` |
| Micro | — | `0.625rem–0.6875rem` (badges, nav labels) |

### Hierarchy rules
- Títulos de sección: `text-xs font-bold uppercase tracking-wider` — NO usar heading tags grandes en formularios.
- Valores/métricas grandes: `text-2xl font-extrabold tracking-tight`.
- Labels de campo: `font-bold text-sm`, dark: `text-white`, light: `text-slate-800`.
- Sublabels / hints: `text-xs`, dark: `text-slate-400`, light: `text-slate-500`.

---

## Elevation & Shadow

**Sistema dual:** Neumorfismo exterior (tarjetas) + Neumorfismo interior (inputs).

### Dark mode

```css
/* Tarjeta elevada */
box-shadow: 6px 6px 14px #000c15, -6px -6px 14px #002843;

/* Input inset */
box-shadow: inset 5px 5px 12px #000c15, inset -5px -5px 12px #002843;

/* Input focused inset */
box-shadow: inset 8px 8px 16px #000a11, inset -8px -8px 16px #002a47;

/* Glow accent (botón CTA) */
box-shadow: 6px 6px 14px #000c15, -6px -6px 14px #002843, 0 0 40px rgba(56,189,248,0.15);
```

### Light mode

```css
/* Tarjeta glassmorphic */
background: rgba(255,255,255,0.4–0.5);
backdrop-filter: blur(12px–16px);
border: 1px solid rgba(255,255,255,0.6–0.8);
box-shadow: 4px 4px 10px rgba(0,0,0,0.05), -4px -4px 10px rgba(255,255,255,0.8);

/* Input inset light */
background: #cae1d9;
box-shadow: inset 4px 4px 8px #aabebd, inset -4px -4px 8px #eafffb;
```

---

## Components

### Form Input (InputGroup)

```jsx
// Dark
<InputGroup className={`rounded-xl ${isDarkMode ? 'bg-black/40 border-white/15' : 'bg-white/70 backdrop-blur-md border border-white/80 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.05),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]'}`}>
```

**Regla:** `rounded-xl` para todos los inputs/selects/textareas. `rounded-2xl` reservado para tarjetas de sección. `rounded-3xl` para tarjetas de acción principal (CTA cards).

### Neumorphic Input (clase CSS)

```css
.neumorphic-input {
  background: #001a2c;
  box-shadow: inset 5px 5px 12px #000c15, inset -5px -5px 12px #002843;
  border: none;
}
```

Usado en selects con `rounded-xl` en modo oscuro.

### Neumorphic Button (clase CSS)

```css
.neumorphic-button {
  background: #001a2c;
  box-shadow: 6px 6px 14px #000c15, -6px -6px 14px #002843;
  border: none;
}
.neumorphic-button.with-glow {
  /* Agrega halo cyan en el CTA principal */
  box-shadow: ..., 0 0 40px rgba(56,189,248,0.15);
}
```

### Card (Standard)

- Dark: `bg-[#0b1b2b] border border-white/5 shadow-xl rounded-[22px]`
- Light: `bg-white/50 backdrop-blur-md border border-white/60 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] rounded-[22px]`

### Step Number Badge

```jsx
<div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg font-outfit shadow-md shrink-0 ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'}`}>
  {dayNumber}
</div>
```

### Action Card (CTA)

`rounded-3xl`, Electric border animated. Dark: `bg-gradient-to-br from-[#202c33]/90 to-[#111b21]/90`. Light: `bg-white/40 border-white/60`.

### Status Badge / Pill

`px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg border` — nunca `rounded-full` para badges de texto con más de 3 caracteres.

### Header

`sticky top-0 backdrop-blur-2xl`. Dark: `bg-[#111b21]/90 border-b border-white/8`. Light: `bg-white/90 border-b border-black/8`.

---

## Motion

**Library:** Framer Motion (`motion.div`, `AnimatePresence`).

**Rules:**
- Page transitions: `initial={{ opacity: 0, y: 15 }}`, `animate={{ opacity: 1, y: 0 }}`, `duration: 0.45`.
- Card hover: `whileHover={{ scale: 1.02, translateY: -2 }}`, `whileTap={{ scale: 0.98 }}`, spring `stiffness: 400, damping: 25`.
- Tactile press (CSS fallback): `active:scale-[0.98]` en todos los elementos clickeables.
- No bounce, no elastic. Solo `ease-out` curves.
- No animar propiedades de layout CSS.
- Bottom nav items: `transform: scale(0.92)` on `:active`.

---

## Layout & Spacing

- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Page vertical padding: `pt-8 pb-safe` (safe = 80px mobile / 100px desktop).
- Card section gap: `space-y-6` o `gap-6` en grids.
- Form field gap dentro de sección: `space-y-4` a `space-y-6`.
- Grid base: `grid-cols-1 sm:grid-cols-2` para campos de formulario. `grid-cols-2 lg:grid-cols-4` para KPIs.

### Spacing rhythm

| Context | Value |
|---|---|
| Sección card padding | `p-6 sm:p-8` |
| Campo de formulario | `py-3.5 px-4` |
| Badge / pill | `px-2 py-0.5` |
| Icon container | `p-1.5` a `p-4` (según jerarquía) |

---

## Special Effects

- **ElectricBorder:** Componente React con canvas WebGL que anima un borde de neón alrededor de tarjetas principales. Parámetros habituales: `color="#00A884"`, `borderRadius={24}`, `chaos={0.15}`, `speed={4}`.
- **Prism (header):** WebGL background con animación `rotate`, `opacity: 20%` — efecto decorativo solo en header.
- **ScrollFloat:** Animación de entrada de texto letra a letra con GSAP en el saludo del dashboard.
- **Screen glow halo:** `position: fixed; inset: 0; border: 4px solid rgba(14,165,233,0.4);` — overlay animado en modo especial.
- **Inca pattern:** `bg-inca-pattern` clase CSS que carga SVG de chakana (`assets/chakana-pattern.svg`, `120px 120px repeat`) — solo en modo claro.

---

## Radius Scale

| Component | Value |
|---|---|
| Inputs, selects, textareas | `rounded-xl` (≈14px) |
| Buttons secondary | `rounded-xl` |
| Cards sección / form panels | `rounded-[22px]` |
| CTA action cards | `rounded-3xl` |
| Avatar / step badges | `rounded-2xl` |
| Icon containers pequeños | `rounded-lg` a `rounded-xl` |
| Pills decorativas (blur blobs) | `rounded-full` |

---

## Accessibility

- Touch targets mínimos: `--touch-min: 48px`, `--touch-comfortable: 56px`.
- iOS zoom prevention: `font-size: 16px !important` en inputs en mobile.
- Dark label contrast: `text-white` o `text-slate-300` sobre fondos oscuros.
- Light label contrast: `text-slate-800` sobre fondos glassmorphic claros (`#cae1d9`).
- `-webkit-tap-highlight-color: transparent` en todos los elementos táctiles.
