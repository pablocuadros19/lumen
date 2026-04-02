'use client'

import { useState } from 'react'
import { GRADOS } from '@/lib/constants'

interface Props {
  recursoId: string
  accion: string
  label: string
  onClose: () => void
}

export default function CopilotoModal({ recursoId, accion, label, onClose }: Props) {
  const [respuesta, setRespuesta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [gradoDestino, setGradoDestino] = useState('')
  const [iniciado, setIniciado] = useState(accion !== 'adaptar') // Para adaptar, esperar selección de grado

  const ejecutar = async (grado?: string) => {
    setCargando(true)
    setError('')
    setRespuesta('')
    try {
      const res = await fetch('/api/copiloto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recurso_id: recursoId,
          accion,
          grado_destino: grado || gradoDestino || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al procesar')
        return
      }
      const data = await res.json()
      setRespuesta(data.respuesta)
    } catch {
      setError('Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  // Auto-ejecutar para acciones que no son adaptar
  if (iniciado && !cargando && !respuesta && !error) {
    ejecutar()
  }

  const copiar = async () => {
    await navigator.clipboard.writeText(respuesta)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-2xl max-h-[85vh] flex flex-col animate-card-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B2252]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#8B2252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1A3A5C]">{label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selector de grado para "adaptar" */}
        {accion === 'adaptar' && !iniciado && (
          <div className="px-6 py-6">
            <p className="text-sm text-gray-500 mb-4">¿A qué grado querés adaptar este recurso?</p>
            <div className="flex flex-wrap gap-2">
              {GRADOS.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGradoDestino(g)
                    setIniciado(true)
                    ejecutar(g)
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium
                             bg-[#1A3A5C]/6 text-[#1A3A5C] border border-[#1A3A5C]/12
                             hover:bg-[#1A3A5C]/15 hover:border-[#1A3A5C]/25
                             transition-all cursor-pointer"
                >
                  {g} grado
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-[#8B2252]/20 border-t-[#8B2252] rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400">Generando con IA...</p>
              <p className="text-xs text-gray-300 mt-1">Puede tomar unos segundos</p>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {respuesta && (
            <div className="prose prose-sm max-w-none
                            prose-headings:text-[#1A3A5C] prose-headings:font-bold
                            prose-strong:text-[#1A3A5C]
                            prose-li:text-gray-600
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-table:text-sm
                            prose-th:bg-[#1A3A5C]/6 prose-th:text-[#1A3A5C] prose-th:font-semibold prose-th:px-3 prose-th:py-2
                            prose-td:px-3 prose-td:py-2 prose-td:border-gray-200">
              {/* Renderizar markdown como texto con formato básico */}
              {respuesta.split('\n').map((linea, i) => {
                if (linea.startsWith('### ')) return <h3 key={i}>{linea.slice(4)}</h3>
                if (linea.startsWith('## ')) return <h2 key={i}>{linea.slice(3)}</h2>
                if (linea.startsWith('# ')) return <h1 key={i}>{linea.slice(2)}</h1>
                if (linea.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-gray-600 text-sm">{formatBold(linea.slice(2))}</li>
                if (/^\d+\.\s/.test(linea)) return <li key={i} className="ml-4 list-decimal text-gray-600 text-sm">{formatBold(linea.replace(/^\d+\.\s/, ''))}</li>
                if (linea.startsWith('|')) return <pre key={i} className="text-xs bg-gray-50 px-3 py-1 rounded font-mono whitespace-pre-wrap">{linea}</pre>
                if (linea.startsWith('---') || linea.startsWith('***')) return <hr key={i} className="my-3 border-gray-200" />
                if (linea.trim() === '') return <div key={i} className="h-2" />
                return <p key={i} className="text-sm text-gray-600 leading-relaxed">{formatBold(linea)}</p>
              })}
            </div>
          )}
        </div>

        {/* Footer con botón copiar */}
        {respuesta && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={copiar}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${copiado
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-[#1A3A5C] text-white hover:bg-[#1A3A5C]/90'
                }`}
            >
              {copiado ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copiar texto
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper para formatear **bold** dentro de texto
function formatBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1A3A5C]">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
