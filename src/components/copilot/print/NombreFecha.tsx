'use client'

// Líneas Nombre/Fecha al pie del header de cada ficha imprimible.
// Espaciado pensado para escribir a mano.
export default function NombreFecha() {
  return (
    <div className="mt-5 mb-2 flex items-end gap-6 text-sm text-gray-700">
      <div className="flex-1 flex items-end gap-2">
        <span>Nombre:</span>
        <span className="flex-1 border-b border-gray-500 h-1" />
      </div>
      <div className="w-40 flex items-end gap-2">
        <span>Fecha:</span>
        <span className="flex-1 border-b border-gray-500 h-1" />
      </div>
    </div>
  )
}
