'use client'

import { useState } from 'react'
import { GRADOS, EJES_TEMATICOS } from '@/lib/constants'

interface Props {
  onClose: () => void
}

export default function SolicitarRecurso({ onClose }: Props) {
  const [descripcion, setDescripcion] = useState('')
  const [grado, setGrado] = useState('')
  const [eje, setEje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async () => {
    if (!descripcion.trim()) return
    setEnviando(true)
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, grado, eje_tematico: eje }),
      })
      if (res.ok) {
        setEnviado(true)
        setTimeout(onClose, 2000)
      }
    } catch {
      // silencioso
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-elevated animate-card-in">
          <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-[#1A3A5C]">Solicitud enviada</p>
          <p className="text-sm text-gray-500 mt-1">La coordinadora va a recibir tu pedido.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated animate-card-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A3A5C]">Solicitar material</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Describí qué material necesitás y la coordinadora lo va a tener en cuenta.
        </p>

        <div className="space-y-4">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Necesito actividades de comprensión lectora con cuentos cortos para 2do grado"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white
                       focus:outline-none focus:border-[#1A3A5C] transition-colors resize-none"
          />

          <div className="flex gap-3">
            <select
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#1A3A5C] transition-colors"
            >
              <option value="">Grado (opcional)</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select
              value={eje}
              onChange={(e) => setEje(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                         focus:outline-none focus:border-[#1A3A5C] transition-colors"
            >
              <option value="">Eje (opcional)</option>
              {EJES_TEMATICOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <button
            onClick={handleEnviar}
            disabled={!descripcion.trim() || enviando}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B2252] to-[#6d1b41]
                       text-white text-sm font-semibold shadow-button
                       hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                       flex items-center justify-center gap-2"
          >
            {enviando && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </div>
    </div>
  )
}
