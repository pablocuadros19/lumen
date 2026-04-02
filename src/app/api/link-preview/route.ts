import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    // Fetch HTML con timeout de 5 segundos
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LUMENBot/1.0)',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ thumbnail_url: null })
    }

    const html = await response.text()

    // Extraer og:image
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    )

    // Extraer og:title como fallback
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i
    )

    return NextResponse.json({
      thumbnail_url: ogImageMatch?.[1] || null,
      title: ogTitleMatch?.[1] || null,
    })
  } catch {
    return NextResponse.json({ thumbnail_url: null })
  }
}
