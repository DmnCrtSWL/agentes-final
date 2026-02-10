import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    console.log('🔧 Iniciando configuración de base de datos...\n');

    try {
        // Test connection
        console.log('📡 Probando conexión a la base de datos...');
        const client = await pool.connect();
        console.log('✅ Conexión exitosa\n');

        // Read migration file
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const migrationPath = join(__dirname, 'migrations', '001_initial_schema.sql');
        
        console.log('📄 Leyendo archivo de migración...');
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Execute migration
        console.log('⚙️ Ejecutando migración...');
        await client.query(migrationSQL);
        console.log('✅ Migración completada\n');

        // Verify table exists
        console.log('🔍 Verificando tabla "citas"...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'citas'
            ORDER BY ordinal_position;
        `);

        if (result.rows.length > 0) {
            console.log('✅ Tabla "citas" creada correctamente\n');
            console.log('📋 Columnas:');
            result.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- REQUIRED' : ''}`);
            });
        } else {
            console.log('❌ No se pudo verificar la tabla');
        }

        client.release();
        console.log('\n✨ Configuración de base de datos completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la configuración:', error.message);
        console.error('\n💡 Asegúrate de que:');
        console.error('   1. DATABASE_URL está configurado en .env');
        console.error('   2. La base de datos está accesible');
        console.error('   3. Tienes permisos para crear tablas');
    } finally {
        await pool.end();
    }
}

setupDatabase();
