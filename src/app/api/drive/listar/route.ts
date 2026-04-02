import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Listar archivos del Drive del usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Obtener token de Google guardado
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('google_token')
      .eq('id', user.id)
      .single()

    if (!perfil?.google_token) {
      return NextResponse.json({ error: 'No conectado a Drive', code: 'NO_TOKEN' }, { status: 401 })
    }

    const pageToken = request.nextUrl.searchParams.get('pageToken') || undefined

    // Llamar a Google Drive API
    const params = new URLSearchParams({
      q: "mimeType='application/pdf' or mimeType='image/jpeg' or mimeType='image/png' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType='application/vnd.openxmlformats-officedocument.presentationml.presentation' or mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.presentation'",
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, size)',
      orderBy: 'modifiedTime desc',
      pageSize: '30',
      spaces: 'drive',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      { headers: { Authorization: `Bearer ${perfil.google_token}` } }
    )

    if (!driveRes.ok) {
      if (driveRes.status === 401) {
        // Token expirado, limpiar
        await supabase.from('perfiles').update({ google_token: null }).eq('id', user.id)
        return NextResponse.json({ error: 'Token expirado, reconectá Drive', code: 'TOKEN_EXPIRED' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Error al acceder a Drive' }, { status: 500 })
    }

    const data = await driveRes.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
