import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/ui/Modal';
import { Calendar, LayoutDashboard, UserCircle, LogOut, Users } from 'lucide-react';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const performLogout = () => {
    setLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = user?.rol === 'admin'
    ? [
        { name: 'Admin', path: '/admin', icon: Users },
      ]
    : [
        { name: 'Inicio', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Clases', path: '/classes', icon: Calendar },
        { name: 'Perfil', path: '/profile', icon: UserCircle },
      ];

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="bg-white/80 text-gray-800 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-purple-500 to-emerald-400 p-2 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img src="/logo.png" alt="Corpore Gym Logo" className="h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 14 2c7 0 7 7 7 7a7 7 0 0 1-7 7c-7 0-7-7-7-7"/><path d="M14 9V2"/></svg>' }} />
            </div>
            <span className="text-xl font-extrabold tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-emerald-600">CORPORE GYM</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                    isActive ? "bg-purple-50 text-purple-700 shadow-sm font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-purple-600")} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              Hola, <span className="text-gray-900 font-semibold">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300",
                  isActive ? "text-purple-600 font-semibold -translate-y-1" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={cn("p-2 rounded-2xl transition-all duration-300", isActive && "bg-purple-50")}>
                  <Icon className={cn("h-6 w-6", isActive && "fill-purple-50")} />
                </div>
                <span className="text-[11px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Cerrar sesión"
        onConfirm={performLogout}
        confirmText="Sí, cerrar sesión"
        cancelText="Conservar sesión"
        variant="danger"
      >
        <p>¿Estás seguro que deseas desconectarte de tu cuenta?</p>
      </Modal>
    </div>
  );
}
