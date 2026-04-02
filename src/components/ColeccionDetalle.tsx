'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Recurso } from '@/types/database'
import RecursoCard from '@/components/RecursoCard'

interface Coleccion {
  id: string
  nombre: string
  descripcion: string | null
  color: string
}

interface Props {
  coleccion: Coleccion
  recursosIniciales: Recurso[]
}

export default function ColeccionDetalle({ coleccion, recursosIniciales }: Props) {
  const router = useRouter()
  const [recursos, setRecursos] = useState(recursosIniciales)
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(coleccion.nombre)
  const [descripcion, setDescripcion] = useState(coleccion.descripcion || '')
  const [confirmBorrar, setConfirmBorrar] = useState(false)

  const quitarRecurso = async (recursoId: string) => {
    const res = await fetch(`/api/colecciones/${coleccion.id}/recursos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurso_id: recursoId }),
    })
    if (res.ok) {
      setRecursos(prev => prev.filter(r => r.id !== recursoId))
    }
  }

  const guardarEdicion = async () => {
    const res = await fetch(`/api/colecciones/${coleccion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, color: coleccion.color }),
    })
    if (res.ok) {
      setEditando(false)
      router.refresh()
    }
  }

  const borrarColeccion = async () => {
    const res = await fetch(`/api/colecciones/${coleccion.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/colecciones')
    }
  }

  return (
    <div>
      {/* Header de colección */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${coleccion.color}15` }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: coleccion.color }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div>
            {editando ? (
              <div className="space-y-2">
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="text-xl font-bold text-[#1A3A5C] bg-[#f8f9fc] border border-gray-200 rounded-lg px-3 py-1
                             focus:outline-none focus:border-[#1A3A5C]"
                  autoFocus
                />
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción..."
                  className="block text-sm text-gray-500 bg-[#f8f9fc] border border-gray-200 rounded-lg px-3 py-1 w-full
                             focus:outline-none focus:border-[#1A3A5C]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={guardarEdicion}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#1A3A5C] text-white font-medium cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => { setEditando(false); setNombre(coleccion.nombre); setDescripcion(coleccion.descripcion || '') }}
                    className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#1A3A5C]">{coleccion.nombre}</h1>
                {coleccion.descripcion && (
                  <p className="text-sm text-gray-400 mt-0.5">{coleccion.descripcion}</p>
                )}
              </>
            )}
          </div>
        </div>

        {!editando && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditando(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-[#1A3A5C] hover:bg-gray-100 transition-colors cursor-pointer"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirmBorrar(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Eliminar colección"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      {recursos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto text-[#1A3A5C]/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-gray-400 mb-2">Esta colección está vacía</p>
          <p className="text-xs text-gray-300">Agregá recursos desde la biblioteca usando el botón +</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recursos.map((recurso, i) => (
            <div key={recurso.id} className="relative group/card">
              <RecursoCard
                recurso={recurso}
                index={i}
                onClick={() => router.push(`/recurso/${recurso.id}`)}
              />
              {/* Botón quitar de colección */}
              <button
                onClick={(e) => { e.stopPropagation(); quitarRecurso(recurso.id) }}
                className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full
                           bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50
                           shadow-sm opacity-0 group-hover/card:opacity-100
                           transition-all duration-200 cursor-pointer"
                title="Quitar de la colección"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmar borrar */}
      {confirmBorrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmBorrar(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-sm p-6 text-center animate-card-in">
            <svg className="w-10 h-10 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <h3 className="text-lg font-bold text-[#1A3A5C] mb-1">¿Eliminar colección?</h3>
            <p className="text-sm text-gray-400 mb-5">Se eliminará &quot;{coleccion.nombre}&quot; pero los recursos no se borran.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBorrar(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500
                           border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={borrarColeccion}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
