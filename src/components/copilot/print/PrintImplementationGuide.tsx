'use client'

import type { ImplementationGuide } from '@/types/copilot'

// La guía es distinta: NO es una ficha para el chico, es un machete
// para que la docente lo lleve al aula. Layout tipo "ficha rápida"
// con secciones compactas en columnas para que entre en una página.
export default function PrintImplementationGuide({ data }: { data: ImplementationGuide }) {
  return (
    <article>
      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>Guía para el docente</div>
      <h1 className="text-2xl font-bold leading-tight mt-0.5" style={{ color: 'var(--color-primary)' }}>
        Cómo implementar este recurso
      </h1>
      <p className="text-xs text-gray-500 mt-1">
        {data.ambientacion.tiempo_estimado_min} minutos estimados
      </p>

      <div className="mt-4 space-y-4">
        <Box title="Para qué sirve">
          <p className="text-sm text-gray-800 leading-relaxed">{data.para_que_sirve}</p>
        </Box>

        <div className="grid grid-cols-2 gap-3">
          <Box title="Materiales">
            <ul className="text-sm text-gray-800 space-y-0.5">
              {data.materiales.map((m, i) => <li key={i}>· {m}</li>)}
            </ul>
          </Box>
          <Box title="Antes de empezar">
            <ul className="text-sm text-gray-800 space-y-1">
              {data.ambientacion.disposicion_aula && <li><strong>Aula:</strong> {data.ambientacion.disposicion_aula}</li>}
              {data.ambientacion.agrupamientos    && <li><strong>Agrupamientos:</strong> {data.ambientacion.agrupamientos}</li>}
              {data.ambientacion.luces            && <li><strong>Ambientación:</strong> {data.ambientacion.luces}</li>}
              <li><strong>Tiempo:</strong> {data.ambientacion.tiempo_estimado_min} min</li>
            </ul>
          </Box>
        </div>

        <Box title="Cómo presentarlo">
          <ol className="text-sm text-gray-800 space-y-1 pl-4">
            {data.como_presentarlo.map((p, i) => (
              <li key={i} className="list-decimal">{p}</li>
            ))}
          </ol>
        </Box>

        <Box title="Posibles dificultades">
          <div className="space-y-2">
            {data.posibles_dificultades.map((d, i) => (
              <div key={i}>
                <div className="text-sm font-semibold text-[#1A3A5C]">{d.que}</div>
                <div className="text-sm text-gray-700">→ {d.como_destrabarlo}</div>
              </div>
            ))}
          </div>
        </Box>

        <Box title="Para cerrar">
          <p className="text-sm text-gray-800 leading-relaxed">{data.para_cerrar}</p>
        </Box>

        <div className="grid grid-cols-2 gap-3">
          {data.si_sobra_tiempo && (
            <Box title="Si te sobra tiempo">
              <p className="text-sm text-gray-800 leading-relaxed">{data.si_sobra_tiempo}</p>
            </Box>
          )}
          {data.si_falta_tiempo && (
            <Box title="Si te falta tiempo">
              <p className="text-sm text-gray-800 leading-relaxed">{data.si_falta_tiempo}</p>
            </Box>
          )}
        </div>
      </div>
    </article>
  )
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-300 rounded p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-secondary)' }}>{title}</div>
      {children}
    </div>
  )
}
