'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import AdaptedResourceView from './AdaptedResourceView'
import SimilarActivitiesView from './SimilarActivitiesView'
import EvaluationMaterialView from './EvaluationMaterialView'
import ImplementationGuideView from './ImplementationGuideView'
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

  // Auto-disparar el diálogo de impresión apenas carga
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
      setAutoTriggered(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Para rúbricas en landscape — detectamos si el output es una rúbrica
  const isRubrica =
    funcion === 'evaluate' &&
    typeof data === 'object' &&
    data !== null &&
    'tipo' in data &&
    (data as { tipo: string }).tipo === 'rubrica'

  return (
    <>
      {/* Estilos de impresión */}
      <style jsx global>{`
        @page {
          size: ${isRubrica ? 'A4 landscape' : 'A4 portrait'};
          margin: 1.8cm 1.8cm 1.5cm 1.8cm;
        }

        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; max-width: none !important; }
          /* Forzar fondos en impresión (header, badges, rubrica) */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Saltos de página inteligentes */
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
          tr, .border-l-4 { break-inside: avoid; page-break-inside: avoid; }
        }

        @media screen {
          body { background: #f1f5f9; }
        }
      `}</style>

      {/* Barra superior — solo en pantalla, no se imprime */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Vista de impresión</span>
            {autoTriggered && (
              <span className="text-emerald-600">
                · Si no apareció el diálogo, usá el botón
              </span>
            )}
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

      {/* Documento imprimible */}
      <div className="max-w-4xl mx-auto px-6 py-8 print:px-0 print:py-0">
        <div className="print-container bg-white">
          {/* Header LUMEN — sale en cada página impresa */}
          <header className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#8B2252]">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded-lg" />
              <div>
                <div className="text-sm font-bold text-[#1A3A5C]">LUMEN</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Plataforma pedagógica</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-500">Generado a partir de:</div>
              <div className="text-xs font-semibold text-[#1A3A5C] max-w-xs truncate">{recursoTitulo}</div>
            </div>
          </header>

          {/* Render del output según función — reusamos los mismos viewers */}
          <main className="print-body">
            {funcion === 'adapt'    && <AdaptedResourceView    data={data as AdaptedResource} />}
            {funcion === 'similar'  && <SimilarActivitiesView  data={data as { actividades: SimilarActivity[]; meta: { generation_id: string } }} />}
            {funcion === 'evaluate' && <EvaluationMaterialView data={data as EvaluationMaterial} />}
            {funcion === 'guide'    && <ImplementationGuideView data={data as ImplementationGuide} />}
          </main>

          {/* Footer */}
          <footer className="mt-8 pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
            <span>Generado con LUMEN · {new Date(generatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>lumen.ar</span>
          </footer>
        </div>
      </div>

      {/* Ocultar header/footer de los OutputCard internos al imprimir
          (ya tienen sus propios botones de Copiar que no queremos en el PDF) */}
      <style jsx global>{`
        @media print {
          .print-body button { display: none !important; }
        }
      `}</style>
    </>
  )
}
