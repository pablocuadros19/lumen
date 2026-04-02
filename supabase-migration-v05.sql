-- LUMEN v0.5 — Efemérides + Colecciones compartidas
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)

-- =============================================
-- Feature: Efemérides escolares
-- =============================================
CREATE TABLE IF NOT EXISTS efemerides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  mes int NOT NULL CHECK (mes >= 1 AND mes <= 12),
  dia int NOT NULL CHECK (dia >= 1 AND dia <= 31),
  descripcion text
);

ALTER TABLE efemerides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven efemerides" ON efemerides FOR SELECT USING (true);

-- Vinculación recurso ↔ efeméride (muchos a muchos)
CREATE TABLE IF NOT EXISTS recurso_efemerides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recurso_id uuid NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
  efemeride_id uuid NOT NULL REFERENCES efemerides(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recurso_id, efemeride_id)
);

ALTER TABLE recurso_efemerides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven recurso_efemerides" ON recurso_efemerides FOR SELECT USING (true);
CREATE POLICY "Autenticados insertan recurso_efemerides" ON recurso_efemerides
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Autenticados borran recurso_efemerides" ON recurso_efemerides
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Efemérides escolares argentinas pre-cargadas
INSERT INTO efemerides (nombre, mes, dia, descripcion) VALUES
('Día de la Memoria', 3, 24, 'Día Nacional de la Memoria por la Verdad y la Justicia'),
('Día del Libro Infantil', 4, 2, 'Día Internacional del Libro Infantil y Juvenil'),
('Día del Libro', 4, 23, 'Día Mundial del Libro y del Derecho de Autor'),
('Revolución de Mayo', 5, 25, 'Aniversario de la Revolución de Mayo'),
('Día de la Bandera', 6, 20, 'Día de la Bandera Argentina'),
('Día de la Independencia', 7, 9, 'Declaración de la Independencia'),
('Día del Maestro', 9, 11, 'Homenaje a Domingo F. Sarmiento'),
('Día del Estudiante', 9, 21, 'Día del Estudiante y de la Primavera'),
('Maratón de Lectura', 9, 26, 'Maratón Nacional de Lectura'),
('Día de la Diversidad Cultural', 10, 12, 'Respeto por la diversidad cultural'),
('Día de la Tradición', 11, 10, 'Celebración de las tradiciones argentinas'),
('Día de los Derechos del Niño', 11, 20, 'Convención sobre los Derechos del Niño');


-- =============================================
-- Feature: Colecciones compartidas
-- =============================================
CREATE TABLE IF NOT EXISTS coleccion_colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coleccion_id uuid NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coleccion_id, user_id)
);

ALTER TABLE coleccion_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver colaboraciones" ON coleccion_colaboradores FOR SELECT USING (
  user_id = auth.uid()
  OR coleccion_id IN (SELECT id FROM colecciones WHERE user_id = auth.uid())
);

CREATE POLICY "Dueño gestiona colaboradores" ON coleccion_colaboradores
  FOR INSERT WITH CHECK (
    coleccion_id IN (SELECT id FROM colecciones WHERE user_id = auth.uid())
  );

CREATE POLICY "Dueño elimina colaboradores" ON coleccion_colaboradores
  FOR DELETE USING (
    coleccion_id IN (SELECT id FROM colecciones WHERE user_id = auth.uid())
  );

-- Actualizar RLS de colecciones: ahora incluye colaboradores
DROP POLICY IF EXISTS "own_colecciones" ON colecciones;
CREATE POLICY "own_or_shared_colecciones" ON colecciones FOR ALL USING (
  user_id = auth.uid()
  OR id IN (SELECT coleccion_id FROM coleccion_colaboradores WHERE user_id = auth.uid())
);

-- Actualizar RLS de coleccion_recursos: ahora incluye colaboradores
DROP POLICY IF EXISTS "own_coleccion_recursos" ON coleccion_recursos;
CREATE POLICY "own_or_shared_coleccion_recursos" ON coleccion_recursos FOR ALL USING (
  coleccion_id IN (SELECT id FROM colecciones WHERE user_id = auth.uid())
  OR coleccion_id IN (SELECT coleccion_id FROM coleccion_colaboradores WHERE user_id = auth.uid())
);
