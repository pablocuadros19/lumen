'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BorrarRecursoButton({ recursoId }: { recursoId: string }) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)

  const handleBorrar = async () => {
    setBorrando(true)
    try {
      const res = await fetch(`/api/recurso/${recursoId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
      } else {
        const data = await res.json()
        alert(data.error || 'Error al borrar')
        setBorrando(false)
        setConfirmando(false)
      }
    } catch {
      alert('Error de conexión')
      setBorrando(false)
      setConfirmando(false)
    }
  }

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-red-400
                   hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200
                   transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        Eliminar recurso
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-red-500 text-center">¿Seguro? Esta acción no se puede deshacer.</p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirmando(false)}
          disabled={borrando}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-500 border border-gray-200
                     hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleBorrar}
          disabled={borrando}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-white bg-red-500
                     hover:bg-red-600 transition-colors cursor-pointer
                     disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {borrando ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Sí, borrar'
          )}
        </button>
      </div>
    </div>
  )
}
