import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nqouocmxfvcpyemxvobm.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VvY214ZnZjcHllbXh2b2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDA1ODYsImV4cCI6MjA2NzQxNjU4Nn0.DNXASUTPOMr3Pf4wsADxqJz-UyRbYFq9U8ijKa_QRQI';

const client = createClient(SUPABASE_URL, ANON_KEY);

async function check() {
    console.log("Logging in...");
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
        email: 'admin@andean.travel',
        password: 'andean2025' 
    });
    console.log("Auth Error:", authError);

    console.log("--- Checking as Authenticated ---");
    const { data, error } = await client.from('andean_journey_cotizaciones').select('*');
    console.log("Data:", data?.length || 0, "rows");
    console.log("Error:", error);
}
check();
