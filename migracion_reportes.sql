-- Agregar columna prioridad a reportes_trabajador (ejecutar una sola vez en pgAdmin)
ALTER TABLE reportes_trabajador
  ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Baja';

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reportes_trabajador'
ORDER BY ordinal_position;
