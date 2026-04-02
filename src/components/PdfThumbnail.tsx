'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  url: string
  className?: string
}

export default function PdfThumbnail({ url, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

        const pdf = await pdfjsLib.getDocument(url).promise
        const page = await pdf.getPage(1)

        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Escalar para que quepa en el contenedor
        const viewport = page.getViewport({ scale: 1 })
        const targetWidth = 400
        const scale = targetWidth / viewport.width
        const scaledViewport = page.getViewport({ scale })

        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas } as any).promise

        if (!cancelled) setLoaded(true)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [url])

  if (error) return null

  return (
    <canvas
      ref={canvasRef}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
    />
  )
}
