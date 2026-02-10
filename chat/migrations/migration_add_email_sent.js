const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const runMigration = async () => {
    try {
        console.log('⏳ Iniciando migración: Agregar columna email_sent...');

        await pool.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
        `);

        // Opcional: Marcar citas viejas como "ya enviadas" para no spammear.
        // Si prefieres que intente enviar a las de hoy, comenta esto.
        // Pero por seguridad, mejor asumimos que lo histórico ya pasó.
        await pool.query(`
            UPDATE citas SET email_sent = TRUE WHERE created_at < NOW() - INTERVAL '1 hour';
        `);

        console.log('✅ Columna email_sent agregada exitosamente.');
    } catch (err) {
        console.error('❌ Error en migración:', err);
    } finally {
        await pool.end();
    }
};

runMigration();
