'use client'

import PrintBlocks from './PrintBlocks'
import NombreFecha from './NombreFecha'
import type { SimilarActivity } from '@/types/copilot'

interface Data {
  actividades: SimilarActivity[]
}

export default function PrintSimilarActivities({ data }: { data: Data }) {
  return (
    <>
      {data.actividades.map((act, i) => (
        <article
          key={i}
          // Cada actividad arranca en página nueva (excepto la primera)
          className={i > 0 ? 'print-page-break' : ''}
        >
          <h1 className="text-2xl font-bold text-[#1A3A5C] leading-tight">{act.titulo}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {act.tipo_actividad} · {act.area} · {act.grado}° grado
          </p>

          <NombreFecha />

          <div className="mt-4">
            <PrintBlocks blocks={act.contenido} />
          </div>
        </article>
      ))}
    </>
  )
}
