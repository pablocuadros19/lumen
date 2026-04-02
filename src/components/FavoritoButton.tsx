'use client'

import { useState } from 'react'

interface Props {
  recursoId: string
  initialFavorito?: boolean
  size?: 'sm' | 'md'
  onToggle?: (recursoId: string, esFavorito: boolean) => void
}

export default function FavoritoButton({ recursoId, initialFavorito = false, size = 'sm', onToggle }: Props) {
  const [favorito, setFavorito] = useState(initialFavorito)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/favorito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurso_id: recursoId }),
      })
      if (res.ok) {
        const data = await res.json()
        setFavorito(data.favorito)
        onToggle?.(recursoId, data.favorito)
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${btnSize} rounded-full transition-all duration-200 cursor-pointer
        ${favorito
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
          : 'text-gray-300 hover:text-red-400 bg-white/80 hover:bg-white'
        }
        ${loading ? 'opacity-50' : ''}
        shadow-sm backdrop-blur-sm`}
      title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg className={iconSize} viewBox="0 0 24 24"
        fill={favorito ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={favorito ? 0 : 1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    </button>
  )
}
