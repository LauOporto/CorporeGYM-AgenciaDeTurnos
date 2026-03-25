import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: regData } = await api.post('/auth/register', formData);
      if (regData.ok) {
        setAuth(regData.data.token, regData.data.usuario);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.message || 'Error al registrarse. Verificá los datos ingresados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl text-purple-700">Crear una cuenta</CardTitle>
          <p className="text-gray-500 mt-2">Sumate a CORPORE GYM y empezá a reservar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <Input
              label="Nombre Completo"
              name="nombre"
              placeholder="Ej: Laura Gómez"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Teléfono (Opcional)"
              type="tel"
              name="telefono"
              placeholder="Ej: +54 11 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
              Crear Cuenta
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Iniciá sesión acá
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
