const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const runMigration = async () => {
    try {
        console.log('⏳ Iniciando migración: Agregar columna reminder_sent...');

        await pool.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
        `);

        // Opcional: Marcar citas viejas o muy próximas (< 2 horas) como "ya enviadas" si no queremos mandarlas de golpe?
        // Mejor lo dejamos limpio, el cron se encargará.

        console.log('✅ Columna reminder_sent agregada exitosamente.');
    } catch (err) {
        console.error('❌ Error en migración:', err);
    } finally {
        await pool.end();
    }
};

runMigration();
