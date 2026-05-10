import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emailRecursoAprobado, emailRecursoObservado } from '@/lib/email'

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

    // Obtener perfil del usuario (revisor)
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, nombre')
      .eq('id', user.id)
      .single()

    // Obtener recurso (con datos para email)
    const { data: recurso } = await supabase
      .from('recursos')
      .select('subido_por, estado, titulo, areas, area, grados, tipo_recurso')
      .eq('id', id)
      .single()

    if (!recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    // Helper: traer email/nombre del autor para notificar
    async function getAutor() {
      const { data } = await supabase
        .from('perfiles')
        .select('email, nombre')
        .eq('id', recurso!.subido_por)
        .single()
      return data
    }

    const recursoEmail = {
      id,
      titulo: recurso.titulo || '',
      areas: recurso.areas?.length ? recurso.areas : recurso.area ? [recurso.area] : [],
      grados: recurso.grados || [],
      tipo: recurso.tipo_recurso || '',
    }

    if (accion === 'aprobar') {
      // Solo admin puede aprobar
      if (!['admin', 'directivo'].includes(perfil?.rol ?? '')) {
        return NextResponse.json({ error: 'Solo coordinadores o directivos pueden aprobar recursos' }, { status: 403 })
      }
      const { error } = await supabase
        .from('recursos')
        .update({ revisado: true, revisado_por: user.id, comentario_revision: null })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Email al autor
      try {
        const autor = await getAutor()
        if (autor?.email && recurso.subido_por !== user.id) {
          await emailRecursoAprobado({
            destinatario: { email: autor.email, nombre: autor.nombre || '' },
            aprobador: perfil?.nombre || 'Coordinación',
            recurso: recursoEmail,
          })
        }
      } catch (err) {
        console.error('[recurso aprobar] error email:', err)
      }

      return NextResponse.json({ ok: true, estado: 'aprobado' })
    }

    if (accion === 'observar') {
      // Solo admin puede observar
      if (!['admin', 'directivo'].includes(perfil?.rol ?? '')) {
        return NextResponse.json({ error: 'Solo coordinadores o directivos pueden observar recursos' }, { status: 403 })
      }
      if (!comentario) {
        return NextResponse.json({ error: 'El comentario es obligatorio al observar' }, { status: 400 })
      }
      const { error } = await supabase
        .from('recursos')
        .update({ estado: 'revision', comentario_revision: comentario, revisado: false, revisado_por: null })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Email al autor con la devolución
      try {
        const autor = await getAutor()
        if (autor?.email && recurso.subido_por !== user.id) {
          await emailRecursoObservado({
            destinatario: { email: autor.email, nombre: autor.nombre || '' },
            revisor: perfil?.nombre || 'Coordinación',
            comentario,
            recurso: recursoEmail,
          })
        }
      } catch (err) {
        console.error('[recurso observar] error email:', err)
      }

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
