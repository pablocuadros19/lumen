import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/copilot/prompt-builder'
import { toolsBySlug, toolSchemas } from '@/lib/copilot/tools'
import type {
  PromptTemplate,
  AiGenerationInsert,
  CopilotOutputMeta,
  DuaLevel,
} from '@/types/copilot'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const RATE_LIMIT_PER_DAY = 20

export type CopilotSlug = keyof typeof toolsBySlug

export interface RunResult<T> {
  ok:   true
  data: T
  meta: CopilotOutputMeta
}

export interface RunError {
  ok:     false
  status: number
  error:  string
}

interface RunParams {
  slug:               CopilotSlug
  sourceResourceId:   string
  duaLevel?:          DuaLevel
  inputParams:        Record<string, unknown>
  userMessage:        string
}

// Orquesta una llamada al copiloto con outputs estructurados.
// - Valida auth, rate limit, recurso fuente, prompt template
// - Llama al modelo con tool use forzado
// - Valida el output con Zod
// - Si el output no valida, reintenta 1 vez con el error como feedback
// - Logea la generación
// - Devuelve el output con meta o un error tipado
export async function runCopilotFunction<T>(
  params: RunParams,
): Promise<RunResult<T> | RunError> {
  const { slug, sourceResourceId, duaLevel = 'estandar', inputParams, userMessage } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: 'No autenticado' }

  // Rate limit
  const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('ai_generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', hace24hs)

  if ((count ?? 0) >= RATE_LIMIT_PER_DAY) {
    return {
      ok:     false,
      status: 429,
      error:  `Límite diario alcanzado (${RATE_LIMIT_PER_DAY} generaciones por día). Intentá mañana.`,
    }
  }

  // Prompt template
  const { data: template } = await supabase
    .from('prompt_templates')
    .select('id, slug, function, version, layer_pedagogy, layer_task, output_schema_slug, model')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!template) return { ok: false, status: 400, error: 'Acción no reconocida' }

  // Recurso fuente
  const { data: recurso } = await supabase
    .from('recursos')
    .select('id, titulo, resumen, texto_extraido, eje_tematico, grados, tipo_recurso, areas, area')
    .eq('id', sourceResourceId)
    .single()

  if (!recurso) return { ok: false, status: 404, error: 'Recurso no encontrado' }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(template as PromptTemplate, {
    titulo:         recurso.titulo,
    resumen:        recurso.resumen ?? undefined,
    grados:         recurso.grados ?? undefined,
    eje_tematico:   recurso.eje_tematico ?? undefined,
    tipo_recurso:   recurso.tipo_recurso ?? undefined,
    texto_extraido: recurso.texto_extraido ?? undefined,
  })

  const tool   = toolsBySlug[slug]
  const schema = toolSchemas[slug] as z.ZodTypeAny

  // Llamada con tool use forzado + reintento si no valida
  const inicio = Date.now()
  let parsed: unknown
  let lastError: string | null = null
  let tokensIn = 0
  let tokensOut = 0
  let attempt = 0
  const MAX_ATTEMPTS = 2

  while (attempt < MAX_ATTEMPTS) {
    attempt++
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: userMessage + '\n\nParámetros: ' + JSON.stringify(inputParams) },
    ]
    if (lastError) {
      messages.push({
        role:    'user',
        content: `El último output no validó. Error: ${lastError}\n\nIntentá de nuevo respetando exactamente el schema de la tool.`,
      })
    }

    let message: Anthropic.Message
    try {
      message = await anthropic.messages.create({
        model:       template.model,
        max_tokens:  4096,
        tools:       [tool],
        tool_choice: { type: 'tool', name: tool.name },
        system:      systemPrompt,
        messages,
      })
    } catch (err) {
      console.error('[copilot runner] anthropic error:', err)
      return { ok: false, status: 502, error: 'Error llamando al modelo' }
    }

    tokensIn  += message.usage.input_tokens
    tokensOut += message.usage.output_tokens

    const toolUseBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )
    if (!toolUseBlock) {
      lastError = 'El modelo no llamó a la tool'
      continue
    }

    const validation = schema.safeParse(toolUseBlock.input)
    if (validation.success) {
      parsed = validation.data
      lastError = null
      break
    }

    lastError = JSON.stringify(validation.error.issues.slice(0, 3))
    console.warn('[copilot runner] validación falló (intento', attempt, '):', lastError)
  }

  const duracion = Date.now() - inicio

  if (lastError) {
    return { ok: false, status: 502, error: `El modelo no devolvió output válido tras ${MAX_ATTEMPTS} intentos` }
  }

  // Logging
  const generationInsert: AiGenerationInsert = {
    user_id:            user.id,
    prompt_template_id: template.id,
    function:           template.function,
    slug,
    source_resource_id: sourceResourceId,
    dua_level:          duaLevel,
    input_params:       inputParams,
    output_json:        parsed as Record<string, unknown>,
    model:              template.model,
    tokens_input:       tokensIn,
    tokens_output:      tokensOut,
    duration_ms:        duracion,
  }

  const { data: gen } = await supabase
    .from('ai_generations')
    .insert(generationInsert)
    .select('id')
    .single()

  const meta: CopilotOutputMeta = {
    generation_id:      gen?.id ?? '',
    prompt_template_id: template.id,
    prompt_version:     template.version,
    generated_at:       new Date().toISOString(),
    source_resource_id: sourceResourceId,
    dua_level:          duaLevel,
    model:              template.model,
  }

  return { ok: true, data: parsed as T, meta }
}
