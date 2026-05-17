import { NextRequest, NextResponse } from 'next/server'
import { runCopilotFunction } from '@/lib/copilot/runner'
import type { SimilarActivity } from '@/types/copilot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recurso_id, cantidad, mismo_contenido, ajuste_grado, dificultad, formato } = body as {
      recurso_id:       string
      cantidad?:        1 | 3 | 5
      mismo_contenido?: boolean
      ajuste_grado?:    'mismo' | 'mas_uno' | 'menos_uno'
      dificultad?:      'mas_facil' | 'igual' | 'mas_desafiante'
      formato?:         'mismo' | 'cambiar'
    }

    if (!recurso_id) {
      return NextResponse.json({ error: 'recurso_id requerido' }, { status: 400 })
    }

    const inputParams: Record<string, unknown> = {
      cantidad:        cantidad        ?? 3,
      mismo_contenido: mismo_contenido ?? true,
      ajuste_grado:    ajuste_grado    ?? 'mismo',
      dificultad:      dificultad      ?? 'igual',
      formato:         formato         ?? 'mismo',
    }

    const result = await runCopilotFunction<{ actividades: Omit<SimilarActivity, 'meta'>[] }>({
      slug:             'similar',
      sourceResourceId: recurso_id,
      inputParams,
      userMessage:      'Generá las actividades similares según los parámetros indicados.',
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    // Pegamos meta a cada actividad individual
    const actividadesConMeta = result.data.actividades.map(a => ({ ...a, meta: result.meta }))

    return NextResponse.json({ data: { actividades: actividadesConMeta, meta: result.meta } })
  } catch (error) {
    console.error('[/api/copilot/similar] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
