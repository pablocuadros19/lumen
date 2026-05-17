import { NextRequest, NextResponse } from 'next/server'
import { runCopilotFunction } from '@/lib/copilot/runner'
import type { ImplementationGuide } from '@/types/copilot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recurso_id } = body as { recurso_id: string }

    if (!recurso_id) {
      return NextResponse.json({ error: 'recurso_id requerido' }, { status: 400 })
    }

    const result = await runCopilotFunction<Omit<ImplementationGuide, 'meta'>>({
      slug:             'guide',
      sourceResourceId: recurso_id,
      inputParams:      {},
      userMessage:      'Generá la guía práctica para implementar este recurso en el aula.',
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ data: { ...result.data, meta: result.meta } })
  } catch (error) {
    console.error('[/api/copilot/guide] error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
