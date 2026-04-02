-- LUMEN v0.6 — Notas privadas + Index área
-- Ejecutar en Supabase SQL Editor

-- =============================================
-- Feature: Notas privadas por recurso
-- =============================================
CREATE TABLE IF NOT EXISTS notas_recurso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recurso_id uuid REFERENCES recursos ON DELETE CASCADE,
  contenido text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recurso_id)
);

ALTER TABLE notas_recurso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notas" ON notas_recurso
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- Index para queries por área (multi-área)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_recursos_area ON recursos (area);
