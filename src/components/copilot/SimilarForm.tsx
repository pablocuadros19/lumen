'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (params: Record<string, unknown>) => void
  cargando: boolean
}

export default function SimilarForm({ onSubmit, cargando }: Props) {
  const [cantidad, setCantidad] = useState<1 | 3 | 5>(3)
  const [mismoContenido, setMismoContenido] = useState(true)
  const [ajusteGrado, setAjusteGrado] = useState<'mismo' | 'mas_uno' | 'menos_uno'>('mismo')
  const [dificultad, setDificultad] = useState<'mas_facil' | 'igual' | 'mas_desafiante'>('igual')
  const [formato, setFormato] = useState<'mismo' | 'cambiar'>('mismo')

  const handleSubmit = () => {
    onSubmit({
      cantidad,
      mismo_contenido: mismoContenido,
      ajuste_grado:    ajusteGrado,
      dificultad,
      formato,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#1A3A5C] mb-1">¿Cómo querés las actividades nuevas?</h3>
        <p className="text-xs text-gray-500">Toman la estructura de la original como inspiración.</p>
      </div>

      <FieldRow label="Cantidad">
        <ChipGroup
          value={cantidad}
          onChange={v => setCantidad(v as 1 | 3 | 5)}
          options={[{ value: 1, label: '1' }, { value: 3, label: '3' }, { value: 5, label: '5' }]}
        />
      </FieldRow>

      <FieldRow label="Tema">
        <ChipGroup
          value={mismoContenido ? 'mismo' : 'otro'}
          onChange={v => setMismoContenido(v === 'mismo')}
          options={[{ value: 'mismo', label: 'Mismo tema' }, { value: 'otro', label: 'Otro relacionado' }]}
        />
      </FieldRow>

      <FieldRow label="Grado">
        <ChipGroup
          value={ajusteGrado}
          onChange={v => setAjusteGrado(v as typeof ajusteGrado)}
          options={[
            { value: 'menos_uno', label: '− 1 grado' },
            { value: 'mismo',     label: 'Mismo' },
            { value: 'mas_uno',   label: '+ 1 grado' },
          ]}
        />
      </FieldRow>

      <FieldRow label="Dificultad">
        <ChipGroup
          value={dificultad}
          onChange={v => setDificultad(v as typeof dificultad)}
          options={[
            { value: 'mas_facil',      label: 'Más fácil' },
            { value: 'igual',          label: 'Igual' },
            { value: 'mas_desafiante', label: 'Más desafiante' },
          ]}
        />
      </FieldRow>

      <FieldRow label="Formato">
        <ChipGroup
          value={formato}
          onChange={v => setFormato(v as typeof formato)}
          options={[
            { value: 'mismo',   label: 'Mismo formato' },
            { value: 'cambiar', label: 'Cambiar formato' },
          ]}
        />
      </FieldRow>

      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full px-4 py-3 rounded-xl bg-[#8B2252] text-white text-sm font-semibold
                   hover:bg-[#8B2252]/90 transition-colors cursor-pointer disabled:opacity-40"
      >
        {cargando ? 'Generando...' : `Generar ${cantidad} actividad${cantidad > 1 ? 'es' : ''}`}
      </button>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider shrink-0">{label}</label>
      <div>{children}</div>
    </div>
  )
}

function ChipGroup<T extends string | number>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <div className="flex gap-1.5">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-[#8B2252] text-white border-[#8B2252]'
              : 'bg-white text-[#1A3A5C] border-gray-200 hover:border-[#8B2252]/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
