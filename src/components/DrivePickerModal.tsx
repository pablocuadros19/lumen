'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  modifiedTime: string
  size?: string
}

interface ImportedData {
  archivo_url: string
  thumbnail_url: string | null
  titulo: string
  resumen: string
  ejes_tematicos: string[]
  tipo_recurso: string
  idioma: string
  texto_extraido?: string
  fileName: string
}

interface Props {
  onClose: () => void
  onFileImported: (data: ImportedData) => void
}

export default function DrivePickerModal({ onClose, onFileImported }: Props) {
  const [estado, setEstado] = useState<'cargando' | 'conectar' | 'seleccionar' | 'importando'>('cargando')
  const [archivos, setArchivos] = useState<DriveFile[]>([])
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarArchivos()
  }, [])

  const cargarArchivos = async () => {
    setEstado('cargando')
    setError('')
    try {
      const res = await fetch('/api/drive/listar')
      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'NO_TOKEN' || data.code === 'TOKEN_EXPIRED') {
          setEstado('conectar')
          return
        }
        setError(data.error || 'Error cargando archivos')
        setEstado('conectar')
        return
      }
      const data = await res.json()
      setArchivos(data.files || [])
      setEstado('seleccionar')
    } catch {
      setEstado('conectar')
    }
  }

  const conectarDrive = () => {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/subir`,
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
      },
    })
  }

  const importarArchivo = async () => {
    const file = archivos.find(f => f.id === seleccionado)
    if (!file) return

    setEstado('importando')
    setError('')
    try {
      const res = await fetch('/api/drive/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          mimeType: file.mimeType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'TOKEN_EXPIRED') {
          setEstado('conectar')
          return
        }
        setError(data.error || 'Error importando')
        setEstado('seleccionar')
        return
      }

      const data = await res.json()
      onFileImported({
        archivo_url: data.archivo_url,
        thumbnail_url: data.thumbnail_url,
        titulo: data.titulo || file.name,
        resumen: data.resumen || '',
        ejes_tematicos: data.ejes_tematicos || [],
        tipo_recurso: data.tipo_recurso || 'Actividad',
        idioma: data.idioma || 'es',
        texto_extraido: data.texto_extraido,
        fileName: file.name,
      })
    } catch {
      setError('Error de conexión')
      setEstado('seleccionar')
    }
  }

  const formatSize = (bytes?: string) => {
    if (!bytes) return ''
    const n = parseInt(bytes)
    if (n < 1024) return `${n} B`
    if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`
    return `${(n / 1048576).toFixed(1)} MB`
  }

  const mimeIcon = (mime: string) => {
    if (mime.includes('pdf')) return 'PDF'
    if (mime.includes('image')) return 'IMG'
    if (mime.includes('document') || mime.includes('word')) return 'DOC'
    if (mime.includes('presentation') || mime.includes('slide')) return 'PPT'
    return 'FILE'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-lg max-h-[80vh] flex flex-col animate-card-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2E6EA6]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2E6EA6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1A3A5C]">Google Drive</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>
        )}

        {/* Cargando */}
        {estado === 'cargando' && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#2E6EA6]/20 border-t-[#2E6EA6] rounded-full animate-spin" />
          </div>
        )}

        {/* Conectar */}
        {estado === 'conectar' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
            <svg className="w-12 h-12 text-[#1A3A5C]/15 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="text-sm text-gray-500 mb-1">Conectá tu Google Drive</p>
            <p className="text-xs text-gray-300 mb-5">Solo lectura — no se modifica nada</p>
            <button
              onClick={conectarDrive}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                         text-sm font-semibold shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              Conectar Google Drive
            </button>
          </div>
        )}

        {/* Seleccionar */}
        {estado === 'seleccionar' && (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {archivos.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No se encontraron archivos compatibles</div>
              ) : (
                <div className="space-y-1">
                  {archivos.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSeleccionado(file.id === seleccionado ? null : file.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer
                        ${seleccionado === file.id
                          ? 'bg-[#2E6EA6]/8 border border-[#2E6EA6]/30 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      {file.thumbnailLink ? (
                        <img src={file.thumbnailLink} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#1A3A5C]/6 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-[#1A3A5C]/40">{mimeIcon(file.mimeType)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A3A5C] truncate">{file.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(file.modifiedTime).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                          {file.size && ` · ${formatSize(file.size)}`}
                        </p>
                      </div>
                      {seleccionado === file.id && (
                        <svg className="w-5 h-5 text-[#2E6EA6] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={importarArchivo}
                disabled={!seleccionado}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white
                           bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6]
                           hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all cursor-pointer"
              >
                Importar
              </button>
            </div>
          </>
        )}

        {/* Importando */}
        {estado === 'importando' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-[#2E6EA6]/20 border-t-[#2E6EA6] rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#1A3A5C] font-medium">Importando...</p>
            <p className="text-xs text-gray-400 mt-1">Descargando, subiendo y clasificando con IA</p>
          </div>
        )}
      </div>
    </div>
  )
}
