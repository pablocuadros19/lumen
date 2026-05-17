import { NextRequest, NextResponse } from 'next/server'
import { runCopilotFunction } from '@/lib/copilot/runner'
import type { EvaluationMaterial, EvaluationType } from '@/types/copilot'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recurso_id, tipo, dimensiones_count, criterios_extra } = body as {
      recurso_id:         string
      tipo:               EvaluationType
      dimensiones_count?: number
      criterios_extra?:   string
    }

    if (!recurso_id) {
      return NextResponse.json({ error: 'recurso_id requerido' }, { status: 400 })
    }
    if (!tipo) {
      return NextResponse.json({ error: 'Elegí un tipo de evaluación' }, { status: 400 })
    }

    const inputParams: Record<string, unknown> = { tipo }
    if (dimensiones_count) inputParams.dimensiones_count = dimensiones_count
    if (criterios_extra)   inputParams.criterios_extra   = criterios_extra

    const result = await runCopilotFunction<Omit<EvaluationMaterial, 'meta'>>({
      slug:             'evaluate',
      sourceResourceId: recurso_id,
      inputParams,
      userMessage:      `Generá un material de evaluación tipo "${tipo}" basado en el recurso.`,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ data: { ...result.data, meta: result.meta } })
  } catch (error) {
    console.error('[/api/copilot/evaluate] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
