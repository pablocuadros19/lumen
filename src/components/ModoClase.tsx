'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import type { Recurso } from '@/types/database'

export default function ModoClase({ recurso }: { recurso: Recurso }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Auto-ocultar la barra de controles después de 3s sin movimiento
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      setChromeVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setChromeVisible(false), 3000)
    }
    reset()
    window.addEventListener('mousemove', reset)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', reset)
    }
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen().catch(() => {})
    }
  }

  const linkSrc = recurso.link_editable || recurso.archivo_url || ''
  const isSlidesLink = linkSrc.includes('docs.google.com/presentation')
  const isDocsLink = linkSrc.includes('docs.google.com/document')
  const isSheetsLink = linkSrc.includes('docs.google.com/spreadsheets')

  let content: React.ReactNode = null

  if (isSlidesLink) {
    const embedUrl = linkSrc.replace(/\/(edit|view|pub).*$/, '/embed?start=false&loop=false&delayms=3000')
    content = <iframe src={embedUrl} className="w-full h-full border-0" title={recurso.titulo} allowFullScreen />
  } else if (isDocsLink || isSheetsLink) {
    const embedUrl = linkSrc.replace(/\/(edit|view).*$/, '/preview')
    content = <iframe src={embedUrl} className="w-full h-full border-0" title={recurso.titulo} />
  } else if (recurso.archivo_url && recurso.formato === 'Imagen / Lámina') {
    // eslint-disable-next-line @next/next/no-img-element
    content = <img src={recurso.archivo_url} alt={recurso.titulo} className="max-w-full max-h-full object-contain" />
  } else if (recurso.archivo_url && recurso.archivo_url.toLowerCase().endsWith('.pdf')) {
    content = <iframe src={recurso.archivo_url} className="w-full h-full border-0" title={recurso.titulo} />
  } else if (recurso.archivo_url) {
    content = <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(recurso.archivo_url)}&embedded=true`} className="w-full h-full border-0" title={recurso.titulo} />
  } else {
    content = (
      <div className="text-center text-gray-400">
        <p className="text-lg">Este recurso no tiene contenido visualizable en modo clase.</p>
        <Link href={`/recurso/${recurso.id}`} className="text-sm text-[#2E6EA6] hover:underline mt-4 inline-block">
          Volver al recurso
        </Link>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-white flex flex-col">
      {/* Barra superior flotante, se auto-oculta */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 transition-opacity duration-500 ${
          chromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B2252]" />
          <span className="truncate max-w-[50vw]">{recurso.titulo}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-black/40 text-white text-xs font-medium hover:bg-black/60 backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
              )}
            </svg>
            {isFullscreen ? 'Salir pantalla' : 'Pantalla completa'}
          </button>

          <Link
            href={`/recurso/${recurso.id}`}
            className="px-3 py-1.5 rounded-xl bg-black/40 text-white text-xs font-medium hover:bg-black/60 backdrop-blur-sm transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Salir
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center bg-white overflow-auto">
        {content}
      </div>
    </div>
  )
}
