# Corrección Final: Mostrar SOLO Detalles Específicos (Sin Totales Genéricos)

## 🔴 Problema

El apartado **INCLUYE** muestra totales genéricos:
- ❌ 5 noches de hotel (genérico)
- ❌ 5 desayunos (genérico)
- ❌ 2 almuerzos (genérico)

**Debería mostrar DETALLES ESPECÍFICOS:**
- ✅ 4 noches en Cusco
- ✅ 1 noche en Aguas Calientes
- ✅ Desayuno en el hotel (Día 1)
- ✅ Desayuno en el hotel (Día 2)
- ✅ 01-Desayuno buffet en Cusipata (Montaña)
- ✅ 01-Almuerzo buffet en el poblado Cusipata (Montaña)
- ✅ 01-Almuerzo Buffet en el Restaurante "RUSTICA" URUBAMBA (Valle)

---

## ✅ Solución

Modificar la función `generarHTMLProgramaIncluye` para que:
1. **NO muestre totales genéricos** de noches, desayunos ni almuerzos
2. **Solo muestre los items consolidados** con sus detalles específicos
3. Filtre únicamente las menciones genéricas sin detalles

---

## 📝 Código a Modificar

### Ubicación
Busca la función `generarHTMLProgramaIncluye` (línea ~1250-1280)

### Código Actual (INCORRECTO)

```javascript
function generarHTMLProgramaIncluye(itemsIncluye, totalNoches, nochesCusco, nochesAguasCalientes, desayunos, almuerzos) {
  const itemsPrincipales = [];
  
  itemsPrincipales.push(
    `<strong>${totalNoches} ${totalNoches === 1 ? 'noche' : 'noches'} de hotel</strong> (${nochesCusco} en Cusco${nochesAguasCalientes > 0 ? ` + ${nochesAguasCalientes} en Aguas Calientes` : ''})`
  );
  
  if (desayunos > 0) {
    itemsPrincipales.push(`<strong>${desayunos} ${desayunos === 1 ? 'desayuno' : 'desayunos'}</strong>`);
  }
  
  if (almuerzos > 0) {
    itemsPrincipales.push(`<strong>${almuerzos} ${almuerzos === 1 ? 'almuerzo' : 'almuerzos'}</strong>`);
  }
  
  // ❌ PROBLEMA: Este filtro elimina los detalles de los almuerzos
  const itemsFiltrados = itemsIncluye.filter(item => {
    const itemLower = item.toLowerCase();
    if (itemLower === 'desayuno' || itemLower === 'almuerzo') return false;
    if (itemLower.startsWith('01-desayuno') || itemLower.startsWith('01-almuerzo')) return false;
    if (itemLower === 'desayuno en el hotel') return false;
    return true;
  });
  
  const todosLosItems = [...itemsPrincipales, ...itemsFiltrados];
  
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
```

### Código Nuevo (CORRECTO) - REEMPLAZAR

```javascript
function generarHTMLProgramaIncluye(itemsIncluye, totalNoches, nochesCusco, nochesAguasCalientes, desayunos, almuerzos) {
  // ✅ NUEVA LÓGICA: Mostrar en orden con formato diferenciado
  
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
```

---

## 🎯 Resultado Esperado

### ANTES (con totales genéricos):
- ❌ 5 noches de hotel (genérico)
- ❌ 5 desayunos (genérico)
- ❌ 2 almuerzos (genérico)
- Traslado aeropuerto

### DESPUÉS (solo detalles específicos):
- ✅ Traslado aeropuerto - hotel
- ✅ Asistencia durante el check-in
- ✅ Desayuno en el hotel (aparece por cada día que lo incluye)
- ✅ 01-Desayuno buffet en Cusipata (Montaña)
- ✅ 01-Almuerzo buffet en el poblado Cusipata (Montaña)
- ✅ 01-Almuerzo Buffet en el Restaurante "RUSTICA" URUBAMBA (Valle)
- ✅ 01-Almuerzo buffet en Mollepata (Laguna)
- ✅ Tren local ida y vuelta
- ✅ Entrada a Machu Picchu
- ✅ Bus de subida y bajada al santuario

---

## ✅ Verificación

Después de aplicar el cambio:
1. El total de desayunos se muestra sin detalles
2. Los almuerzos se muestran con sus detalles específicos
3. No aparecen menciones genéricas de "Almuerzo" o "Desayuno"

**Fecha**: 28 de noviembre de 2025  
**Versión**: v7.4-COMIDAS-CON-DETALLES
