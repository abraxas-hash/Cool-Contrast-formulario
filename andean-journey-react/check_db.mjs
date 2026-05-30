import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nqouocmxfvcpyemxvobm.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VvY214ZnZjcHllbXh2b2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg0MDU4NiwiZXhwIjoyMDY3NDE2NTg2fQ.WYzE45zlmtNeuMUCk9WPw4H89GI67ooFmsSam0NDOmc';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VvY214ZnZjcHllbXh2b2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDA1ODYsImV4cCI6MjA2NzQxNjU4Nn0.DNXASUTPOMr3Pf4wsADxqJz-UyRbYFq9U8ijKa_QRQI';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function check() {
    console.log("--- Checking as ADMIN (bypass RLS) ---");
    const { data: adminData, error: adminError } = await adminClient.from('andean_journey_cotizaciones').select('*');
    console.log("Admin Data:", adminData?.length || 0, "rows");
    console.log("Admin Error:", adminError);

    console.log("--- Checking as ANON (client role) ---");
    const { data: anonData, error: anonError } = await anonClient.from('andean_journey_cotizaciones').select('*');
    console.log("Anon Data:", anonData?.length || 0, "rows");
    console.log("Anon Error:", anonError);
    
    if (adminData && adminData.length > 0) {
        console.log("Sample row keys:", Object.keys(adminData[0]));
        console.log("Sample datos:", adminData[0].datos);
    }
}
check();
