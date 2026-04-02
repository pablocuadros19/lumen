'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GRADOS, TIPOS_RECURSO, AREAS, getEjesForArea } from '@/lib/constants'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
import DrivePickerModal from '@/components/DrivePickerModal'
import ThankYouOverlay from '@/components/ThankYouOverlay'

type FormData = {
  titulo: string
  resumen: string
  area: string
  grados: string[]
  ejes_tematicos: string[]
  tipo_recurso: string
  editable: boolean
  idioma: 'es' | 'en'
  link_editable: string
  thumbnail_url: string
}

function SubirContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [clasificando, setClasificando] = useState(false)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [sugerenciasIA, setSugerenciasIA] = useState(false)
  const [textoExtraido, setTextoExtraido] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showDriveModal, setShowDriveModal] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null)
  const [driveFileName, setDriveFileName] = useState('')
  const [efemeridesDisponibles, setEfemeridesDisponibles] = useState<{ id: string; nombre: string }[]>([])
  const [efemeridesSeleccionadas, setEfemeridesSeleccionadas] = useState<string[]>([])
  const [recursosEnRevision, setRecursosEnRevision] = useState<{ id: string; titulo: string; comentario_revision: string | null }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-abrir modal Drive si viene de OAuth
  useEffect(() => {
    if (searchParams.get('drive') === '1') {
      setShowDriveModal(true)
      // Limpiar el param de la URL sin recargar
      window.history.replaceState({}, '', '/subir')
    }
  }, [searchParams])

  useEffect(() => {
    fetch('/api/efemerides').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setEfemeridesDisponibles(data)
    }).catch(() => {})
  }, [])

  // Cargar recursos propios en revisión
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase
          .from('recursos')
          .select('id, titulo, comentario_revision')
          .eq('subido_por', user.id)
          .eq('estado', 'revision')
          .then(({ data }) => {
            if (data && data.length > 0) setRecursosEnRevision(data)
          })
      })
    })
  }, [])

  const [form, setForm] = useState<FormData>({
    titulo: '',
    resumen: '',
    area: 'Prácticas del Lenguaje',
    grados: [],
    ejes_tematicos: [],
    tipo_recurso: '',
    editable: false,
    idioma: 'es',
    link_editable: '',
    thumbnail_url: '',
  })

  const detectarEditable = (nombre: string) => {
    const ext = nombre.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(ext || '')) return false
    return true
  }

  const clasificarConIA = async (file: File) => {
    setClasificando(true)
    const esEditable = detectarEditable(file.name)

    try {
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('nombre', file.name)

      const res = await fetch('/api/clasificar', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setSugerenciasIA(true)
        setTextoExtraido(data.texto_extraido || '')
        setForm(prev => ({
          titulo: data.titulo || file.name.replace(/\.[^.]+$/, ''),
          resumen: data.resumen || '',
          area: data.area || prev.area,
          grados: [],
          ejes_tematicos: data.ejes_tematicos || [],
          tipo_recurso: data.tipo_recurso || 'Actividad',
          editable: esEditable,
          idioma: data.idioma || 'es',
          link_editable: '',
          thumbnail_url: '',
        }))
      } else {
        setForm(prev => ({
          ...prev,
          titulo: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          editable: esEditable,
        }))
      }
    } catch {
      setForm(prev => ({
        ...prev,
        titulo: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        editable: esEditable,
      }))
    } finally {
      setClasificando(false)
    }
  }

  const handleArchivo = (file: File) => {
    setArchivo(file)
    clasificarConIA(file)
    setPaso(2)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files[0]
    if (file) handleArchivo(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleArchivo(file)
  }

  const toggleGrado = (g: string) => {
    setForm(prev => ({
      ...prev,
      grados: prev.grados.includes(g)
        ? prev.grados.filter(x => x !== g)
        : [...prev.grados, g],
    }))
  }

  const handleDriveImport = (data: {
    archivo_url: string; thumbnail_url: string | null; titulo: string; resumen: string;
    ejes_tematicos: string[]; tipo_recurso: string; idioma: string; texto_extraido?: string; fileName: string
  }) => {
    setArchivoUrl(data.archivo_url)
    setDriveFileName(data.fileName)
    setTextoExtraido(data.texto_extraido || '')
    setSugerenciasIA(true)
    setForm(prev => ({
      titulo: data.titulo,
      resumen: data.resumen,
      area: prev.area,
      grados: [],
      ejes_tematicos: data.ejes_tematicos || [],
      tipo_recurso: data.tipo_recurso || 'Actividad',
      editable: true,
      idioma: (data.idioma as 'es' | 'en') || 'es',
      link_editable: '',
      thumbnail_url: data.thumbnail_url || '',
    }))
    setShowDriveModal(false)
    setPaso(2)
  }

  // Generar thumbnail de PDF en el browser
  const generarThumbPDF = async (file: File): Promise<Blob | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await doc.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport }).promise
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.75)
      })
    } catch {
      return null
    }
  }

  const handlePublicar = async () => {
    if (!form.titulo || form.grados.length === 0 || form.ejes_tematicos.length === 0 || !form.tipo_recurso) {
      alert('Completá todos los campos obligatorios')
      return
    }

    setSubiendo(true)
    setErrorMsg('')

    try {
      const body = new FormData()
      if (archivo) {
        body.append('archivo', archivo)
        // Generar thumbnail si es PDF
        if (archivo.type === 'application/pdf') {
          const thumbBlob = await generarThumbPDF(archivo)
          if (thumbBlob) {
            body.append('thumbnail', thumbBlob, 'thumb.jpg')
          }
        }
      }
      body.append('datos', JSON.stringify({
        ...form,
        texto_extraido: textoExtraido,
        efemeride_ids: efemeridesSeleccionadas,
        ...(archivoUrl ? { existing_archivo_url: archivoUrl, existing_thumbnail_url: form.thumbnail_url || null } : {}),
      }))

      const res = await fetch('/api/publicar', {
        method: 'POST',
        body,
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Error al publicar')
        setSubiendo(false)
        return
      }

      setSubiendo(false)
      setShowThankYou(true)
    } catch {
      setErrorMsg('Error de conexión. Intentá de nuevo.')
      setSubiendo(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:border-[#1A3A5C] focus:shadow-[var(--shadow-input-focus)] transition-all duration-200"

  return (
    <div className="min-h-screen bg-lumen-bg bg-grid-pattern flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm px-6 py-5 flex items-center gap-3 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-50" />
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-gradient-lumen">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400 font-medium">Cargar recurso</span>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        <Image src="/newman-logo-2.jpg" alt="Newman" width={36} height={36} className="shrink-0 rounded-lg ring-1 ring-gray-100" />
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {/* Banner recursos en revisión */}
        {recursosEnRevision.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-card-in">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-semibold text-amber-800">
                Tenés {recursosEnRevision.length} recurso{recursosEnRevision.length > 1 ? 's' : ''} observado{recursosEnRevision.length > 1 ? 's' : ''}
              </p>
            </div>
            {recursosEnRevision.map(r => (
              <a
                key={r.id}
                href={`/recurso/${r.id}`}
                className="block text-sm text-amber-700 hover:text-amber-900 py-1 pl-6"
              >
                <span className="font-medium">{r.titulo}</span>
                {r.comentario_revision && (
                  <span className="text-amber-500 ml-2">— &ldquo;{r.comentario_revision}&rdquo;</span>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Paso 1: Subir archivo */}
        {paso === 1 && (
          <div className="animate-card-in">
            <h1 className="text-2xl font-bold text-[#1A3A5C] mb-2">Subir recurso</h1>
            <p className="text-gray-500 text-sm mb-8">
              Subí un archivo o pegá un link. La IA va a sugerir la clasificación.
            </p>

            {/* Zona de drag & drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer
                transition-all duration-300 ease-[var(--ease-smooth)]
                ${arrastrando
                  ? 'border-[#8B2252] bg-gradient-to-br from-[#8B2252]/5 to-[#8B2252]/10 shadow-card-hover scale-[1.01]'
                  : 'border-gray-200 bg-white/50 hover:border-[#1A3A5C]/40 hover:bg-white hover:shadow-card'
                }`}
              style={arrastrando ? { animation: 'pulseGlow 2s ease-in-out infinite' } : {}}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.pptx,.ppt,.png,.jpg,.jpeg,.svg,.mp4,.mp3,.txt"
                onChange={handleInputChange}
              />
              <svg className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${arrastrando ? 'text-[#8B2252]' : 'text-[#1A3A5C]/25'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="text-[#1A3A5C] font-semibold mb-1">
                {arrastrando ? 'Soltá el archivo acá' : 'Arrastrá un archivo o hacé click'}
              </p>
              <p className="text-sm text-gray-400">
                PDF, Word, PowerPoint, imagen, video, audio
              </p>
              <p className="text-xs text-gray-300 mt-2">
                Recomendamos subir el PDF para facilitar la clasificación
              </p>
            </div>

            {/* Separador + botón Drive */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <span className="text-sm text-gray-400">o importá desde</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            <button
              onClick={() => setShowDriveModal(true)}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl
                         bg-white border border-gray-200 shadow-sm
                         hover:border-[#2E6EA6]/40 hover:shadow-card hover:-translate-y-0.5
                         transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#2E6EA6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span className="text-sm font-medium text-[#1A3A5C]">Google Drive</span>
            </button>

            {/* Separador link */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <span className="text-sm text-gray-400">o pegá un link</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            {/* Link directo */}
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://www.canva.com/design/... o link de Google Docs"
                value={form.link_editable}
                onChange={(e) => setForm(prev => ({ ...prev, link_editable: e.target.value }))}
                className={inputClasses}
              />
              <button
                onClick={async () => {
                  if (form.link_editable.trim()) {
                    setForm(prev => ({ ...prev, editable: true }))
                    setPaso(2)
                    setSugerenciasIA(false)
                    // Intentar extraer thumbnail del link
                    try {
                      const res = await fetch('/api/link-preview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: form.link_editable.trim() }),
                      })
                      if (res.ok) {
                        const data = await res.json()
                        if (data.thumbnail_url) {
                          setForm(prev => ({ ...prev, thumbnail_url: data.thumbnail_url }))
                        }
                        if (data.title && !form.titulo) {
                          setForm(prev => ({ ...prev, titulo: data.title }))
                        }
                      }
                    } catch {
                      // No bloquear si falla el preview
                    }
                  }
                }}
                disabled={!form.link_editable.trim()}
                className="px-6 py-3 rounded-xl bg-[#1A3A5C] text-white text-sm font-medium
                           hover:bg-[#15304d] shadow-sm transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Clasificar */}
        {paso === 2 && (
          <div className="animate-card-in">
            <button
              onClick={() => { setPaso(1); setArchivo(null); setSugerenciasIA(false); setArchivoUrl(null); setDriveFileName('') }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-4 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <h1 className="text-2xl font-bold text-[#1A3A5C] mb-1">Clasificar recurso</h1>

            {clasificando && (
              <div className="flex items-center gap-3 mb-6 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#1A3A5C]/5 to-[#8B2252]/5 border border-[#1A3A5C]/10">
                <div className="w-5 h-5 border-2 border-[#8B2252] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#1A3A5C] font-medium">
                  La IA está analizando el recurso...
                </span>
              </div>
            )}

            {sugerenciasIA && !clasificando && (
              <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl bg-[#8B2252]/5 border border-[#8B2252]/12">
                <svg className="w-4 h-4 text-[#8B2252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                <span className="text-sm text-[#8B2252]">
                  La IA sugirió la clasificación. Revisá y ajustá lo que necesites.
                </span>
              </div>
            )}

            {!sugerenciasIA && !clasificando && (
              <p className="text-sm text-gray-500 mb-6">Completá los datos del recurso.</p>
            )}

            {/* Archivo cargado */}
            {archivo && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1A3A5C]/8 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1A3A5C]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A3A5C] truncate">{archivo.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(archivo.size)}</p>
                </div>
                <button
                  onClick={() => { setArchivo(null); setPaso(1) }}
                  className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Archivo importado de Drive */}
            {!archivo && archivoUrl && driveFileName && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2E6EA6]/8 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#2E6EA6]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A3A5C] truncate">{driveFileName}</p>
                  <p className="text-xs text-gray-400">Importado desde Google Drive</p>
                </div>
                <button
                  onClick={() => { setArchivoUrl(null); setDriveFileName(''); setPaso(1) }}
                  className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Preview del link */}
            {!archivo && form.thumbnail_url && (
              <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <img
                  src={form.thumbnail_url}
                  alt="Preview del link"
                  className="w-full max-h-48 object-cover"
                />
              </div>
            )}

            {/* Formulario */}
            <div className="space-y-5">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-1.5">
                  Título <span className="text-[#8B2252]">*</span>
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Signos de puntuación — ejercicios"
                  className={inputClasses}
                />
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-1.5">
                  Resumen
                </label>
                <textarea
                  value={form.resumen}
                  onChange={(e) => setForm(prev => ({ ...prev, resumen: e.target.value }))}
                  placeholder="Breve descripción del recurso"
                  rows={3}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-2">
                  Área <span className="text-[#8B2252]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => (
                    <button
                      key={a.slug}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        area: a.nombre,
                        ejes_tematicos: [], // Reset ejes al cambiar área
                      }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                        hover:scale-105
                        ${form.area === a.nombre
                          ? 'text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
                        }`}
                      style={form.area === a.nombre ? { backgroundColor: a.color, boxShadow: `0 4px 6px ${a.color}40` } : {}}
                    >
                      {a.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grados */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-2">
                  Grado <span className="text-[#8B2252]">*</span>
                  <span className="text-xs text-gray-400 ml-2 font-normal">Podés elegir varios</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADOS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGrado(g)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                        hover:scale-105
                        ${form.grados.includes(g)
                          ? 'bg-[#1A3A5C] text-white shadow-md shadow-[#1A3A5C]/25'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A3A5C] shadow-sm'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eje temático */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-2">
                  Eje temático <span className="text-[#8B2252]">*</span>
                  <span className="text-xs text-gray-400 ml-2 font-normal">Podés elegir varios</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {getEjesForArea(form.area).map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        ejes_tematicos: prev.ejes_tematicos.includes(e)
                          ? prev.ejes_tematicos.filter(x => x !== e)
                          : [...prev.ejes_tematicos, e],
                      }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                        hover:scale-105
                        ${form.ejes_tematicos.includes(e)
                          ? 'bg-[#8B2252] text-white shadow-md shadow-[#8B2252]/25'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#8B2252] shadow-sm'
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de recurso */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-1.5">
                  Tipo de recurso <span className="text-[#8B2252]">*</span>
                </label>
                <select
                  value={form.tipo_recurso}
                  onChange={(e) => setForm(prev => ({ ...prev, tipo_recurso: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="">Seleccioná un tipo</option>
                  {TIPOS_RECURSO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Idioma */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-1.5">
                  Idioma
                </label>
                <div className="flex gap-3">
                  {(['es', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setForm(prev => ({ ...prev, idioma: lang }))}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                        ${form.idioma === lang
                          ? 'bg-[#1A3A5C] text-white shadow-md shadow-[#1A3A5C]/25'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A3A5C] shadow-sm'
                        }`}
                    >
                      {lang === 'es' ? 'Español' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efemérides */}
              {efemeridesDisponibles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#1A3A5C] mb-2">
                    Efeméride
                    <span className="text-xs text-gray-400 ml-2 font-normal">Opcional — vincular a fecha escolar</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {efemeridesDisponibles.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setEfemeridesSeleccionadas(prev =>
                          prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id]
                        )}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer
                          ${efemeridesSeleccionadas.includes(e.id)
                            ? 'bg-[#2E6EA6] text-white shadow-sm'
                            : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2E6EA6] shadow-sm'
                          }`}
                      >
                        {e.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Link editable */}
              <div>
                <label className="block text-sm font-medium text-[#1A3A5C] mb-1.5">
                  Link editable
                  <span className="text-xs text-gray-400 ml-2 font-normal">Canva, Google Docs, etc.</span>
                </label>
                <input
                  type="url"
                  value={form.link_editable}
                  onChange={(e) => setForm(prev => ({ ...prev, link_editable: e.target.value }))}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>

              {/* Editable */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(prev => ({ ...prev, editable: !prev.editable }))}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer
                    ${form.editable ? 'bg-[#8B2252]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${form.editable ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                  />
                </button>
                <span className="text-sm text-[#1A3A5C]">
                  {form.editable ? 'Recurso editable' : 'No editable (PDF, imagen, escaneo)'}
                </span>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="px-4 py-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  {errorMsg}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setPaso(1); setArchivo(null); setSugerenciasIA(false); setArchivoUrl(null); setDriveFileName('') }}
                  className="px-6 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-600
                             hover:bg-gray-50 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePublicar}
                  disabled={subiendo || !form.titulo || form.grados.length === 0 || form.ejes_tematicos.length === 0 || !form.tipo_recurso}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                             bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white text-sm font-semibold
                             shadow-button hover:shadow-lg hover:shadow-[#8B2252]/30 hover:-translate-y-0.5
                             active:scale-[0.97] transition-all duration-200 cursor-pointer
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {subiendo && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {subiendo ? 'Publicando...' : 'Publicar recurso'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDriveModal && (
        <DrivePickerModal
          onClose={() => setShowDriveModal(false)}
          onFileImported={handleDriveImport}
        />
      )}

      {showThankYou && (
        <ThankYouOverlay onDone={() => router.push('/')} />
      )}
    </div>
  )
}

export default function SubirPage() {
  return (
    <Suspense>
      <SubirContent />
    </Suspense>
  )
}
