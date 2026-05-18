-- LUMEN v0.7g — Mi biblioteca: permite borrar generaciones propias
-- Ejecutar DESPUÉS de v07. Idempotente.

drop policy if exists "ai_gen_owner_delete" on ai_generations;
create policy "ai_gen_owner_delete" on ai_generations
  for delete using (auth.uid() = user_id);
