import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Emails con acceso directo (admins, desarrollo)
const EMAILS_PERMITIDOS = (process.env.ALLOWED_EMAILS || '').split(',').filter(Boolean)
// Dominios institucionales permitidos
const DOMINIOS_PERMITIDOS = (process.env.ALLOWED_DOMAINS || '').split(',').filter(Boolean)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Error exchanging code:', sessionError)
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }

    // Verificar dominio/email si hay restricciones configuradas
    if (DOMINIOS_PERMITIDOS.length > 0 || EMAILS_PERMITIDOS.length > 0) {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email || ''
      const dominio = email.split('@')[1] || ''

      const permitido = EMAILS_PERMITIDOS.includes(email) || DOMINIOS_PERMITIDOS.includes(dominio)

      if (!permitido) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=dominio`)
      }
    }

    // Guardar provider_token (Google) para Drive
    const providerToken = sessionData?.session?.provider_token ?? null

    if (providerToken) {
      const userId = sessionData?.session?.user?.id
      if (userId) {
        await supabase
          .from('perfiles')
          .update({ google_token: providerToken })
          .eq('id', userId)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
