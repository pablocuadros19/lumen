'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_RECURSOS } from '@/lib/mock-data'

// Colores por eje temático
const EJE_COLORS: Record<string, string> = {
  'Plan lector': '#2E6EA6',
  'Gramática': '#8B2252',
  'Ortografía': '#D4A017',
  'Comprensión lectora': '#1A3A5C',
  'Producción escrita': '#6B4C9A',
  'Oralidad': '#2D8659',
  'Vocabulario': '#C75B39',
}

// Iconos por tipo de recurso
const TIPO_ICONS: Record<string, string> = {
  'Actividad': '📝',
  'Evaluación': '📋',
  'Rúbrica': '📊',
  'Planificación': '📅',
  'Presentación': '📽️',
  'Teoría / Marco': '📖',
  'Ideas / Inspiración': '💡',
}

export default function RecursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const recurso = MOCK_RECURSOS.find((r) => r.id === id)

  if (!recurso) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-[#1A3A5C] mb-2">Recurso no encontrado</h2>
          <Link href="/" className="text-sm text-[#8B2252] hover:underline">
            Volver a la biblioteca
          </Link>
        </div>
      </div>
    )
  }

  const ejeColor = EJE_COLORS[recurso.eje_tematico] || '#1A3A5C'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-[#1A3A5C]">LUMEN</span>
        </Link>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Header del recurso */}
            <div className="mb-6">
              {recurso.estado === 'destacado' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                               bg-[#8B2252]/10 text-[#8B2252] mb-3">
                  ⭐ Destacado
                </span>
              )}
              <h1 className="text-2xl font-bold text-[#1A3A5C] mb-3">{recurso.titulo}</h1>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recurso.grados.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A3A5C]/8 text-[#1A3A5C]"
                  >
                    {g}
                  </span>
                ))}
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${ejeColor}12`, color: ejeColor }}
                >
                  {recurso.eje_tematico}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#2E6EA6]/8 text-[#2E6EA6]">
                  {TIPO_ICONS[recurso.tipo_recurso]} {recurso.tipo_recurso}
                </span>
              </div>
            </div>

            {/* Resumen */}
            {recurso.resumen && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1A3A5C] mb-2">Resumen</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{recurso.resumen}</p>
              </div>
            )}

            {/* Preview */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 mb-6 flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-6xl mb-4">
                {TIPO_ICONS[recurso.tipo_recurso] || '📄'}
              </span>
              <p className="text-sm text-gray-400 mb-1">{recurso.formato}</p>
              <p className="text-xs text-gray-300">
                Preview no disponible en modo demo
              </p>
            </div>

            {/* Copiloto pedagógico */}
            <div className="rounded-xl border border-[#8B2252]/15 bg-[#8B2252]/3 p-5">
              <h3 className="text-sm font-bold text-[#8B2252] mb-3 flex items-center gap-2">
                ✨ Copiloto Pedagógico
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Usá IA para trabajar con este recurso. Elegí una acción:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Adaptar a otro grado', icon: '🔄' },
                  { label: 'Crear evaluación', icon: '📋' },
                  { label: 'Simplificar consignas', icon: '✏️' },
                  { label: 'Generar rúbrica', icon: '📊' },
                  { label: 'Guía docente', icon: '📖' },
                  { label: 'Actividades complementarias', icon: '➕' },
                ].map((accion) => (
                  <button
                    key={accion.label}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left
                               bg-white border border-gray-200 text-[#1A3A5C]
                               hover:border-[#8B2252] hover:bg-[#8B2252]/5 transition-colors"
                  >
                    <span>{accion.icon}</span>
                    <span className="text-xs font-medium">{accion.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Próximamente: las acciones van a generar prompts de alta calidad con el contenido de este recurso.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Acciones principales */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <button className="w-full px-4 py-3 rounded-lg bg-[#1A3A5C] text-white text-sm font-semibold
                                 hover:bg-[#15304d] transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </button>

              {recurso.link_editable && (
                <a
                  href={recurso.link_editable}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 rounded-lg bg-white border-2 border-[#8B2252] text-[#8B2252]
                             text-sm font-semibold hover:bg-[#8B2252]/5 transition-colors
                             flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir editable
                </a>
              )}

              <button className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600
                                 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Guardar en favoritos
              </button>
            </div>

            {/* Info del recurso */}
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Formato</span>
                  <span className="text-[#1A3A5C] font-medium">{recurso.formato}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Editable</span>
                  <span className={`font-medium ${recurso.editable ? 'text-green-600' : 'text-gray-400'}`}>
                    {recurso.editable ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Idioma</span>
                  <span className="text-[#1A3A5C] font-medium">
                    {recurso.idioma === 'es' ? 'Español' : 'English'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Descargas</span>
                  <span className="text-[#1A3A5C] font-medium">{recurso.descargas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subido por</span>
                  <span className="text-[#1A3A5C] font-medium">{recurso.autor_nombre || 'Anónimo'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha</span>
                  <span className="text-[#1A3A5C] font-medium">
                    {new Date(recurso.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado</h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${recurso.estado === 'publicado' ? 'bg-green-50 text-green-700' : ''}
                ${recurso.estado === 'destacado' ? 'bg-[#8B2252]/10 text-[#8B2252]' : ''}
                ${recurso.estado === 'borrador' ? 'bg-gray-100 text-gray-500' : ''}
                ${recurso.estado === 'archivado' ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                <span className={`w-2 h-2 rounded-full
                  ${recurso.estado === 'publicado' ? 'bg-green-500' : ''}
                  ${recurso.estado === 'destacado' ? 'bg-[#8B2252]' : ''}
                  ${recurso.estado === 'borrador' ? 'bg-gray-400' : ''}
                  ${recurso.estado === 'archivado' ? 'bg-gray-300' : ''}
                `} />
                {recurso.estado.charAt(0).toUpperCase() + recurso.estado.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
