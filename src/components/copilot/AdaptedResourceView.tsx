'use client'

import OutputCard from './OutputCard'
import ResourceBlocks from './ResourceBlocks'
import type { AdaptedResource } from '@/types/copilot'

export default function AdaptedResourceView({ data }: { data: AdaptedResource }) {
  const subtitle = `${data.area}${data.eje_tematico ? ' · ' + data.eje_tematico : ''} · ${data.grado_destino}° grado`
  const textoPlano = blocksToMarkdown(data)
  const printUrl = data.meta.source_resource_id
    ? `/copilot/${data.meta.source_resource_id}/print?gen=${data.meta.generation_id}`
    : undefined

  return (
    <OutputCard title={data.titulo} subtitle={subtitle} textToCopy={textoPlano} printUrl={printUrl}>
      {data.cambios_realizados.length > 0 && (
        <div className="mb-5 bg-[#8B2252]/5 border border-[#8B2252]/15 rounded-xl p-4">
          <div className="text-[11px] font-bold text-[#8B2252] uppercase tracking-wider mb-2">Cambios aplicados</div>
          <ul className="space-y-1">
            {data.cambios_realizados.map((c, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-[#8B2252] mt-0.5">·</span>
                <span><span className="font-semibold capitalize">{c.tipo.replace('_', ' ')}:</span> {c.descripcion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ResourceBlocks blocks={data.contenido} />

      {data.notas_pedagogicas && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notas pedagógicas</div>
          <p className="text-xs text-gray-600 leading-relaxed italic">{data.notas_pedagogicas}</p>
        </div>
      )}
    </OutputCard>
  )
}

function blocksToMarkdown(r: AdaptedResource): string {
  const lines: string[] = [`# ${r.titulo}`, '', `${r.area} · ${r.grado_destino}° grado`, '']
  for (const b of r.contenido) {
    switch (b.kind) {
      case 'titulo':            lines.push('#'.repeat(b.nivel + 1) + ' ' + b.texto, ''); break
      case 'texto':             lines.push(b.html.replace(/<[^>]+>/g, ''), ''); break
      case 'consigna':          lines.push(`${b.numero}. ${b.texto}`, ''); break
      case 'recuadro_destacado': lines.push(`> ${b.titulo ? `**${b.titulo}**: ` : ''}${b.contenido}`, ''); break
      case 'lista':             b.items.forEach((it, i) => lines.push(b.ordenada ? `${i+1}. ${it}` : `- ${it}`)); lines.push(''); break
      case 'tabla':
        lines.push('| ' + b.columnas.join(' | ') + ' |')
        lines.push('| ' + b.columnas.map(() => '---').join(' | ') + ' |')
        b.filas.forEach(f => lines.push('| ' + f.join(' | ') + ' |'))
        lines.push('')
        break
      case 'separador':         lines.push('---', ''); break
      case 'imagen_sugerida':   lines.push(`*[Imagen: ${b.descripcion}]*`, ''); break
    }
  }
  return lines.join('\n')
}
