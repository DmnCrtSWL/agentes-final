import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const { Pool } = pg;

// Configuración de la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
        rejectUnauthorized: false
    }
});

async function addEmailColumn() {
    console.log('🔧 Agregando columna email a tabla quotes...\n');

    try {
        // Test connection
        console.log('📡 Probando conexión a la base de datos...');
        const client = await pool.connect();
        console.log('✅ Conexión exitosa\n');

        // Read migration file
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const migrationPath = join(__dirname, 'migrations', '003_add_email_to_quotes.sql');
        
        console.log('📄 Leyendo archivo de migración...');
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Execute migration
        console.log('⚙️ Ejecutando migración...');
        await client.query(migrationSQL);
        console.log('✅ Migración completada\n');

        // Verify column exists
        console.log('🔍 Verificando columna "email" en tabla "quotes"...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'quotes'
            ORDER BY ordinal_position;
        `);

        if (result.rows.length > 0) {
            console.log('✅ Tabla "quotes" actualizada correctamente\n');
            console.log('📋 Columnas:');
            result.rows.forEach(col => {
                const highlight = col.column_name === 'email' ? ' ⭐ NUEVA' : '';
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- REQUIRED' : ''}${highlight}`);
            });
        } else {
            console.log('❌ No se pudo verificar la tabla');
        }

        client.release();
        console.log('\n✨ Migración completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.error('\n💡 Asegúrate de que:');
        console.error('   1. DATABASE_URL está configurado en .env');
        console.error('   2. La base de datos está accesible');
        console.error('   3. Tienes permisos para modificar tablas');
    } finally {
        await pool.end();
    }
}

addEmailColumn();
