import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nqouocmxfvcpyemxvobm.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VvY214ZnZjcHllbXh2b2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg0MDU4NiwiZXhwIjoyMDY3NDE2NTg2fQ.WYzE45zlmtNeuMUCk9WPw4H89GI67ooFmsSam0NDOmc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
    console.log('Creating users...');
    
    const admin = await supabase.auth.admin.createUser({
        email: 'admin@andean.travel',
        password: 'andean2025',
        email_confirm: true,
        user_metadata: { is_admin: true }
    });
    if (admin.error) console.log('Admin Error:', admin.error.message);
    else console.log('Admin created successfully.');

    const invitado = await supabase.auth.admin.createUser({
        email: 'invitado@andean.travel',
        password: 'demo123',
        email_confirm: true,
        user_metadata: { is_demo: true }
    });
    if (invitado.error) console.log('Invitado Error:', invitado.error.message);
    else console.log('Invitado created successfully.');
}

main();
