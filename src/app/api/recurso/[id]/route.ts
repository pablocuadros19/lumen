import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Aprobar, observar o reenviar un recurso
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

    const body = await request.json()
    const { accion, comentario } = body as { accion: string; comentario?: string }

    // Obtener perfil del usuario
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    // Obtener recurso
    const { data: recurso } = await supabase
      .from('recursos')
      .select('subido_por, estado')
      .eq('id', id)
      .single()

    if (!recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    if (accion === 'aprobar') {
      // Solo admin puede aprobar
      if (perfil?.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo un admin puede aprobar recursos' }, { status: 403 })
      }
      const { error } = await supabase
        .from('recursos')
        .update({ revisado: true, revisado_por: user.id, comentario_revision: null })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, estado: 'aprobado' })
    }

    if (accion === 'observar') {
      // Solo admin puede observar
      if (perfil?.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo un admin puede observar recursos' }, { status: 403 })
      }
      if (!comentario) {
        return NextResponse.json({ error: 'El comentario es obligatorio al observar' }, { status: 400 })
      }
      const { error } = await supabase
        .from('recursos')
        .update({ estado: 'revision', comentario_revision: comentario, revisado: false, revisado_por: null })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, estado: 'revision' })
    }

    if (accion === 'reenviar') {
      // Solo el autor puede reenviar
      if (recurso.subido_por !== user.id) {
        return NextResponse.json({ error: 'Solo el autor puede reenviar' }, { status: 403 })
      }
      if (recurso.estado !== 'revision') {
        return NextResponse.json({ error: 'Solo se pueden reenviar recursos en revisión' }, { status: 400 })
      }
      const { error } = await supabase
        .from('recursos')
        .update({ estado: 'publicado', revisado: false, comentario_revision: null })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, estado: 'publicado' })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error en PATCH recurso:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

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

    // Admins pueden borrar cualquier recurso
    if (recurso.subido_por !== user.id) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      if (perfil?.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo el autor o un admin puede borrar este recurso' }, { status: 403 })
      }
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
