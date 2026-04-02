import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener recurso
    const { data: recurso, error } = await supabase
      .from('recursos')
      .select('archivo_url')
      .eq('id', id)
      .single()

    if (error || !recurso?.archivo_url) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    // Incrementar contador y registrar descarga (no bloquean el redirect si fallan)
    await Promise.allSettled([
      supabase.rpc('incrementar_descargas', { p_recurso_id: id }),
      supabase.from('historial_descargas').insert({ user_id: user.id, recurso_id: id }),
    ])

    // Redirigir al archivo
    return NextResponse.redirect(recurso.archivo_url)
  } catch (error) {
    console.error('Error en descarga:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
