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

interface Colaborador {
  id: string
  nombre: string
  email: string
}

interface Props {
  coleccion: Coleccion
  recursosIniciales: Recurso[]
  isOwner?: boolean
  colaboradoresIniciales?: Colaborador[]
}

export default function ColeccionDetalle({ coleccion, recursosIniciales, isOwner = true, colaboradoresIniciales = [] }: Props) {
  const router = useRouter()
  const [recursos, setRecursos] = useState(recursosIniciales)
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(coleccion.nombre)
  const [descripcion, setDescripcion] = useState(coleccion.descripcion || '')
  const [confirmBorrar, setConfirmBorrar] = useState(false)

  // Colaboradores
  const [colaboradores, setColaboradores] = useState(colaboradoresIniciales)
  const [mostrarInvitar, setMostrarInvitar] = useState(false)
  const [emailInvitar, setEmailInvitar] = useState('')
  const [invitando, setInvitando] = useState(false)
  const [errorInvitar, setErrorInvitar] = useState('')

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

  const invitarColaborador = async () => {
    if (!emailInvitar.trim()) return
    setInvitando(true)
    setErrorInvitar('')

    try {
      const res = await fetch(`/api/colecciones/${coleccion.id}/colaboradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInvitar.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorInvitar(data.error)
      } else {
        setColaboradores(prev => [...prev, data])
        setEmailInvitar('')
        setMostrarInvitar(false)
      }
    } catch {
      setErrorInvitar('Error de conexión')
    } finally {
      setInvitando(false)
    }
  }

  const quitarColaborador = async (userId: string) => {
    const res = await fetch(`/api/colecciones/${coleccion.id}/colaboradores`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setColaboradores(prev => prev.filter(c => c.id !== userId))
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

        {!editando && isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarInvitar(!mostrarInvitar)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                mostrarInvitar
                  ? 'text-[#2E6EA6] bg-[#2E6EA6]/10'
                  : 'text-gray-400 hover:text-[#2E6EA6] hover:bg-[#2E6EA6]/5'
              }`}
              title="Compartir colección"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </button>
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

      {/* Panel de colaboradores */}
      {mostrarInvitar && isOwner && (
        <div className="mb-6 p-5 rounded-2xl bg-white border border-[#2E6EA6]/15 shadow-sm animate-card-in">
          <h3 className="text-sm font-semibold text-[#1A3A5C] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2E6EA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Colaboradores
          </h3>

          {/* Lista de colaboradores */}
          {colaboradores.length > 0 && (
            <div className="space-y-2 mb-4">
              {colaboradores.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                  <div className="w-7 h-7 rounded-full bg-[#2E6EA6]/10 flex items-center justify-center text-xs font-bold text-[#2E6EA6]">
                    {c.nombre[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A3A5C] truncate">{c.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <button
                    onClick={() => quitarColaborador(c.id)}
                    className="text-xs text-gray-400 hover:text-red-500 cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Invitar */}
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInvitar}
              onChange={(e) => { setEmailInvitar(e.target.value); setErrorInvitar('') }}
              placeholder="Email del docente..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#2E6EA6] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && invitarColaborador()}
            />
            <button
              onClick={invitarColaborador}
              disabled={invitando || !emailInvitar.trim()}
              className="px-4 py-2 rounded-xl bg-[#2E6EA6] text-white text-sm font-medium
                         hover:bg-[#245d8f] disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors cursor-pointer"
            >
              {invitando ? '...' : 'Invitar'}
            </button>
          </div>
          {errorInvitar && (
            <p className="text-xs text-red-500 mt-2">{errorInvitar}</p>
          )}
        </div>
      )}

      {/* Indicador de colaboradores (vista no-owner o cuando hay colaboradores) */}
      {!mostrarInvitar && colaboradores.length > 0 && (
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Compartida con {colaboradores.map(c => c.nombre.split(' ')[0]).join(', ')}
        </div>
      )}

      {/* Contenido */}
      {recursos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto text-[#1A3A5C]/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-gray-400 mb-2">Esta colección está vacía</p>
          <p className="text-xs text-gray-300">Agregá recursos desde la plataforma usando el botón +</p>
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
