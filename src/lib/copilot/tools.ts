import { z } from 'zod'
import type Anthropic from '@anthropic-ai/sdk'
import {
  AdaptedResourceSchema,
  SimilarActivitySchema,
  EvaluationMaterialSchema,
  ImplementationGuideSchema,
} from '@/types/copilot'

// Versión "para el modelo": sin `meta` (lo agrega el servidor).
// El modelo solo genera el contenido pedagógico, no la trazabilidad.
const AdaptedResourceToolSchema     = AdaptedResourceSchema.omit({ meta: true })
const SimilarActivityToolSchema     = SimilarActivitySchema.omit({ meta: true })
const EvaluationMaterialToolSchema  = EvaluationMaterialSchema.omit({ meta: true })
const ImplementationGuideToolSchema = ImplementationGuideSchema.omit({ meta: true })

const SimilarActivityListSchema = z.object({
  actividades: z.array(SimilarActivityToolSchema),
})

// Helper: zod → JSON schema con la forma que necesita Anthropic
function toAnthropicInputSchema(schema: z.ZodType): Anthropic.Tool.InputSchema {
  const json = z.toJSONSchema(schema, { target: 'draft-7' }) as Record<string, unknown>
  return {
    type:       'object',
    properties: json.properties as Record<string, unknown>,
    ...(json.required ? { required: json.required as string[] } : {}),
  }
}

export const adaptTool: Anthropic.Tool = {
  name:         'devolver_recurso_adaptado',
  description:  'Devuelve el recurso pedagógico adaptado según los ejes solicitados por la docente.',
  input_schema: toAnthropicInputSchema(AdaptedResourceToolSchema),
}

export const similarTool: Anthropic.Tool = {
  name:         'devolver_actividades_similares',
  description:  'Devuelve una o más actividades nuevas inspiradas en el recurso fuente.',
  input_schema: toAnthropicInputSchema(SimilarActivityListSchema),
}

export const evaluateTool: Anthropic.Tool = {
  name:         'devolver_material_evaluacion',
  description:  'Devuelve el instrumento de evaluación según el tipo solicitado.',
  input_schema: toAnthropicInputSchema(EvaluationMaterialToolSchema),
}

export const guideTool: Anthropic.Tool = {
  name:         'devolver_guia_implementacion',
  description:  'Devuelve la guía práctica para implementar el recurso en el aula.',
  input_schema: toAnthropicInputSchema(ImplementationGuideToolSchema),
}

export const toolSchemas = {
  adapt:    AdaptedResourceToolSchema,
  similar:  SimilarActivityListSchema,
  evaluate: EvaluationMaterialToolSchema,
  guide:    ImplementationGuideToolSchema,
} as const

export const toolsBySlug = {
  adapt:    adaptTool,
  similar:  similarTool,
  evaluate: evaluateTool,
  guide:    guideTool,
} as const
