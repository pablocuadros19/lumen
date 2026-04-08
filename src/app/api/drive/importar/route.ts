import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Importar un archivo de Drive: descarga, sube a Storage, clasifica con IA
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

    const { fileId, fileName, mimeType } = await request.json()

    // Para Google Docs/Slides, exportar como PDF
    let downloadUrl: string
    let finalMimeType = mimeType
    let finalFileName = fileName

    let googleLink: string | null = null

    if (mimeType === 'application/vnd.google-apps.document') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`
      finalMimeType = 'application/pdf'
      finalFileName = fileName.replace(/\.[^.]+$/, '') + '.pdf'
      googleLink = `https://docs.google.com/document/d/${fileId}/edit`
    } else if (mimeType === 'application/vnd.google-apps.presentation') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`
      finalMimeType = 'application/pdf'
      finalFileName = fileName.replace(/\.[^.]+$/, '') + '.pdf'
      googleLink = `https://docs.google.com/presentation/d/${fileId}/edit`
    } else {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    }

    // Descargar archivo de Drive
    const driveRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${perfil.google_token}` },
    })

    if (!driveRes.ok) {
      if (driveRes.status === 401) {
        await supabase.from('perfiles').update({ google_token: null }).eq('id', user.id)
        return NextResponse.json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' }, { status: 401 })
      }
      return NextResponse.json({ error: `Error descargando: ${driveRes.status}` }, { status: 500 })
    }

    const fileBuffer = Buffer.from(await driveRes.arrayBuffer())

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
      return NextResponse.json({ error: `Error subiendo: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(storagePath)
    const archivoUrl = urlData.publicUrl

    // Clasificar con IA (enviar al endpoint de clasificar como FormData)
    const clasificarUrl = new URL('/api/clasificar', request.url)
    const formData = new FormData()
    const blob = new Blob([fileBuffer], { type: finalMimeType })
    formData.append('archivo', blob, finalFileName)
    formData.append('nombre', finalFileName)

    const clasRes = await fetch(clasificarUrl, { method: 'POST', body: formData })
    const clasificacion = clasRes.ok ? await clasRes.json() : { titulo: finalFileName, resumen: '', ejes_tematicos: [], tipo_recurso: 'Actividad', idioma: 'es' }

    // Thumbnail
    let thumbnailUrl: string | null = null
    if (finalMimeType.startsWith('image/')) {
      thumbnailUrl = archivoUrl
    } else {
      // Intentar capturar thumbnail desde Drive API
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
        // Si falla, seguir sin thumbnail
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
    console.error('Error importando desde Drive:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
