'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GRADOS, EJES_TEMATICOS, TIPOS_RECURSO } from '@/lib/constants'

type FormData = {
  titulo: string
  resumen: string
  grados: string[]
  ejes_tematicos: string[]
  tipo_recurso: string
  editable: boolean
  idioma: 'es' | 'en'
  link_editable: string
}

export default function SubirPage() {
  const router = useRouter()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [clasificando, setClasificando] = useState(false)
  const [paso, setPaso] = useState<1 | 2>(1) // 1: subir archivo, 2: clasificar
  const [sugerenciasIA, setSugerenciasIA] = useState(false)
  const [textoExtraido, setTextoExtraido] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormData>({
    titulo: '',
    resumen: '',
    grados: [],
    ejes_tematicos: [],
    tipo_recurso: '',
    editable: false,
    idioma: 'es',
    link_editable: '',
  })

  // Detectar formato por extensión
  const detectarFormato = (nombre: string) => {
    const ext = nombre.split('.').pop()?.toLowerCase()
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return 'Documento'
    if (['pptx', 'ppt'].includes(ext || '')) return 'Presentación slides'
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'Video'
    if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext || '')) return 'Imagen / Lámina'
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'Audio'
    return 'Documento'
  }

  // Detectar si NO es editable (solo escaneos o fotos)
  const detectarEditable = (nombre: string) => {
    const ext = nombre.split('.').pop()?.toLowerCase()
    // Solo marcar como no editable si es un escaneo evidente
    if (['jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(ext || '')) return false
    return true // Por defecto editable
  }

  // Clasificación con IA (Claude Haiku)
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
        setForm({
          titulo: data.titulo || file.name.replace(/\.[^.]+$/, ''),
          resumen: data.resumen || '',
          grados: [], // La docente elige siempre
          ejes_tematicos: data.ejes_tematicos || [],
          tipo_recurso: data.tipo_recurso || 'Actividad',
          editable: esEditable,
          idioma: data.idioma || 'es',
          link_editable: '',
        })
      } else {
        // Fallback: título del nombre de archivo
        setForm(prev => ({
          ...prev,
          titulo: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          editable: esEditable,
        }))
      }
    } catch {
      // Fallback silencioso
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
      }
      body.append('datos', JSON.stringify({
        ...form,
        texto_extraido: textoExtraido,
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

      router.push('/')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-lumen-bg flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 shadow-sm px-5 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="LUMEN" width={36} height={36} className="rounded" />
          <span className="text-xl font-bold tracking-tight text-[#1A3A5C]">LUMEN</span>
        </Link>
        <div className="flex-1" />
        <span className="text-sm text-gray-400">Cargar recurso</span>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {/* Paso 1: Subir archivo */}
        {paso === 1 && (
          <div>
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
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-300
                ${arrastrando
                  ? 'border-[#8B2252] bg-gradient-to-br from-[#8B2252]/5 to-[#8B2252]/10 shadow-card scale-[1.01]'
                  : 'border-gray-300 hover:border-[#1A3A5C] hover:bg-gray-50 hover:shadow-card'
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.pptx,.ppt,.png,.jpg,.jpeg,.svg,.mp4,.mp3,.txt"
                onChange={handleInputChange}
              />
              <div className="text-4xl mb-4">
                {arrastrando ? '📥' : '📄'}
              </div>
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

            {/* Separador */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">o pegá un link</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Link directo */}
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://www.canva.com/design/... o link de Google Docs"
                value={form.link_editable}
                onChange={(e) => setForm(prev => ({ ...prev, link_editable: e.target.value }))}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm
                           focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
              />
              <button
                onClick={() => {
                  if (form.link_editable.trim()) {
                    setForm(prev => ({ ...prev, editable: true }))
                    setPaso(2)
                    setSugerenciasIA(false)
                  }
                }}
                disabled={!form.link_editable.trim()}
                className="px-6 py-3 rounded-lg bg-[#1A3A5C] text-white text-sm font-medium
                           hover:bg-[#15304d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Clasificar */}
        {paso === 2 && (
          <div>
            <button
              onClick={() => { setPaso(1); setArchivo(null); setSugerenciasIA(false) }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#1A3A5C] mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <h1 className="text-2xl font-bold text-[#1A3A5C] mb-1">Clasificar recurso</h1>

            {clasificando && (
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg bg-[#1A3A5C]/5 border border-[#1A3A5C]/15">
                <div className="w-4 h-4 border-2 border-[#8B2252] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#1A3A5C]">
                  La IA está analizando el recurso...
                </span>
              </div>
            )}

            {sugerenciasIA && !clasificando && (
              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-[#8B2252]/5 border border-[#8B2252]/15">
                <span className="text-sm">✨</span>
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
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#1A3A5C]/10 flex items-center justify-center text-lg">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A3A5C] truncate">{archivo.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(archivo.size)}</p>
                </div>
                <button
                  onClick={() => { setArchivo(null); setPaso(1) }}
                  className="text-gray-300 hover:text-gray-500 text-lg"
                >
                  ✕
                </button>
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm
                             focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
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
                  placeholder="Breve descripción del recurso (la IA puede completar esto automáticamente después)"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm resize-none
                             focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
                />
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${form.grados.includes(g)
                          ? 'bg-[#1A3A5C] text-white shadow-sm shadow-[#1A3A5C]/30'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#1A3A5C]'
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
                  {EJES_TEMATICOS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm(prev => ({
                        ...prev,
                        ejes_tematicos: prev.ejes_tematicos.includes(e)
                          ? prev.ejes_tematicos.filter(x => x !== e)
                          : [...prev.ejes_tematicos, e],
                      }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${form.ejes_tematicos.includes(e)
                          ? 'bg-[#8B2252] text-white shadow-sm shadow-[#8B2252]/30'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#8B2252]'
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white
                             focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
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
                  <button
                    onClick={() => setForm(prev => ({ ...prev, idioma: 'es' }))}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                      ${form.idioma === 'es'
                        ? 'bg-[#1A3A5C] text-white'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#1A3A5C]'
                      }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, idioma: 'en' }))}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
                      ${form.idioma === 'en'
                        ? 'bg-[#1A3A5C] text-white'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#1A3A5C]'
                      }`}
                  >
                    English
                  </button>
                </div>
              </div>

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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm
                             focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]/20"
                />
                {!archivo && !form.link_editable && (
                  <p className="text-xs text-gray-400 mt-1">
                    Si solo tenés el link, subí también el PDF para facilitar la búsqueda y clasificación.
                  </p>
                )}
              </div>

              {/* Editable */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(prev => ({ ...prev, editable: !prev.editable }))}
                  className={`relative w-11 h-6 rounded-full transition-colors
                    ${form.editable ? 'bg-[#8B2252]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                    ${form.editable ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                  />
                </button>
                <span className="text-sm text-[#1A3A5C]">
                  {form.editable ? 'Recurso editable' : 'No editable (PDF, imagen, escaneo)'}
                </span>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setPaso(1); setArchivo(null); setSugerenciasIA(false) }}
                  className="px-6 py-3 rounded-lg border border-gray-200 text-sm text-gray-600
                             hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePublicar}
                  disabled={subiendo || !form.titulo || form.grados.length === 0 || form.ejes_tematicos.length === 0 || !form.tipo_recurso}
                  className="flex-1 px-6 py-3 rounded-xl
                             bg-gradient-to-r from-[#8B2252] to-[#6d1b41] text-white text-sm font-semibold
                             shadow-button hover:shadow-lg hover:shadow-[#8B2252]/30
                             active:scale-[0.97] transition-all duration-200
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {subiendo ? 'Subiendo...' : 'Publicar recurso'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
