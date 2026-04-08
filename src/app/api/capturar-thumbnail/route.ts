import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Captura el thumbnail de un archivo de Google Slides/Docs usando el token del usuario
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
      return NextResponse.json({ error: 'Conectá tu cuenta de Google Drive primero', code: 'NO_TOKEN' }, { status: 401 })
    }

    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 })

    // Extraer fileId de la URL de Google
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (!match) return NextResponse.json({ error: 'URL de Google no válida' }, { status: 400 })
    const fileId = match[1]

    // Obtener thumbnailLink desde Drive API
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink`,
      { headers: { Authorization: `Bearer ${perfil.google_token}` } }
    )

    if (!metaRes.ok) {
      if (metaRes.status === 401) {
        await supabase.from('perfiles').update({ google_token: null }).eq('id', user.id)
        return NextResponse.json({ error: 'Token expirado, reconectá Google Drive', code: 'TOKEN_EXPIRED' }, { status: 401 })
      }
      return NextResponse.json({ error: 'No se pudo acceder al archivo' }, { status: 400 })
    }

    const metaData = await metaRes.json()
    if (!metaData.thumbnailLink) {
      return NextResponse.json({ error: 'El archivo no tiene thumbnail disponible' }, { status: 404 })
    }

    // Descargar thumbnail en alta resolución
    const thumbSrc = metaData.thumbnailLink.replace(/=s\d+/, '=s800')
    const thumbRes = await fetch(thumbSrc, {
      headers: { Authorization: `Bearer ${perfil.google_token}` }
    })

    if (!thumbRes.ok) {
      return NextResponse.json({ error: 'No se pudo descargar el thumbnail' }, { status: 500 })
    }

    // Subir a Supabase Storage
    const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer())
    const storageId = crypto.randomUUID()
    const thumbPath = `${user.id}/thumb_${storageId}.png`

    const { error: uploadError } = await supabase.storage
      .from('recursos')
      .upload(thumbPath, thumbBuffer, { contentType: 'image/png', upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Error subiendo: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('recursos').getPublicUrl(thumbPath)

    return NextResponse.json({ thumbnail_url: urlData.publicUrl })
  } catch (error) {
    console.error('Error capturando thumbnail:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
