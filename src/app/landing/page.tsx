import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A3A5C] overflow-hidden">

      {/* ===================== HERO ===================== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Decoraciones de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3A5C]/[0.03] via-transparent to-[#8B2252]/[0.03]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#2E6EA6]/[0.06] blur-[120px] -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#8B2252]/[0.05] blur-[100px] translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#1A3A5C]/[0.02] blur-[80px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center landing-fade-in">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="LUMEN"
              width={200}
              height={200}
              className="drop-shadow-sm"
              priority
            />
          </div>

          <p className="text-sm font-semibold tracking-[4px] uppercase text-[#8B2252] mb-6">
            Biblioteca Pedagógica Inteligente
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
            Todos los recursos de tu escuela.{' '}
            <span className="text-gradient-lumen">
              Un solo lugar.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            LUMEN centraliza, clasifica con IA y potencia los materiales pedagógicos
            de tu colegio. Para que cada docente encuentre lo que necesita en segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                         bg-gradient-to-r from-[#1A3A5C] to-[#2E6EA6] text-white
                         font-semibold text-lg shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Comenzar
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                         border-2 border-[#1A3A5C]/20 text-[#1A3A5C]
                         font-semibold text-lg
                         hover:border-[#1A3A5C]/40 hover:bg-[#1A3A5C]/[0.03]
                         transition-all duration-300"
            >
              Conocé más
            </a>
          </div>
        </div>

        {/* Indicador scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 landing-fade-in-delayed">
          <div className="w-6 h-10 border-2 border-[#1A3A5C]/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#1A3A5C]/30 rounded-full landing-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ===================== PROBLEMA ===================== */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8f9fc] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[3px] uppercase text-[#8B2252] mb-4">
              El problema
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Los recursos de tu escuela están{' '}
              <span className="text-[#8B2252]">dispersos</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Fragmentados',
                text: 'WhatsApp, Drive, pendrives, emails... Cada docente guarda sus materiales en un lugar diferente.',
              },
              {
                title: 'Invisibles',
                text: 'El recurso excelente que una docente creó el año pasado no existe para el resto del equipo.',
              },
              {
                title: 'Sin potencial',
                text: 'Materiales valiosos que podrían adaptarse a otros grados quedan estancados donde se crearon.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 border border-gray-100
                           shadow-[0_2px_8px_rgba(26,58,92,0.04)]
                           hover:border-[#8B2252]/20 hover:shadow-[0_8px_24px_rgba(139,34,82,0.06)]
                           transition-all duration-300"
              >
                <h3 className="text-lg font-bold mb-3 text-[#1A3A5C]">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-lg text-gray-500 max-w-2xl mx-auto">
            Fichas, planificaciones, evaluaciones y materiales valiosos se pierden
            en el camino. LUMEN los rescata.
          </p>
        </div>
      </section>

      {/* ===================== QUE ES LUMEN ===================== */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[3px] uppercase text-[#2E6EA6] mb-4">
              La solución
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Una biblioteca inteligente{' '}
              <span className="text-gradient-lumen">para tu colegio</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              LUMEN es una plataforma web privada donde el equipo docente organiza,
              comparte y potencia sus recursos pedagógicos con inteligencia artificial.
              Diseñada para educación primaria argentina, alineada al Diseño Curricular
              de la Provincia de Buenos Aires.
            </p>
          </div>

          {/* Linea decorativa gradiente */}
          <div className="w-24 h-1 bg-gradient-to-r from-[#1A3A5C] via-[#2E6EA6] to-[#8B2252] rounded-full mx-auto mb-16" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Clasificación automática con IA',
                text: 'Subís un PDF y la inteligencia artificial lo clasifica por área, eje temático, grado y tipo. Solo revisás y confirmás.',
                color: '#2E6EA6',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                title: 'Búsqueda inteligente',
                text: 'Encontrá el recurso justo en segundos. Buscá por título, eje temático, tipo o grado con resultados instantáneos.',
                color: '#1A3A5C',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: 'Copiloto pedagógico',
                text: 'Adaptá recursos a otro grado, generá evaluaciones, creá rúbricas, simplificá consignas y armá guías docentes.',
                color: '#8B2252',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                ),
              },
              {
                title: 'Colecciones y favoritos',
                text: 'Cada docente organiza su biblioteca personal. Marcá favoritos, creá colecciones temáticas y compartilas con colegas.',
                color: '#1A3A5C',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ),
              },
              {
                title: 'Panel de coordinación',
                text: 'Semáforo de cobertura curricular, métricas de uso, recursos más descargados y gestión de contenido destacado.',
                color: '#2E6EA6',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                title: 'Sistema de revisión',
                text: 'La coordinadora aprueba u observa cada recurso antes de publicarlo. Control de calidad garantizado.',
                color: '#8B2252',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl p-8 border border-gray-100
                           shadow-[0_2px_8px_rgba(26,58,92,0.04)]
                           hover:border-[color:var(--hover-color)] hover:shadow-[0_8px_24px_rgba(26,58,92,0.08)]
                           transition-all duration-300"
                style={{ '--hover-color': `${feature.color}30` } as React.CSSProperties}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5
                             transition-colors duration-300"
                  style={{ backgroundColor: `${feature.color}10`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMO FUNCIONA ===================== */}
      <section id="como-funciona" className="relative py-24 sm:py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8f9fc] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[3px] uppercase text-[#2E6EA6] mb-4">
              Simple
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Tres pasos. Eso es todo.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Subí un recurso',
                text: 'Arrastrá un PDF, Word o imagen. También podés importar directo desde Google Drive.',
              },
              {
                step: '2',
                title: 'La IA lo clasifica',
                text: 'En segundos, la inteligencia artificial analiza el contenido y sugiere área, eje, grado y tipo.',
              },
              {
                step: '3',
                title: 'Todo el equipo lo encuentra',
                text: 'El recurso queda disponible para que cualquier docente lo busque, descargue o adapte con el copiloto.',
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A3A5C] to-[#2E6EA6]
                               flex items-center justify-center text-white text-2xl font-black
                               mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.text}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2">
                    {/* Flecha visual implícita por layout */}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Linea conectora */}
          <div className="hidden md:block absolute top-[calc(50%+8px)] left-1/2 -translate-x-1/2 w-2/3 h-0.5
                          bg-gradient-to-r from-[#1A3A5C]/10 via-[#2E6EA6]/20 to-[#1A3A5C]/10 rounded-full -z-0" />
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8f9fc] to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[3px] uppercase text-[#8B2252] mb-4">
              Inversión
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Transparente y accesible
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Sin costo por usuario. Sin sorpresas. Todo incluido.
            </p>
          </div>

          {/* Banner especial */}
          <div className="bg-gradient-to-r from-[#1A3A5C]/[0.05] to-[#2E6EA6]/[0.05]
                          border border-[#2E6EA6]/20 rounded-2xl p-8 mb-12 text-center">
            <h3 className="text-xl font-bold mb-2 text-[#1A3A5C]">
              Primer mes gratis
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Probá LUMEN con tu equipo docente durante 30 días sin costo ni compromiso.
              Si funciona para tu colegio, seguimos. Si no, sin vueltas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Hasta 50 usuarios */}
            <div className="relative bg-gradient-to-br from-[#1A3A5C] to-[#2E6EA6]
                            rounded-3xl p-8 sm:p-10 text-white
                            shadow-[0_8px_32px_rgba(26,58,92,0.25)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2
                              bg-[#8B2252] text-white text-xs font-bold tracking-wider uppercase
                              px-5 py-1.5 rounded-full shadow-md">
                Más elegido
              </div>

              <p className="text-xs font-bold tracking-[2px] uppercase text-white/50 mb-6">
                Hasta 50 usuarios
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black">$250</span>
                <span className="text-white/50 font-medium">USD/mes</span>
              </div>
              <p className="text-sm text-white/40 mb-8">Ideal para la mayoría de los colegios</p>

              <ul className="space-y-3 mb-8">
                {[
                  'Hasta 50 docentes y coordinadores',
                  'IA integrada sin límite de uso',
                  'Clasificación automática con IA',
                  'Copiloto pedagógico',
                  'Panel de coordinación',
                  'Sistema de revisión y aprobación',
                  'Soporte y capacitación incluidos',
                  'Actualizaciones continuas',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-white/80">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:pablocuadros19@gmail.com?subject=Demo LUMEN"
                className="block w-full text-center px-6 py-3.5 rounded-xl
                           bg-white text-[#1A3A5C] font-semibold
                           hover:bg-white/90 hover:shadow-lg
                           transition-all duration-300"
              >
                Agenda una demo
              </a>
            </div>

            {/* +50 usuarios */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200
                            shadow-[0_2px_8px_rgba(26,58,92,0.04)]
                            hover:shadow-[0_8px_24px_rgba(26,58,92,0.08)]
                            transition-all duration-300 flex flex-col">
              <p className="text-xs font-bold tracking-[2px] uppercase text-gray-400 mb-6">
                +50 usuarios
              </p>
              <div className="mb-2">
                <span className="text-4xl font-black text-[#1A3A5C]">A medida</span>
              </div>
              <p className="text-sm text-gray-400 mb-8">Para colegios grandes o redes educativas</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Todo lo del plan base',
                  'Usuarios ilimitados',
                  'Múltiples niveles y sedes',
                  'Onboarding personalizado',
                  'SLA de soporte dedicado',
                  'Integraciones a medida',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <svg className="w-5 h-5 text-[#2E6EA6] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:pablocuadros19@gmail.com?subject=LUMEN - Plan a medida"
                className="block w-full text-center px-6 py-3.5 rounded-xl border-2 border-[#1A3A5C]/20
                           text-[#1A3A5C] font-semibold
                           hover:border-[#1A3A5C]/40 hover:bg-[#1A3A5C]/[0.03]
                           transition-all duration-300"
              >
                Hablemos
              </a>
            </div>
          </div>

          {/* Que incluye */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">
              Qué incluyen todos los planes
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Plataforma 24/7',
                'Hosting y base de datos',
                'IA integrada',
                'Backups automáticos',
                'Actualizaciones continuas',
                'Capacitación inicial',
              ].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-white border border-gray-200
                             text-sm text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            ¿Querés transformar la biblioteca{' '}
            <span className="text-gradient-lumen">de tu escuela?</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Escribinos y coordinamos una demo personalizada para tu colegio.
            Sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:pablocuadros19@gmail.com?subject=Demo LUMEN"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                         bg-gradient-to-r from-[#8B2252] to-[#1A3A5C] text-white
                         font-semibold text-lg shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Agenda una demo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                         border-2 border-[#1A3A5C]/20 text-[#1A3A5C]
                         font-semibold text-lg
                         hover:border-[#1A3A5C]/40 hover:bg-[#1A3A5C]/[0.03]
                         transition-all duration-300"
            >
              Ir a la plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="LUMEN"
              width={40}
              height={40}
            />
            <span className="font-bold text-[#1A3A5C]">LUMEN</span>
            <span className="text-gray-400 text-sm">Biblioteca Pedagógica Inteligente</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacidad" className="hover:text-[#1A3A5C] transition-colors">
              Privacidad
            </Link>
            <a href="mailto:pablocuadros19@gmail.com" className="hover:text-[#1A3A5C] transition-colors">
              pablocuadros19@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {/* Estilos de animacion CSS */}
      <style>{`
        .landing-fade-in {
          animation: landingFadeIn 1s ease-out both;
        }
        .landing-fade-in-delayed {
          animation: landingFadeIn 1s ease-out 0.5s both;
        }
        @keyframes landingFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .landing-scroll-indicator {
          animation: landingScroll 2s ease-in-out infinite;
        }
        @keyframes landingScroll {
          0%, 100% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(8px);
          }
        }
      `}</style>
    </div>
  )
}
