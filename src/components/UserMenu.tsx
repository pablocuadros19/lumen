'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu() {
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
    window.location.href = '/login'
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
          <img src={avatar} alt={nombre} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-[#1A3A5C] truncate">{nombre}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-[#8B2252] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
