import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Detectar formato por extensión
function detectarFormato(nombre: string): string {
  const ext = nombre.split('.').pop()?.toLowerCase()
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'Documento'
  if (['pptx', 'ppt'].includes(ext || '')) return 'Presentación slides'
  if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'Video'
  if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext || '')) return 'Imagen / Lámina'
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'Audio'
  return 'Documento'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const archivo = formData.get('archivo') as File | null
    const datosJson = formData.get('datos') as string
    const datos = JSON.parse(datosJson)

    let archivoUrl: string | null = datos.existing_archivo_url || null
    let thumbnailUrl: string | null = datos.existing_thumbnail_url || null

    // Subir archivo a Storage si existe (y no viene pre-subido)
    if (archivo && !archivoUrl) {
      const ext = archivo.name.split('.').pop()
      const fileId = crypto.randomUUID()
      const fileName = `${user.id}/${fileId}.${ext}`
      const buffer = Buffer.from(await archivo.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('recursos')
        .upload(fileName, buffer, {
          contentType: archivo.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error subiendo archivo:', uploadError)
        return NextResponse.json(
          { error: `Error al subir archivo: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('recursos')
        .getPublicUrl(fileName)

      archivoUrl = urlData.publicUrl

      // Si es imagen, usar como thumbnail
      if (archivo.type.startsWith('image/')) {
        thumbnailUrl = archivoUrl
      }
    }

    // Si no hay thumbnail del archivo pero viene uno del link (OG image)
    if (!thumbnailUrl && datos.thumbnail_url) {
      thumbnailUrl = datos.thumbnail_url
    }

    // Obtener nombre del perfil
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', user.id)
      .single()

    // Insertar recurso en la tabla
    const recurso = {
      titulo: datos.titulo,
      resumen: datos.resumen || null,
      grados: datos.grados,
      area: 'Prácticas del Lenguaje',
      eje_tematico: datos.ejes_tematicos[0], // DB usa singular
      tipo_recurso: datos.tipo_recurso,
      formato: archivo ? detectarFormato(archivo.name) : 'Link externo',
      editable: datos.editable,
      estado: 'publicado',
      idioma: datos.idioma || 'es',
      archivo_url: archivoUrl,
      thumbnail_url: thumbnailUrl,
      link_editable: datos.link_editable || null,
      texto_extraido: datos.texto_extraido || null,
      subido_por: user.id,
      autor_nombre: perfil?.nombre || user.user_metadata?.full_name || user.email,
    }

    const { data: recursoCreado, error: insertError } = await supabase
      .from('recursos')
      .insert(recurso)
      .select()
      .single()

    if (insertError) {
      console.error('Error insertando recurso:', insertError)
      return NextResponse.json(
        { error: `Error al guardar recurso: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Vincular efemérides si se seleccionaron
    if (datos.efemeride_ids && datos.efemeride_ids.length > 0 && recursoCreado) {
      const efeRows = datos.efemeride_ids.map((efeId: string) => ({
        recurso_id: recursoCreado.id,
        efemeride_id: efeId,
      }))
      await supabase.from('recurso_efemerides').insert(efeRows)
    }

    return NextResponse.json(recursoCreado)
  } catch (error) {
    console.error('Error en publicar:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
