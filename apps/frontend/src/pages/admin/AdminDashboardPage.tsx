import { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Circle, 
  Clock, 
  Lock, 
  X, 
  CheckCircle2, 
  Plus,
  Loader2,
  Phone,
  Scissors,
  User,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { 
  fetchServices, 
  fetchAppointments, 
  fetchProfessionalBlocks,
  createProfessionalBlock,
  deleteProfessionalBlock,
  fetchOpeningHours,
  updateAppointmentStatus,
  Service as APIService,
  ProfessionalBlock,
  OpeningHour
} from "../../lib/api";
import { useProfessionalProfile } from "../../components/auth/AdminGuard";

interface ScheduleDay {
  id: string;
  dayName: string;
  isOpen: boolean;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

export function AdminDashboardPage() {
  const { profile } = useProfessionalProfile();

  // Helper to get YYYY-MM-DD in local time
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dataLoading, setDataLoading] = useState(false);
  
  // States for Modals
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<{
    id: string; date: string; start: string; duration: number;
    service: string; client: string; whatsapp: string; price: number; status: string;
  } | null>(null);
  
  // Data State
  const [blocks, setBlocks] = useState<ProfessionalBlock[]>([]);
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [apiServices, setApiServices] = useState<APIService[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);

  // Derived state: Appointments in dashboard format
  const appointments = useMemo(() => {
    return apiAppointments.map(appt => {
      // Parse date/time directly from ISO string to avoid browser timezone conversion
      // Format: "2026-04-15T08:30:00-03:00" → extract "2026-04-15" and "08:30"
      const isoString: string = appt.date_time;
      const datePart = isoString.substring(0, 10);        // "2026-04-15"
      const timePart = isoString.substring(11, 16);       // "08:30"
      const hour = isoString.substring(11, 13);           // "08"
      const minute = isoString.substring(14, 16);         // "30"

      const serviceObj = apiServices.find(s => s.id === appt.service);

      return {
        id: appt.id.toString(),
        date: datePart,
        start: timePart,
        startTimeValue: parseInt(hour) * 60 + parseInt(minute),
        duration: serviceObj ? serviceObj.duration_minutes : 30,
        service: serviceObj ? serviceObj.name : "Serviço",
        client: appt.client_name,
        whatsapp: appt.client_whatsapp || '',
        price: serviceObj ? parseFloat(serviceObj.price) : 0,
        status: appt.status,
        date_time: appt.date_time // keeping original for conflict check
      };
    });
  }, [apiAppointments, apiServices]);


  async function loadDashboardData() {
    if (!profile) return;
    
    setDataLoading(true);
    try {
      const [servicesData, appointmentsData, blocksData, openingHoursData] = await Promise.all([
        fetchServices(profile.id),
        fetchAppointments({ professionalId: profile.id }),
        fetchProfessionalBlocks(profile.id),
        fetchOpeningHours(profile.id)
      ]);

      console.log(`[Dashboard] Fetched ${servicesData.length} services and ${appointmentsData.length} appointments for professional ${profile.id}`);
      setApiServices(servicesData);
      setApiAppointments(appointmentsData);
      setBlocks(blocksData);

      // Map OpeningHour[] to ScheduleDay[]
      // Backend: 0=Segunda, 1=Terça, ..., 6=Domingo
      const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
      const mappedSchedule: ScheduleDay[] = openingHoursData
        .sort((a: OpeningHour, b: OpeningHour) => a.day_of_week - b.day_of_week)
        .map((oh: OpeningHour) => ({
          id: oh.id.toString(),
          dayName: dayNames[oh.day_of_week],
          isOpen: oh.is_open,
          workStart: oh.work_start.substring(0, 5),
          workEnd: oh.work_end.substring(0, 5),
          lunchStart: oh.lunch_start.substring(0, 5),
          lunchEnd: oh.lunch_end.substring(0, 5)
        }));
      
      setSchedule(mappedSchedule);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  // Modal temporary data
  const [newBlock, setNewBlock] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    start: '08:00', 
    end: '09:00',
    isFullDay: false
  });
  const [newAppt, setNewAppt] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    start: '08:00', 
    service: '', 
    client: '' 
  });

  // Update newAppt service when apiServices loads
  useEffect(() => {
    if (apiServices.length > 0 && !newAppt.service) {
      setNewAppt(prev => ({ ...prev, service: apiServices[0].name }));
    }
  }, [apiServices, newAppt.service]);


  // Helper to get day of week and date for the current week starting from Monday
  const weekDates = useMemo(() => {
    const dates = [];
    const curr = new Date(selectedDate);
    // Adjust to local Monday
    const day = curr.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = curr.getDate() - (day === 0 ? 6 : day - 1);
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startOfWeek);
      nextDate.setDate(startOfWeek.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  }, [selectedDate]);

  // Handle navigations
  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 7);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Stats calculation
  const stats = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const weekDateStrings = weekDates.map(d => getLocalDateString(d));

    const todaysAppts = appointments.filter(a => a.date === todayStr);
    const weeklyAppts = appointments.filter(a => weekDateStrings.includes(a.date));

    const todayRevenueSum = todaysAppts.reduce((sum, a) => sum + (a.price || 0), 0);
    const weeklyRevenueSum = weeklyAppts.reduce((sum, a) => sum + (a.price || 0), 0);
    
    return {
      todayCount: todaysAppts.length,
      todayRevenue: todayRevenueSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      weekCount: weeklyAppts.length,
      weekRevenue: weeklyRevenueSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  }, [appointments, weekDates]);

  const daysLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const handleConfirmBlock = async () => {
    if (!profile) return;
    try {
      const created = await createProfessionalBlock({
        professional: profile.id,
        date: newBlock.date,
        start_time: newBlock.isFullDay ? null : newBlock.start + ":00",
        end_time: newBlock.isFullDay ? null : newBlock.end + ":00",
        reason: "Bloqueio Manual"
      });
      setBlocks([...blocks, created]);
      setIsBlockModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);
      alert("Erro ao criar bloqueio.");
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!window.confirm("Remover este bloqueio?")) return;
    try {
      await deleteProfessionalBlock(id);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;
    try {
      await updateAppointmentStatus(id, 'cancelled');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert("Erro ao cancelar agendamento.");
    }
  };

  const handleConfirmAppt = () => {
    // Note: Manual appointments should eventually hit the API too
    // For now we just close as the focus is on client bookings
    setIsAppointmentModalOpen(false);
  };

  const handlePlusClick = (date: Date, hour: string) => {
    setNewAppt({
      ...newAppt,
      date: date.toISOString().split('T')[0],
      start: hour
    });
    setIsAppointmentModalOpen(true);
  };

  const isClosed = (date: Date, hour: string) => {
    const jsDay = date.getDay(); // 0 (Sun) to 6 (Sat)
    const apiDay = jsDay === 0 ? 6 : jsDay - 1; // 0 (Mon) to 6 (Sun)
    
    // schedule is sorted by day_of_week at line 105
    const daySchedule = schedule[apiDay];

    if (!daySchedule || !daySchedule.isOpen) return true;

    const [h, m] = hour.split(':').map(Number);
    const timeVal = h * 60 + m;

    const [startH, startM] = daySchedule.workStart.split(':').map(Number);
    const startVal = startH * 60 + (startM || 0);

    const [endH, endM] = daySchedule.workEnd.split(':').map(Number);
    const endVal = endH * 60 + (endM || 0);

    const [lunchStartH, lunchStartM] = daySchedule.lunchStart.split(':').map(Number);
    const lunchStartVal = lunchStartH * 60 + (lunchStartM || 0);

    const [lunchEndH, lunchEndM] = daySchedule.lunchEnd.split(':').map(Number);
    const lunchEndVal = lunchEndH * 60 + (lunchEndM || 0);

    // Outside work hours
    if (timeVal < startVal || timeVal >= endVal) return true;
    
    // Lunch break
    if (timeVal >= lunchStartVal && timeVal < lunchEndVal) return true;

    return false;
  };

  const getConflictType = (appt: any) => {
    const apptDate = new Date(appt.date_time);
    const apptDateStr = getLocalDateString(apptDate);

    // 1. Check Blocks
    const block = blocks.find(b => {
      if (b.date !== apptDateStr) return false;
      if (!b.start_time || !b.end_time) return true;
      
      const apptStartVal = appt.startTimeValue;
      const apptEndVal = apptStartVal + appt.duration;
      
      const [bsH, bsM] = b.start_time.split(':').map(Number);
      const bStartVal = bsH * 60 + bsM;
      const [beH, beM] = b.end_time.split(':').map(Number);
      const bEndVal = beH * 60 + beM;

      return (apptStartVal < bEndVal) && (bStartVal < apptEndVal);
    });

    if (block) return { type: 'block', message: 'Data Bloqueada' };

    // 2. Check Opening Hours
    const jsDay = apptDate.getDay();
    const apiDay = jsDay === 0 ? 6 : jsDay - 1;
    const daySchedule = schedule[apiDay];

    if (!daySchedule || !daySchedule.isOpen) return { type: 'closed', message: 'Dia Fechado' };

    const apptStartVal = appt.startTimeValue;
    const apptEndVal = apptStartVal + appt.duration;

    const [startH, startM] = daySchedule.workStart.split(':').map(Number);
    const workStartVal = startH * 60 + (startM || 0);
    const [endH, endM] = daySchedule.workEnd.split(':').map(Number);
    const workEndVal = endH * 60 + (endM || 0);

    const [lunchSH, lunchSM] = daySchedule.lunchStart.split(':').map(Number);
    const lunchStartVal = lunchSH * 60 + (lunchSM || 0);
    const [lunchEH, lunchEM] = daySchedule.lunchEnd.split(':').map(Number);
    const lunchEndVal = lunchEH * 60 + (lunchEM || 0);

    if (apptStartVal < workStartVal || apptEndVal > workEndVal) {
      return { type: 'outside', message: 'Fora do Horário' };
    }

    if ((apptStartVal < lunchEndVal) && (lunchStartVal < apptEndVal)) {
      return { type: 'lunch', message: 'Conflito com Almoço' };
    }

    return null;
  };

  // Generate dynamic hours based on schedule with 30-minute intervals
  const hours = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      // Fallback range if no schedule is found
      const slots = [];
      for (let h = 8; h <= 20; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
      }
      return slots;
    }

    const activeDays = schedule.filter(day => day.isOpen);
    if (activeDays.length === 0) {
      const slots = [];
      for (let h = 8; h <= 20; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
      }
      return slots;
    }

    // Find the min start hour and max end hour across all active days
    let minHour = 24;
    let maxHour = 0;

    activeDays.forEach(day => {
      const start = parseInt(day.workStart.split(':')[0]);
      const end = parseInt(day.workEnd.split(':')[0]);
      
      if (start < minHour) minHour = start;
      if (end > maxHour) maxHour = end;
    });

    // Ensure at least a small range and valid hours
    if (maxHour <= minHour) maxHour = minHour + 1;
    
    const slots = [];
    for (let h = minHour; h <= maxHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      // Don't add :30 for the very last hour if it's the exact closing limit
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }, [schedule]);

  if (dataLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
        <p className="text-slate-500 mt-4 font-bold">Sincronizando agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-dark/10 text-brand-dark p-3 rounded-2xl shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Agendamentos Hoje</p>
            <p className="text-2xl font-bold text-brand-dark">{stats.todayCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-gold/10 text-brand-gold p-3 rounded-2xl shrink-0">
            <Circle size={24} /> 
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Receita Hoje</p>
            <p className="text-2xl font-bold text-brand-dark">{stats.todayRevenue}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-dark/10 text-brand-dark p-3 rounded-2xl shrink-0">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total na Semana</p>
            <p className="text-2xl font-bold text-brand-dark">{stats.weekCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-gold/10 text-brand-gold p-3 rounded-2xl shrink-0">
            <Plus size={24} /> 
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Previsão Semanal</p>
            <p className="text-2xl font-bold text-brand-dark">{stats.weekRevenue}</p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-brand-dark flex items-center gap-3">
            <CalendarIcon className="text-brand-dark" size={24} />
            Agenda Semanal
          </h3>
          <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
            <button 
              onClick={handlePrevWeek}
              className="p-2 text-slate-400 hover:text-brand-dark hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextWeek}
              className="p-2 text-slate-400 hover:text-brand-dark hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={handleToday}
            className="flex-1 sm:flex-none bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm"
          >
            Hoje
          </button>
          <button 
            onClick={() => setIsBlockModalOpen(true)}
            className="flex-1 sm:flex-none bg-brand-dark text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/10 hover:bg-brand-dark/90"
          >
            <Lock size={14} />
            Criar Bloqueio
          </button>
        </div>
      </div>

      {/* Desktop Calendar Grid */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/50">
            <div className="p-6"></div>
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                 <div key={i} className={`p-6 text-center border-l border-slate-100 ${isToday ? 'bg-brand-gold/5' : ''}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{daysLabels[i]}</span>
                    <p className={`text-2xl font-bold mt-1 ${isToday ? 'text-brand-gold' : 'text-brand-dark'}`}>{date.getDate()}</p>
                 </div>
              )
            })}
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-slate-100">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] group">
                <div className="p-4 text-center text-[11px] font-bold text-slate-400 self-center uppercase tracking-widest bg-slate-50/30">{hour}</div>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = getLocalDateString(date);
                  
                  // Check for blocks
                  const block = blocks.find(b => {
                    if (b.date !== dateStr) return false;
                    // Full day block
                    if (!b.start_time || !b.end_time) return true;
                    // Partial day block
                    const [h, m] = hour.split(':').map(Number);
                    const timeVal = h * 60 + m;
                    
                    const [bsH, bsM] = b.start_time.split(':').map(Number);
                    const startVal = bsH * 60 + bsM;
                    const [beH, beM] = b.end_time.split(':').map(Number);
                    const endVal = beH * 60 + beM;

                    return timeVal >= startVal && timeVal < endVal;
                  });

                  if (block) {
                    return (
                      <div key={dayIndex} className="p-2 border-l border-slate-100 min-h-[100px] bg-slate-50/50 flex items-center justify-center relative group/block">
                         <div className="border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border-dashed bg-white shadow-sm">
                            Bloqueado
                         </div>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="absolute top-1 right-1 p-1 text-red-400 opacity-0 group-hover/block:opacity-100 transition-opacity"
                         >
                            <X size={12} />
                         </button>
                      </div>
                    );
                  }

                  // Check for appointments
                  const slotAppointments = appointments.filter(a => {
                    if (a.date !== dateStr) return false;
                    if (a.status?.toLowerCase() === 'cancelled') return false;
                    const [sh, sm] = hour.split(':').map(Number);
                    const sTime = sh * 60 + sm;
                    // Match if appointment starts within this 30-minute window
                    return a.startTimeValue >= sTime && a.startTimeValue < sTime + 30;
                  });

                  if (slotAppointments.length > 0) {
                    return (
                      <div key={dayIndex} className="p-1 border-l border-slate-100 min-h-[100px] bg-brand-dark/5 relative">
                        {slotAppointments.map((appt, i) => (
                          <div 
                            key={appt.id}
                            onClick={() => setSelectedAppointmentDetail(appt)}
                            className="absolute inset-x-1 bg-brand-dark text-white p-2 rounded-xl shadow-md flex flex-col justify-center border border-brand-dark/10 overflow-hidden cursor-pointer hover:bg-brand-dark/80 transition-colors"
                            style={{ 
                              top: `${i * 4 + 4}px`,
                              height: `${(appt.duration / 30) * 100 - 8}px`,
                              zIndex: 20
                            }}
                          >
                            <p className="font-bold text-[10px] sm:text-xs leading-tight tracking-tight text-brand-gold truncate">{appt.service}</p>
                            <p className="text-[9px] sm:text-[10px] opacity-80 mt-0.5 uppercase font-medium truncate">{appt.client}</p>
                            <p className="text-[8px] opacity-60 mt-0.5 font-mono">{appt.start} ({appt.duration}min)</p>
                            
                            {/* Conflict indicator */}
                            {(() => {
                              const conflict = getConflictType(appt);
                              if (conflict) {
                                return (
                                  <div className="mt-1.5 flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-md border border-white/30 backdrop-blur-sm animate-pulse">
                                    <AlertTriangle size={10} className="text-brand-gold fill-brand-gold/20" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{conflict.message}</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Cancel Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(parseInt(appt.id));
                              }}
                              className="absolute top-1 right-1 p-1 text-white/50 hover:text-white transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Check if it's outside work hours or lunch
                  const isOffHours = isClosed(date, hour);
                  if (isOffHours) {
                    return (
                      <div key={dayIndex} className="p-2 border-l border-slate-100 min-h-[100px] transition-colors relative group/cell flex items-center justify-center opacity-60">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Fechado</span>
                      </div>
                    );
                  }

                  return (
                      <div 
                        key={dayIndex} 
                        className="p-3 border-l border-slate-100 min-h-[100px] hover:bg-slate-50/50 transition-colors cursor-pointer group/cell relative"
                      >
                      <button 
                        onClick={() => handlePlusClick(date, hour)}
                        className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"
                      >
                        <Plus size={20} className="text-slate-300" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointmentDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedAppointmentDetail(null)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-brand-dark px-6 py-5 flex justify-between items-start">
              <div>
                <p className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-1">Agendamento</p>
                <h2 className="text-white text-lg font-bold leading-tight">{selectedAppointmentDetail.service}</h2>
              </div>
              <button 
                onClick={() => setSelectedAppointmentDetail(null)}
                className="text-white/50 hover:text-white transition-colors mt-0.5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  selectedAppointmentDetail.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : selectedAppointmentDetail.status === 'cancelled'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <Circle size={6} fill="currentColor" />
                  {selectedAppointmentDetail.status === 'confirmed' ? 'Confirmado'
                    : selectedAppointmentDetail.status === 'cancelled' ? 'Cancelado'
                    : 'Pendente'}
                </span>
                <span className="text-slate-400 text-xs font-mono">{selectedAppointmentDetail.date}</span>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-brand-dark">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Cliente</p>
                    <p className="text-sm font-bold text-brand-dark">{selectedAppointmentDetail.client}</p>
                  </div>
                </div>

                {selectedAppointmentDetail.whatsapp && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">WhatsApp</p>
                      <a 
                        href={`https://wa.me/55${selectedAppointmentDetail.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-emerald-600 hover:underline"
                      >
                        {selectedAppointmentDetail.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-brand-dark">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Horário</p>
                    <p className="text-sm font-bold text-brand-dark">
                      {selectedAppointmentDetail.start} &mdash; {(() => {
                        const [h, m] = selectedAppointmentDetail.start.split(':').map(Number);
                        const endMin = h * 60 + m + selectedAppointmentDetail.duration;
                        return `${String(Math.floor(endMin / 60)).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
                      })()} <span className="text-slate-400 font-normal">({selectedAppointmentDetail.duration}min)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-brand-gold">
                    <Scissors size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Serviço</p>
                    <p className="text-sm font-bold text-brand-dark">{selectedAppointmentDetail.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Valor</p>
                    <p className="text-sm font-bold text-brand-dark">
                      R$ {selectedAppointmentDetail.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            {selectedAppointmentDetail.status !== 'cancelled' && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    handleCancelAppointment(parseInt(selectedAppointmentDetail.id));
                    setSelectedAppointmentDetail(null);
                  }}
                  className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Cancelar Agendamento
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <Lock size={18} />
                Criar Bloqueio de Horário
              </h2>
              <button 
                onClick={() => setIsBlockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-500">Bloqueie horários específicos para pausas, almoço ou compromissos pessoais.</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="isFullDay"
                    checked={newBlock.isFullDay}
                    onChange={(e) => setNewBlock({...newBlock, isFullDay: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isFullDay" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Bloquear dia inteiro
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                    <CalendarIcon size={14} /> Data
                  </label>
                  <input 
                    type="date" 
                    value={newBlock.date}
                    onChange={(e) => setNewBlock({...newBlock, date: e.target.value})}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all"
                  />
                </div>

                {!newBlock.isFullDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Clock size={14} /> Início
                      </label>
                      <input 
                        type="time" 
                        value={newBlock.start}
                        onChange={(e) => setNewBlock({...newBlock, start: e.target.value})}
                        className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Clock size={14} /> Fim
                      </label>
                      <input 
                        type="time" 
                        value={newBlock.end}
                        onChange={(e) => setNewBlock({...newBlock, end: e.target.value})}
                        className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmBlock}
                  className="flex-1 bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Confirmar Bloqueio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <CalendarIcon size={18} />
                Novo Agendamento
              </h2>
              <button 
                onClick={() => setIsAppointmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Cliente</label>
                  <input 
                    type="text" 
                    placeholder="Nome do cliente"
                    value={newAppt.client}
                    onChange={(e) => setNewAppt({...newAppt, client: e.target.value})}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Serviço</label>
                  <select 
                    value={newAppt.service}
                    onChange={(e) => setNewAppt({...newAppt, service: e.target.value})}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all"
                  >
                    {apiServices.map(service => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({service.duration_minutes} min) - R$ {service.price}
                      </option>
                    ))}
                    {apiServices.length === 0 && <option value="Corte">Corte (Exemplo)</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 text-xs">Data</label>
                    <input 
                      type="date" 
                      value={newAppt.date}
                      onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2 px-3 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 text-xs">Hora</label>
                    <input 
                      type="time" 
                      value={newAppt.start}
                      onChange={(e) => setNewAppt({...newAppt, start: e.target.value})}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2 px-3 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmAppt}
                  className="flex-1 bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
