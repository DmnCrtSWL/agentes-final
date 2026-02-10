const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aclJYNkAe8C5@ep-withered-grass-ahonh5wg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("Iniciando migración...");
        await pool.query('ALTER TABLE citas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;');
        console.log("Columna deleted_at agregada exitosamente.");
    } catch (err) {
        console.error("Error en la migración:", err);
    } finally {
        await pool.end();
    }
}

migrate();
