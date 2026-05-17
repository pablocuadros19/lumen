'use client'

import type { ResourceBlock } from '@/types/copilot'

export default function ResourceBlocks({ blocks }: { blocks: ResourceBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => <Block key={i} block={block} />)}
    </div>
  )
}

function Block({ block }: { block: ResourceBlock }) {
  switch (block.kind) {
    case 'titulo': {
      const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' } as const
      return <h3 className={`${sizes[block.nivel]} font-bold text-[#1A3A5C] mt-2`}>{block.texto}</h3>
    }

    case 'texto':
      return (
        <div
          className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )

    case 'consigna':
      return (
        <div className="border-l-4 border-[#8B2252]/30 pl-4 py-1">
          <div className="flex items-start gap-2">
            <span className="text-sm font-bold text-[#8B2252] shrink-0">{block.numero}.</span>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">{block.texto}</p>
              {block.tipo === 'opcion_multiple' && block.opciones && (
                <ul className="mt-2 space-y-1">
                  {block.opciones.map((op, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded border border-gray-300 shrink-0" />
                      {op}
                    </li>
                  ))}
                </ul>
              )}
              {block.tipo === 'verdadero_falso' && (
                <div className="flex gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-gray-300" /> V</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-gray-300" /> F</span>
                </div>
              )}
              {(block.tipo === 'abierta' || block.tipo === 'completar') && block.espacio_respuesta_lineas && (
                <div className="mt-2 space-y-2">
                  {Array.from({ length: block.espacio_respuesta_lineas }).map((_, j) => (
                    <div key={j} className="border-b border-gray-200 h-5" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'imagen_sugerida':
      return (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Imagen sugerida</div>
          <p className="text-sm text-gray-600">{block.descripcion}</p>
          <p className="text-[11px] text-gray-400 mt-1 italic">alt: {block.alt}</p>
        </div>
      )

    case 'recuadro_destacado': {
      const tonos = {
        info:      'bg-blue-50 border-blue-200 text-blue-800',
        atencion:  'bg-amber-50 border-amber-200 text-amber-800',
        pista:     'bg-emerald-50 border-emerald-200 text-emerald-800',
      } as const
      return (
        <div className={`border rounded-xl p-3 ${tonos[block.tono]}`}>
          {block.titulo && <div className="text-xs font-bold mb-1">{block.titulo}</div>}
          <p className="text-sm leading-relaxed">{block.contenido}</p>
        </div>
      )
    }

    case 'tabla':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {block.columnas.map((c, i) => (
                  <th key={i} className="border border-gray-300 bg-[#1A3A5C]/5 text-[#1A3A5C] font-semibold px-3 py-2 text-left">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td key={j} className="border border-gray-300 px-3 py-2 text-gray-700">{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'lista':
      return block.ordenada ? (
        <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )

    case 'separador':
      return <hr className="border-gray-200" />

    // ============================================
    // BLOQUES VISUALES — el chico realmente escribe/marca/dibuja
    // ============================================
    case 'cuadricula_escritura':
      return (
        <div className="space-y-2 my-3">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap">
              {block.mostrar_etiqueta && (
                <span className="text-sm font-semibold text-[#1A3A5C] min-w-[100px]">{item.palabra}</span>
              )}
              <div className="flex gap-0.5">
                {Array.from({ length: item.casilleros }).map((_, j) => (
                  <span key={j} className="w-7 h-9 border-2 border-gray-400 inline-block" />
                ))}
              </div>
              {item.pista && (
                <span className="text-[11px] text-gray-500 italic ml-2">{item.pista}</span>
              )}
            </div>
          ))}
        </div>
      )

    case 'lineas_respuesta':
      return (
        <div className="my-3">
          {block.etiqueta && (
            <div className="text-xs text-gray-600 mb-2">{block.etiqueta}</div>
          )}
          <div className="space-y-3">
            {Array.from({ length: block.cantidad }).map((_, i) => (
              <div key={i} className="border-b-2 border-gray-400 h-5" />
            ))}
          </div>
        </div>
      )

    case 'recuadro_dibujar':
      return (
        <div className="my-3">
          <div className="text-xs text-gray-600 mb-2 font-medium">{block.etiqueta}</div>
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg w-full"
            style={{ height: `${block.alto_cm}cm` }}
          />
        </div>
      )

    case 'tabla_llenar':
      return (
        <div className="my-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {block.columnas.map((c, i) => (
                  <th key={i} className="border-2 border-gray-400 bg-[#1A3A5C]/10 text-[#1A3A5C] font-semibold px-3 py-2 text-left">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: block.filas_cantidad }).map((_, i) => (
                <tr key={i}>
                  {block.columnas.map((_, j) => (
                    <td key={j} className="border-2 border-gray-400 h-9">
                      {j === 0 && block.columna_indice?.[i] && (
                        <span className="px-2 text-sm text-[#1A3A5C] font-medium">{block.columna_indice[i]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'opcion_marcar': {
      const marker = block.marcador === 'circulo'
        ? <span className="w-4 h-4 rounded-full border-2 border-gray-500 inline-block shrink-0" />
        : <span className="w-4 h-4 border-2 border-gray-500 inline-block shrink-0" />
      return (
        <div className="my-3">
          <div className="text-sm text-gray-700 mb-2">{block.enunciado}</div>
          <ul className="space-y-2 pl-2">
            {block.opciones.map((op, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                {marker}
                <span>{op}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }
}
