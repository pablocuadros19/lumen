'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const searchParams = useSearchParams()
  const errorDominio = searchParams.get('error') === 'dominio'

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f9fc] to-[#1A3A5C]/10
                    flex items-center justify-center relative overflow-hidden bg-grid-pattern">
      {/* Decoraciones de fondo */}
      <div className="absolute top-10 -left-32 w-96 h-96 rounded-full bg-[#8B2252]/6 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#1A3A5C]/6 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2E6EA6]/3 blur-3xl" />

      <div className="glass rounded-[32px] shadow-elevated border border-white/60
                      text-center max-w-md mx-auto px-8 sm:px-12 py-8 sm:py-14 relative z-10">
        {/* Logos: Newman + LUMEN en fila en mobile, columna en desktop */}
        <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
          <Image
            src="/newman-logo.png"
            alt="Newman"
            width={56}
            height={56}
            className="sm:w-[80px] sm:h-[80px]"
            priority
          />
          <Image
            src="/logo.png"
            alt="LUMEN"
            width={180}
            height={180}
            className="drop-shadow-sm sm:w-[280px] sm:h-[280px]"
            priority
          />
        </div>

        <p className="text-lg sm:text-xl font-medium mb-5 sm:mb-8 text-gradient-lumen">
          Biblioteca Pedagógica Inteligente
        </p>

        {/* Línea decorativa */}
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#8B2252] to-transparent
                        mx-auto mb-5 sm:mb-8 rounded-full" />

        {/* Botón Google */}
        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full px-5 py-3.5 sm:px-6 sm:py-4
                     bg-white border border-gray-200 rounded-2xl
                     text-[#1A3A5C] font-semibold text-sm sm:text-base
                     shadow-card hover:shadow-card-hover hover:-translate-y-0.5
                     active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Iniciar sesión con Google
        </button>

        {errorDominio && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            Solo se permiten cuentas institucionales del Newman. Contactá a la coordinadora si necesitás acceso.
          </div>
        )}

        <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
          Usá tu cuenta institucional del colegio
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
