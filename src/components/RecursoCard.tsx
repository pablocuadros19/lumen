'use client'

import type { Recurso } from '@/types/database'

interface RecursoCardProps {
  recurso: Recurso
  onClick?: () => void
}

export default function RecursoCard({ recurso, onClick }: RecursoCardProps) {
  const gradoChips = recurso.grados.join(', ')

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-150 rounded-xl overflow-hidden cursor-pointer
                 hover:border-[#8B2252]/40 hover:shadow-lg hover:shadow-[#8B2252]/5
                 transition-all duration-200 group"
    >
      {/* Preview area */}
      <div className="h-32 bg-gradient-to-br from-[#1A3A5C]/5 to-[#8B2252]/5 flex items-center justify-center relative">
        {recurso.thumbnail_url ? (
          <img
            src={recurso.thumbnail_url}
            alt={recurso.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <span className="text-3xl">
              {recurso.formato === 'Documento' ? '📄' :
               recurso.formato === 'Presentación slides' ? '📊' :
               recurso.formato === 'Video' ? '🎬' :
               recurso.formato === 'Imagen / Lámina' ? '🖼️' :
               recurso.formato === 'Juego / Interactivo' ? '🎮' :
               recurso.formato === 'Audio' ? '🎵' : '🔗'}
            </span>
            <div className="mt-2 space-y-1.5 px-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="mx-auto h-1 rounded-full bg-[#1A3A5C]/10"
                  style={{ width: i < 2 ? '100%' : '65%' }}
                />
              ))}
            </div>
          </div>
        )}
        {/* Badge destacado */}
        {recurso.estado === 'destacado' && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold
                          bg-[#8B2252] text-white">
            ★ Destacado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-[#1A3A5C] line-clamp-2 mb-2
                       group-hover:text-[#8B2252] transition-colors">
          {recurso.titulo}
        </h3>

        {/* Resumen */}
        {recurso.resumen && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2.5 leading-relaxed">
            {recurso.resumen}
          </p>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1A3A5C]/8 text-[#1A3A5C] font-medium">
            {gradoChips}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#8B2252]/8 text-[#8B2252] font-medium">
            {recurso.eje_tematico}
          </span>
        </div>

        {/* Tipo + Editable */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{recurso.tipo_recurso}</span>
          <span className={recurso.editable ? 'text-[#2E6EA6]' : ''}>
            {recurso.editable ? '✏️ Editable' : '📄 PDF'}
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center text-[11px] text-gray-400">
          <span>↓ {recurso.descargas}</span>
          <span className="font-medium text-[#1A3A5C]/60">{recurso.autor_nombre}</span>
          <span>{new Date(recurso.created_at).getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
