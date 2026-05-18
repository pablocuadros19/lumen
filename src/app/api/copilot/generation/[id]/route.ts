import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // RLS asegura que solo se puede borrar lo propio (la policy ai_gen_owner ya está)
    // Pero las policies actuales no incluyen DELETE — la agregamos vía migración
    const { error } = await supabase
      .from('ai_generations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // defensa extra

    if (error) {
      console.error('[DELETE /api/copilot/generation/:id]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/copilot/generation/:id]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
