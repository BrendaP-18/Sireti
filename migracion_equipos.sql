-- =============================================
-- SIRETI — Migración: columnas extras en equipos
-- Ejecutar en PostgreSQL una sola vez
-- =============================================

-- Agregar columnas procesador y almacenamiento a equipos
ALTER TABLE equipos
  ADD COLUMN IF NOT EXISTS procesador    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS almacenamiento VARCHAR(100);

-- Verificar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'equipos'
ORDER BY ordinal_position;
