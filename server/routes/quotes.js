import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// Ruta: Obtener cotizaciones activas
router.get("/cotizaciones", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM quotes WHERE deleted_at IS NULL ORDER BY date ASC"
    );
    
    // Map database fields to frontend expected fields
    const quotes = result.rows.map(row => ({
      id: row.id,
      paciente: row.name,
      procedimiento: row.procedure,
      fecha: row.date,
      monto: parseFloat(row.amount),
      description: row.description,
      pdf_file: row.pdf_file,
      status: row.deleted_at ? 'deleted' : 'active',
      created_at: row.created_at,
      edited_at: row.edited_at
    }));

    res.json(quotes);
  } catch (err) {
    console.error("Error ejecutando query:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener cotizaciones" });
  }
});

// Ruta: Obtener una cotización por ID
router.get("/cotizaciones/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      "SELECT * FROM quotes WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const row = result.rows[0];
    const quote = {
      id: row.id,
      paciente: row.name,
      procedimiento: row.procedure,
      fecha: row.date,
      monto: parseFloat(row.amount),
      description: row.description,
      pdf_file: row.pdf_file,
      status: row.deleted_at ? 'deleted' : 'active',
      created_at: row.created_at,
      edited_at: row.edited_at
    };

    res.json(quote);
  } catch (err) {
    console.error("Error ejecutando query:", err);
    res.status(500).json({ error: "Error al obtener la cotización" });
  }
});

// Ruta: Crear nueva cotización
router.post("/cotizaciones", async (req, res) => {
  const { paciente, procedimiento, fecha, monto, description, pdf_file } = req.body;

  // Validate required fields
  if (!paciente || !procedimiento || !fecha || !monto) {
    return res.status(400).json({ 
      error: "Campos requeridos: paciente, procedimiento, fecha, monto" 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO quotes (name, procedure, amount, date, description, pdf_file) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [paciente, procedimiento, monto, fecha, description || null, pdf_file || null]
    );

    const row = result.rows[0];
    const newQuote = {
      id: row.id,
      paciente: row.name,
      procedimiento: row.procedure,
      fecha: row.date,
      monto: parseFloat(row.amount),
      description: row.description,
      pdf_file: row.pdf_file,
      status: 'active',
      created_at: row.created_at
    };

    res.status(201).json(newQuote);
  } catch (err) {
    console.error("Error creando cotización:", err);
    res.status(500).json({ error: "Error al crear la cotización" });
  }
});

// Ruta: Actualizar cotización
router.put("/cotizaciones/:id", async (req, res) => {
  const { id } = req.params;
  const { paciente, procedimiento, fecha, monto, description, pdf_file } = req.body;

  try {
    let queryText = "UPDATE quotes SET edited_at = NOW()";
    let queryParams = [];
    let paramCount = 1;

    if (paciente) {
      queryText += `, name = $${paramCount}`;
      queryParams.push(paciente);
      paramCount++;
    }
    if (procedimiento) {
      queryText += `, procedure = $${paramCount}`;
      queryParams.push(procedimiento);
      paramCount++;
    }
    if (fecha) {
      queryText += `, date = $${paramCount}`;
      queryParams.push(fecha);
      paramCount++;
    }
    if (monto !== undefined) {
      queryText += `, amount = $${paramCount}`;
      queryParams.push(monto);
      paramCount++;
    }
    if (description !== undefined) {
      queryText += `, description = $${paramCount}`;
      queryParams.push(description);
      paramCount++;
    }
    if (pdf_file !== undefined) {
      queryText += `, pdf_file = $${paramCount}`;
      queryParams.push(pdf_file);
      paramCount++;
    }

    queryText += ` WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`;
    queryParams.push(id);

    const result = await pool.query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const row = result.rows[0];
    const updatedQuote = {
      id: row.id,
      paciente: row.name,
      procedimiento: row.procedure,
      fecha: row.date,
      monto: parseFloat(row.amount),
      description: row.description,
      pdf_file: row.pdf_file,
      status: 'active',
      edited_at: row.edited_at
    };

    res.json(updatedQuote);
  } catch (err) {
    console.error("Error actualizando cotización:", err);
    res.status(500).json({ error: "Error al actualizar la cotización" });
  }
});

// Ruta: Eliminar cotización (soft delete)
router.delete("/cotizaciones/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE quotes SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }
    
    res.json({ message: "Cotización eliminada", id: parseInt(id) });
  } catch (err) {
    console.error("Error eliminando cotización:", err);
    res.status(500).json({ error: "Error al eliminar la cotización" });
  }
});

export default router;
