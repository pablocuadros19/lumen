import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Listar mis colecciones
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data } = await supabase
      .from('colecciones')
      .select('*, coleccion_recursos(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error listando colecciones:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Crear colección
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { nombre, descripcion, color } = await request.json()
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('colecciones')
      .insert({
        user_id: user.id,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        color: color || '#1A3A5C',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creando colección:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
