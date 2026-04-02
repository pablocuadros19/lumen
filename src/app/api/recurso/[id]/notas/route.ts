import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Obtener nota del usuario para este recurso
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('notas_recurso')
    .select('contenido')
    .eq('user_id', user.id)
    .eq('recurso_id', id)
    .single()

  return NextResponse.json({ contenido: data?.contenido || '' })
}

// Guardar/actualizar nota (upsert)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { contenido } = await request.json()

  const { error } = await supabase
    .from('notas_recurso')
    .upsert({
      user_id: user.id,
      recurso_id: id,
      contenido: contenido || '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,recurso_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
