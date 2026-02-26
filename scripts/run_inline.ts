import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jjljpplzszeypsjxdsxy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
    console.log('--- PROCESSES ---');
    let { data: p, error: pe } = await supabase.from('processes').select('*').limit(1);
    if (pe) console.error(pe);
    if (p && p.length > 0) {
        console.log(Object.keys(p[0]));
    }

    console.log('--- DEADLINES ---');
    let { data: d, error: de } = await supabase.from('deadlines').select('*').limit(1);
    if (de) console.error(de);
    if (d && d.length > 0) {
        console.log(Object.keys(d[0]));
    }
}

run();
