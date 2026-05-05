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

    const { fileId, fileName, mimeType } = await request.json()

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

    const driveRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${perfil.google_token}` },
    })

    if (!driveRes.ok) {
      const errBody = await driveRes.text().catch(() => '')
      if (driveRes.status === 401) {
        await supabase.from('perfiles').update({ google_token: null }).eq('id', user.id)
        return NextResponse.json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' }, { status: 401 })
      }
      return NextResponse.json({
        error: `Drive devolvió ${driveRes.status}`,
        detalle: errBody.slice(0, 300),
        fase: 'descarga',
      }, { status: 500 })
    }

    const fileBuffer = Buffer.from(await driveRes.arrayBuffer())

    const ext = finalFileName.split('.').pop() || 'pdf'
    const storageId = crypto.randomUUID()
    const storagePath = `${user.id}/${storageId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('recursos')
      .upload(storagePath, fileBuffer, { contentType: finalMimeType, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Storage: ${uploadError.message}`, fase: 'upload' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(storagePath)
    const archivoUrl = urlData.publicUrl

    const clasificarUrl = new URL('/api/clasificar', request.url)
    const formData = new FormData()
    formData.append('archivo', new Blob([fileBuffer], { type: finalMimeType }), finalFileName)
    formData.append('nombre', finalFileName)
    const clasRes = await fetch(clasificarUrl, { method: 'POST', body: formData })
    const clasificacion = clasRes.ok
      ? await clasRes.json()
      : { titulo: finalFileName, resumen: '', ejes_tematicos: [], tipo_recurso: 'Actividad', idioma: 'es' }

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
          const thumbImgRes = await fetch(thumbSrc, { headers: { Authorization: `Bearer ${perfil.google_token}` } })
          if (thumbImgRes.ok) {
            const thumbBuffer = Buffer.from(await thumbImgRes.arrayBuffer())
            const thumbPath = `${user.id}/thumb_${storageId}.png`
            await supabase.storage.from('recursos').upload(thumbPath, thumbBuffer, { contentType: 'image/png', upsert: false })
            const { data: thumbUrlData } = supabase.storage.from('recursos').getPublicUrl(thumbPath)
            thumbnailUrl = thumbUrlData.publicUrl
          }
        }
      } catch { /* sin thumbnail */ }
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
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Error interno: ${msg}`, fase: 'desconocida' }, { status: 500 })
  }
}
