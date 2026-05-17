'use client'

import OutputCard from './OutputCard'
import ResourceBlocks from './ResourceBlocks'
import type {
  EvaluationMaterial,
  RubricContent,
  TestContent,
  ChecklistContent,
  SelfEvalContent,
} from '@/types/copilot'

const TIPO_LABEL: Record<EvaluationMaterial['tipo'], string> = {
  diagnostica:    'Evaluación diagnóstica',
  proceso:        'Evaluación de proceso',
  sumativa:       'Evaluación sumativa',
  rubrica:        'Rúbrica',
  lista_cotejo:   'Lista de cotejo',
  autoevaluacion: 'Autoevaluación',
}

export default function EvaluationMaterialView({ data }: { data: EvaluationMaterial }) {
  const subtitle = `${TIPO_LABEL[data.tipo]} · ${data.area} · ${data.grado}° grado${data.tiempo_estimado_min ? ' · ' + data.tiempo_estimado_min + ' min' : ''}`

  return (
    <OutputCard title={data.titulo} subtitle={subtitle} textToCopy={data.titulo}>
      {data.contenido.kind === 'rubrica'         && <RubricaView c={data.contenido} />}
      {data.contenido.kind === 'prueba'          && <PruebaView c={data.contenido} />}
      {data.contenido.kind === 'lista_cotejo'    && <ListaCotejoView c={data.contenido} />}
      {data.contenido.kind === 'autoevaluacion'  && <AutoEvalView c={data.contenido} />}
    </OutputCard>
  )
}

function RubricaView({ c }: { c: RubricContent }) {
  return (
    <div>
      {c.descripcion && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{c.descripcion}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-[#1A3A5C]/10 text-[#1A3A5C] font-semibold px-3 py-2 text-left">Dimensión</th>
              <th className="border border-gray-300 bg-emerald-50 text-emerald-800 font-semibold px-3 py-2 text-left">Logrado</th>
              <th className="border border-gray-300 bg-amber-50 text-amber-800 font-semibold px-3 py-2 text-left">En proceso</th>
              <th className="border border-gray-300 bg-red-50 text-red-700 font-semibold px-3 py-2 text-left">Inicial</th>
            </tr>
          </thead>
          <tbody>
            {c.dimensiones.map((d, i) => {
              const niveles = {
                logrado:    d.niveles.find(n => n.nivel === 'logrado')?.descriptor    ?? '',
                en_proceso: d.niveles.find(n => n.nivel === 'en_proceso')?.descriptor ?? '',
                inicial:    d.niveles.find(n => n.nivel === 'inicial')?.descriptor    ?? '',
              }
              return (
                <tr key={i}>
                  <td className="border border-gray-300 px-3 py-2 bg-[#1A3A5C]/5">
                    <div className="font-semibold text-[#1A3A5C] text-sm">{d.nombre}</div>
                    {d.descripcion && <div className="text-xs text-gray-500 mt-0.5">{d.descripcion}</div>}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700 text-xs align-top">{niveles.logrado}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700 text-xs align-top">{niveles.en_proceso}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700 text-xs align-top">{niveles.inicial}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PruebaView({ c }: { c: TestContent }) {
  return (
    <div>
      {c.introduccion && <p className="text-sm text-gray-600 mb-4 leading-relaxed italic">{c.introduccion}</p>}
      <ResourceBlocks blocks={c.consignas} />
      {c.criterios_correccion && c.criterios_correccion.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Criterios de corrección</div>
          <ul className="space-y-1">
            {c.criterios_correccion.map((cr, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-[#8B2252] mt-0.5">·</span>{cr}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ListaCotejoView({ c }: { c: ChecklistContent }) {
  return (
    <div>
      {c.introduccion && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{c.introduccion}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-[#1A3A5C]/5 px-3 py-2 text-left text-[#1A3A5C] font-semibold">Indicador</th>
            <th className="border border-gray-300 bg-[#1A3A5C]/5 px-3 py-2 text-center text-[#1A3A5C] font-semibold w-16">Sí</th>
            <th className="border border-gray-300 bg-[#1A3A5C]/5 px-3 py-2 text-center text-[#1A3A5C] font-semibold w-16">No</th>
            {c.con_espacio_observaciones && (
              <th className="border border-gray-300 bg-[#1A3A5C]/5 px-3 py-2 text-left text-[#1A3A5C] font-semibold">Observaciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {c.items.map((it, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-3 py-2">
                <div className="font-medium text-[#1A3A5C] text-xs">{it.indicador}</div>
                {it.observable && <div className="text-[11px] text-gray-500 mt-0.5">{it.observable}</div>}
              </td>
              <td className="border border-gray-300 text-center">
                <span className="inline-block w-4 h-4 rounded border border-gray-400" />
              </td>
              <td className="border border-gray-300 text-center">
                <span className="inline-block w-4 h-4 rounded border border-gray-400" />
              </td>
              {c.con_espacio_observaciones && <td className="border border-gray-300 h-8" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AutoEvalView({ c }: { c: SelfEvalContent }) {
  const escalas = {
    caritas:   ['😞', '😐', '🙂', '😄'],
    estrellas: ['☆', '★☆', '★★', '★★★'],
    numeros:   ['1', '2', '3', '4'],
  } as const

  return (
    <div className="space-y-4">
      {c.preguntas.map((p, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-[#1A3A5C] font-medium mb-3">{i + 1}. {p.pregunta}</p>
          <div className="flex flex-wrap gap-3">
            {(p.opciones && p.opciones.length > 0 ? p.opciones : escalas[c.escala]).map((op, j) => (
              <button key={j} type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                {op}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
