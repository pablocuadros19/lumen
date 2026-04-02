import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Agregar recurso a colección
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Verificar que la colección es del usuario
    const { data: col } = await supabase
      .from('colecciones')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!col) return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 })

    const { recurso_id } = await request.json()

    // Obtener el orden máximo actual
    const { data: ultimo } = await supabase
      .from('coleccion_recursos')
      .select('orden')
      .eq('coleccion_id', id)
      .order('orden', { ascending: false })
      .limit(1)
      .single()

    const orden = (ultimo?.orden ?? -1) + 1

    const { error } = await supabase
      .from('coleccion_recursos')
      .insert({ coleccion_id: id, recurso_id, orden })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya está en la colección' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Quitar recurso de colección
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { recurso_id } = await request.json()

    const { error } = await supabase
      .from('coleccion_recursos')
      .delete()
      .eq('coleccion_id', id)
      .eq('recurso_id', recurso_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
