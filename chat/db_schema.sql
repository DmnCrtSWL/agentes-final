CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo TEXT,
    resumen_medico TEXT,
    status VARCHAR(50) DEFAULT 'confirmada', -- confirmada, cancelada, completada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción para asegurar que haya al menos un medio de contacto
    CONSTRAINT contacto_requerido CHECK (telefono IS NOT NULL OR email IS NOT NULL)
);

-- Índices para búsquedas rápidas por fecha (útil para el calendario)
CREATE INDEX idx_citas_fecha ON citas(fecha_hora);
