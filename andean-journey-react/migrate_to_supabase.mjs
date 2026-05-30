import { createClient } from '@supabase/supabase-js';

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyMwt1ywrb74yLEAfF2QNVf6wDGStAV6Qiu1nA5cgkJhEvFq8szcubM_RfpaFeZumbvQ/exec';
const SUPABASE_URL = 'https://nqouocmxfvcpyemxvobm.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VvY214ZnZjcHllbXh2b2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg0MDU4NiwiZXhwIjoyMDY3NDE2NTg2fQ.WYzE45zlmtNeuMUCk9WPw4H89GI67ooFmsSam0NDOmc';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function migrate() {
    console.log("Fetching Google Sheets data...");
    const response = await fetch(GOOGLE_SHEETS_URL);
    const json = await response.json();
    
    // Filter out test pings and invalid rows
    const rows = Array.isArray(json) ? json : json.data;
    const validRows = rows.filter(row => row && !row.test && row.nombre_cliente && row.nombre_cliente.trim() !== '');
    
    console.log(`Found ${validRows.length} valid rows to migrate out of ${rows.length} total.`);

    const records = validRows.map(row => {
        return {
            tipo: (row.tipo_cotizacion && row.tipo_cotizacion.toLowerCase() === 'fijo') ? 'fijo' : 'personalizado',
            pdf_url: row.pdf_url || null,
            datos: {
                ...row,
                numero_personas: row.numero_personas || row.personas || '', // Normalize
                fecha: row.fecha_tour || row.fecha || ''
            },
            created_at: row.fecha_creacion || new Date().toISOString()
        };
    });

    console.log("Inserting into Supabase...");
    
    // Insert in batches of 100
    for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100);
        const { error } = await adminClient.from('andean_journey_cotizaciones').insert(batch);
        
        if (error) {
            console.error(`Error inserting batch ${i}:`, error);
        } else {
            console.log(`Successfully inserted batch ${i} to ${i + batch.length}`);
        }
    }
    
    console.log("Migration complete!");
}

migrate();
