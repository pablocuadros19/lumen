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

function CheckboxGroup({
  title,
  options,
  activos,
  onToggle,
  accentColor = '#1A3A5C',
}: {
  title: string
  options: readonly string[]
  activos: string[]
  onToggle: (val: string) => void
  accentColor?: string
}) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-[#8B2252] uppercase tracking-wider mb-2.5">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const isActive = activos.includes(opt)
          return (
            <label
              key={opt}
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => onToggle(opt)}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  border: isActive ? `2px solid ${accentColor}` : '2px solid #d0d5dd',
                }}
              >
                {isActive && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${isActive ? 'text-[#1A3A5C] font-medium' : 'text-gray-500 group-hover:text-[#1A3A5C]'} transition-colors`}>
                {opt}
              </span>
            </label>
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
    <aside className="w-56 shrink-0 bg-gradient-to-b from-white to-gray-50/50
                      border-r border-gray-100/60 p-4 overflow-y-auto">
      <h2 className="text-sm font-bold text-[#1A3A5C] mb-1">Filtros</h2>
      <div className="w-10 h-0.5 bg-gradient-to-r from-[#8B2252] to-[#8B2252]/30 rounded-full mb-4" />

      <CheckboxGroup
        title="Grado"
        options={GRADOS}
        activos={gradosActivos}
        onToggle={onToggleGrado}
        accentColor="#1A3A5C"
      />

      <CheckboxGroup
        title="Eje temático"
        options={EJES_TEMATICOS}
        activos={ejesActivos}
        onToggle={onToggleEje}
        accentColor="#8B2252"
      />

      <CheckboxGroup
        title="Tipo de recurso"
        options={TIPOS_RECURSO}
        activos={tiposActivos}
        onToggle={onToggleTipo}
        accentColor="#2E6EA6"
      />

      <div className="mb-5">
        <h3 className="text-xs font-semibold text-[#8B2252] uppercase tracking-wider mb-2.5">Editable</h3>
        <div className="space-y-2">
          {[
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ].map(({ label, value }) => {
            const isActive = soloEditable === value
            return (
              <label
                key={label}
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => onToggleEditable(isActive ? null : value)}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: isActive ? '#1A3A5C' : 'transparent',
                    border: isActive ? '2px solid #1A3A5C' : '2px solid #d0d5dd',
                  }}
                >
                  {isActive && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${isActive ? 'text-[#1A3A5C] font-medium' : 'text-gray-500 group-hover:text-[#1A3A5C]'} transition-colors`}>
                  {label}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
