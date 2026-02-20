import Link from 'next/link';
import { 
  Play, 
  Timer, 
  FolderKanban, 
  BarChart3, 
  CheckCircle2,
  Linkedin,
  Github,
} from 'lucide-react';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

export function LandingView() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon-transparent.svg" alt="TicTak" className="w-10 h-10" />
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">TicTak</span>
          </Link>

          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Link href="/dashboard">
              <button className="cursor-pointer bg-gradient-to-r from-[#38a3a5] to-[#57cc99] hover:from-[#22577a] hover:to-[#38a3a5] text-white font-semibold rounded-lg px-5 py-2 transition-all duration-200">
                Empezar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 lg:py-15">
        {/* Blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#38a3a5]/20 to-[#57cc99]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#57cc99]/20 to-[#38a3a5]/20 blur-3xl pointer-events-none" />
        {/* Diagonal bottom band */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom right, transparent 49%, rgba(87,204,153,0.15) 50%)' }}
        />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mt-6 text-gray-900 dark:text-gray-100">
                Registra cada{' '}
                <span className="bg-gradient-to-r from-[#38a3a5] to-[#57cc99] bg-clip-text text-transparent">
                  minuto
                </span>
                <br />
                de lo que haces.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-lg">
                TicTak es tu rastreador de tiempo personal. Organiza tus proyectos, mide cuánto 
                dedicas a cada cosa y gana claridad sobre cómo usas realmente tu tiempo.
              </p>

              {/* CTA Button */}
              <Link href="/dashboard">
                <button className="mt-8 px-8 py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-[#38a3a5] to-[#57cc99] hover:from-[#22577a] hover:to-[#38a3a5] shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 hover:scale-105 flex items-center gap-2 cursor-pointer">
                  <Play className="h-5 w-5" />
                  Empezar ahora
                </button>
              </Link>

              {/* Note */}
              <p className="text-sm text-gray-400 mt-3">
                Sin registro · Empieza en segundos · Completamente gratis
              </p>
            </div>

            {/* Right Column - Screenshot Mockup */}
            <div className="hidden md:block">
              <div className="relative -rotate-1 shadow-2xl rounded-xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* App Preview */}
                <div className="bg-gradient-to-br from-[#38a3a5] to-[#80ed99] aspect-[4/3] flex flex-col items-center justify-center p-12">
                  <img src="/favicon-transparent.svg" alt="TicTak" className="h-24 w-24 brightness-0 invert mb-6 opacity-90" />
                  <div className="text-6xl font-bold text-white mb-2">00:00:00</div>
                  <div className="text-white/80 text-lg">Timer en espera</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features Bar */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Sin cuenta necesaria
            </div>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Sin registro requerido
            </div>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Proyectos ilimitados
            </div>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Dark mode
            </div>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Gratis
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden py-20 bg-white dark:bg-gray-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-[#38a3a5]/10 to-[#57cc99]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Todo lo que necesitas para medir tu tiempo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Sin complicaciones. Sin suscripciones.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 mb-4 w-fit">
                <Timer className="h-6 w-6 text-[#38a3a5]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Timer inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Inicia y pausa cuando quieras. Asigna el tiempo a un proyecto después de terminar, sin interrumpir tu flujo de trabajo.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 mb-4 w-fit">
                <FolderKanban className="h-6 w-6 text-[#57cc99]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Organiza lo tuyo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Estructura tus actividades en Cliente → Proyecto → Tarea. Mueve y reorganiza en cualquier momento.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 mb-4 w-fit">
                <BarChart3 className="h-6 w-6 text-[#38a3a5]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Entiende tu tiempo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Descubre cuánto dedicas realmente a cada cosa. Estadísticas semanales, mensuales y anuales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - 3 Steps */}
      <section className="relative overflow-hidden py-20 bg-gray-50 dark:bg-gray-900">
        <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-gradient-to-bl from-[#57cc99]/15 to-[#38a3a5]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-[#38a3a5]/10 to-[#57cc99]/15 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Tres pasos. Nada más.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Empieza en menos de un minuto.</p>
          </div>

          {/* Steps with connector */}
          <div className="relative grid md:grid-cols-3 gap-6">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-[#38a3a5] to-[#57cc99] opacity-30" />

            {/* Step 1 */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38a3a5] to-[#57cc99] flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                <span className="text-white font-black text-lg">1</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Crea tus proyectos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Agrega las áreas de tu vida que quieres medir: trabajo, aprendizaje, hobbies…
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38a3a5] to-[#57cc99] flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                <span className="text-white font-black text-lg">2</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Activa el timer
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Selecciona una tarea y dale play. O graba sin tarea y asígnala al guardar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38a3a5] to-[#57cc99] flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                <span className="text-white font-black text-lg">3</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Analiza tu tiempo
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Revisa tus estadísticas y encuentra patrones en cómo usas tu tiempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Showcase */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Blobs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#38a3a5]/20 to-[#57cc99]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#57cc99]/20 to-[#38a3a5]/20 blur-3xl pointer-events-none" />
        {/* Diagonal bottom band */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom right, transparent 49%, rgba(87,204,153,0.15) 50%)' }}
        />
        <div className="max-w-4xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Una interfaz limpia que no se mete en tu camino
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
              Diseñada para que el foco esté en el trabajo, no en la herramienta.
            </p>
          </div>

          {/* Screenshot Mockups — asymmetric layout */}
          <div className="grid lg:grid-cols-5 gap-5 items-start">

            {/* Timer — portrait, 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="/timer-view.png" alt="Vista del timer" className="w-full h-full object-cover object-top" />
                </div>
              </div>
              <div className="flex items-center gap-2 px-1">
                <Timer className="h-3.5 w-3.5 text-[#38a3a5]" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Timer</span>
                <span className="text-xs text-gray-400 ml-auto">Tus sesiones, sin distracciones</span>
              </div>
            </div>

            {/* Projects + Stats — landscape, 3 cols */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Projects */}
              <div className="flex flex-col gap-2">
                <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src="/projects-view.png" alt="Vista de proyectos" className="w-full h-full object-cover object-top" />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <FolderKanban className="h-3.5 w-3.5 text-[#57cc99]" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Proyectos</span>
                  <span className="text-xs text-gray-400 ml-auto">Organiza todo en un vistazo</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-2">
                <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src="/stats-view.png" alt="Vista de estadísticas" className="w-full h-full object-cover object-top" />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <BarChart3 className="h-3.5 w-3.5 text-[#38a3a5]" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Estadísticas</span>
                  <span className="text-xs text-gray-400 ml-auto">Patrones que no sabías que tenías</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#38a3a5] to-[#57cc99] py-20">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <img src="/favicon-transparent.svg" alt="TicTak" className="h-14 w-14 mx-auto mb-4 brightness-0 invert" />
          <h2 className="text-3xl font-bold text-white">
            ¿Cuánto tiempo le dedicas realmente a lo que importa?
          </h2>
          <p className="text-white/80 text-lg mt-3">
            Solo tú, tus proyectos y un timer.
          </p>

          <Link href="/dashboard">
            <button className="mt-6 px-8 py-4 bg-white text-[#38a3a5] font-bold rounded-xl hover:bg-gray-50 shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto">
              <Play className="h-5 w-5" />
              Abrir TicTak
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Social Links + Copyright */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/jose-julian-martinez-a79163237/?locale=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#38a3a5] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/JoseJulian25"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#38a3a5] transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
          <span className="text-sm text-gray-400">© 2026 TicTak</span>
        </div>
      </footer>
    </div>
  );
}
