'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import PrintAdaptedResource from './print/PrintAdaptedResource'
import PrintSimilarActivities from './print/PrintSimilarActivities'
import PrintEvaluationMaterial from './print/PrintEvaluationMaterial'
import PrintImplementationGuide from './print/PrintImplementationGuide'
import type { CopilotFunctionKey } from './CopilotPanel'
import type {
  AdaptedResource,
  SimilarActivity,
  EvaluationMaterial,
  ImplementationGuide,
} from '@/types/copilot'

interface Props {
  funcion:       CopilotFunctionKey
  data:          unknown
  recursoTitulo: string
  generatedAt:   string
}

export default function PrintView({ funcion, data, recursoTitulo, generatedAt }: Props) {
  const [autoTriggered, setAutoTriggered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
      setAutoTriggered(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Rúbrica en landscape — la matriz queda mejor a lo ancho
  const isRubrica =
    funcion === 'evaluate' &&
    typeof data === 'object' &&
    data !== null &&
    'tipo' in data &&
    (data as { tipo: string }).tipo === 'rubrica'

  return (
    <>
      <style jsx global>{`
        @page {
          size: ${isRubrica ? 'A4 landscape' : 'A4 portrait'};
          margin: 1.5cm 1.5cm 1.2cm 1.5cm;
        }

        @media screen {
          body { background: #f1f5f9; }
        }

        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page-break { page-break-before: always; break-before: page; }
          /* Color exacto en impresión */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Saltos de página inteligentes */
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          .print-blocks > * { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      {/* Barra superior — solo en pantalla */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {autoTriggered ? 'Si no apareció el diálogo, usá el botón →' : 'Cargando vista de impresión...'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[#8B2252] text-white text-sm font-semibold hover:bg-[#8B2252]/90 cursor-pointer"
            >
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={() => window.close()}
              className="px-3 py-2 rounded-lg text-gray-400 text-sm hover:text-gray-600 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Documento imprimible — en pantalla simulamos hoja A4 */}
      <div className="py-6 px-4 print:p-0">
        <div
          className="mx-auto bg-white shadow-lg print:shadow-none"
          style={{
            maxWidth: isRubrica ? '29.7cm' : '21cm',
            minHeight: isRubrica ? '21cm' : '29.7cm',
            padding: '1.5cm',
          }}
        >
          {/* Header compacto */}
          <header className="flex items-center justify-between pb-3 mb-5 border-b-2 border-[#8B2252]">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="LUMEN" width={28} height={28} className="rounded" />
              <span className="text-sm font-bold text-[#1A3A5C] tracking-tight">LUMEN</span>
            </div>
            <div className="text-right text-[10px] text-gray-500 max-w-xs truncate">
              {recursoTitulo}
            </div>
          </header>

          {/* Contenido — usa los componentes print dedicados (limpios, sin meta) */}
          <main>
            {funcion === 'adapt'    && <PrintAdaptedResource    data={data as AdaptedResource} />}
            {funcion === 'similar'  && <PrintSimilarActivities  data={data as { actividades: SimilarActivity[] }} />}
            {funcion === 'evaluate' && <PrintEvaluationMaterial data={data as EvaluationMaterial} />}
            {funcion === 'guide'    && <PrintImplementationGuide data={data as ImplementationGuide} />}
          </main>

          {/* Footer */}
          <footer className="mt-8 pt-2 border-t border-gray-200 flex items-center justify-between text-[9px] text-gray-400">
            <span>
              Generado con LUMEN ·{' '}
              {new Date(generatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span>lumen.ar</span>
          </footer>
        </div>
      </div>
    </>
  )
}
