'use client'

import { useState } from 'react'

interface Usuario {
  id: string
  email: string
  nombre: string | null
  rol: string
  created_at: string
}

const LABEL_ROL: Record<string, string> = {
  directivo: 'Directivo',
  admin: 'Coordinador',
  docente: 'Docente',
}

const COLOR_ROL: Record<string, string> = {
  directivo: 'bg-[#1A3A5C]/10 text-[#1A3A5C] border border-[#1A3A5C]/15',
  admin: 'bg-[#8B2252]/10 text-[#8B2252] border border-[#8B2252]/15',
  docente: 'bg-gray-100 text-gray-600 border border-gray-200',
}

export default function GestionUsuarios({ usuarios: init, userId }: { usuarios: Usuario[]; userId: string }) {
  const [lista, setLista] = useState(init)
  const [cambiando, setCambiando] = useState<string | null>(null)
  const [error, setError] = useState('')

  const cambiarRol = async (id: string, nuevoRol: string) => {
    setCambiando(id)
    setError('')
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    })
    if (res.ok) {
      setLista(prev => prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
    } else {
      const data = await res.json()
      setError(data.error || 'Error al cambiar rol')
    }
    setCambiando(null)
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-[#1A3A5C] mb-1">Gestión de usuarios</h2>
      <p className="text-xs text-gray-400 mb-5">
        Los coordinadores pueden revisar y aprobar materiales. Los directivos gestionan el equipo.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        {lista.map(u => (
          <div
            key={u.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A3A5C] truncate">
                {u.nombre || u.email}
                {u.id === userId && (
                  <span className="ml-2 text-[10px] text-gray-400 font-normal">(vos)</span>
                )}
              </p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
            </div>

            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${COLOR_ROL[u.rol] || COLOR_ROL.docente}`}>
              {LABEL_ROL[u.rol] || u.rol}
            </span>

            {/* Solo se puede cambiar a docentes y admins — no directivos ni a uno mismo */}
            {u.id !== userId && u.rol !== 'directivo' && (
              <div className="flex gap-1.5 shrink-0">
                {u.rol !== 'admin' && (
                  <button
                    onClick={() => cambiarRol(u.id, 'admin')}
                    disabled={cambiando === u.id}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                               bg-[#8B2252]/8 text-[#8B2252] hover:bg-[#8B2252]/15
                               transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {cambiando === u.id ? '...' : '↑ Coordinador'}
                  </button>
                )}
                {u.rol !== 'docente' && (
                  <button
                    onClick={() => cambiarRol(u.id, 'docente')}
                    disabled={cambiando === u.id}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                               bg-gray-100 text-gray-500 hover:bg-gray-200
                               transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {cambiando === u.id ? '...' : '↓ Docente'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
