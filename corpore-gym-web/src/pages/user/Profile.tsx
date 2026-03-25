import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { User as UserIcon, Settings, Trash2, Mail } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setAuth, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{ msg: string; title?: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${user?.id}`, formData);
      if (data.ok) {
        // Renovar contexto del store con los nuevos datos devueltos en data.data
        setAuth(data.data.token, data.data.usuario);
        alert('Perfil actualizado correctamente.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = prompt('Estás a punto de ELIMINAR tu cuenta permanentemente. Escribí "ELIMINAR" (todo en mayúsculas) para confirmar:');
    if (confirmation !== 'ELIMINAR') return;

    try {
      setLoading(true);
      const { data } = await api.delete(`/users/${user?.id}`);
      if (data.ok) {
        setDeleteConfirmOpen(false);
        setAlertInfo({ msg: 'Cuenta eliminada. Reenviando al inicio...' });
        setTimeout(() => {
          useAuthStore.getState().logout();
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error', msg: err.response?.data?.message || 'Error al eliminar la cuenta.' });
      setLoading(false);
    }
  };

  const handleDeclarePayment = async () => {
    setPayLoading(true);
    try {
      const { data } = await api.post('/users/self/pay');
      if (data.ok) {
        refreshUser();
        setPaymentModalOpen(false);
        setAlertInfo({ title: 'Aviso de Pago', msg: 'Pago notificado. El administrador validará tu comprobante en breve para habilitar tus inscripciones.' });
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error', msg: err.response?.data?.message || 'Error al notificar el pago.' });
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mi Perfil</h1>
        <p className="text-lg text-gray-500 mt-2 font-medium">Gestioná tu información personal y suscripción.</p>
      </div>

      <Card className="border-white/60 bg-white/60 backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-emerald-50 h-32 w-full object-cover"></div>
        <CardContent className="px-8 pt-0 pb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full sm:w-auto">
              <div className="bg-white p-2 rounded-[2rem] shadow-sm shrink-0 -mt-12 border-4 border-white/50 backdrop-blur-md">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[1.5rem] p-5">
                  <UserIcon size={56} className="text-purple-500" />
                </div>
              </div>
              <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{user?.nombre}</h2>
                <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                  <Mail size={18} className="text-gray-400" /> {user?.email}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center sm:items-end gap-2 text-center sm:text-right w-full sm:w-auto bg-white/50 backdrop-blur-sm sm:bg-transparent p-5 sm:p-0 rounded-[2rem] sm:mt-2 border border-white/60 sm:border-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado de Suscripción</span>
              {user?.cuota_al_dia ? (
                <div className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-full shadow-sm text-sm border border-emerald-200">
                  Suscripción Activa
                </div>
              ) : user?.pago_pendiente ? (
                <div className="px-4 py-1.5 bg-amber-100 text-amber-800 font-bold rounded-full shadow-sm text-sm border border-amber-200">
                  Validación Pendiente
                </div>
              ) : (
                <div className="space-y-3 w-full sm:w-auto flex flex-col items-center sm:items-end">
                   <div className="px-4 py-1.5 bg-red-100 text-red-800 font-bold rounded-full shadow-sm text-sm border border-red-200">
                     Cuota Vencida
                   </div>
                   <Button size="sm" className="w-full" onClick={() => setPaymentModalOpen(true)}>Abonar Cuota</Button>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6 max-w-lg">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <Settings size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-800">Datos Personales</h3>
            </div>
            
            <div className="space-y-4">
              <Input 
                label="Nombre completo" 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                required 
              />
              <Input 
                label="Teléfono (Opcional)" 
                type="tel"
                value={formData.telefono} 
                onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                placeholder="Ej: +54 9 11 1234 5678"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="w-full sm:w-auto shadow-sm">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-100 bg-red-50/50 backdrop-blur-md shadow-sm">
        <CardHeader className="border-b-0 pb-2">
          <CardTitle className="inline-flex flex-row items-center gap-2 text-red-600 text-xl">
            <Trash2 size={24} />
            Zona de Peligro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600/80 mb-4 max-w-xl">
            Al eliminar tu cuenta, **perderás permanentemente** tu lugar asegurado en todos los horarios fijos semanales a los que te hayas inscripto. Esta acción no se puede deshacer.
          </p>
          <Button 
            variant="danger" 
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Eliminar mi cuenta
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Pago de Cuota */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-xl text-center text-gray-900">Abonar Cuota Mensual</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">Para poder reservar tus horarios, necesitás tener la cuota al día, por favor realizá el pago de la suscripción mensual a la siguiente cuenta:</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-3">
                <div className="flex justify-between items-center border-b border-purple-100/50 pb-2">
                  <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">Alias MercadoPago</span>
                  <span className="font-bold text-gray-900 select-all tracking-wide">CORPORE.GYM.MP</span>
                </div>
                <div className="flex justify-between items-center border-b border-purple-100/50 pb-2">
                  <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">CVU</span>
                  <span className="font-bold text-gray-900 select-all tracking-wider text-sm">00000031000123456789</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">Titular</span>
                  <span className="font-bold text-gray-900">Corpore Gym Pilates</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm text-emerald-800 flex gap-2">
                <span className="text-emerald-500">💰</span>
                <p>Una vez completada la transferencia en tu App bancaria, hacé clic en confirmar para liberar tu acceso a las reservas.</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full sm:w-1/2" 
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={payLoading}
                >
                  Regresar
                </Button>
                <Button 
                  className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 font-bold outline-none" 
                  isLoading={payLoading}
                  onClick={handleDeclarePayment}
                >
                  Ya transferí mensualidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas Varias Generales */}
      <Modal isOpen={!!alertInfo} onClose={() => setAlertInfo(null)} title={alertInfo?.title}>
        <p className="text-gray-700 text-lg">{alertInfo?.msg}</p>
      </Modal>

      {/* Confirmación Borrado de Cuenta */}
      <Modal 
        isOpen={deleteConfirmOpen} 
        onClose={() => { setDeleteConfirmOpen(false); setDeleteInputText(''); }} 
        title="Eliminar Cuenta"
        variant="danger"
        confirmText="Borrar Definitivamente"
        onConfirm={handleDelete}
        isLoading={loading}
      >
        <p className="mb-4">Estás a punto de ELIMINAR tu cuenta permanentemente. Escribí <b>ELIMINAR</b> para confirmar:</p>
        <Input 
          value={deleteInputText}
          onChange={(e) => setDeleteInputText(e.target.value)}
          placeholder="ELIMINAR"
          className="text-center font-bold tracking-widest text-red-600 border-red-200 uppercase"
        />
      </Modal>

    </div>
  );
}
