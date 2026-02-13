-- Agregar columna email a la tabla quotes
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
