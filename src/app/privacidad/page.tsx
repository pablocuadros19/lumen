import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — LUMEN',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 2 de abril de 2026</p>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">1. Qué es LUMEN</h2>
            <p>
              LUMEN es una biblioteca pedagógica digital diseñada para instituciones educativas.
              Permite a docentes y coordinadores compartir, organizar y descubrir recursos
              pedagógicos de manera colaborativa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos de cuenta:</strong> nombre, email y foto de perfil proporcionados por Google al iniciar sesión.</li>
              <li><strong>Contenido subido:</strong> archivos, recursos y metadatos que los usuarios publican voluntariamente en la plataforma.</li>
              <li><strong>Datos de uso:</strong> historial de descargas y favoritos para mejorar las recomendaciones.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">3. Google Drive</h2>
            <p>
              LUMEN permite importar archivos desde Google Drive. Usamos el scope <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">drive.file</code>,
              que significa que <strong>solo accedemos al archivo específico que elegís</strong> a través del selector de Google.
              No leemos, listamos ni accedemos a ningún otro archivo de tu Drive.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">4. Cómo usamos los datos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Autenticación y gestión de tu cuenta.</li>
              <li>Almacenamiento y distribución de los recursos que subís.</li>
              <li>Clasificación automática de recursos mediante inteligencia artificial.</li>
              <li>Estadísticas de uso para coordinadores de la institución.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">5. Almacenamiento y seguridad</h2>
            <p>
              Los datos se almacenan en servidores seguros de Supabase (infraestructura AWS).
              Los archivos se guardan en almacenamiento cifrado. Las conexiones se realizan
              exclusivamente a través de HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">6. Compartición de datos</h2>
            <p>
              No vendemos, alquilamos ni compartimos datos personales con terceros.
              Los recursos publicados son visibles únicamente para los miembros de tu institución educativa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">7. Tus derechos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Podés solicitar la eliminación de tu cuenta y datos en cualquier momento.</li>
              <li>Podés revocar el acceso a Google Drive desde tu cuenta de Google.</li>
              <li>Podés eliminar cualquier recurso que hayas subido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A3A5C] mb-3">8. Contacto</h2>
            <p>
              Para consultas sobre privacidad, escribinos a{' '}
              <a href="mailto:pablocuadros19@gmail.com" className="text-[#2E6EA6] hover:underline">
                pablocuadros19@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
