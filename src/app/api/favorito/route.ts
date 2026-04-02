import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Toggle favorito: si existe lo borra, si no existe lo crea
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { recurso_id } = await request.json()
    if (!recurso_id) {
      return NextResponse.json({ error: 'recurso_id requerido' }, { status: 400 })
    }

    // Verificar si ya existe
    const { data: existente } = await supabase
      .from('favoritos')
      .select('id')
      .eq('user_id', user.id)
      .eq('recurso_id', recurso_id)
      .single()

    if (existente) {
      // Quitar favorito
      await supabase
        .from('favoritos')
        .delete()
        .eq('id', existente.id)

      return NextResponse.json({ favorito: false })
    } else {
      // Agregar favorito
      await supabase
        .from('favoritos')
        .insert({ user_id: user.id, recurso_id })

      return NextResponse.json({ favorito: true })
    }
  } catch (error) {
    console.error('Error en favorito:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Obtener IDs de recursos favoritos del usuario
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: favoritos } = await supabase
      .from('favoritos')
      .select('recurso_id')
      .eq('user_id', user.id)

    const ids = (favoritos || []).map(f => f.recurso_id)
    return NextResponse.json({ ids })
  } catch (error) {
    console.error('Error obteniendo favoritos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
