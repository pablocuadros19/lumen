'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  recursoId: string
  size?: 'sm' | 'md'
}

interface Coleccion {
  id: string
  nombre: string
  color: string
}

export default function AgregarAColeccion({ recursoId, size = 'sm' }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [cargando, setCargando] = useState(false)
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' | 'ya' } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!abierto) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false)
        setCreando(false)
        setMensaje(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [abierto])

  const abrir = async () => {
    setAbierto(true)
    setCargando(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/colecciones')
      if (res.ok) {
        const data = await res.json()
        setColecciones(data)
      }
    } finally {
      setCargando(false)
    }
  }

  const agregarA = async (coleccionId: string) => {
    const res = await fetch(`/api/colecciones/${coleccionId}/recursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurso_id: recursoId }),
    })
    if (res.ok) {
      setMensaje({ texto: 'Agregado', tipo: 'ok' })
      setTimeout(() => { setAbierto(false); setMensaje(null) }, 800)
    } else if (res.status === 409) {
      setMensaje({ texto: 'Ya está en esa colección', tipo: 'ya' })
    } else {
      setMensaje({ texto: 'Error', tipo: 'error' })
    }
  }

  const crearYAgregar = async () => {
    if (!nuevoNombre.trim()) return
    const res = await fetch('/api/colecciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre }),
    })
    if (res.ok) {
      const nueva = await res.json()
      setNuevoNombre('')
      setCreando(false)
      await agregarA(nueva.id)
    } else {
      setMensaje({ texto: 'Error al crear colección', tipo: 'error' })
    }
  }

  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); abierto ? setAbierto(false) : abrir() }}
        className={`${btnSize} rounded-full bg-white/90 shadow-sm flex items-center justify-center
                   text-gray-400 hover:text-[#1A3A5C] hover:bg-white
                   transition-all duration-200 cursor-pointer`}
        title="Agregar a colección"
      >
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {abierto && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-gray-100
                     z-50 overflow-hidden animate-card-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agregar a colección</p>
          </div>

          {mensaje && (
            <div className={`px-3 py-2 text-xs font-medium text-center
              ${mensaje.tipo === 'ok' ? 'text-green-600 bg-green-50' : mensaje.tipo === 'ya' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'}`}>
              {mensaje.texto}
            </div>
          )}

          {cargando ? (
            <div className="px-3 py-4 text-center text-xs text-gray-400">Cargando...</div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {colecciones.length === 0 && !creando && (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">No tenés colecciones</div>
              )}
              {colecciones.map((col) => (
                <button
                  key={col.id}
                  onClick={() => agregarA(col.id)}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-2.5
                             hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-sm text-[#1A3A5C] truncate">{col.nombre}</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100">
            {creando ? (
              <div className="p-2.5 flex gap-2">
                <input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre..."
                  className="flex-1 text-sm px-2.5 py-1.5 rounded-lg bg-[#f8f9fc] border border-gray-200
                             focus:outline-none focus:border-[#1A3A5C]"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && crearYAgregar()}
                />
                <button
                  onClick={crearYAgregar}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1A3A5C] text-white text-xs font-medium cursor-pointer"
                >
                  Crear
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreando(true)}
                className="w-full px-3 py-2.5 text-left flex items-center gap-2
                           text-sm text-[#2E6EA6] font-medium hover:bg-blue-50/50
                           transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nueva colección
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
