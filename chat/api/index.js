import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const { Pool } = pg;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la Base de Datos (Neon Postgres)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Configuración de Email (Nodemailer - IONOS)
const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.com',
    port: 587,
    secure: false, // false para puerto 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Funciones Auxiliares ---

const sendConfirmationEmail = async (to, cita) => {
    if (!process.env.EMAIL_USER) {
        console.warn('⚠️ EMAIL_USER no configurado. Saltando envío de correo.');
        return;
    }

    // const fechaFormat = new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    const mailOptions = {
        from: `"Clínica Dr. Quiroz" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '📅 Confirmación de tu Cita Médica',
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 30px 20px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; line-height: 60px; font-size: 30px;">
                        📅
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">¡Cita Confirmada!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Tu salud está en buenas manos</p>
                </div>
                <div style="padding: 30px; color: #444444;">
                    <p style="margin-bottom: 20px; font-size: 16px;">Hola <strong>${cita.paciente_nombre}</strong>,</p>
                    <p style="margin-bottom: 25px; line-height: 1.6; color: #555;">Nos complace confirmarte que tu cita ha sido agendada exitosamente en nuestro sistema.</p>
                    
                    <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555; width: 30%;"><strong>🗓️ Fecha:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111; font-weight: 600;">${new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>⏰ Hora:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #0d9488; font-weight: 700;">${new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>🩺 Motivo:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111;">${cita.motivo || 'Consulta General'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>👨‍⚕️ Doctor:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111;">Dr. Rubén Quiroz</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-weight: 600; color: #334155;">Clínica de Cardiología - Dr. Rubén Quiroz</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Correo enviado a ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        return false;
    }
};

const sendReminderEmail = async (to, cita) => {
    if (!process.env.EMAIL_USER) return;

    // const fechaFormat = new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const frontendUrl = process.env.FRONTEND_URL || 'https://agentes-theta.vercel.app';
    const confirmLink = `${frontendUrl}/?confirmar_id=${cita.id}`;

    const mailOptions = {
        from: `"Clínica Dr. Quiroz" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '⏰ Recordatorio: Tu cita es en 48 horas - ¡Confirma tu asistencia!',
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0;">
                <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px 20px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; line-height: 60px; font-size: 30px;">
                        ⏰
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Recordatorio de Cita</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Faltan poco menos de 48 horas</p>
                </div>
                <div style="padding: 30px; color: #444444;">
                    <p style="margin-bottom: 20px; font-size: 16px;">Hola <strong>${cita.paciente_nombre}</strong>,</p>
                    <p style="margin-bottom: 25px; line-height: 1.6; color: #555;">Este es un recordatorio amable de que tienes una cita programada con nosotros próximamente.</p>
                    
                    <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555; width: 30%;"><strong>🗓️ Fecha:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111; font-weight: 600;">${new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>⏰ Hora:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #d97706; font-weight: 700;">${new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>👨‍⚕️ Doctor:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111;">Dr. Rubén Quiroz</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                         <p style="font-size: 16px; color: #333; margin-bottom: 15px;"><strong>¿Podrás asistir?</strong></p>
                         <a href="${confirmLink}" style="background-color: #d97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(217, 119, 6, 0.3);">✅ CONFIRMAR SI ASISTIRÉ</a>
                    </div>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-weight: 600; color: #334155;">Clínica de Cardiología - Dr. Rubén Quiroz</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Correo enviado a ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        return false;
    }
};


// --- Rutas ---

// Ruta: Obtener citas activas (no canceladas)
app.get('/api/citas', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM citas WHERE status != 'cancelada' ORDER BY fecha_hora ASC");
        res.json(result.rows);
    } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener citas' });
    }
});

// Ruta: Obtener citas canceladas
app.get('/api/cancelaciones', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM citas WHERE status = 'cancelada' ORDER BY deleted_at DESC, fecha_hora ASC");
        res.json(result.rows);
    } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener cancelaciones' });
    }
});

// Ruta de prueba
app.get('/api', (req, res) => {
    res.send('API de Citas Médicas Funcionando 🚀');
});

// Ruta de DEBUG para probar envío de correos
app.get('/api/debug/email', async (req, res) => {
    const testEmail = req.query.to || process.env.EMAIL_USER; // Enviar a sí mismo por defecto
    if (!testEmail) return res.status(400).json({ error: 'Falta parámetro ?to=email' });

    try {
        const info = await transporter.sendMail({
            from: `"Test Debug" <${process.env.EMAIL_USER}>`,
            to: testEmail,
            subject: '🧪 Test de Correo Vercel',
            text: 'Si ves esto, el envío de correos funciona correctamente desde Vercel.',
            html: '<b>Si ves esto, el envío de correos funciona correctamente desde Vercel.</b>'
        });
        res.json({ success: true, messageId: info.messageId, accepted: info.accepted });
    } catch (error) {
        console.error('Debug Email Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            config: {
                host: 'smtp.ionos.com',
                port: 587,
                user: process.env.EMAIL_USER ? 'Configurado' : 'Faltante',
                pass: process.env.EMAIL_PASS ? 'Configurado' : 'Faltante'
            }
        });
    }
});

