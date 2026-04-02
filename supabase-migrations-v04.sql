-- LUMEN v0.4 — Migraciones de base de datos
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)

-- =============================================
-- Feature 2: Favoritos (verificar que existe)
-- =============================================
CREATE TABLE IF NOT EXISTS favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recurso_id uuid REFERENCES recursos ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recurso_id)
);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gestionan sus favoritos" ON favoritos
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- Feature 4: Historial de descargas
-- =============================================
CREATE TABLE IF NOT EXISTS historial_descargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recurso_id uuid REFERENCES recursos ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historial_descargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su historial" ON historial_descargas
  FOR ALL USING (user_id = auth.uid());

-- Función para incrementar descargas (atómica)
CREATE OR REPLACE FUNCTION incrementar_descargas(p_recurso_id uuid)
RETURNS void AS $$
  UPDATE recursos SET descargas = descargas + 1 WHERE id = p_recurso_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Feature 6: Solicitudes
-- =============================================
CREATE TABLE IF NOT EXISTS solicitudes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  autor_nombre text,
  descripcion text NOT NULL,
  grado text,
  eje_tematico text,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios crean solicitudes" ON solicitudes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios ven sus solicitudes" ON solicitudes
  FOR SELECT USING (user_id = auth.uid());

-- TODO: agregar policy para admin cuando se implemente el dashboard

-- =============================================
-- Feature 7: Campo last_seen_at en perfiles
-- =============================================
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- =============================================
-- Feature 10: Colecciones (para cuando se implemente)
-- =============================================
CREATE TABLE IF NOT EXISTS colecciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  color text DEFAULT '#1A3A5C',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coleccion_recursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coleccion_id uuid REFERENCES colecciones ON DELETE CASCADE,
  recurso_id uuid REFERENCES recursos ON DELETE CASCADE,
  orden int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coleccion_id, recurso_id)
);

ALTER TABLE colecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_colecciones" ON colecciones
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_coleccion_recursos" ON coleccion_recursos
  FOR ALL USING (
    coleccion_id IN (SELECT id FROM colecciones WHERE user_id = auth.uid())
  );
