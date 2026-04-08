'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GRADOS, EJES_TEMATICOS } from '@/lib/constants'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  modifiedTime: string
  size?: string
}

interface ImportedFile {
  fileId: string
  fileName: string
  archivo_url: string
  thumbnail_url: string | null
  google_link: string | null
  titulo: string
  resumen: string
  ejes_tematicos: string[]
  tipo_recurso: string
  idioma: string
  texto_extraido?: string
  grados: string[]
  editable: boolean
}

export default function ImportarPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<'conectar' | 'seleccionar' | 'clasificar' | 'listo'>('conectar')
  const [archivos, setArchivos] = useState<DriveFile[]>([])
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [cargandoArchivos, setCargandoArchivos] = useState(false)
  const [importando, setImportando] = useState(false)
  const [importados, setImportados] = useState<ImportedFile[]>([])
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [publicando, setPublicando] = useState(false)
  const [error, setError] = useState('')

  // Al cargar, intentar listar archivos
  useEffect(() => {
    cargarArchivos()
  }, [])

  const conectarDrive = () => {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/importar`,
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
      },
    })
  }

  const cargarArchivos = async () => {
    setCargandoArchivos(true)
    setError('')
    try {
      const res = await fetch('/api/drive/listar')
      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'NO_TOKEN' || data.code === 'TOKEN_EXPIRED') {
          setPaso('conectar')
          return
        }
        setError(data.error || 'Error cargando archivos')
        return
      }
      const data = await res.json()
      setArchivos(data.files || [])
      setPaso('seleccionar')
    } catch {
      setPaso('conectar')
    } finally {
      setCargandoArchivos(false)
    }
  }

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const importarSeleccionados = async () => {
    const files = archivos.filter(f => seleccionados.has(f.id))
    setImportando(true)
    setProgreso({ actual: 0, total: files.length })
    setImportados([])
    setPaso('clasificar')

    const resultados: ImportedFile[] = []

    for (let i = 0; i < files.length; i++) {
      setProgreso({ actual: i + 1, total: files.length })
      try {
        const res = await fetch('/api/drive/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: files[i].id,
            fileName: files[i].name,
            mimeType: files[i].mimeType,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          resultados.push({
            fileId: files[i].id,
            fileName: files[i].name,
            archivo_url: data.archivo_url,
            thumbnail_url: data.thumbnail_url,
            google_link: data.google_link || null,
            titulo: data.titulo || files[i].name,
            resumen: data.resumen || '',
            ejes_tematicos: data.ejes_tematicos || [],
            tipo_recurso: data.tipo_recurso || 'Actividad',
            idioma: data.idioma || 'es',
            texto_extraido: data.texto_extraido,
            grados: [],
            editable: true,
          })
        }
      } catch {
        // Seguir con el siguiente
      }
    }

    setImportados(resultados)
    setImportando(false)
  }

  const actualizarImportado = (index: number, campo: string, valor: unknown) => {
    setImportados(prev => prev.map((item, i) =>
      i === index ? { ...item, [campo]: valor } : item
    ))
  }

  const publicarTodos = async () => {
    setPublicando(true)
    try {
      for (const item of importados) {
        if (item.grados.length === 0 || item.ejes_tematicos.length === 0) continue

        const formData = new FormData()
        formData.append('datos', JSON.stringify({
          titulo: item.titulo,
          resumen: item.resumen,
          grados: item.grados,
          ejes_tematicos: item.ejes_tematicos,
          tipo_recurso: item.tipo_recurso,
          editable: item.editable,
          idioma: item.idioma,
          link_editable: item.google_link || '',
          texto_extraido: item.texto_extraido || '',
          // archivo_url ya existe en storage, pasarlo como dato
          existing_archivo_url: item.archivo_url,
          existing_thumbnail_url: item.thumbnail_url,
        }))

        await fetch('/api/publicar', { method: 'POST', body: formData })
      }
      setPaso('listo')
    } finally {
      setPublicando(false)
    }
  }

  const formatSize = (bytes: string) => {
    const n = parseInt(bytes)
    if (!n) return ''
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
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">Importar desde Drive</span>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la biblioteca
        </Link>

        <h1 className="text-2xl font-bold text-[#1A3A5C] mb-6">Importar desde Google Drive</h1>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
        )}

        {/* PASO: Conectar Drive */}
        {paso === 'conectar' && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            {cargandoArchivos ? (
              <>
                <div className="w-10 h-10 border-3 border-[#2E6EA6]/20 border-t-[#2E6EA6] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-400">Conectando con Drive...</p>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 mx-auto text-[#1A3A5C]/15 mb-4" viewBox="0 0 87.3 78" fill="currentColor">
                  <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" />
                  <path d="M43.65 25.15L29.9 1.35c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.35c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" />
                  <path d="M73.55 13.3c-.8-1.4-1.95-2.5-3.3-3.3L57.5 1.35c-1.35-.8-2.9-1.2-4.5-1.2L29.9 34.95l13.75 23.8 29.9-51.8c-.8-1.4-1.95-2.5-3.3-3.3z" />
                  <path d="M43.65 25.15l13.75-23.8c-1.6-.8-3.15-1.2-4.75-1.2H34.4c-1.6 0-3.15.45-4.5 1.2z" />
                  <path d="M59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" />
                  <path d="M73.4 47.35L60.65 25.15 43.65 25.15 57.4 48.95l16.15 27.95c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.4 1.2-2.95 1.2-4.5H59.6z" />
                </svg>
                <p className="text-gray-500 mb-4">Conectá tu Google Drive para importar archivos</p>
                <p className="text-xs text-gray-300 mb-6">Solo se accede en modo lectura. No se modifica nada en tu Drive.</p>
                <button
                  onClick={conectarDrive}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl
                             bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                             text-sm font-semibold shadow-sm
                             hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Conectar Google Drive
                </button>
              </>
            )}
          </div>
        )}

        {/* PASO: Seleccionar archivos */}
        {paso === 'seleccionar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Seleccioná los archivos que querés importar ({seleccionados.size} seleccionados)
              </p>
              <button
                onClick={importarSeleccionados}
                disabled={seleccionados.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white
                           text-sm font-semibold shadow-sm
                           hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Importar {seleccionados.size > 0 ? `(${seleccionados.size})` : ''}
              </button>
            </div>

            {archivos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400">No se encontraron archivos compatibles en tu Drive</p>
              </div>
            ) : (
              <div className="space-y-2">
                {archivos.map((file) => (
                  <label
                    key={file.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-white border
                               shadow-sm cursor-pointer transition-all duration-200
                               ${seleccionados.has(file.id)
                                 ? 'border-[#2E6EA6] bg-[#2E6EA6]/3 shadow-card'
                                 : 'border-gray-100 hover:border-gray-200 hover:shadow-card'
                               }`}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionados.has(file.id)}
                      onChange={() => toggleSeleccion(file.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2E6EA6] accent-[#2E6EA6]"
                    />

                    {file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#1A3A5C]/6 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#1A3A5C]/40">{mimeIcon(file.mimeType)}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A3A5C] truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(file.modifiedTime).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {file.size && ` · ${formatSize(file.size)}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO: Clasificar / importando */}
        {paso === 'clasificar' && (
          <div>
            {importando ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 border-3 border-[#8B2252]/20 border-t-[#8B2252] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#1A3A5C] font-medium mb-1">
                  Importando archivo {progreso.actual} de {progreso.total}...
                </p>
                <p className="text-xs text-gray-400">Descargando, subiendo y clasificando con IA</p>
                <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B2252] to-[#2E6EA6] rounded-full transition-all duration-300"
                    style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Revisá las clasificaciones y completá los grados antes de publicar.
                </p>

                <div className="space-y-4 mb-6">
                  {importados.map((item, i) => (
                    <div key={item.fileId} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1A3A5C]/6 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-[#1A3A5C]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <input
                            value={item.titulo}
                            onChange={(e) => actualizarImportado(i, 'titulo', e.target.value)}
                            className="w-full text-sm font-bold text-[#1A3A5C] bg-transparent border-b border-transparent
                                       hover:border-gray-200 focus:border-[#1A3A5C] focus:outline-none pb-0.5 transition-colors"
                          />
                          <p className="text-xs text-gray-400 mt-1">{item.fileName}</p>
                        </div>
                      </div>

                      {/* Grados */}
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Grados *</label>
                        <div className="flex flex-wrap gap-1.5">
                          {GRADOS.map((g) => (
                            <button
                              key={g}
                              onClick={() => {
                                const grados = item.grados.includes(g)
                                  ? item.grados.filter(x => x !== g)
                                  : [...item.grados, g]
                                actualizarImportado(i, 'grados', grados)
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                                ${item.grados.includes(g)
                                  ? 'bg-[#1A3A5C] text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Eje temático */}
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Eje temático</label>
                        <div className="flex flex-wrap gap-1.5">
                          {EJES_TEMATICOS.map((e) => (
                            <button
                              key={e}
                              onClick={() => {
                                const ejes = item.ejes_tematicos.includes(e)
                                  ? item.ejes_tematicos.filter(x => x !== e)
                                  : [...item.ejes_tematicos, e]
                                actualizarImportado(i, 'ejes_tematicos', ejes)
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                                ${item.ejes_tematicos.includes(e)
                                  ? 'bg-[#8B2252] text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tipo recurso */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{item.tipo_recurso}</span>
                        <span>·</span>
                        <span>{item.idioma === 'es' ? 'Español' : 'Inglés'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPaso('seleccionar'); setImportados([]) }}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500
                               border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    onClick={publicarTodos}
                    disabled={publicando || importados.some(i => i.grados.length === 0)}
                    className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white
                               bg-gradient-to-r from-[#8B2252] to-[#6d1b41]
                               hover:shadow-lg disabled:opacity-40
                               transition-all duration-200 cursor-pointer"
                  >
                    {publicando ? 'Publicando...' : `Publicar ${importados.length} recursos`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO: Listo */}
        {paso === 'listo' && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1A3A5C] mb-2">Importación completada</h2>
            <p className="text-sm text-gray-400 mb-6">
              Se importaron {importados.length} recursos desde tu Google Drive
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                         text-sm font-semibold shadow-sm
                         hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Ir a la biblioteca
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
