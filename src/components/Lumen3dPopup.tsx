'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const STORAGE_KEY = 'lumen3d-popup-dismissed-v1'
const DELAY_MS = 1500

export default function Lumen3dPopup() {
  const [show, setShow] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(STORAGE_KEY)) return
    const t = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  function dismiss(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    setClosing(true)
    setTimeout(() => {
      setShow(false)
      try { window.localStorage.setItem(STORAGE_KEY, '1') } catch {}
    }, 350)
  }

  if (!show) return null

  return (
    <Link
      href="/3d"
      className={`fixed top-4 right-4 z-[60] block w-[280px]
                  ${closing ? 'animate-slide-out-up' : 'animate-slide-in-down'}`}
      aria-label="Conocé LUMEN 3D"
    >
      <div
        className="relative bg-white rounded-2xl border border-[#8B2252]/15
                   shadow-[0_12px_32px_rgba(139,34,82,0.18),0_4px_12px_rgba(26,58,92,0.08)]
                   overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(139,34,82,0.25)]
                   transition-all duration-200"
      >
        {/* Banda superior bordó-azul para contraste */}
        <div className="h-1.5 bg-gradient-to-r from-[#8B2252] via-[#2E6EA6] to-[#1A3A5C]" />

        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full
                     flex items-center justify-center text-gray-400
                     hover:bg-gray-100 hover:text-gray-700
                     transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 pt-4 flex items-start gap-4">
          <Image
            src="/logo-3d.png"
            alt="LUMEN 3D"
            width={64}
            height={64}
            className="h-16 w-16 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#8B2252] mb-1">
              Novedad
            </p>
            <h3 className="text-sm font-bold text-[#1A3A5C] leading-tight mb-2">
              ¿Y si los recursos también se tocan?
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2252]">
              Conocé LUMEN 3D
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
