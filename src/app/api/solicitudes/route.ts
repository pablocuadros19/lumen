import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Crear solicitud
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { descripcion, grado, eje_tematico } = await request.json()
    if (!descripcion?.trim()) {
      return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 })
    }

    // Obtener nombre del perfil
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', user.id)
      .single()

    const { error } = await supabase
      .from('solicitudes')
      .insert({
        user_id: user.id,
        autor_nombre: perfil?.nombre || user.user_metadata?.full_name || user.email,
        descripcion: descripcion.trim(),
        grado: grado || null,
        eje_tematico: eje_tematico || null,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en solicitud:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Listar solicitudes (para admin)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si es admin
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfil?.rol !== 'admin') {
      // Si no es admin, solo ve sus propias solicitudes
      const { data } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      return NextResponse.json(data || [])
    }

    // Admin ve todas
    const { data } = await supabase
      .from('solicitudes')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
