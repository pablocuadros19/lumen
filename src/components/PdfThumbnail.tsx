'use client'

import { useEffect, useState } from 'react'

interface Props {
  url: string
  className?: string
}

export default function PdfThumbnail({ url, className = '' }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const response = await fetch(url)
        if (!response.ok) return
        const data = await response.arrayBuffer()

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`

        const pdf = await pdfjsLib.getDocument({ data }).promise
        const page = await pdf.getPage(1)

        const viewport = page.getViewport({ scale: 1 })
        const scale = 400 / viewport.width
        const scaledViewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas } as any).promise

        if (!cancelled) {
          setImgSrc(canvas.toDataURL('image/jpeg', 0.8))
        }
      } catch (e) {
        console.error('PdfThumbnail error:', e)
      }
    }

    render()
    return () => { cancelled = true }
  }, [url])

  if (!imgSrc) return null

  return (
    <img
      src={imgSrc}
      alt="Preview PDF"
      className={`${className} transition-opacity duration-300`}
    />
  )
}
