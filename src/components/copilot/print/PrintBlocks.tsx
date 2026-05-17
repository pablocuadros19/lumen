'use client'

import type { ResourceBlock } from '@/types/copilot'

// Versión print de ResourceBlocks. Diferencias:
// - Casilleros 11mm × 14mm (escribibles a mano, no los 28×36px de pantalla)
// - Líneas para responder de 9mm de alto (espacio cómodo para escribir)
// - Tipografía y márgenes pensados para hoja A4
// - Omite `imagen_sugerida` (no aporta a una ficha imprimible — solo lo describe)

export default function PrintBlocks({ blocks }: { blocks: ResourceBlock[] }) {
  return (
    <div className="space-y-4 print-blocks">
      {blocks.map((block, i) => <Block key={i} block={block} />)}
    </div>
  )
}

function Block({ block }: { block: ResourceBlock }) {
  switch (block.kind) {
    case 'titulo': {
      const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' } as const
      return <h3 className={`${sizes[block.nivel]} font-bold text-[#1A3A5C] mt-4`}>{block.texto}</h3>
    }

    case 'texto':
      return (
        <div
          className="text-sm text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )

    case 'consigna':
      return (
        <div className="mt-3">
          <div className="flex items-start gap-2">
            <span className="text-sm font-bold text-[#1A3A5C] shrink-0">{block.numero}.</span>
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">{block.texto}</p>
              {block.tipo === 'opcion_multiple' && block.opciones && (
                <ul className="mt-2 space-y-1.5 pl-1">
                  {block.opciones.map((op, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-800">
                      <span className="w-3.5 h-3.5 border border-gray-500 shrink-0" />
                      {op}
                    </li>
                  ))}
                </ul>
              )}
              {block.tipo === 'verdadero_falso' && (
                <div className="flex gap-4 mt-2 text-sm text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-gray-500 inline-block" /> V
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-gray-500 inline-block" /> F
                  </span>
                </div>
              )}
              {(block.tipo === 'abierta' || block.tipo === 'completar') && (
                <div className="mt-2 space-y-3.5">
                  {Array.from({ length: block.espacio_respuesta_lineas ?? 3 }).map((_, j) => (
                    <div key={j} className="border-b border-gray-500 h-1" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'recuadro_destacado': {
      // En print los recuadros pueden seguir, pero más sutiles
      return (
        <div className="border border-gray-400 rounded p-3 my-3 bg-gray-50">
          {block.titulo && <div className="text-xs font-bold text-[#1A3A5C] mb-1">{block.titulo}</div>}
          <p className="text-sm text-gray-800 leading-relaxed">{block.contenido}</p>
        </div>
      )
    }

    case 'tabla':
      return (
        <table className="w-full text-sm border-collapse my-3">
          <thead>
            <tr>
              {block.columnas.map((c, i) => (
                <th key={i} className="border border-gray-500 bg-gray-100 text-[#1A3A5C] font-semibold px-2 py-1.5 text-left">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.filas.map((fila, i) => (
              <tr key={i}>
                {fila.map((celda, j) => (
                  <td key={j} className="border border-gray-500 px-2 py-1.5 text-gray-800">{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'lista':
      return block.ordenada ? (
        <ol className="list-decimal pl-6 space-y-1 text-sm text-gray-800 my-2">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-800 my-2">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )

    case 'separador':
      return <hr className="border-gray-300 my-4" />

    case 'imagen_sugerida':
      // Omitir en print — es metadata para el docente, no ficha de aula
      return null

    // ============================================
    // BLOQUES VISUALES PEDAGÓGICOS — en print con dimensiones de impresión
    // ============================================
    case 'cuadricula_escritura':
      return (
        <div className="my-4 space-y-2.5">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex gap-0">
                {Array.from({ length: item.casilleros }).map((_, j) => (
                  <span
                    key={j}
                    className="border border-gray-600 inline-block"
                    style={{ width: '11mm', height: '11mm' }}
                  />
                ))}
              </div>
              {block.mostrar_etiqueta && (
                <span className="text-xs text-gray-500 italic">{item.palabra.toLowerCase()}</span>
              )}
              {item.pista && (
                <span className="text-xs text-gray-500">— {item.pista}</span>
              )}
            </div>
          ))}
        </div>
      )

    case 'lineas_respuesta':
      return (
        <div className="my-3">
          {block.etiqueta && <div className="text-sm text-gray-700 mb-2">{block.etiqueta}</div>}
          <div className="space-y-3.5">
            {Array.from({ length: block.cantidad }).map((_, i) => (
              <div key={i} className="border-b border-gray-500 h-1" />
            ))}
          </div>
        </div>
      )

    case 'recuadro_dibujar':
      return (
        <div className="my-3">
          <div className="text-sm text-gray-700 mb-2">{block.etiqueta}</div>
          <div
            className="border border-gray-500 w-full"
            style={{ height: `${block.alto_cm}cm` }}
          />
        </div>
      )

    case 'tabla_llenar':
      return (
        <table className="w-full text-sm border-collapse my-3">
          <thead>
            <tr>
              {block.columnas.map((c, i) => (
                <th key={i} className="border border-gray-600 bg-gray-100 text-[#1A3A5C] font-semibold px-2 py-1.5 text-left">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: block.filas_cantidad }).map((_, i) => (
              <tr key={i} style={{ height: '11mm' }}>
                {block.columnas.map((_, j) => (
                  <td key={j} className="border border-gray-600 px-2 align-top pt-1">
                    {j === 0 && block.columna_indice?.[i] && (
                      <span className="text-sm text-[#1A3A5C] font-medium">{block.columna_indice[i]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )

    case 'opcion_marcar': {
      const marker = block.marcador === 'circulo'
        ? <span className="w-4 h-4 rounded-full border border-gray-600 inline-block shrink-0" />
        : <span className="w-4 h-4 border border-gray-600 inline-block shrink-0" />
      return (
        <div className="my-3">
          <div className="text-sm text-gray-800 mb-2">{block.enunciado}</div>
          <ul className="space-y-2.5 pl-2">
            {block.opciones.map((op, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-800">
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
