'use client'

import type { Recurso } from '@/types/database'
import PdfThumbnail from '@/components/PdfThumbnail'
import FavoritoButton from '@/components/FavoritoButton'
import AgregarAColeccion from '@/components/AgregarAColeccion'

// SVG icons por formato (reemplazan emojis)
function FormatIcon({ formato }: { formato: string }) {
  const cls = "w-8 h-8 text-[#1A3A5C]/30 group-hover:text-[#1A3A5C]/50 transition-colors duration-300"
  switch (formato) {
    case 'Documento':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    case 'Presentación slides':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h16.5M3.75 3v0M20.25 3v11.25A2.25 2.25 0 0118 16.5h-2.25M12 16.5V21m0 0l-3-3m3 3l3-3" /></svg>
    case 'Video':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
    case 'Imagen / Lámina':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
    case 'Audio':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
    default:
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
  }
}

interface RecursoCardProps {
  recurso: Recurso
  onClick?: () => void
  index?: number
  esFavorito?: boolean
  onToggleFavorito?: (id: string, esFav: boolean) => void
  esCoordinadora?: boolean
}

export default function RecursoCard({ recurso, onClick, index = 0, esFavorito = false, onToggleFavorito, esCoordinadora = false }: RecursoCardProps) {
  const gradoChips = recurso.grados.join(', ')

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl overflow-hidden cursor-pointer
                 shadow-card border border-gray-100/80
                 border-l-[3px]
                 hover:shadow-card-hover hover:-translate-y-1.5
                 transition-all duration-300 ease-[var(--ease-smooth)] group
                 animate-card-in
                 ${esCoordinadora
                   ? 'bg-[#8B2252]/[0.03] border-l-[#8B2252]'
                   : 'bg-white border-l-transparent hover:border-l-[#8B2252]'
                 }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Preview area */}
      <div className="h-36 bg-gradient-to-br from-[#1A3A5C]/6 via-[#2E6EA6]/3 to-[#8B2252]/8
                      flex flex-col items-center justify-center relative overflow-hidden">
        {recurso.thumbnail_url ? (
          <>
            <img
              src={recurso.thumbnail_url}
              alt={recurso.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent" />
          </>
        ) : recurso.archivo_url && recurso.archivo_url.includes('.pdf') ? (
          <>
            <PdfThumbnail url={recurso.archivo_url} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent" />
          </>
        ) : (() => {
          // Detectar Google Slides/Docs/Sheets para generar thumbnail
          const link = recurso.link_editable || recurso.archivo_url || ''
          const slideMatch = link.match(/docs\.google\.com\/presentation\/d\/([^/]+)/)
          const docMatch = link.match(/docs\.google\.com\/document\/d\/([^/]+)/)
          if (slideMatch) {
            const sid = slideMatch[1]
            return (
              <>
                <img
                  src={`https://drive.google.com/thumbnail?id=${sid}&sz=w800`}
                  alt={recurso.titulo}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1'
                      img.src = `https://docs.google.com/presentation/d/${sid}/export/png?pageid=p1`
                    } else {
                      img.style.display = 'none'
                    }
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent" />
              </>
            )
          }
          if (docMatch) {
            const did = docMatch[1]
            return (
              <>
                <img
                  src={`https://drive.google.com/thumbnail?id=${did}&sz=w800`}
                  alt={recurso.titulo}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent" />
              </>
            )
          }
          return null
        })() || (
          <div className="text-center relative z-10 flex flex-col items-center">
            <FormatIcon formato={recurso.formato} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1A3A5C]/20 mt-2.5">
              {recurso.formato}
            </span>
          </div>
        )}

        {/* Botón favorito */}
        <div className="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={esFavorito ? { opacity: 1 } : {}}
        >
          <FavoritoButton
            recursoId={recurso.id}
            initialFavorito={esFavorito}
            size="sm"
            onToggle={onToggleFavorito}
          />
        </div>

        {/* Botón agregar a colección */}
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AgregarAColeccion recursoId={recurso.id} size="sm" />
        </div>

        {/* Badge coordinación */}
        {esCoordinadora && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold
                          bg-[#8B2252] text-white shadow-sm shadow-[#8B2252]/30 z-10">
            Coordinación
          </div>
        )}

        {/* Badge destacado o aprobado */}
        {recurso.estado === 'destacado' ? (
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold
                          bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                          shadow-sm shadow-[#8B2252]/30 z-10">
            Destacado
          </div>
        ) : recurso.revisado && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
                          bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 z-10">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Aprobado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-bold text-[15px] tracking-tight text-[#1A3A5C] line-clamp-2 mb-2
                       group-hover:text-[#8B2252] transition-colors duration-300">
          {recurso.titulo}
        </h3>

        {recurso.resumen && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {recurso.resumen}
          </p>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold
                          bg-[#1A3A5C]/8 text-[#1A3A5C] border border-[#1A3A5C]/10">
            {gradoChips}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold
                          bg-[#8B2252]/8 text-[#8B2252] border border-[#8B2252]/10">
            {recurso.eje_tematico}
          </span>
        </div>

        {/* Tipo + Editable */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="font-medium text-gray-500">{recurso.tipo_recurso}</span>
          <span className={`flex items-center gap-1.5 ${recurso.editable ? 'text-[#2E6EA6]' : 'text-gray-400'}`}>
            {recurso.editable ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                Editable
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                Solo lectura
              </>
            )}
          </span>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100/80 pt-3 flex justify-between items-center text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {recurso.descargas}
          </span>
          <span className={`font-semibold ${esCoordinadora ? 'text-[#8B2252]' : 'text-[#1A3A5C]/50'}`}>
            {esCoordinadora && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B2252] mr-1 align-middle" />
            )}
            {recurso.autor_nombre}
          </span>
          <span>{new Date(recurso.created_at).getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
