'use client'

import OutputCard from './OutputCard'
import type { ImplementationGuide } from '@/types/copilot'

export default function ImplementationGuideView({ data }: { data: ImplementationGuide }) {
  const subtitle = `Guía para implementar · ${data.ambientacion.tiempo_estimado_min} min estimados`
  const texto = guiaToTexto(data)

  return (
    <OutputCard title="Guía de implementación" subtitle={subtitle} textToCopy={texto}>
      <div className="space-y-5">
        <Seccion titulo="Para qué sirve">
          <p className="text-sm text-gray-700 leading-relaxed">{data.para_que_sirve}</p>
        </Seccion>

        <Seccion titulo="Materiales necesarios">
          <ul className="space-y-1">
            {data.materiales.map((m, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8B2252] mt-2 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Antes de empezar">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {data.ambientacion.disposicion_aula && (
              <Mini label="Disposición del aula" value={data.ambientacion.disposicion_aula} />
            )}
            {data.ambientacion.agrupamientos && (
              <Mini label="Agrupamientos" value={data.ambientacion.agrupamientos} />
            )}
            {data.ambientacion.luces && (
              <Mini label="Luces / ambientación" value={data.ambientacion.luces} />
            )}
            <Mini label="Tiempo estimado" value={`${data.ambientacion.tiempo_estimado_min} min`} />
          </div>
        </Seccion>

        <Seccion titulo="Cómo presentarlo">
          <ul className="space-y-1.5">
            {data.como_presentarlo.map((p, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-[#8B2252] font-bold text-xs mt-1">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Posibles dificultades">
          <div className="space-y-2">
            {data.posibles_dificultades.map((d, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-amber-900">{d.que}</div>
                <div className="text-xs text-gray-700 mt-1">→ {d.como_destrabarlo}</div>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Para cerrar">
          <p className="text-sm text-gray-700 leading-relaxed">{data.para_cerrar}</p>
        </Seccion>

        <div className="grid grid-cols-2 gap-3">
          {data.si_sobra_tiempo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Si te sobra tiempo</div>
              <p className="text-xs text-gray-700 leading-relaxed">{data.si_sobra_tiempo}</p>
            </div>
          )}
          {data.si_falta_tiempo && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">Si te falta tiempo</div>
              <p className="text-xs text-gray-700 leading-relaxed">{data.si_falta_tiempo}</p>
            </div>
          )}
        </div>
      </div>
    </OutputCard>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-[#1A3A5C] uppercase tracking-wider mb-2">{titulo}</div>
      {children}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-gray-700 mt-0.5 leading-snug">{value}</div>
    </div>
  )
}

function guiaToTexto(g: ImplementationGuide): string {
  const lines = ['# Guía de implementación', '']
  lines.push('## Para qué sirve', g.para_que_sirve, '')
  lines.push('## Materiales', ...g.materiales.map(m => '- ' + m), '')
  lines.push('## Antes de empezar')
  if (g.ambientacion.disposicion_aula) lines.push(`- Disposición: ${g.ambientacion.disposicion_aula}`)
  if (g.ambientacion.agrupamientos)    lines.push(`- Agrupamientos: ${g.ambientacion.agrupamientos}`)
  if (g.ambientacion.luces)            lines.push(`- Ambientación: ${g.ambientacion.luces}`)
  lines.push(`- Tiempo: ${g.ambientacion.tiempo_estimado_min} min`, '')
  lines.push('## Cómo presentarlo', ...g.como_presentarlo.map((p, i) => `${i+1}. ${p}`), '')
  lines.push('## Posibles dificultades')
  g.posibles_dificultades.forEach(d => lines.push(`- ${d.que} → ${d.como_destrabarlo}`))
  lines.push('', '## Para cerrar', g.para_cerrar, '')
  if (g.si_sobra_tiempo) lines.push('## Si te sobra tiempo', g.si_sobra_tiempo, '')
  if (g.si_falta_tiempo) lines.push('## Si te falta tiempo', g.si_falta_tiempo, '')
  return lines.join('\n')
}
