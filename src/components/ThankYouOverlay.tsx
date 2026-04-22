'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const AGRADECIMIENTOS = [
  'Gracias por compartir. El aula de alguien va a ser mejor por esto.',
  'Material nuevo para la plataforma. Los chicos te lo van a agradecer.',
  'Otro recurso más que suma. Gracias por ser parte.',
  'Esto es lo que hace grande a LUMEN: docentes como vos.',
  'Guardado y listo. Ahora otro docente puede usarlo también.',
  'Gracias por tu tiempo y dedicación. Se nota.',
  'Un recurso más, una clase mejor. Así se construye.',
  'La plataforma crece gracias a vos. Gracias de verdad.',
  'Compartir es multiplicar. Gracias por sumar.',
  'Listo. Lo que subiste hoy puede cambiar una clase mañana.',
]

interface Props {
  onDone: () => void
}

export default function ThankYouOverlay({ onDone }: Props) {
  const [saliendo, setSaliendo] = useState(false)
  const [mensaje] = useState(() => AGRADECIMIENTOS[Math.floor(Math.random() * AGRADECIMIENTOS.length)])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaliendo(true)
      setTimeout(onDone, 600)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center
                  transition-opacity duration-500 ${saliendo ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="absolute inset-0 bg-white/85 backdrop-blur-md" />

      <div className={`relative flex flex-col items-center transition-all duration-700 ease-out
                       ${saliendo ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0 animate-[welcomeIn_0.8s_ease-out]'}`}>
        {/* Logo Newman */}
        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 flex items-center justify-center mb-6">
          <Image src="/newman-logo-2.jpg" alt="Newman" width={52} height={52} />
        </div>

        {/* Mensaje */}
        <p className="text-xl font-bold text-[#1A3A5C] text-center max-w-sm leading-snug mb-2">
          {mensaje}
        </p>

        <p className="text-sm text-gray-400">LUMEN · Newman</p>

        {/* Línea decorativa */}
        <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-40 mt-4" />
      </div>
    </div>
  )
}
