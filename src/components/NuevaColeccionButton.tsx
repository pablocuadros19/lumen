'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COLORES = ['#1A3A5C', '#8B2252', '#2E6EA6', '#2D8659', '#D4A017', '#6B4C9A', '#C75B39']

export default function NuevaColeccionButton() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [color, setColor] = useState('#1A3A5C')
  const [guardando, setGuardando] = useState(false)

  const crear = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    try {
      const res = await fetch('/api/colecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion, color }),
      })
      if (res.ok) {
        setAbierto(false)
        setNombre('')
        setDescripcion('')
        setColor('#1A3A5C')
        router.refresh()
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                   bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                   text-sm font-semibold shadow-sm
                   hover:shadow-lg hover:-translate-y-0.5
                   active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nueva colección
      </button>

      {/* Modal */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAbierto(false)} />
          <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-md p-6 animate-card-in">
            <h2 className="text-lg font-bold text-[#1A3A5C] mb-4">Nueva colección</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Actividades de lectura"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#f8f9fc] border border-gray-200
                             focus:outline-none focus:border-[#1A3A5C] focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Para qué es esta colección..."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#f8f9fc] border border-gray-200
                             focus:outline-none focus:border-[#1A3A5C] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Color</label>
                <div className="flex gap-2">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer
                        ${color === c ? 'ring-2 ring-offset-2 ring-[#1A3A5C] scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAbierto(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-500
                           border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={crear}
                disabled={!nombre.trim() || guardando}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6]
                           hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {guardando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
