import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Users, UserMinus, Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClase, setSelectedClase] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [activeTab, setActiveTab] = useState<'clases'|'alumnos'>('clases');
  const [todosAlumnos, setTodosAlumnos] = useState<any[]>([]);
  const [loadingTodosAlumnos, setLoadingTodosAlumnos] = useState(false);
  
  // Modals Extra State
  const [alertInfo, setAlertInfo] = useState<{ msg: string; title?: string } | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState<{ claseId: number, alumnoId: number } | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Create / Edit Class State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    dia_semana: 'Lunes',
    hora_inicio: '17:00',
    hora_fin: '18:00',
    cupo_maximo: 10,
    descripcion: ''
  });

  const HORARIOS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Filtramos la lista de horarios para ocultar los ocupados en el día seleccionado
  const horariosOcupadosDelDia = clases
    .filter(c => c.dia_semana === formData.dia_semana && c.id !== editingId)
    .map(c => c.hora_inicio.slice(0,5));

  const horariosDisponibles = HORARIOS.filter(h => !horariosOcupadosDelDia.includes(h));

  // Auto-fijar el select si el horario actual elegido quedó inválido por cambio de día
  useEffect(() => {
    if (isFormOpen && !horariosDisponibles.includes(formData.hora_inicio)) {
      if (horariosDisponibles.length > 0) {
        handleHoraInicioChange(horariosDisponibles[0]);
      }
    }
  }, [formData.dia_semana, isFormOpen]);

  const handleHoraInicioChange = (horaStr: string) => {
    // Calculamos automáticamente la hora_fin (+1 hora)
    const [h, m] = horaStr.split(':').map(Number);
    const horaFin = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setFormData({ ...formData, hora_inicio: horaStr, hora_fin: horaFin });
  };
  
  // Carrusel State
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const fetchClases = async () => {
    try {
      const { data } = await api.get('/classes');
      if (data.ok) {
        setClases(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosAlumnos = async () => {
    try {
      setLoadingTodosAlumnos(true);
      const { data } = await api.get('/users/admin/alumnos');
      if (data.ok) setTodosAlumnos(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTodosAlumnos(false);
    }
  };

  useEffect(() => {
    fetchClases();
    fetchTodosAlumnos();
  }, []);

  const handleToggleCuota = async (alumnoId: number, currentStatus: boolean) => {
    try {
      const { data } = await api.patch(`/users/${alumnoId}/cuota`, { cuota_al_dia: !currentStatus });
      if (data.ok) {
        setTodosAlumnos(todosAlumnos.map(a => a.id === alumnoId ? { ...a, cuota_al_dia: !currentStatus, pago_pendiente: false } : a));
      }
    } catch (err) {
      setAlertInfo({ title: 'Error', msg: 'Error al actualizar cuota del alumno.' });
    }
  };

  const handleSelectClase = async (claseId: number) => {
    if (selectedClase === claseId) {
      setSelectedClase(null);
      return;
    }
    setSelectedClase(claseId);
    setLoadingAlumnos(true);
    try {
      const { data } = await api.get(`/classes/${claseId}/students`);
      if (data.ok) setAlumnos(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleRemoveAlumno = async () => {
    if(!confirmRemoveOpen) return;
    const { claseId, alumnoId } = confirmRemoveOpen;
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/classes/${claseId}/remove-user`, { usuario_id: alumnoId });
      if (data.ok) {
        handleSelectClase(claseId);
        fetchClases();
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error', msg: err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'No se pudo remover el alumno.' });
    } finally {
      setConfirmRemoveOpen(null);
      setActionLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ dia_semana: 'Lunes', hora_inicio: '17:00', hora_fin: '18:00', cupo_maximo: 10, descripcion: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      dia_semana: c.dia_semana,
      hora_inicio: c.hora_inicio.slice(0,5),
      hora_fin: c.hora_fin.slice(0,5),
      cupo_maximo: c.cupo_maximo,
      descripcion: c.descripcion || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteClass = async () => {
    if(!confirmDeleteOpen) return;
    const claseId = confirmDeleteOpen;
    setActionLoading(true);
    try {
      const { data } = await api.delete(`/classes/${claseId}`);
      if (data.ok) {
        if(selectedClase === claseId) setSelectedClase(null);
        fetchClases();
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error al eliminar', msg: err.response?.data?.message || "Hubo un error al eliminar el horario." });
    } finally {
      setConfirmDeleteOpen(null);
      setActionLoading(false);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/classes/${editingId}`, formData);
        if (data.ok) {
          setIsFormOpen(false);
          fetchClases();
        }
      } else {
        const { data } = await api.post('/classes', {
          ...formData,
          nombre: 'Pilates', // Hardcoded
          profesor_id: user?.id
        });
        if (data.ok) {
          setIsFormOpen(false);
          fetchClases();
        }
      }
    } catch (err: any) {
      setAlertInfo({ title: 'Error al guardar', msg: err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Error al guardar el horario en el servidor." });
    } finally {
      setFormLoading(false);
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

  // Ajustar el índice si el día actual desaparece tras borrar una clase
  useEffect(() => {
    if (diasConClases.length > 0 && currentDayIndex >= diasConClases.length) {
      setCurrentDayIndex(0);
    }
  }, [diasConClases.length, currentDayIndex]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Administración</h1>
          <p className="text-gray-500 mt-2">Gestioná horarios fijos y monitoreá pagos y alumnos.</p>
        </div>
        {activeTab === 'clases' && (
          <Button onClick={() => isFormOpen ? setIsFormOpen(false) : handleOpenCreate()} variant={isFormOpen ? 'outline' : 'primary'} className="shrink-0">
            {isFormOpen ? <><X size={18} className="mr-2"/> Cancelar</> : <><Plus size={18} className="mr-2"/> Nuevo Horario</>}
          </Button>
        )}
      </div>

      <div className="flex space-x-2 border-b border-gray-200 mt-4 overflow-x-auto">
        <button onClick={() => setActiveTab('clases')} className={`pb-3 px-4 whitespace-nowrap whitespace-nowrap transition-all ${activeTab === 'clases' ? 'border-b-2 border-purple-600 font-semibold text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}>
          Gestión de Horarios
        </button>
        <button onClick={() => setActiveTab('alumnos')} className={`pb-3 px-4 whitespace-nowrap transition-all ${activeTab === 'alumnos' ? 'border-b-2 border-purple-600 font-semibold text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}>
          Directorio de Alumnos
        </button>
      </div>

      {activeTab === 'clases' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {isFormOpen && (
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-emerald-800">{editingId ? 'Editar horario fijo' : 'Configurar nuevo horario'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Día de la semana</label>
                  <select required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm" value={formData.dia_semana} onChange={e => setFormData({...formData, dia_semana: e.target.value})}>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm" 
                    value={formData.hora_inicio} 
                    onChange={e => handleHoraInicioChange(e.target.value)}
                  >
                    {horariosDisponibles.length === 0 && <option value="" disabled>Sin cupos este día</option>}
                    {horariosDisponibles.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Hora de Fin</label>
                  <div className="w-full px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl shadow-sm select-none">
                    {formData.hora_fin} (Automático)
                  </div>
                </div>
                <Input label="Cupo Máximo" required type="number" min="1" value={formData.cupo_maximo} onChange={e => setFormData({...formData, cupo_maximo: parseInt(e.target.value)})} />
                <Input label="Nombre del Profesor" type="text" placeholder="Ej: Flor, Gaby..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" isLoading={formLoading}>{editingId ? 'Actualizar Cambios' : 'Confirmar Horario'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4 pt-8">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      ) : clases.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 shadow-sm border-gray-200 border-dashed mt-8">
          <CalendarDays className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          No hay horarios configurados. Creá uno nuevo.
        </Card>
      ) : diaActual ? (
        <div className="space-y-8 pt-6">
          {/* Navegador de Días (Carousel Header) */}
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-3 max-w-2xl mx-auto ring-1 ring-gray-900/5">
            <Button variant="ghost" onClick={handlePrevDay} className="px-3 md:px-6 text-purple-700 hover:bg-purple-50">
              <ChevronLeft size={28} />
            </Button>
            
            <div className="flex flex-col items-center flex-1 text-center">
              <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">Día seleccionado</span>
              <h2 className="text-2xl md:text-3xl font-black text-purple-900 uppercase tracking-tight">
                {diaActual}
              </h2>
            </div>

            <Button variant="ghost" onClick={handleNextDay} className="px-3 md:px-6 text-purple-700 hover:bg-purple-50">
              <ChevronRight size={28} />
            </Button>
          </div>

          <div className="space-y-4">
            {clasesPorDia[diaActual].map((c: any) => (
              <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between items-center p-4 bg-gray-50 flex-wrap gap-4">
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors flex-1"
                    onClick={() => handleSelectClase(c.id)}
                  >
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg uppercase tracking-wide">
                         {c.hora_inicio?.slice(0,5)} a {c.hora_fin?.slice(0,5)}
                      </h4>
                      <span className="text-sm font-medium text-gray-500 mt-1 block">Anotados: {c.cupos_ocupados} de {c.cupo_maximo} lugares | Prof. {c.descripcion || 'No asignado'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={c.cupos_ocupados >= c.cupo_maximo ? 'error' : 'success'}>
                      {c.cupos_ocupados >= c.cupo_maximo ? 'Lleno' : 'Disponible'}
                    </Badge>
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                      <Button variant="ghost" className="p-2 h-auto text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleOpenEdit(c); }} title="Editar horario">
                        <Pencil size={18} />
                      </Button>
                      <Button variant="ghost" className="p-2 h-auto text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setConfirmDeleteOpen(c.id); }} title="Eliminar horario">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedClase === c.id && (
                  <div className="p-4 bg-white border-t border-gray-100">
                    <h5 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                      Lista de Alumnos 
                    </h5>
                    
                    {loadingAlumnos ? (
                      <p className="text-sm text-gray-500">Cargando alumnos...</p>
                    ) : alumnos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {alumnos.map(a => (
                          <div key={a.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <span className="font-medium text-sm text-gray-900">{a.nombre} <span className="text-gray-500 font-normal block sm:inline">({a.email})</span></span>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => setConfirmRemoveOpen({ claseId: c.id, alumnoId: a.id })} className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Remover alumno">
                                <UserMinus size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No hay alumnos anotados en este horario fijo todavía.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
        </div>
      )}

      {activeTab === 'alumnos' && (
        <div className="animate-in fade-in duration-300 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg">Registro Global de Alumnos</h3>
            <span className="text-sm font-medium text-gray-500">{todosAlumnos.length} inscriptos</span>
          </div>
          {loadingTodosAlumnos ? (
            <p className="p-8 text-center text-gray-400">Cargando directorio...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Nombre y Contacto</th>
                    <th className="p-4 font-semibold text-center">Estado de Cuota</th>
                    <th className="p-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todosAlumnos.map(al => (
                    <tr key={al.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{al.nombre}</div>
                        <div className="text-sm text-gray-500">{al.email}</div>
                        {al.telefono && <div className="text-xs text-gray-400 mt-0.5">{al.telefono}</div>}
                      </td>
                      <td className="p-4 text-center">
                        {al.cuota_al_dia ? (
                          <Badge variant="success" className="inline-flex">Al Día</Badge>
                        ) : al.pago_pendiente ? (
                          <Badge variant="warning" className="inline-flex animate-pulse">Revisar Comprobante</Badge>
                        ) : (
                          <Badge variant="error" className="inline-flex">Por Pagar</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant={al.cuota_al_dia ? 'outline' : (al.pago_pendiente ? 'primary' : 'outline')} 
                          size="sm" 
                          onClick={() => handleToggleCuota(al.id, al.cuota_al_dia)}
                          className={al.pago_pendiente ? 'ring-2 ring-amber-300 ring-offset-1' : ''}
                        >
                          {al.cuota_al_dia ? 'Marcar Vencida' : (al.pago_pendiente ? 'Validar y Aprobar' : 'Aprobar Pago')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {todosAlumnos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-400 italic">No hay alumnos registrados en el sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      <Modal isOpen={!!alertInfo} onClose={() => setAlertInfo(null)} title={alertInfo?.title}>
        <p className="text-gray-700 text-lg">{alertInfo?.msg}</p>
      </Modal>

      {/* Modal Confirm Remover Alumno */}
      <Modal
        isOpen={confirmRemoveOpen !== null}
        onClose={() => setConfirmRemoveOpen(null)}
        title="Remover Alumno"
        variant="warning"
        confirmText="Confirmar Remoción"
        onConfirm={handleRemoveAlumno}
        isLoading={actionLoading}
      >
        <p>¿Querés remover de forma forzada a este alumno de su lugar permanente en el horario?</p>
      </Modal>

      {/* Modal Confirm Delete Class */}
      <Modal
        isOpen={confirmDeleteOpen !== null}
        onClose={() => setConfirmDeleteOpen(null)}
        title="Destruir Horario Fijo"
        variant="danger"
        confirmText="BORRAR DEFINITIVAMENTE"
        onConfirm={handleDeleteClass}
        isLoading={actionLoading}
      >
        <p>¿Estás seguro de que querés eliminar DEFINITIVAMENTE este horario? Se limpiarán todas las reservas asociadas y será irrecuperable.</p>
      </Modal>

    </div>
  );
}
