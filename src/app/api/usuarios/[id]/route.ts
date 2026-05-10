import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Solo directivo puede cambiar roles
    const { data: miPerfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (miPerfil?.rol !== 'directivo') {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
    }

    // No puede cambiarse a sí mismo
    if (id === user.id) {
      return NextResponse.json({ error: 'No podés cambiar tu propio rol' }, { status: 400 })
    }

    const { rol } = await request.json()
    if (!['docente', 'admin'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    // No puede modificar a otro directivo
    const { data: objetivo } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', id)
      .single()

    if (objetivo?.rol === 'directivo') {
      return NextResponse.json({ error: 'No se puede modificar el rol de otro directivo' }, { status: 403 })
    }

    const { error } = await supabase
      .from('perfiles')
      .update({ rol })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
