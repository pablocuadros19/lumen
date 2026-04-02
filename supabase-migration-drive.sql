-- LUMEN — Migración para Google Drive import
-- Ejecutar en Supabase SQL Editor

-- Columna para guardar el token de Google OAuth (necesario para Drive API)
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS google_token text;
