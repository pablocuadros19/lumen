'use client'

import { useState } from 'react'
import type { EvaluationType } from '@/types/copilot'

interface Props {
  onSubmit: (params: Record<string, unknown>) => void
  cargando: boolean
}

const TIPOS: Array<{ value: EvaluationType; label: string; desc: string }> = [
  { value: 'diagnostica',    label: 'Diagnóstica',     desc: 'Qué saben antes de empezar' },
  { value: 'proceso',        label: 'De proceso',      desc: 'Formativa, durante la unidad' },
  { value: 'sumativa',       label: 'Sumativa',        desc: 'Cierre integrador con criterios' },
  { value: 'rubrica',        label: 'Rúbrica',         desc: 'Matriz de criterios x niveles' },
  { value: 'lista_cotejo',   label: 'Lista de cotejo', desc: 'Verificación rápida sí/no' },
  { value: 'autoevaluacion', label: 'Autoevaluación',  desc: 'Para que el chico reflexione' },
]

export default function EvaluateForm({ onSubmit, cargando }: Props) {
  const [tipo, setTipo] = useState<EvaluationType | null>(null)

  const handleSubmit = () => {
    if (!tipo) return
    onSubmit({ tipo })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#1A3A5C] mb-1">¿Qué tipo de evaluación necesitás?</h3>
        <p className="text-xs text-gray-500">Cada tipo tiene un formato pedagógico propio.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TIPOS.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
              tipo === t.value
                ? 'border-[#8B2252] bg-[#8B2252]/5'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-semibold text-[#1A3A5C]">{t.label}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{t.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={cargando || !tipo}
        className="w-full px-4 py-3 rounded-xl bg-[#8B2252] text-white text-sm font-semibold
                   hover:bg-[#8B2252]/90 transition-colors cursor-pointer
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {cargando ? 'Generando...' : 'Generar evaluación'}
      </button>
    </div>
  )
}
