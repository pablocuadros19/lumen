'use client'

import Link from 'next/link'

interface EfemerideProxima {
  id: string
  nombre: string
  mes: number
  dia: number
  cantidadRecursos: number
  diasRestantes: number
}

interface Props {
  efemeride: EfemerideProxima
}

const MESES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default function EfemeridesBanner({ efemeride }: Props) {
  const fechaTexto = `${efemeride.dia} de ${MESES[efemeride.mes]}`
  const esHoy = efemeride.diasRestantes === 0
  const esMañana = efemeride.diasRestantes === 1

  const tiempoTexto = esHoy
    ? 'Hoy'
    : esMañana
      ? 'Mañana'
      : `En ${efemeride.diasRestantes} días`

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#1A3A5C]/5 via-[#2E6EA6]/5 to-[#8B2252]/5 border border-[#2E6EA6]/15">
      {/* Ícono calendario */}
      <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-[#8B2252] uppercase leading-none">{MESES[efemeride.mes]}</span>
        <span className="text-lg font-bold text-[#1A3A5C] leading-none">{efemeride.dia}</span>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#1A3A5C]">{efemeride.nombre}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            esHoy
              ? 'bg-[#8B2252]/10 text-[#8B2252]'
              : 'bg-[#2E6EA6]/10 text-[#2E6EA6]'
          }`}>
            {tiempoTexto} · {fechaTexto}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {efemeride.cantidadRecursos > 0
            ? `${efemeride.cantidadRecursos} recurso${efemeride.cantidadRecursos > 1 ? 's' : ''} disponible${efemeride.cantidadRecursos > 1 ? 's' : ''}`
            : 'No hay recursos vinculados todavía'
          }
        </p>
      </div>

      {/* Acción */}
      {efemeride.cantidadRecursos === 0 ? (
        <Link
          href="/subir"
          className="text-xs font-semibold text-[#8B2252] hover:text-[#6d1b41] px-3 py-2 rounded-xl
                     hover:bg-[#8B2252]/5 transition-colors shrink-0"
        >
          Subí material
        </Link>
      ) : (
        <span className="text-xs text-[#2E6EA6] font-medium shrink-0">
          <svg className="w-4 h-4 inline -mt-0.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Con material
        </span>
      )}
    </div>
  )
}
