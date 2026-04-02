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
      className="bg-white rounded-2xl overflow-hidden cursor-pointer
                 shadow-card border border-gray-100
                 hover:shadow-card-hover hover:-translate-y-1.5 hover:border-[#8B2252]/20
                 transition-all duration-300 ease-out group"
    >
      {/* Preview area */}
      <div className="h-32 bg-gradient-to-br from-[#1A3A5C]/8 via-[#2E6EA6]/4 to-[#8B2252]/6
                      flex items-center justify-center relative overflow-hidden">
        {recurso.thumbnail_url ? (
          <img
            src={recurso.thumbnail_url}
            alt={recurso.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center relative z-10">
            <span className="text-3xl drop-shadow-sm">
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
        {/* Decoración sutil */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#8B2252]/5
                        group-hover:bg-[#8B2252]/10 transition-colors duration-500" />
        {/* Badge destacado */}
        {recurso.estado === 'destacado' && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold
                          bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                          shadow-sm shadow-[#8B2252]/30">
            ★ Destacado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-[#1A3A5C] line-clamp-2 mb-2
                       group-hover:text-[#8B2252] transition-colors duration-300">
          {recurso.titulo}
        </h3>

        {recurso.resumen && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {recurso.resumen}
          </p>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full
                          bg-gradient-to-r from-[#1A3A5C]/10 to-[#1A3A5C]/5
                          text-[#1A3A5C] font-semibold">
            {gradoChips}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full
                          bg-gradient-to-r from-[#8B2252]/10 to-[#8B2252]/5
                          text-[#8B2252] font-semibold">
            {recurso.eje_tematico}
          </span>
        </div>

        {/* Tipo + Editable */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="font-medium">{recurso.tipo_recurso}</span>
          <span className={`flex items-center gap-1 ${recurso.editable ? 'text-[#2E6EA6]' : ''}`}>
            {recurso.editable ? '✏️ Editable' : '📄 PDF'}
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {recurso.descargas}
          </span>
          <span className="font-medium text-[#1A3A5C]/60">{recurso.autor_nombre}</span>
          <span>{new Date(recurso.created_at).getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
