'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  url: string
  className?: string
}

export default function PdfThumbnail({ url, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        // Descargar el PDF como ArrayBuffer para evitar CORS con pdf.js
        const response = await fetch(url)
        if (!response.ok) return
        const data = await response.arrayBuffer()

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

        const pdf = await pdfjsLib.getDocument({ data }).promise
        const page = await pdf.getPage(1)

        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const viewport = page.getViewport({ scale: 1 })
        const scale = 400 / viewport.width
        const scaledViewport = page.getViewport({ scale })

        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas } as any).promise

        if (!cancelled) setLoaded(true)
      } catch (e) {
        console.error('PdfThumbnail error:', e)
      }
    }

    render()
    return () => { cancelled = true }
  }, [url])

  return (
    <canvas
      ref={canvasRef}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
    />
  )
}
