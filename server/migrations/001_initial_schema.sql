CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    paciente_nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo TEXT,
    resumen_medico TEXT,
    status VARCHAR(50) DEFAULT 'confirmada',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT contacto_requerido CHECK (telefono IS NOT NULL OR email IS NOT NULL)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_status ON citas(status);
