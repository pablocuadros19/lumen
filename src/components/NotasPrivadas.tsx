'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  recursoId: string
}

export default function NotasPrivadas({ recursoId }: Props) {
  const [contenido, setContenido] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [cargado, setCargado] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cargar nota al abrir
  useEffect(() => {
    if (!abierto || cargado) return
    fetch(`/api/recurso/${recursoId}/notas`)
      .then(r => r.json())
      .then(data => {
        setContenido(data.contenido || '')
        setCargado(true)
      })
      .catch(() => setCargado(true))
  }, [abierto, cargado, recursoId])

  // Auto-save con debounce
  const guardar = useCallback((texto: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setGuardando(true)
      try {
        await fetch(`/api/recurso/${recursoId}/notas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contenido: texto }),
        })
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2000)
      } catch {
        // silencioso
      } finally {
        setGuardando(false)
      }
    }, 1000)
  }, [recursoId])

  const handleChange = (texto: string) => {
    setContenido(texto)
    setGuardado(false)
    guardar(texto)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer
                   hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#2E6EA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
          <span className="text-sm font-semibold text-[#1A3A5C]">Mis notas</span>
          {contenido && !abierto && (
            <span className="w-2 h-2 rounded-full bg-[#2E6EA6]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {guardando && <span className="text-[10px] text-gray-400">Guardando...</span>}
          {guardado && <span className="text-[10px] text-green-500">Guardado</span>}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {abierto && (
        <div className="px-5 pb-4 animate-card-in">
          <textarea
            value={contenido}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Escribí tus notas privadas sobre este recurso... Solo vos las ves."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-[#f8f9fc]
                       placeholder-gray-300 resize-none
                       focus:outline-none focus:border-[#2E6EA6] focus:bg-white
                       transition-all duration-200"
          />
          <p className="text-[10px] text-gray-300 mt-1.5">Se guarda automáticamente</p>
        </div>
      )}
    </div>
  )
}
