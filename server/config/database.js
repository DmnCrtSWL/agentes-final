import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Configuración de la Base de Datos (Neon Postgres)
console.log("Intentando conectar a DB con URL:", process.env.DATABASE_URL ? "URL encontrada (oculta por seguridad)" : "URL NO ENCONTRADA - Usando localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test de conexión
pool.on("connect", () => {
  console.log("✅ Conectado a la base de datos PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en la base de datos:", err);
});

export default pool;
