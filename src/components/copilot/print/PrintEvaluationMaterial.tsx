'use client'

import PrintBlocks from './PrintBlocks'
import NombreFecha from './NombreFecha'
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
  rubrica:        'Rúbrica de evaluación',
  lista_cotejo:   'Lista de cotejo',
  autoevaluacion: 'Autoevaluación',
}

export default function PrintEvaluationMaterial({ data }: { data: EvaluationMaterial }) {
  const esRubrica = data.contenido.kind === 'rubrica'
  const esCotejo  = data.contenido.kind === 'lista_cotejo'
  // Rúbrica y cotejo son herramientas del docente — no llevan Nombre/Fecha
  const necesitaNombreFecha = !esRubrica && !esCotejo

  return (
    <article>
      <div className="text-[11px] font-bold text-[#8B2252] uppercase tracking-wider">
        {TIPO_LABEL[data.tipo]}
      </div>
      <h1 className="text-2xl font-bold text-[#1A3A5C] leading-tight mt-0.5">{data.titulo}</h1>
      <p className="text-xs text-gray-500 mt-1">
        {data.area} · {data.grado}° grado
        {data.tiempo_estimado_min ? ' · ' + data.tiempo_estimado_min + ' min' : ''}
      </p>

      {necesitaNombreFecha && <NombreFecha />}

      <div className="mt-4">
        {data.contenido.kind === 'rubrica'        && <Rubrica c={data.contenido} />}
        {data.contenido.kind === 'prueba'         && <Prueba c={data.contenido} />}
        {data.contenido.kind === 'lista_cotejo'   && <Cotejo c={data.contenido} />}
        {data.contenido.kind === 'autoevaluacion' && <AutoEval c={data.contenido} />}
      </div>
    </article>
  )
}

function Rubrica({ c }: { c: RubricContent }) {
  return (
    <div>
      {c.descripcion && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{c.descripcion}</p>}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-600 bg-gray-100 text-[#1A3A5C] font-semibold px-2 py-1.5 text-left w-1/4">Dimensión</th>
            <th className="border border-gray-600 bg-emerald-50 text-emerald-900 font-semibold px-2 py-1.5 text-left">Logrado</th>
            <th className="border border-gray-600 bg-amber-50 text-amber-900 font-semibold px-2 py-1.5 text-left">En proceso</th>
            <th className="border border-gray-600 bg-red-50 text-red-900 font-semibold px-2 py-1.5 text-left">Inicial</th>
          </tr>
        </thead>
        <tbody>
          {c.dimensiones.map((d, i) => {
            const n = {
              logrado:    d.niveles.find(x => x.nivel === 'logrado')?.descriptor    ?? '',
              en_proceso: d.niveles.find(x => x.nivel === 'en_proceso')?.descriptor ?? '',
              inicial:    d.niveles.find(x => x.nivel === 'inicial')?.descriptor    ?? '',
            }
            return (
              <tr key={i}>
                <td className="border border-gray-600 px-2 py-1.5 bg-gray-50 align-top">
                  <div className="font-semibold text-[#1A3A5C]">{d.nombre}</div>
                  {d.descripcion && <div className="text-[10px] text-gray-600 mt-0.5">{d.descripcion}</div>}
                </td>
                <td className="border border-gray-600 px-2 py-1.5 text-gray-800 align-top">{n.logrado}</td>
                <td className="border border-gray-600 px-2 py-1.5 text-gray-800 align-top">{n.en_proceso}</td>
                <td className="border border-gray-600 px-2 py-1.5 text-gray-800 align-top">{n.inicial}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Prueba({ c }: { c: TestContent }) {
  return (
    <div>
      {c.introduccion && <p className="text-sm text-gray-800 mb-3 leading-relaxed italic">{c.introduccion}</p>}
      <PrintBlocks blocks={c.consignas} />
    </div>
  )
}

function Cotejo({ c }: { c: ChecklistContent }) {
  return (
    <div>
      {c.introduccion && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{c.introduccion}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-600 bg-gray-100 px-2 py-1.5 text-left text-[#1A3A5C] font-semibold">Indicador</th>
            <th className="border border-gray-600 bg-gray-100 px-2 py-1.5 text-center text-[#1A3A5C] font-semibold w-12">Sí</th>
            <th className="border border-gray-600 bg-gray-100 px-2 py-1.5 text-center text-[#1A3A5C] font-semibold w-12">No</th>
            {c.con_espacio_observaciones && (
              <th className="border border-gray-600 bg-gray-100 px-2 py-1.5 text-left text-[#1A3A5C] font-semibold w-1/3">Observaciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {c.items.map((it, i) => (
            <tr key={i} style={{ height: '11mm' }}>
              <td className="border border-gray-600 px-2 py-1.5 align-top">
                <div className="font-medium text-[#1A3A5C]">{it.indicador}</div>
                {it.observable && <div className="text-[11px] text-gray-600 mt-0.5">{it.observable}</div>}
              </td>
              <td className="border border-gray-600 text-center align-middle">
                <span className="inline-block w-4 h-4 border border-gray-600" />
              </td>
              <td className="border border-gray-600 text-center align-middle">
                <span className="inline-block w-4 h-4 border border-gray-600" />
              </td>
              {c.con_espacio_observaciones && <td className="border border-gray-600" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AutoEval({ c }: { c: SelfEvalContent }) {
  const escalas = {
    caritas:   ['☹', '😐', '🙂', '😄'],
    estrellas: ['☆', '★', '★★', '★★★'],
    numeros:   ['1', '2', '3', '4'],
  } as const

  return (
    <div className="space-y-4">
      {c.preguntas.map((p, i) => (
        <div key={i} className="border border-gray-400 rounded p-3">
          <p className="text-sm text-[#1A3A5C] font-medium mb-2.5">{i + 1}. {p.pregunta}</p>
          <div className="flex flex-wrap gap-4">
            {(p.opciones && p.opciones.length > 0 ? p.opciones : escalas[c.escala]).map((op, j) => (
              <div key={j} className="flex items-center gap-2 text-sm text-gray-800">
                <span className="w-4 h-4 rounded-full border border-gray-600 inline-block" />
                {op}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
