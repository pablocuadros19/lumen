import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Agregar colaborador por email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coleccionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que es dueño de la colección
    const { data: coleccion } = await supabase
      .from('colecciones')
      .select('user_id')
      .eq('id', coleccionId)
      .single()

    if (!coleccion || coleccion.user_id !== user.id) {
      return NextResponse.json({ error: 'Solo el dueño puede invitar' }, { status: 403 })
    }

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Buscar usuario por email
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('id, nombre, email')
      .eq('email', email)
      .single()

    if (!perfil) {
      return NextResponse.json({ error: 'No se encontró un usuario con ese email' }, { status: 404 })
    }

    if (perfil.id === user.id) {
      return NextResponse.json({ error: 'No podés invitarte a vos mismo' }, { status: 400 })
    }

    // Agregar como colaborador
    const { error: insertError } = await supabase
      .from('coleccion_colaboradores')
      .insert({ coleccion_id: coleccionId, user_id: perfil.id })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Ya es colaborador' }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ id: perfil.id, nombre: perfil.nombre, email: perfil.email })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Eliminar colaborador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coleccionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { userId } = await request.json()

    const { error } = await supabase
      .from('coleccion_colaboradores')
      .delete()
      .eq('coleccion_id', coleccionId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
