'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const DELAY_MS = 1500

export default function Lumen3dPopup() {
  const [show, setShow] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  function dismiss(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    setClosing(true)
    setTimeout(() => setShow(false), 350)
  }

  if (!show) return null

  return (
    <Link
      href="/3d"
      className={`fixed top-5 right-5 z-[60] block w-[350px]
                  ${closing ? 'animate-slide-out-up' : 'animate-slide-in-down'}`}
      aria-label="Conocé LUMEN 3D"
    >
      <div
        className="relative bg-white rounded-2xl border border-[#8B2252]/15
                   shadow-[0_15px_40px_rgba(139,34,82,0.20),0_5px_15px_rgba(26,58,92,0.10)]
                   overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(139,34,82,0.28)]
                   transition-all duration-200"
      >
        {/* Banda superior bordó-azul para contraste */}
        <div className="h-2 bg-gradient-to-r from-[#8B2252] via-[#2E6EA6] to-[#1A3A5C]" />

        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-7 h-7 rounded-full
                     flex items-center justify-center text-gray-400
                     hover:bg-gray-100 hover:text-gray-700
                     transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-5 flex items-start gap-5">
          <Image
            src="/logo-3d.png"
            alt="LUMEN 3D"
            width={80}
            height={80}
            className="h-20 w-20 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[11px] font-bold tracking-[2.5px] uppercase text-[#8B2252] mb-1.5">
              Novedad
            </p>
            <h3 className="text-base font-bold text-[#1A3A5C] leading-tight mb-3">
              ¿Y si los recursos también se manipulan?
            </h3>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B2252]">
              Conocé LUMEN 3D
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
