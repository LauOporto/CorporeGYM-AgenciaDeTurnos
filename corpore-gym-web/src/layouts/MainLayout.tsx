import { Outlet, Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-purple-600">
            <Dumbbell className="h-8 w-8 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight">CORPORE GYM</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="text-sm font-medium bg-emerald-500 text-white px-4 py-2 flex items-center rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
              Registrarse
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Corpore Gym. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