// Ruta: Actualizar estado de una cita
app.put('/api/citas/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        let queryText = 'UPDATE citas SET status = $1 WHERE id = $2 RETURNING *';
        let queryParams = [status, id];

        if (status === 'cancelada') {
            queryText = 'UPDATE citas SET status = $1, deleted_at = NOW() WHERE id = $2 RETURNING *';
        } else if (status === 'confirmada') {
            queryText = 'UPDATE citas SET status = $1, deleted_at = NULL WHERE id = $2 RETURNING *';
        }

        const result = await pool.query(queryText, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando cita:', err);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
});

// Ruta: Crear nueva cita (Incluye envío de correo)
app.post('/api/citas', async (req, res) => {
    const { paciente_nombre, telefono, email, fecha_hora, motivo } = req.body;

    if (!paciente_nombre || !fecha_hora) {
        return res.status(400).json({ error: 'Nombre y fecha fecha_hora son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO citas (paciente_nombre, telefono, email, fecha_hora, motivo, email_sent) 
             VALUES ($1, $2, $3, $4, $5, FALSE) 
             RETURNING *`,
            [paciente_nombre, telefono, email, fecha_hora, motivo]
        );

        const nuevaCita = result.rows[0];
        console.log('✅ Cita creada en DB:', nuevaCita.id);

        if (email) {
            const sent = await sendConfirmationEmail(email, nuevaCita);
            if (sent) {
                await pool.query('UPDATE citas SET email_sent = TRUE WHERE id = $1', [nuevaCita.id]);
            }
        }

        res.status(201).json(nuevaCita);
    } catch (err) {
        console.error('Error creando cita:', err);
        res.status(500).json({ error: 'Error al crear la cita' });
    }
});


// ---------------------------------------------------------
// PROCESADOR DE CORREOS PENDIENTES
// ---------------------------------------------------------
const processPendingEmails = async () => {
    console.log('🔄 Ejecutando Job de Correos...');
    try {
        // 1. Confirmaciones pendientes
        const confirmaciones = await pool.query(`
            SELECT * FROM citas 
            WHERE email IS NOT NULL 
            AND email_sent = FALSE 
            AND status != 'cancelada'
            LIMIT 10
        `);

        if (confirmaciones.rows.length > 0) {
            console.log(`📬 Enviando ${confirmaciones.rows.length} confirmaciones...`);
            for (const cita of confirmaciones.rows) {
                const sent = await sendConfirmationEmail(cita.email, cita);
                if (sent) {
                    await pool.query('UPDATE citas SET email_sent = TRUE WHERE id = $1', [cita.id]);
                }
                console.log(`✅ Confirmación procesada para Cita #${cita.id} (Enviado: ${sent})`);
            }
        }

        // 2. Recordatorios de 48 horas
        const recordatorios = await pool.query(`
            SELECT * FROM citas 
            WHERE email IS NOT NULL 
            AND reminder_sent = FALSE 
            AND status != 'cancelada'
            AND fecha_hora <= NOW() + INTERVAL '48 hours'
            AND fecha_hora > NOW()
            LIMIT 10
        `);

        if (recordatorios.rows.length > 0) {
            console.log(`⏰ Enviando ${recordatorios.rows.length} recordatorios de 48h...`);
            for (const cita of recordatorios.rows) {
                const sent = await sendReminderEmail(cita.email, cita);
                if (sent) {
                    await pool.query('UPDATE citas SET reminder_sent = TRUE WHERE id = $1', [cita.id]);
                }
                console.log(`✅ Recordatorio procesado para Cita #${cita.id} (Enviado: ${sent})`);
            }
        }

        if (confirmaciones.rows.length === 0 && recordatorios.rows.length === 0) {
            console.log('📭 No hay correos pendientes.');
        }

        return {
            confirmaciones: confirmaciones.rows.length,
            recordatorios: recordatorios.rows.length
        };

    } catch (error) {
        console.error('❌ Error en Job:', error);
        return { error: error.message };
    }
};

// Endpoint Cron (Para llamar desde Vercel Cron o externo)
app.get('/api/cron/process-emails', async (req, res) => {
    const result = await processPendingEmails();
    res.json(result);
});

// Exportar app para Vercel
export default app;

// Soporte para ejecución local (node api/index.js)
// Verifica si este archivo es el punto de entrada principal
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Backend unificado corriendo en http://localhost:${port}`);
        // Iniciar cron localmente también
        setInterval(processPendingEmails, 10 * 60 * 1000);
        processPendingEmails();
    });
}
