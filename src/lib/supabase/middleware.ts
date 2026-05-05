import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Si entran por *.vercel.app, redirigir a www.lumen.ar (dominio canónico)
  // Excluimos /auth/* y /api/* para no romper el flujo de OAuth ni las APIs
  const hostname = request.headers.get('host') || ''
  const path = request.nextUrl.pathname
  if (
    hostname.endsWith('.vercel.app') &&
    !path.startsWith('/auth') &&
    !path.startsWith('/api')
  ) {
    const canonicalUrl = new URL(path + request.nextUrl.search, 'https://www.lumen.ar')
    return NextResponse.redirect(canonicalUrl, 308)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas (no requieren sesión)
  const esRutaPublica =
    path.startsWith('/login') ||
    path.startsWith('/auth') ||
    path.startsWith('/landing') ||
    path.startsWith('/privacidad') ||
    path.startsWith('/3d') ||
    path === '/'

  if (!user && !esRutaPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
