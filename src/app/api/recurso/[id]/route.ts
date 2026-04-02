import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener recurso para verificar autoría y archivo
    const { data: recurso, error: fetchError } = await supabase
      .from('recursos')
      .select('subido_por, archivo_url')
      .eq('id', id)
      .single()

    if (fetchError || !recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    if (recurso.subido_por !== user.id) {
      return NextResponse.json({ error: 'Solo el autor puede borrar este recurso' }, { status: 403 })
    }

    // Borrar archivo de Storage si existe
    if (recurso.archivo_url) {
      const url = new URL(recurso.archivo_url)
      const path = url.pathname.split('/object/public/recursos/')[1]
      if (path) {
        await supabase.storage.from('recursos').remove([decodeURIComponent(path)])
      }
    }

    // Borrar registro de la tabla
    const { error: deleteError } = await supabase
      .from('recursos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error borrando recurso:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
