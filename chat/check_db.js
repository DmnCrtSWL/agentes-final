
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

async function checkDb() {
    try {
        console.log("Checking table columns...");
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'citas';
        `);
        console.log("Columns:", columns.rows.map(r => r.column_name));

        console.log("\nChecking pending confirmations (email_sent = false or null)...");
        // Check if email_sent column exists first to avoid error if I'm wrong about schema drift
        const hasEmailSent = columns.rows.some(r => r.column_name === 'email_sent');

        if (hasEmailSent) {
            const pending = await pool.query(`
                SELECT id, paciente_nombre, email, fecha_hora, email_sent, status
                FROM citas 
                WHERE (email_sent IS FALSE OR email_sent IS NULL)
                AND email IS NOT NULL
                ORDER BY id DESC;
            `);
            console.log("Pending Confirmations:", pending.rows);
        } else {
            console.log("Column 'email_sent' does not exist!");
        }

        console.log("\nChecking all recent appointments...");
        const recent = await pool.query(`
            SELECT id, paciente_nombre, email, fecha_hora, status
            FROM citas 
            ORDER BY id DESC
            LIMIT 5;
        `);
        console.log("Recent Appointments:", recent.rows);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkDb();
