import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import api from '../../services/api';

export default function ClassesList() {
  const { user } = useAuthStore();
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [misClasesIds, setMisClasesIds] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  // Estado para el slider de días
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Estados del Modal de Pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Estados de Modales Confirmación
  const [confirmEnrollOpen, setConfirmEnrollOpen] = useState<number | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState<number | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ msg: string; title?: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clasesRes, misClasesRes] = await Promise.all([
        api.get('/classes'),
        api.get(`/users/${user?.id}/classes`)
      ]);
      
      if (clasesRes.data.ok) setClases(clasesRes.data.data);
      if (misClasesRes.data.ok) {
        const ids = new Set<number>(misClasesRes.data.data.map((c: any) => c.clase_id || c.id));
        setMisClasesIds(ids);
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar datos de grilla semanal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const showNotification = (msg: string, type: 'success'|'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInitiateEnroll = (claseId: number) => {
    if (!user?.cuota_al_dia) {
      if (user?.pago_pendiente) {
        setAlertInfo({ title: 'Pendiente', msg: 'Tu validación de pago está pendiente. Esperá a que el profe lo confirme para anotarte.' });
      } else {
        setPaymentModalOpen(true);
      }
      return;
    }
    setConfirmEnrollOpen(claseId);
  };

  const handleEnroll = async () => {
    if (!confirmEnrollOpen) return;
    const claseId = confirmEnrollOpen;
    setActionLoading(claseId);
    try {
      const { data } = await api.post(`/classes/${claseId}/enroll`);
      if (data.ok) {
        showNotification('Horario fijo reservado con éxito.', 'success');
        await fetchData();
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error al reservar', msg: err.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Hubo un error al reservar el turno.' });
    } finally {
      setConfirmEnrollOpen(null);
      setActionLoading(null);
    }
  };

  const handleDeclarePayment = async () => {
    setPayLoading(true);
    try {
      const { data } = await api.post('/users/self/pay');
      if (data.ok) {
        useAuthStore.getState().refreshUser();
        setPaymentModalOpen(false);
        showNotification('Pago notificado. El profesor validará tu comprobante pronto.', 'success');
      }
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Error al notificar el pago.', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  const handleCancelEnroll = async () => {
    if(!confirmCancelOpen) return;
    const claseId = confirmCancelOpen;
    setActionLoading(claseId);
    try {
      const { data } = await api.delete(`/classes/${claseId}/enroll`);
      if (data.ok) {
        showNotification('Reserva cancelada correctamente.', 'success');
        await fetchData();
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error al cancelar', msg: err.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Hubo un error al intentar liberar el cupo.' });
    } finally {
      setConfirmCancelOpen(null);
      setActionLoading(null);
    }
  };

  const diasOrdenados = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const clasesPorDia = clases.reduce((acc, c) => {
    if (!acc[c.dia_semana]) acc[c.dia_semana] = [];
    acc[c.dia_semana].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  // Filtrar solo los días que efectivamente tienen clases programadas
  const diasConClases = diasOrdenados.filter(dia => clasesPorDia[dia] && clasesPorDia[dia].length > 0);
  const diaActual = diasConClases.length > 0 ? diasConClases[currentDayIndex] : null;

  const handlePrevDay = () => {
    setCurrentDayIndex((prev) => (prev === 0 ? diasConClases.length - 1 : prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev === diasConClases.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Grilla de Pilates</h1>
          <p className="text-lg text-gray-500 mt-2 font-medium">Navegá por los días y reservá tu lugar fijo semanal.</p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'} transition-all`}>
          {notification.msg}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
           {[1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-gray-100" />)}
        </div>
      ) : clases.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 shadow-sm border-gray-200 border-dashed">
          <CalendarDays className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          El profesor aún no ha cargado los horarios semanales de Pilates.
        </Card>
      ) : diaActual ? (
        <div className="space-y-10">
          {/* Navegador de Días (Carousel Header) */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 px-6 py-4 max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={handlePrevDay} 
              className="p-3 md:p-4 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-all duration-300"
            >
              <ChevronLeft size={32} />
            </Button>
            
            <div className="flex flex-col items-center flex-1 text-center">
              <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">Día seleccionado</span>
              <h2 className="text-3xl md:text-4xl font-black text-emerald-500 uppercase tracking-tight drop-shadow-sm">
                {diaActual}
              </h2>
              <span className="text-sm font-semibold text-gray-500 mt-1.5">
                {clasesPorDia[diaActual].length} {clasesPorDia[diaActual].length === 1 ? 'horario' : 'horarios'} disponible{clasesPorDia[diaActual].length !== 1 ? 's' : ''}
              </span>
            </div>

            <Button 
              variant="ghost" 
              onClick={handleNextDay} 
              className="p-3 md:p-4 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-all duration-300"
            >
              <ChevronRight size={32} />
            </Button>
          </div>

          {/* Grilla de Clases del Día Seleccionado */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
            {clasesPorDia[diaActual].map((c: any) => {
              const isEnrolled = misClasesIds.has(c.id);
              const isFull = c.cupos_ocupados >= c.cupo_maximo;
              const percentageFilled = (c.cupos_ocupados / c.cupo_maximo) * 100;
              
              const isWarning = percentageFilled >= 80 && !isFull;
              const badgeVariant = isEnrolled ? 'brand' : (isFull ? 'error' : (isWarning ? 'warning' : 'success'));
              const badgeText = isEnrolled ? 'Tu turno asignado' : (isFull ? 'Clase llena' : (isWarning ? '¡Últimos lugares!' : 'Libre'));

              return (
                <Card 
                  key={c.id} 
                  className={`flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] border-2
                    ${isEnrolled ? 'border-emerald-200 ring-4 ring-emerald-50/50 bg-emerald-50/40' : 'border-white/60 bg-white/70 backdrop-blur-md'}
                    ${isFull && !isEnrolled ? 'opacity-60 grayscale-[30%] bg-gray-50/80 hover:opacity-80' : ''}
                  `}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isFull && !isEnrolled ? 'bg-gray-200' : 'bg-purple-100'}`}>
                          <Clock className={`w-5 h-5 ${isFull && !isEnrolled ? 'text-gray-500' : 'text-purple-600'}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                          {c.hora_inicio?.slice(0,5)}
                          <span className="text-sm tracking-normal font-medium text-gray-400 mx-2">a</span>
                          {c.hora_fin?.slice(0,5)}
                        </h3>
                      </div>
                      <Badge variant={badgeVariant} className="whitespace-nowrap shrink-0">{badgeText}</Badge>
                    </div>

                    <div className="space-y-4 mt-auto border-t border-gray-100 pt-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-600">
                          <span>Profesor</span>
                          <span>{c.descripcion || 'Designar'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-gray-600 border-t pt-2 mt-2">
                          <span>Lugares</span>
                          <span className={isFull && !isEnrolled ? 'line-through text-red-500' : ''}>
                            {c.cupo_maximo - c.cupos_ocupados} de {c.cupo_maximo} libres
                          </span>
                        </div>
                        <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${isFull && !isEnrolled ? 'opacity-70' : ''}`}>
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : (isWarning ? 'bg-amber-400' : 'bg-emerald-500')}`}
                            style={{ width: `${percentageFilled}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2">
                        {isEnrolled ? (
                          <Button 
                            variant="ghost" 
                            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-11 border border-red-100" 
                            onClick={() => setConfirmCancelOpen(c.id)}
                            isLoading={actionLoading === c.id}
                          >
                            Liberar mi lugar
                          </Button>
                        ) : (
                          <Button 
                            variant="primary"
                            className={`w-full h-11 text-base font-semibold shadow-sm ${isFull ? 'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300' : ''}`} 
                            disabled={isFull}
                            onClick={() => handleInitiateEnroll(c.id)}
                            isLoading={actionLoading === c.id}
                          >
                            {isFull ? 'Vení en otro horario' : 'Asignarme este horario'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Alertas Varias Generales */}
      <Modal isOpen={!!alertInfo} onClose={() => setAlertInfo(null)} title={alertInfo?.title}>
        <p className="text-gray-700 text-lg">{alertInfo?.msg}</p>
      </Modal>

      {/* Confirmación Reserva */}
      <Modal
        isOpen={confirmEnrollOpen !== null}
        onClose={() => setConfirmEnrollOpen(null)}
        title="Confirmar Reserva"
        onConfirm={handleEnroll}
        confirmText="Anotarme en este horario"
        isLoading={actionLoading === confirmEnrollOpen}
      >
        <p>¿Estás seguro que querés reservar este lugar de manera semanal? Se descontará un cupo de la clase.</p>
      </Modal>

      {/* Confirmación Baja */}
      <Modal
        isOpen={confirmCancelOpen !== null}
        onClose={() => setConfirmCancelOpen(null)}
        title="Liberar Lugar"
        variant="danger"
        onConfirm={handleCancelEnroll}
        confirmText="Sí, liberar cupo"
        isLoading={actionLoading === confirmCancelOpen}
      >
        <p>¿Deseas abandonar tu lugar permanente en este horario? El cupo se liberará automáticamente para alguien más.</p>
      </Modal>

      {/* Modal de Pago de Cuota */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-xl text-center text-gray-900">Abonar Cuota Mensual</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">Para poder reservar tus horarios, necesitás tener la cuota al día, por favor realizá el pago de la suscripción mensual a la siguiente cuenta y mandá el comprobante por WhatsApp al profesor:</p>
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
                <p>Una vez completada la transferencia, hacé clic en confirmar para que el profesor apruebe tu acceso a las reservas.</p>
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
    </div>
  );
}
