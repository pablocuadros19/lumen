'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('')
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setNombre(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '')
        setAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || '')
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const iniciales = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {avatar ? (
          <img src={avatar} alt={nombre} className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#8B2252] flex items-center justify-center text-white text-xs font-semibold">
            {iniciales || '?'}
          </div>
        )}
        <span className="text-sm font-medium text-[#1A3A5C] hidden sm:block max-w-[120px] truncate">
          {nombre.split(' ')[0]}
        </span>
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-elevated z-50 py-2">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-[#1A3A5C] truncate">{nombre}</p>
            </div>
            <Link
              href="/colecciones"
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Mis colecciones
            </Link>
            <Link
              href="/mis-descargas"
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Mis descargas
            </Link>
            <Link
              href="/importar"
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              Importar desde Drive
            </Link>
            <div className="border-t border-gray-100 mt-1 pt-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-[#8B2252] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
