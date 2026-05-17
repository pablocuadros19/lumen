'use client'

import OutputCard from './OutputCard'
import ResourceBlocks from './ResourceBlocks'
import type { SimilarActivity } from '@/types/copilot'

interface Data {
  actividades: SimilarActivity[]
  meta:        { generation_id: string; source_resource_id?: string }
}

export default function SimilarActivitiesView({ data }: { data: Data }) {
  const printUrl = data.meta.source_resource_id
    ? `/copilot/${data.meta.source_resource_id}/print?gen=${data.meta.generation_id}`
    : undefined

  return (
    <div className="space-y-4">
      {data.actividades.map((act, i) => {
        const textoPlano = `# ${act.titulo}\n\n${act.tipo_actividad} · ${act.area} · ${act.grado}° grado\n\n${act.diferencias_clave}\n\n${act.contenido.map(b => 'kind' in b && b.kind === 'consigna' ? `${b.numero}. ${b.texto}` : '').filter(Boolean).join('\n')}`
        return (
          <OutputCard
            key={i}
            title={act.titulo}
            subtitle={`${act.tipo_actividad} · ${act.area} · ${act.grado}° grado`}
            textToCopy={textoPlano}
            // Solo mostramos botón "Imprimir" en la primera card —
            // imprime el conjunto completo de actividades
            printUrl={i === 0 ? printUrl : undefined}
          >
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Qué la diferencia del original</div>
              <p className="text-xs text-gray-700 leading-relaxed">{act.diferencias_clave}</p>
            </div>
            <ResourceBlocks blocks={act.contenido} />
          </OutputCard>
        )
      })}
    </div>
  )
}
