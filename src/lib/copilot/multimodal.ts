import type Anthropic from '@anthropic-ai/sdk'

const MAX_BYTES = 8 * 1024 * 1024  // 8 MB — más grande genera timeouts y costos altos

const MIME_BY_EXT: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  pdf:  'application/pdf',
}

// Baja el archivo del recurso y lo convierte a un content block multimodal
// para Anthropic. Si no se puede usar (formato no soportado, muy grande,
// fetch falla, etc.), devuelve null y el modelo trabaja solo con texto.
export async function fetchResourceAsMultimodal(
  archivoUrl: string | null | undefined,
): Promise<Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam | null> {
  if (!archivoUrl) return null

  // Solo intentamos con URLs directas — Drive y otros links los salteamos
  let ext: string
  try {
    const url = new URL(archivoUrl)
    if (url.hostname.includes('drive.google.com') || url.hostname.includes('docs.google.com')) {
      return null
    }
    ext = (url.pathname.split('.').pop() || '').toLowerCase()
  } catch {
    return null
  }

  const mediaType = MIME_BY_EXT[ext]
  if (!mediaType) return null

  let buffer: ArrayBuffer
  try {
    const res = await fetch(archivoUrl, {
      // Timeout corto — si tarda más de 8s, no vale la pena bloquear la generación
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null

    const contentLength = Number(res.headers.get('content-length') ?? 0)
    if (contentLength > MAX_BYTES) return null

    buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) return null
  } catch {
    return null
  }

  const base64 = Buffer.from(buffer).toString('base64')

  if (mediaType === 'application/pdf') {
    return {
      type:   'document',
      source: {
        type:       'base64',
        media_type: 'application/pdf',
        data:       base64,
      },
    }
  }

  return {
    type:   'image',
    source: {
      type:       'base64',
      media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      data:       base64,
    },
  }
}
