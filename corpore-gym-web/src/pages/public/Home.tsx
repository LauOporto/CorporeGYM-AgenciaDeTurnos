import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Leaf, Sparkles, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Top Navbar */}
      <nav className="absolute top-0 w-full z-10 px-6 py-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-500 to-emerald-400 p-2 rounded-2xl shadow-sm">
               <img src="/logo.png" alt="Corpore Gym" className="h-6 w-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 14 2c7 0 7 7 7 7a7 7 0 0 1-7 7c-7 0-7-7-7-7"/><path d="M14 9V2"/></svg>' }} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-800 hidden sm:block">CORPORE GYM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 flex-grow flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-purple-100/50 to-transparent rounded-full blur-3xl -z-10 animate-in fade-in duration-1000"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-20 -right-20 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>

        <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-purple-100 text-purple-700 text-sm font-semibold mb-8 shadow-sm">
            <Sparkles size={16} className="text-purple-500" />
            Tu centro de bienestar integral
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-[1.1]">
            Encuentra tu equilibrio <br className="hidden md:block"/> con <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-emerald-500">Pilates Reformer</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Un espacio diseñado para reconectar cuerpo y mente. Mejorá tu postura, ganá flexibilidad y liberá tensiones en un entorno de paz absoluta.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-10 h-16 shadow-xl shadow-emerald-500/20">Empezar mi viaje</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg px-10 h-16 bg-white/40">Continuar mi práctica</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="px-4 pb-24 lg:pb-32 max-w-7xl mx-auto relative z-10 w-full animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300 fill-mode-both">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Leaf size={28} className="drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Conexión Fluida</h3>
            <p className="text-gray-600 leading-relaxed font-medium">Movimientos conscientes que alivian tensiones crónicas y restauran la biomecánica natural de tu cuerpo paso a paso.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Activity size={28} className="drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Tono y Fuerza</h3>
            <p className="text-gray-600 leading-relaxed font-medium">Desarrollá una base sólida desde el core, esculpiendo cada grupo muscular sin impacto ni agresividad.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={28} className="drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Paz Mental</h3>
            <p className="text-gray-600 leading-relaxed font-medium">Un oasis en medio de tu rutina. Reducí el estrés mediante la respiración coordinada y el enfoque total.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
