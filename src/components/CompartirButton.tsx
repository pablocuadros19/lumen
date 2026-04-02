'use client'

import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'

interface Props {
  recursoId: string
  titulo: string
}

export default function CompartirButton({ recursoId, titulo }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/recurso/${recursoId}`
    : `/recurso/${recursoId}`

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [abierto])

  const copiarLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const compartirWhatsApp = () => {
    const texto = encodeURIComponent(`Mirá este recurso en LUMEN: ${titulo}\n${url}`)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  const generarQR = async () => {
    if (!qrDataUrl) {
      const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2 })
      setQrDataUrl(dataUrl)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setAbierto(!abierto); generarQR() }}
        className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200
                   text-sm font-medium text-[#1A3A5C] shadow-sm
                   hover:shadow-card hover:-translate-y-0.5
                   transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
        Compartir
      </button>

      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100
                        shadow-elevated p-3 space-y-1.5 z-20 animate-card-in">
          {/* Copiar link */}
          <button
            onClick={copiarLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       hover:bg-[#1A3A5C]/5 transition-colors cursor-pointer text-left"
          >
            <svg className="w-4 h-4 text-[#1A3A5C]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <span className="text-[#1A3A5C]">{copiado ? 'Copiado!' : 'Copiar link'}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={compartirWhatsApp}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       hover:bg-green-50 transition-colors cursor-pointer text-left"
          >
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            <span className="text-green-700">WhatsApp</span>
          </button>

          {/* QR */}
          {qrDataUrl && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Escaneá para abrir</p>
              <img src={qrDataUrl} alt="QR" className="w-40 h-40 mx-auto rounded-xl" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
