import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// Ruta: Obtener citas activas (no canceladas)
router.get("/citas", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE status != 'cancelled' AND status != 'cancelada' ORDER BY date ASC, time ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error ejecutando query:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener citas" });
  }
});

// Ruta: Obtener citas canceladas
router.get("/cancelaciones", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE status = 'cancelled' OR status = 'cancelada' ORDER BY deleted_at DESC, date ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error ejecutando query:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener cancelaciones" });
  }
});

// Ruta: Crear nueva cita
router.post("/citas", async (req, res) => {
  // Nota: El frontend actual envía fecha_hora junto, habría que separarlo si se usa este endpoint
  // Por ahora adaptamos para recibir los campos separados si es posible, o parsear fecha_hora
  const { paciente_nombre, telefono, email, fecha_hora, motivo } = req.body;

  // TODO: Ajustar lógica de creación si se usa desde el admin/chat activamente
  // Por ahora nos enfocamos en lectura para el admin dash

  // Fallback simple por si se usa
  try {
    let dateVal, timeVal;
    if (fecha_hora) {
      const d = new Date(fecha_hora);
      dateVal = d.toISOString().split("T")[0];
      timeVal = d.toLocaleTimeString("es-MX", { hour12: false });
    }

    const result = await pool.query(
      `INSERT INTO appointments (name, phone, email, date, time, reason, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') 
             RETURNING *`,
      [paciente_nombre, telefono, email, dateVal, timeVal, motivo],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando cita:", err);
    res.status(500).json({ error: "Error al crear la cita" });
  }
});

// Ruta: Actualizar estado de una cita o sus detalles
router.put("/citas/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, reason } = req.body;

  try {
    let queryText = "UPDATE appointments SET ";
    let queryParams = [];
    let updateFields = [];
    let paramCount = 1;

    if (date) {
      updateFields.push(`date = $${paramCount}`);
      queryParams.push(date);
      paramCount++;
    }
    if (time) {
      updateFields.push(`time = $${paramCount}`);
      queryParams.push(time);
      paramCount++;
    }
    if (reason) {
      updateFields.push(`reason = $${paramCount}`);
      queryParams.push(reason);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ error: "No se enviaron campos para actualizar" });
    }

    queryText +=
      updateFields.join(", ") + ` WHERE id = $${paramCount} RETURNING *`;
    queryParams.push(id);

    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando cita:", err);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
});

// Ruta: Actualizar estado de una cita (cancelar/confirmar)
router.put("/citas/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Mapear status del admin ('cancelada') al de la DB (probablemente 'cancelled' o 'confirmed')
    let dbStatus = status;
    if (status === "cancelada") dbStatus = "cancelled";
    if (status === "confirmada") dbStatus = "confirmed";

    let queryText =
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *";
    let queryParams = [dbStatus, id];

    if (dbStatus === "cancelled") {
      queryText =
        "UPDATE appointments SET status = $1, deleted_at = NOW() WHERE id = $2 RETURNING *";
    }

    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando cita:", err);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
});

export default router;
