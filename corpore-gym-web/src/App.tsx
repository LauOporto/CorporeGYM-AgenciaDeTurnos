import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import ClassesList from './pages/user/ClassesList';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import { useAuthStore } from './store/authStore';

function App() {
  const { token, refreshUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes" element={<ClassesList />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
        
        {/* Helper Redirect for Admin Root Login */}
        <Route path="/redirect" element={<Navigate to="/admin" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
