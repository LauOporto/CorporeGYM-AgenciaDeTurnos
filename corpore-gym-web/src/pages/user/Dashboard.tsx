import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMisClases = async () => {
      try {
        const { data } = await api.get(`/users/${user?.id}/classes`);
        if (data.ok) {
          setClases(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchMisClases();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hola, {user?.nombre?.split(' ')[0] || 'Atleta'}</h1>
        <p className="text-gray-500 mt-2">Aquí está el resumen de tus reservas.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Mis Próximas Clases</CardTitle>
              <Link to="/classes">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">Ver todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : clases.length > 0 ? (
                <div className="space-y-4">
                  {clases.map((c: any) => (
                    <div key={c.id} className="flex flex-col items-center text-center sm:text-left sm:flex-row justify-between p-6 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-white hover:border-purple-100 gap-4 transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl shadow-sm hidden sm:block group-hover:scale-105 transition-transform duration-300">
                          <Calendar className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div className="flex flex-col items-center sm:items-start">
                          <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-tight">{c.dia_semana}</h4>
                          <div className="text-sm text-gray-500 flex flex-col items-center sm:items-start gap-1 mt-2">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {c.hora_inicio?.slice(0, 5)} a {c.hora_fin?.slice(0, 5)}</span>
                            <span className="flex items-center gap-1.5 font-medium text-purple-600">Prof. {c.descripcion || 'No asignado'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="success" className="w-max self-center sm:self-auto px-4 py-1.5 text-xs font-semibold shadow-sm border border-emerald-200">Cupo Asegurado</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No tenés reservas activas próximas.</p>
                  <Link to="/classes">
                    <Button>Agendar una clase</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-white/20 shadow-lg shadow-purple-500/20">
             <CardContent className="p-10 text-center space-y-6">
                <div className="bg-white/20 w-16 h-16 mx-auto rounded-[1.5rem] flex items-center justify-center backdrop-blur-md shadow-sm mb-2">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">¿Listo para entrenar?</h3>
                <p className="text-purple-50 text-base leading-relaxed font-medium">Reservá tu lugar en la próxima clase antes de que se agoten los cupos y mantené tu ritmo.</p>
                <Link to="/classes" className="block w-full pt-2">
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-50 hover:text-purple-700 h-14 text-lg shadow-xl shadow-black/5">Reservar ahora</Button>
                </Link>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
