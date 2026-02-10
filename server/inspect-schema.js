import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function inspectSchema() {
    console.log('🔍 Inspeccionando esquema appointments...');
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'appointments'
        `);
        
        const lines = ['📋 Columnas de appointments:'];
        res.rows.forEach(row => {
            lines.push(`   - ${row.column_name} (${row.data_type})`);
        });
        fs.writeFileSync('schema.txt', lines.join('\n'));
        console.log('Schema saved to schema.txt');
    } catch(e) { console.error(e); }
    finally { client.release(); pool.end(); }
}
inspectSchema();
