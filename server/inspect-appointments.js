import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_aclJYNkAe8C5@ep-withered-grass-ahonh5wg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function inspectAppointments() {
  try {
    console.log('📊 Inspeccionando tabla appointments...\n');
    
    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      ORDER BY ordinal_position
    `;
    
    const structure = await pool.query(structureQuery);
    console.log('=== ESTRUCTURA DE LA TABLA ===');
    console.table(structure.rows);
    
    // Get sample data
    const dataQuery = 'SELECT * FROM appointments LIMIT 3';
    const data = await pool.query(dataQuery);
    console.log('\n=== DATOS DE EJEMPLO ===');
    console.log(JSON.stringify(data.rows, null, 2));
    
    // Get status values
    const statusQuery = 'SELECT DISTINCT status FROM appointments';
    const statuses = await pool.query(statusQuery);
    console.log('\n=== VALORES DE STATUS ===');
    console.log(statuses.rows.map(r => r.status));
    
    // Count by status
    const countQuery = 'SELECT status, COUNT(*) as count FROM appointments GROUP BY status';
    const counts = await pool.query(countQuery);
    console.log('\n=== CONTEO POR STATUS ===');
    console.table(counts.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

inspectAppointments();
