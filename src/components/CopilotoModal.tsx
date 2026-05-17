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
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [gradoDestino, setGradoDestino] = useState('')
  const [iniciado, setIniciado] = useState(accion !== 'adaptar')
  const [feedback, setFeedback] = useState<1 | -1 | null>(null)
  const [enviandoFeedback, setEnviandoFeedback] = useState(false)

  const ejecutar = async (grado?: string) => {
    setCargando(true)
    setError('')
    setRespuesta('')
    setGenerationId(null)
    setFeedback(null)
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
      setGenerationId(data.generation_id ?? null)
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

  const darFeedback = async (score: 1 | -1) => {
    if (!generationId || enviandoFeedback) return
    setEnviandoFeedback(true)
    setFeedback(score)
    try {
      await fetch('/api/copiloto/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generationId, score }),
      })
    } catch {
      // El feedback es best-effort — no molestamos al docente si falla
    } finally {
      setEnviandoFeedback(false)
    }
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

        {/* Footer */}
        {respuesta && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            {/* Feedback 👍/👎 */}
            <div className="flex items-center gap-1">
              {feedback === null ? (
                <>
                  <span className="text-xs text-gray-400 mr-1">¿Útil?</span>
                  <button
                    onClick={() => darFeedback(1)}
                    disabled={enviandoFeedback}
                    title="Sí, me sirvió"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => darFeedback(-1)}
                    disabled={enviandoFeedback}
                    title="No me sirvió"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.861-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                    </svg>
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400">
                  {feedback === 1 ? '¡Gracias! Nos ayuda a mejorar.' : 'Gracias por el feedback.'}
                </span>
              )}
            </div>

            {/* Copiar */}
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

function formatBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#1A3A5C]">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
