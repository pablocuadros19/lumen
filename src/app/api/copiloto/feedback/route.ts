import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    const { generation_id, score, texto } = body as {
      generation_id: string
      score: 1 | -1
      texto?: string
    }

    if (!generation_id || ![1, -1].includes(score)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    const { error } = await supabase
      .from('ai_generations')
      .update({ feedback_score: score, feedback_text: texto ?? null })
      .eq('id', generation_id)
      .eq('user_id', user.id) // solo puede dar feedback de sus propias generaciones

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error feedback copiloto:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
