import postgres from 'postgres';
import { readFileSync } from 'fs';

const connectionString = 'postgresql://postgres.jjljpplzszeypsjxdsxy:supabase_themixa2026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function run() {
    try {
        const query = readFileSync('scripts/044_offline_jurimetrics.sql', 'utf8');
        await sql.unsafe(query);
        console.log('Script 044 executed successfully');
    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        await sql.end();
    }
}

run();
