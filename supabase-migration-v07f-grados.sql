-- LUMEN v0.7f — Corrección: primaria llega hasta 6° grado, no 7°
-- Ejecutar DESPUÉS de v07, v07b, v07c, v07d, v07e. Idempotente.
--
-- Reemplaza "1 a 7" por "1 a 6" en los prompts de adapt, similar y evaluate
-- para que el modelo no genere adaptaciones a un grado inexistente.

update prompt_templates
set layer_task = replace(layer_task, '1 a 7', '1 a 6')
where slug in ('adapt', 'similar', 'evaluate', 'guide')
  and layer_task like '%1 a 7%';
