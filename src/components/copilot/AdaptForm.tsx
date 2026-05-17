'use client'

import { useState } from 'react'
import type { DuaLevel } from '@/types/copilot'

interface Props {
  onSubmit: (params: Record<string, unknown>) => void
  cargando: boolean
}

const GRADOS = [1, 2, 3, 4, 5, 6, 7] as const

const DUA_OPTIONS: Array<{ value: DuaLevel; label: string; helper: string }> = [
  { value: 'estandar',         label: 'Estándar',         helper: 'Sin cambios de accesibilidad' },
  { value: 'leve',             label: 'Adaptación leve',  helper: 'Frases cortas, vocabulario simple' },
  { value: 'profunda',         label: 'Adaptación profunda', helper: 'Lectura fácil, apoyos visuales' },
  { value: 'enriquecimiento',  label: 'Enriquecimiento',  helper: 'Más complejidad, preguntas abiertas' },
]

const MODALIDAD_OPTIONS = [
  { value: 'presencial',           label: 'Presencial' },
  { value: 'domiciliario',         label: 'Domiciliario' },
  { value: 'virtual_asincronico',  label: 'Virtual asincrónico' },
] as const

const TIEMPO_OPTIONS = [
  { value: 30,  label: '≤ 30 min' },
  { value: 60,  label: '40-60 min (un módulo)' },
  { value: 120, label: '80+ min (módulo doble)' },
] as const

export default function AdaptForm({ onSubmit, cargando }: Props) {
  const [grado, setGrado] = useState<number | null>(null)
  const [dua, setDua] = useState<DuaLevel | null>(null)
  const [modalidad, setModalidad] = useState<typeof MODALIDAD_OPTIONS[number]['value'] | null>(null)
  const [tiempo, setTiempo] = useState<number | null>(null)

  const handleSubmit = () => {
    const params: Record<string, unknown> = {}
    if (grado)     params.grado_destino = grado
    if (dua)       params.dua_level     = dua
    if (modalidad) params.modalidad     = modalidad
    if (tiempo)    params.tiempo_min    = tiempo
    onSubmit(params)
  }

  const algoSeleccionado = grado || dua || modalidad || tiempo

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#1A3A5C] mb-1">¿Qué querés ajustar?</h3>
        <p className="text-xs text-gray-500">Elegí uno o varios ejes. Lo que no selecciones queda como está.</p>
      </div>

      {/* Grado */}
      <Section title="Grado destino" reset={() => setGrado(null)} hasValue={!!grado}>
        <div className="flex flex-wrap gap-2">
          {GRADOS.map(g => (
            <Chip key={g} selected={grado === g} onClick={() => setGrado(g)}>{g}°</Chip>
          ))}
        </div>
      </Section>

      {/* DUA */}
      <Section title="Perfil DUA (accesibilidad)" reset={() => setDua(null)} hasValue={!!dua}>
        <div className="grid grid-cols-2 gap-2">
          {DUA_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDua(opt.value)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                dua === opt.value
                  ? 'border-[#8B2252] bg-[#8B2252]/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-semibold text-[#1A3A5C]">{opt.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{opt.helper}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Modalidad */}
      <Section title="Modalidad" reset={() => setModalidad(null)} hasValue={!!modalidad}>
        <div className="flex flex-wrap gap-2">
          {MODALIDAD_OPTIONS.map(opt => (
            <Chip key={opt.value} selected={modalidad === opt.value} onClick={() => setModalidad(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Tiempo */}
      <Section title="Tiempo disponible" reset={() => setTiempo(null)} hasValue={!!tiempo}>
        <div className="flex flex-wrap gap-2">
          {TIEMPO_OPTIONS.map(opt => (
            <Chip key={opt.value} selected={tiempo === opt.value} onClick={() => setTiempo(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </Section>

      <button
        onClick={handleSubmit}
        disabled={cargando || !algoSeleccionado}
        className="w-full px-4 py-3 rounded-xl bg-[#8B2252] text-white text-sm font-semibold
                   hover:bg-[#8B2252]/90 transition-colors cursor-pointer
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {cargando ? 'Generando...' : 'Generar adaptación'}
      </button>
    </div>
  )
}

function Section({
  title, children, reset, hasValue,
}: { title: string; children: React.ReactNode; reset: () => void; hasValue: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider">{title}</label>
        {hasValue && (
          <button onClick={reset} className="text-[11px] text-gray-400 hover:text-[#8B2252] cursor-pointer">
            limpiar
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Chip({
  children, selected, onClick,
}: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
        selected
          ? 'bg-[#8B2252] text-white border-[#8B2252]'
          : 'bg-white text-[#1A3A5C] border-gray-200 hover:border-[#8B2252]/40'
      }`}
    >
      {children}
    </button>
  )
}
