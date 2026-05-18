// Helpers para extraer info de display de una ai_generations row,
// sin tipar el output_json completo (es jsonb).

import type { CopilotFunction } from '@/types/copilot'

interface GenerationRow {
  id:           string
  function:     CopilotFunction
  slug:         string
  output_json:  Record<string, unknown> | null
  created_at:   string
}

const FUNCTION_LABEL: Record<CopilotFunction, string> = {
  adapt_resource:              'Adaptación',
  create_similar_activity:     'Actividad similar',
  create_evaluation:           'Evaluación',
  create_implementation_guide: 'Guía',
}

export function funcionLabel(fn: CopilotFunction): string {
  return FUNCTION_LABEL[fn] ?? fn
}

// Saca un título legible de la generación según su forma
export function tituloDe(gen: GenerationRow): string {
  const o = gen.output_json
  if (!o) return 'Generación sin título'

  if (gen.function === 'create_similar_activity') {
    // similar = { actividades: [{ titulo, ... }, ...] }
    const acts = (o as { actividades?: Array<{ titulo?: string }> }).actividades
    if (acts && acts.length > 0) {
      const primero = acts[0].titulo ?? 'Actividad'
      return acts.length > 1 ? `${primero} (+${acts.length - 1})` : primero
    }
  }

  if (gen.function === 'create_implementation_guide') {
    return 'Guía para implementar'
  }

  // adapt y evaluate: { titulo: string }
  const t = (o as { titulo?: string }).titulo
  if (t) return t

  return funcionLabel(gen.function)
}

// Función → key del frontend para construir URLs y elegir viewer
export function functionToKey(fn: CopilotFunction): 'adapt' | 'similar' | 'evaluate' | 'guide' {
  const map: Record<CopilotFunction, 'adapt' | 'similar' | 'evaluate' | 'guide'> = {
    adapt_resource:              'adapt',
    create_similar_activity:     'similar',
    create_evaluation:           'evaluate',
    create_implementation_guide: 'guide',
  }
  return map[fn]
}

// Construye el objeto data con meta que esperan los viewers, a partir de la row de DB
export function rehidratarData(gen: GenerationRow & { source_resource_id?: string | null }): unknown {
  const out = (gen.output_json ?? {}) as Record<string, unknown>
  return {
    ...out,
    meta: {
      generation_id:      gen.id,
      generated_at:       gen.created_at,
      source_resource_id: gen.source_resource_id ?? undefined,
    },
  }
}
