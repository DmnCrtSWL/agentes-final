import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function inspectDatabase() {
    console.log('🔍 Inspeccionando base de datos...');
    try {
        const client = await pool.connect();
        
        console.log('✅ Conexión exitosa');
        
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\n📋 Tablas encontradas:');
        if (res.rows.length === 0) {
            console.log('   (Ninguna tabla encontrada)');
        } else {
            res.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }
        
        client.release();
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

inspectDatabase();
