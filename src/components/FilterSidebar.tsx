'use client'

import { GRADOS, EJES_TEMATICOS, TIPOS_RECURSO } from '@/lib/constants'

interface FilterSidebarProps {
  gradosActivos: string[]
  ejesActivos: string[]
  tiposActivos: string[]
  soloEditable: boolean | null
  onToggleGrado: (grado: string) => void
  onToggleEje: (eje: string) => void
  onToggleTipo: (tipo: string) => void
  onToggleEditable: (val: boolean | null) => void
}

function PillGroup({
  title,
  options,
  activos,
  onToggle,
  activeColor = '#1A3A5C',
}: {
  title: string
  options: readonly string[]
  activos: string[]
  onToggle: (val: string) => void
  activeColor?: string
}) {
  return (
    <div className="mb-5">
      <h3 className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeColor }} />
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = activos.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium
                         transition-all duration-200 ease-[var(--ease-smooth)] cursor-pointer"
              style={{
                backgroundColor: isActive ? activeColor : '#f3f4f6',
                color: isActive ? 'white' : '#6b7280',
                border: isActive ? `1px solid ${activeColor}` : '1px solid #e5e7eb',
                boxShadow: isActive ? `0 2px 4px ${activeColor}33` : 'none',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function FilterSidebar({
  gradosActivos,
  ejesActivos,
  tiposActivos,
  soloEditable,
  onToggleGrado,
  onToggleEje,
  onToggleTipo,
  onToggleEditable,
}: FilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100/60 p-5 overflow-y-auto">
      <h2 className="text-sm font-bold text-[#1A3A5C] mb-1">Filtros</h2>
      <div className="w-full h-px bg-gradient-to-r from-[#8B2252] via-[#2E6EA6]/30 to-transparent rounded-full mb-5" />

      <PillGroup
        title="Grado"
        options={GRADOS}
        activos={gradosActivos}
        onToggle={onToggleGrado}
        activeColor="#1A3A5C"
      />

      <PillGroup
        title="Eje temático"
        options={EJES_TEMATICOS}
        activos={ejesActivos}
        onToggle={onToggleEje}
        activeColor="#8B2252"
      />

      <PillGroup
        title="Tipo de recurso"
        options={TIPOS_RECURSO}
        activos={tiposActivos}
        onToggle={onToggleTipo}
        activeColor="#2E6EA6"
      />

      <div className="mb-5">
        <h3 className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A3A5C]" />
          Editable
        </h3>
        <div className="flex gap-1.5">
          {[
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ].map(({ label, value }) => {
            const isActive = soloEditable === value
            return (
              <button
                key={label}
                onClick={() => onToggleEditable(isActive ? null : value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium
                           transition-all duration-200 ease-[var(--ease-smooth)] cursor-pointer"
                style={{
                  backgroundColor: isActive ? '#1A3A5C' : '#f3f4f6',
                  color: isActive ? 'white' : '#6b7280',
                  border: isActive ? '1px solid #1A3A5C' : '1px solid #e5e7eb',
                  boxShadow: isActive ? '0 2px 4px rgba(26,58,92,0.2)' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
