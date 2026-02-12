import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// Ruta: Obtener cotizaciones activas
router.get("/cotizaciones", async (req, res) => {
  try {
    // Por ahora, usamos datos de prueba ya que la tabla cotizaciones no existe
    // TODO: Crear tabla cotizaciones en la base de datos
    const mockData = [
      {
        id: 1,
        paciente: "María González",
        procedimiento: "Ortodoncia Completa",
        fecha: "2026-02-15",
        monto: 15000,
        status: "active"
      },
      {
        id: 2,
        paciente: "Juan Pérez",
        procedimiento: "Implante Dental",
        fecha: "2026-02-18",
        monto: 25000,
        status: "active"
      },
      {
        id: 3,
        paciente: "Ana Martínez",
        procedimiento: "Blanqueamiento Dental",
        fecha: "2026-02-20",
        monto: 3500,
        status: "active"
      }
    ];

    res.json(mockData);
    
    // Cuando la tabla exista, usar:
    // const result = await pool.query(
    //   "SELECT * FROM cotizaciones WHERE status = 'active' ORDER BY fecha ASC"
    // );
    // res.json(result.rows);
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
    // Mock data
    const mockData = {
      id: parseInt(id),
      paciente: "María González",
      procedimiento: "Ortodoncia Completa",
      fecha: "2026-02-15",
      monto: 15000,
      status: "active",
      detalles: "Ortodoncia completa con brackets metálicos"
    };

    res.json(mockData);
  } catch (err) {
    console.error("Error ejecutando query:", err);
    res.status(500).json({ error: "Error al obtener la cotización" });
  }
});

// Ruta: Crear nueva cotización
router.post("/cotizaciones", async (req, res) => {
  const { paciente, procedimiento, fecha, monto } = req.body;

  try {
    // Mock response
    const newQuote = {
      id: Date.now(),
      paciente,
      procedimiento,
      fecha,
      monto,
      status: "active"
    };

    res.status(201).json(newQuote);
    
    // Cuando la tabla exista, usar:
    // const result = await pool.query(
    //   `INSERT INTO cotizaciones (paciente, procedimiento, fecha, monto, status) 
    //    VALUES ($1, $2, $3, $4, 'active') 
    //    RETURNING *`,
    //   [paciente, procedimiento, fecha, monto]
    // );
    // res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creando cotización:", err);
    res.status(500).json({ error: "Error al crear la cotización" });
  }
});

// Ruta: Actualizar cotización
router.put("/cotizaciones/:id", async (req, res) => {
  const { id } = req.params;
  const { paciente, procedimiento, fecha, monto } = req.body;

  try {
    // Mock response
    const updatedQuote = {
      id: parseInt(id),
      paciente,
      procedimiento,
      fecha,
      monto,
      status: "active"
    };

    res.json(updatedQuote);
  } catch (err) {
    console.error("Error actualizando cotización:", err);
    res.status(500).json({ error: "Error al actualizar la cotización" });
  }
});

// Ruta: Eliminar cotización
router.delete("/cotizaciones/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Mock response
    res.json({ message: "Cotización eliminada exitosamente", id: parseInt(id) });
    
    // Cuando la tabla exista, usar:
    // const result = await pool.query(
    //   "DELETE FROM cotizaciones WHERE id = $1 RETURNING *",
    //   [id]
    // );
    // 
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: "Cotización no encontrada" });
    // }
    // 
    // res.json({ message: "Cotización eliminada", data: result.rows[0] });
  } catch (err) {
    console.error("Error eliminando cotización:", err);
    res.status(500).json({ error: "Error al eliminar la cotización" });
  }
});

export default router;
