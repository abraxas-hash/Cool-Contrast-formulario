const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_programas_fijos.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const templatePath = path.join(__dirname, 'prueba_3d2n_fijo.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

const outputDir = path.join(__dirname, 'html_generados');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Split the template to insert dynamically
const headerSplitPoint = '<!-- ========== ACTIVIDADES COMPACTAS ========== -->';
const footerSplitPoint = '<!-- ========== PÁGINAS FINALES ========== -->';

const [headerPart, restPart] = templateHtml.split(headerSplitPoint);
const [_, footerPart] = restPart.split(footerSplitPoint);

for (const key in db) {
  const prog = db[key];
  
  let newHtml = headerPart;
  
  // Replace title in header
  newHtml = newHtml.replace(/AVENTURA CUSQUEÑA 3D2N S420 BASICO MACHU PICCHU/g, prog.titulo_programa);
  newHtml = newHtml.replace(/3 Días \/ 2 Noches/g, prog.dias_noches);
  
  // Start Actividades
  newHtml += headerSplitPoint + '\n  <div class="actividades-container">\n';
  
  prog.itinerario.forEach((diaInfo, i) => {
    newHtml += `
    <div class="actividad-compacta">
      <div class="actividad-texto">
        <h3>${diaInfo.titulo}</h3>
        <div class="fecha-badge">🗓️ {{FECHA_COMPLETA_DIA_${diaInfo.dia}}}</div>
        <h4>Itinerario:</h4>
        <ul>
`;
    diaInfo.actividades.forEach(act => {
      newHtml += `          <li>${act}</li>\n`;
    });
    newHtml += `        </ul>
      </div>
      <div class="actividad-imagen">
        <img src="${diaInfo.imagen}" alt="${diaInfo.titulo}">
      </div>
    </div>\n`;
  });
  
  newHtml += '  </div>\n\n  <!-- ========== SECCIONES FINALES ========== -->\n';
  
  // INCLUYE
  if (prog.incluye && prog.incluye.length > 0) {
    newHtml += `  <div class="seccion-fija">\n    <h3>NUESTRO PROGRAMA INCLUYE POR PERSONA:</h3>\n    <ul>\n`;
    prog.incluye.forEach(item => { newHtml += `      <li>${item}</li>\n`; });
    newHtml += `    </ul>\n  </div>\n\n`;
  }
  
  // NO INCLUYE
  if (prog.no_incluye && prog.no_incluye.length > 0) {
    newHtml += `  <div class="seccion-fija">\n    <h3>NO INCLUYE:</h3>\n    <ul>\n`;
    prog.no_incluye.forEach(item => { newHtml += `      <li>${item}</li>\n`; });
    newHtml += `    </ul>\n  </div>\n\n`;
  }
  
  // SUGERENCIAS QUE DEBE LLEVAR
  if (prog.sugerencias_llevar && prog.sugerencias_llevar.length > 0) {
    newHtml += `  <div class="seccion-fija">\n    <h3>SUGERENCIAS QUE DEBE LLEVAR:</h3>\n    <ul>\n`;
    prog.sugerencias_llevar.forEach(item => { newHtml += `      <li>${item}</li>\n`; });
    newHtml += `    </ul>\n  </div>\n\n`;
  }
  
  // SUGERENCIAS CAMINATAS
  if (prog.sugerencias_caminatas && prog.sugerencias_caminatas.length > 0) {
    newHtml += `  <div class="seccion-fija">\n    <h3>SUGERENCIAS PARA TOUR DE CAMINATAS:</h3>\n    <ul>\n`;
    prog.sugerencias_caminatas.forEach(item => { newHtml += `      <li>${item}</li>\n`; });
    newHtml += `    </ul>\n  </div>\n\n`;
  }
  
  // RESPECTO AL TREN LOCAL
  if (prog.respecto_tren_local && prog.respecto_tren_local.length > 0) {
    newHtml += `  <div class="seccion-fija" style="page-break-before: always;">\n    <h3>RESPECTO AL TREN LOCAL:</h3>\n`;
    // Formatear tren local (basado en el original)
    // Here we'll just put each line as a <p> or list item for simplicity, but let's try to match original
    let inList = false;
    newHtml += `    <div style="font-weight: bold; font-size: 9.5pt; text-align: justify; line-height: 1.4;">\n`;
    prog.respecto_tren_local.forEach((item, idx) => {
      if (item.match(/^[0-9]\./)) {
         newHtml += `      <p style="margin-bottom: 10px;"><strong>${item}</strong></p>\n`;
      } else {
         newHtml += `      <p style="margin-bottom: 10px;">${item}</p>\n`;
      }
    });
    newHtml += `    </div>\n  </div>\n\n`;
  }
  
  // HOTELES
  if (prog.info_hoteles && prog.info_hoteles.length > 0) {
    newHtml += `  <div class="seccion-fija">\n    <h3>EN HOTELES</h3>\n    <ul>\n`;
    prog.info_hoteles.forEach(item => { newHtml += `      <li>${item}</li>\n`; });
    newHtml += `    </ul>\n    <div style="text-align: center; margin-top: 25px;">
      <h3 style="border: none; margin-bottom: 5px;">Cuentas Bancarias Autorizadas</h3>
      <img src="https://nqouocmxfvcpyemxvobm.supabase.co/storage/v1/object/public/andean-journey-assets/CUENTA-BANCARIA.png" alt="Información de Pago"
        style="width: 80%; max-width: 500px; height: auto; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid var(--border-color);">
    </div>\n  </div>\n\n`;
  }
  
  // Add footer
  newHtml += footerSplitPoint + footerPart;
  
  fs.writeFileSync(path.join(outputDir, `${key}.html`), newHtml, 'utf8');
  console.log(`Generated HTML for: ${key}`);
}

console.log("All files generated in /html_generados/");
