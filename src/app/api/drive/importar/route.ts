import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('google_token')
      .eq('id', user.id)
      .single()

    if (!perfil?.google_token) {
      return NextResponse.json({ error: 'No conectado a Drive', code: 'NO_TOKEN' }, { status: 401 })
    }

    // El cliente descarga el archivo (scope drive.file funciona en browser post-Picker)
    // y lo envía como FormData. El servidor solo sube a Storage y clasifica.
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileId = formData.get('fileId') as string
    const finalFileName = formData.get('fileName') as string
    const finalMimeType = formData.get('mimeType') as string
    const originalMimeType = formData.get('originalMimeType') as string

    if (!file || !fileId || !finalFileName || !finalMimeType) {
      return NextResponse.json({ error: 'Faltan campos requeridos', fase: 'validacion' }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Link editable para Google Docs/Slides
    let googleLink: string | null = null
    if (originalMimeType === 'application/vnd.google-apps.document') {
      googleLink = `https://docs.google.com/document/d/${fileId}/edit`
    } else if (originalMimeType === 'application/vnd.google-apps.presentation') {
      googleLink = `https://docs.google.com/presentation/d/${fileId}/edit`
    }

    // Subir a Supabase Storage
    const ext = finalFileName.split('.').pop() || 'pdf'
    const storageId = crypto.randomUUID()
    const storagePath = `${user.id}/${storageId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('recursos')
      .upload(storagePath, fileBuffer, {
        contentType: finalMimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error('[drive/importar] Error subiendo a Storage:', uploadError)
      return NextResponse.json({
        error: `Storage: ${uploadError.message}`,
        fase: 'upload',
      }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(storagePath)
    const archivoUrl = urlData.publicUrl

    // Clasificar con IA
    const clasificarUrl = new URL('/api/clasificar', request.url)
    const clasFormData = new FormData()
    const blob = new Blob([fileBuffer], { type: finalMimeType })
    clasFormData.append('archivo', blob, finalFileName)
    clasFormData.append('nombre', finalFileName)

    const clasRes = await fetch(clasificarUrl, { method: 'POST', body: clasFormData })
    const clasificacion = clasRes.ok
      ? await clasRes.json()
      : { titulo: finalFileName, resumen: '', ejes_tematicos: [], tipo_recurso: 'Actividad', idioma: 'es' }

    // Thumbnail — intentar desde Drive API con el token del servidor
    let thumbnailUrl: string | null = null
    if (finalMimeType.startsWith('image/')) {
      thumbnailUrl = archivoUrl
    } else {
      try {
        const thumbMeta = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink`,
          { headers: { Authorization: `Bearer ${perfil.google_token}` } }
        )
        const thumbData = await thumbMeta.json()
        if (thumbData.thumbnailLink) {
          const thumbSrc = thumbData.thumbnailLink.replace(/=s\d+/, '=s800')
          const thumbImgRes = await fetch(thumbSrc, {
            headers: { Authorization: `Bearer ${perfil.google_token}` }
          })
          if (thumbImgRes.ok) {
            const thumbBuffer = Buffer.from(await thumbImgRes.arrayBuffer())
            const thumbPath = `${user.id}/thumb_${storageId}.png`
            await supabase.storage.from('recursos').upload(thumbPath, thumbBuffer, {
              contentType: 'image/png',
              upsert: false,
            })
            const { data: thumbUrlData } = supabase.storage.from('recursos').getPublicUrl(thumbPath)
            thumbnailUrl = thumbUrlData.publicUrl
          }
        }
      } catch {
        // Sin thumbnail
      }
    }

    return NextResponse.json({
      archivo_url: archivoUrl,
      thumbnail_url: thumbnailUrl,
      google_link: googleLink,
      fileName: finalFileName,
      mimeType: finalMimeType,
      ...clasificacion,
    })
  } catch (error) {
    console.error('[drive/importar] Error interno:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      error: `Error interno: ${msg}`,
      fase: 'desconocida',
    }, { status: 500 })
  }
}
