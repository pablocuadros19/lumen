'use client'

import { useState } from 'react'
import AdaptForm from './AdaptForm'
import SimilarForm from './SimilarForm'
import EvaluateForm from './EvaluateForm'
import GuideForm from './GuideForm'
import AdaptedResourceView from './AdaptedResourceView'
import SimilarActivitiesView from './SimilarActivitiesView'
import EvaluationMaterialView from './EvaluationMaterialView'
import ImplementationGuideView from './ImplementationGuideView'
import FeedbackButtons from './FeedbackButtons'
import type {
  AdaptedResource,
  SimilarActivity,
  EvaluationMaterial,
  ImplementationGuide,
} from '@/types/copilot'

export type CopilotFunctionKey = 'adapt' | 'similar' | 'evaluate' | 'guide'

interface Props {
  recursoId:        string
  initialFunction?: CopilotFunctionKey
}

const FUNCIONES: Array<{ key: CopilotFunctionKey; label: string; descripcion: string; icon: React.ReactNode }> = [
  {
    key: 'adapt',
    label: 'Adaptar recurso',
    descripcion: 'Cambiá grado, accesibilidad, modalidad o duración',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" /></svg>,
  },
  {
    key: 'similar',
    label: 'Crear actividad similar',
    descripcion: 'Generá actividades nuevas inspiradas en esta',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  },
  {
    key: 'evaluate',
    label: 'Material de evaluación',
    descripcion: 'Rúbrica, prueba, lista de cotejo o autoevaluación',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>,
  },
  {
    key: 'guide',
    label: 'Guía para implementar',
    descripcion: 'Cómo llevarlo al aula: materiales, tiempos, dificultades',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  },
]

export default function CopilotPanel({ recursoId, initialFunction }: Props) {
  const [funcion, setFuncion] = useState<CopilotFunctionKey>(initialFunction ?? 'adapt')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<unknown>(null)

  const cambiarFuncion = (key: CopilotFunctionKey) => {
    setFuncion(key)
    setOutput(null)
    setError(null)
  }

  const generar = async (endpoint: string, body: Record<string, unknown>) => {
    setCargando(true)
    setError(null)
    setOutput(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurso_id: recursoId, ...body }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Error generando')
        return
      }
      setOutput(json.data)
    } catch {
      setError('Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de función */}
      <div className="grid grid-cols-2 gap-3">
        {FUNCIONES.map(f => {
          const activa = funcion === f.key
          return (
            <button
              key={f.key}
              onClick={() => cambiarFuncion(f.key)}
              className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                activa
                  ? 'border-[#8B2252] bg-[#8B2252]/5 shadow-card'
                  : 'border-gray-200 bg-white hover:border-[#8B2252]/40'
              }`}
            >
              <div className={`flex items-center gap-2 mb-1 ${activa ? 'text-[#8B2252]' : 'text-[#1A3A5C]'}`}>
                {f.icon}
                <span className="text-sm font-semibold">{f.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-snug">{f.descripcion}</p>
            </button>
          )
        })}
      </div>

      {/* Formulario de parámetros */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-6">
        {funcion === 'adapt' && <AdaptForm onSubmit={p => generar('/api/copilot/adapt', p)} cargando={cargando} />}
        {funcion === 'similar' && <SimilarForm onSubmit={p => generar('/api/copilot/similar', p)} cargando={cargando} />}
        {funcion === 'evaluate' && <EvaluateForm onSubmit={p => generar('/api/copilot/evaluate', p)} cargando={cargando} />}
        {funcion === 'guide' && <GuideForm onSubmit={() => generar('/api/copilot/guide', {})} cargando={cargando} />}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loader */}
      {cargando && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-12 text-center">
          <div className="w-10 h-10 mx-auto border-3 border-[#8B2252]/20 border-t-[#8B2252] rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generando con IA...</p>
          <p className="text-xs text-gray-400 mt-1">Puede tomar 10-20 segundos</p>
        </div>
      )}

      {/* Output */}
      {output !== null && !cargando && (
        <div className="space-y-4">
          {funcion === 'adapt'    && <AdaptedResourceView    data={output as AdaptedResource} />}
          {funcion === 'similar'  && <SimilarActivitiesView  data={output as { actividades: SimilarActivity[]; meta: { generation_id: string } }} />}
          {funcion === 'evaluate' && <EvaluationMaterialView data={output as EvaluationMaterial} />}
          {funcion === 'guide'    && <ImplementationGuideView data={output as ImplementationGuide} />}

          <FeedbackButtons generationId={(output as { meta: { generation_id: string } }).meta.generation_id} />
        </div>
      )}
    </div>
  )
}
