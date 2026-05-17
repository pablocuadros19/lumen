import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/copilot/prompt-builder'
import type { PromptTemplate, AiGenerationInsert } from '@/types/copilot'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RATE_LIMIT_PER_DAY = 20

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    const { recurso_id, accion, grado_destino } = body as {
      recurso_id: string
      accion: string
      grado_destino?: string
    }

    if (!recurso_id || !accion) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    // Rate limit: máximo RATE_LIMIT_PER_DAY generaciones en las últimas 24hs
    const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: generacionesHoy } = await supabase
      .from('ai_generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', hace24hs)

    if ((generacionesHoy ?? 0) >= RATE_LIMIT_PER_DAY) {
      return NextResponse.json(
        { error: `Límite diario alcanzado (${RATE_LIMIT_PER_DAY} generaciones por día). Intentá mañana.` },
        { status: 429 }
      )
    }

    // Obtener template activo para esta acción
    const { data: template } = await supabase
      .from('prompt_templates')
      .select('id, slug, function, version, layer_pedagogy, layer_task, output_schema_slug, model')
      .eq('slug', accion)
      .eq('is_active', true)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }

    // Obtener recurso fuente
    const { data: recurso } = await supabase
      .from('recursos')
      .select('titulo, resumen, texto_extraido, eje_tematico, grados, tipo_recurso')
      .eq('id', recurso_id)
      .single()

    if (!recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    // Armar prompt con las 5 capas
    const systemPrompt = buildSystemPrompt(template as PromptTemplate, {
      titulo:         recurso.titulo,
      resumen:        recurso.resumen ?? undefined,
      grados:         recurso.grados ?? undefined,
      eje_tematico:   recurso.eje_tematico ?? undefined,
      tipo_recurso:   recurso.tipo_recurso ?? undefined,
      texto_extraido: recurso.texto_extraido ?? undefined,
      grado_destino:  grado_destino ?? undefined,
    })

    // Llamada al modelo (el modelo lo define el template — Sonnet o Haiku según función)
    const inicio = Date.now()
    const message = await anthropic.messages.create({
      model:      template.model,
      max_tokens: 2048,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: '¿Podés generar el material?' }],
    })
    const duracion = Date.now() - inicio

    const respuesta = message.content[0].type === 'text' ? message.content[0].text : ''

    // Logging de la generación
    const generacion: AiGenerationInsert = {
      user_id:            user.id,
      prompt_template_id: template.id,
      function:           template.function,
      slug:               accion,
      source_resource_id: recurso_id,
      dua_level:          'estandar',
      input_params:       { accion, grado_destino: grado_destino ?? null },
      output_json:        { respuesta },
      model:              template.model,
      tokens_input:       message.usage.input_tokens,
      tokens_output:      message.usage.output_tokens,
      duration_ms:        duracion,
    }

    const { data: gen } = await supabase
      .from('ai_generations')
      .insert(generacion)
      .select('id')
      .single()

    return NextResponse.json({ respuesta, generation_id: gen?.id ?? null })
  } catch (error) {
    console.error('Error copiloto:', error)
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 })
  }
}
