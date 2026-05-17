import { NextRequest, NextResponse } from 'next/server'
import { runCopilotFunction } from '@/lib/copilot/runner'
import type { AdaptedResource, DuaLevel } from '@/types/copilot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recurso_id, grado_destino, dua_level, modalidad, tiempo_min } = body as {
      recurso_id:     string
      grado_destino?: number
      dua_level?:     DuaLevel
      modalidad?:     'presencial' | 'domiciliario' | 'virtual_asincronico'
      tiempo_min?:    number
    }

    if (!recurso_id) {
      return NextResponse.json({ error: 'recurso_id requerido' }, { status: 400 })
    }

    const inputParams: Record<string, unknown> = {}
    if (grado_destino) inputParams.grado_destino = grado_destino
    if (dua_level)     inputParams.dua_level     = dua_level
    if (modalidad)     inputParams.modalidad     = modalidad
    if (tiempo_min)    inputParams.tiempo_min    = tiempo_min

    if (Object.keys(inputParams).length === 0) {
      return NextResponse.json({ error: 'Elegí al menos un eje de adaptación' }, { status: 400 })
    }

    const result = await runCopilotFunction<Omit<AdaptedResource, 'meta'>>({
      slug:             'adapt',
      sourceResourceId: recurso_id,
      duaLevel:         dua_level ?? 'estandar',
      inputParams,
      userMessage:      'Adaptá el recurso según los parámetros indicados.',
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ data: { ...result.data, meta: result.meta } })
  } catch (error) {
    console.error('[/api/copilot/adapt] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
