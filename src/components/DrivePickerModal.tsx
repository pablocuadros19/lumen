'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

// Mime types soportados
const SUPPORTED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.presentation',
]

export default function DrivePickerModal({ onClose, onFileImported }: Props) {
  const [estado, setEstado] = useState<'cargando' | 'conectar' | 'picker' | 'importando'>('cargando')
  const [error, setError] = useState('')
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [pickerLoaded, setPickerLoaded] = useState(false)

  // Cargar el SDK de Google Picker
  useEffect(() => {
    if (document.getElementById('google-picker-script')) {
      setPickerLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'google-picker-script'
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('picker', () => setPickerLoaded(true))
    }
    document.body.appendChild(script)
  }, [])

  // Obtener el token de Google
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/drive/listar')
        if (!res.ok) {
          const data = await res.json()
          if (data.code === 'NO_TOKEN' || data.code === 'TOKEN_EXPIRED') {
            setEstado('conectar')
            return
          }
        }
        // Token válido — obtenerlo del perfil
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setEstado('conectar'); return }

        const { data: perfil } = await supabase
          .from('perfiles')
          .select('google_token')
          .eq('id', user.id)
          .single()

        if (perfil?.google_token) {
          setGoogleToken(perfil.google_token)
          setEstado('picker')
        } else {
          setEstado('conectar')
        }
      } catch {
        setEstado('conectar')
      }
    }
    fetchToken()
  }, [])

  // Abrir el Picker cuando todo está listo
  const abrirPicker = useCallback(() => {
    if (!pickerLoaded || !googleToken || !GOOGLE_API_KEY) return

    const mimeQuery = SUPPORTED_MIMES.join(',')
    const docsView = new google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMimeTypes(mimeQuery)

    const picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .addView(new google.picker.DocsView().setIncludeFolders(true).setSelectFolderEnabled(false).setMimeTypes(mimeQuery).setEnableDrives(true))
      .setOAuthToken(googleToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(handlePickerCallback)
      .setTitle('Elegí un archivo para importar')
      .setLocale('es')
      .build()

    picker.setVisible(true)
  }, [pickerLoaded, googleToken])

  // Abrir automáticamente cuando está listo
  useEffect(() => {
    if (estado === 'picker' && pickerLoaded && googleToken) {
      abrirPicker()
    }
  }, [estado, pickerLoaded, googleToken, abrirPicker])

  const handlePickerCallback = async (data: google.picker.ResponseObject) => {
    if (data.action === google.picker.Action.CANCEL) {
      onClose()
      return
    }

    if (data.action === google.picker.Action.PICKED) {
      const doc = data.docs[0]
      if (!doc) return

      setEstado('importando')
      setError('')

      try {
        const res = await fetch('/api/drive/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: doc.id,
            fileName: doc.name,
            mimeType: doc.mimeType,
          }),
        })

        if (!res.ok) {
          const errData = await res.json()
          if (errData.code === 'TOKEN_EXPIRED') {
            setEstado('conectar')
            return
          }
          const detalle = errData.detalle ? ` (${errData.detalle})` : ''
          const fase = errData.fase ? `[${errData.fase}] ` : ''
          setError(`${fase}${errData.error || 'Error importando'}${detalle}`)
          console.error('[DrivePicker] Error completo:', errData)
          setEstado('picker')
          return
        }

        const importData = await res.json()
        onFileImported({
          archivo_url: importData.archivo_url,
          thumbnail_url: importData.thumbnail_url,
          titulo: importData.titulo || doc.name,
          resumen: importData.resumen || '',
          ejes_tematicos: importData.ejes_tematicos || [],
          tipo_recurso: importData.tipo_recurso || 'Actividad',
          idioma: importData.idioma || 'es',
          texto_extraido: importData.texto_extraido,
          fileName: doc.name,
        })
      } catch {
        setError('Error de conexión')
        setEstado('picker')
      }
    }
  }

  const conectarDrive = () => {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/subir?drive=1')}`,
        scopes: 'https://www.googleapis.com/auth/drive.file',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  // Si no hay API key configurada, fallback a la lista
  const sinConfig = !GOOGLE_API_KEY || !GOOGLE_CLIENT_ID

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-elevated w-full max-w-lg flex flex-col animate-card-in">
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
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#2E6EA6]/20 border-t-[#2E6EA6] rounded-full animate-spin" />
          </div>
        )}

        {/* Conectar */}
        {estado === 'conectar' && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
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

        {/* Picker abierto — mostrar mensaje mientras el Picker nativo está visible */}
        {estado === 'picker' && !sinConfig && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <p className="text-sm text-gray-500 mb-3">Seleccioná un archivo del Picker de Google Drive</p>
            <button
              onClick={abrirPicker}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                         text-sm font-semibold shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              Abrir Google Drive
            </button>
          </div>
        )}

        {/* Sin configuración de Picker — mensaje */}
        {estado === 'picker' && sinConfig && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <p className="text-sm text-gray-500 mb-1">Google Picker no está configurado</p>
            <p className="text-xs text-gray-300">Configurá NEXT_PUBLIC_GOOGLE_API_KEY y NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
          </div>
        )}

        {/* Importando */}
        {estado === 'importando' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-[#2E6EA6]/20 border-t-[#2E6EA6] rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#1A3A5C] font-medium">Importando...</p>
            <p className="text-xs text-gray-400 mt-1">Descargando, subiendo y clasificando con IA</p>
          </div>
        )}
      </div>
    </div>
  )
}
