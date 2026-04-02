'use client'

import { useState, useEffect } from 'react'

const SALUDOS = [
  (n: string) => `Hola ${n}, ¿qué vamos a enseñar hoy?`,
  (n: string) => `¡${n}! Tu biblioteca te esperaba.`,
  (n: string) => `Buenas, ${n}. Los chicos no saben la suerte que tienen.`,
  (n: string) => `Hola ${n}, ¿preparamos algo lindo para el aula?`,
  (n: string) => `¡Qué bueno verte, ${n}! ¿Arrancamos?`,
  (n: string) => `${n}, cada clase tuya deja huella.`,
  (n: string) => `Hola ${n}, hoy es un gran día para compartir ideas.`,
  (n: string) => `Bienvenida de vuelta, ${n}. ¿Qué necesitás para esta semana?`,
  (n: string) => `${n}, LUMEN está listo cuando vos lo estés.`,
  (n: string) => `¡${n}! Otro día, otra oportunidad de inspirar.`,
  (n: string) => `Hola ${n}, ¿en qué grado ponemos energía hoy?`,
  (n: string) => `${n}, la mejor parte del día empieza ahora.`,
  (n: string) => `¡Hola ${n}! Tu dedicación se nota. Seguí así.`,
  (n: string) => `Buenas, ${n}. ¿Qué vamos a crear hoy?`,
  (n: string) => `${n}, el aula te espera. Y nosotros también.`,
]

interface Props {
  nombre: string
  avatar: string
}

export default function WelcomeOverlay({ nombre, avatar }: Props) {
  const [visible, setVisible] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [saludo, setSaludo] = useState('')

  useEffect(() => {
    // Mostrar solo una vez por sesión
    if (sessionStorage.getItem('lumen_welcomed')) return

    const primerNombre = nombre.split(' ')[0]
    const idx = Math.floor(Math.random() * SALUDOS.length)
    setSaludo(SALUDOS[idx](primerNombre))
    setVisible(true)
    sessionStorage.setItem('lumen_welcomed', '1')

    // Auto-dismiss después de 3.5s
    const timer = setTimeout(() => {
      setSaliendo(true)
      setTimeout(() => setVisible(false), 600)
    }, 3500)

    return () => clearTimeout(timer)
  }, [nombre])

  if (!visible) return null

  const dismiss = () => {
    setSaliendo(true)
    setTimeout(() => setVisible(false), 600)
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center cursor-pointer
                  transition-opacity duration-500 ${saliendo ? 'opacity-0' : 'opacity-100'}`}
      onClick={dismiss}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />

      <div className={`relative flex flex-col items-center transition-all duration-700 ease-out
                       ${saliendo ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0 animate-[welcomeIn_0.8s_ease-out]'}`}
      >
        {/* Foto de perfil */}
        {avatar ? (
          <img
            src={avatar}
            alt={nombre}
            className="w-24 h-24 rounded-full shadow-lg ring-4 ring-white mb-6"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 rounded-full shadow-lg ring-4 ring-white mb-6
                          bg-gradient-to-br from-[#1A3A5C] to-[#2E6EA6]
                          flex items-center justify-center text-white text-3xl font-bold">
            {nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Saludo */}
        <p className="text-2xl font-bold text-[#1A3A5C] text-center max-w-md leading-snug mb-3">
          {saludo}
        </p>

        {/* Línea decorativa */}
        <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] opacity-40" />
      </div>

    </div>
  )
}
