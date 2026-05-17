'use client'

import PrintBlocks from './PrintBlocks'
import NombreFecha from './NombreFecha'
import type { AdaptedResource } from '@/types/copilot'

export default function PrintAdaptedResource({ data }: { data: AdaptedResource }) {
  return (
    <article>
      <h1 className="text-2xl font-bold text-[#1A3A5C] leading-tight">{data.titulo}</h1>
      <p className="text-xs text-gray-500 mt-1">
        {data.area}{data.eje_tematico ? ' · ' + data.eje_tematico : ''} · {data.grado_destino}° grado
      </p>

      <NombreFecha />

      <div className="mt-4">
        <PrintBlocks blocks={data.contenido} />
      </div>
    </article>
  )
}
