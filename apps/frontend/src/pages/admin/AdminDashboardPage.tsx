import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Lock,
  Plus
} from "lucide-react";

interface ScheduleDay {
  id: string;
  dayName: string;
  isOpen: boolean;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
}

export function AdminDashboardPage() {

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // States for Modals
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // Data State (with persistence)
  const [blocks, setBlocks] = useState<{id: string, date: string, start: string, end: string}[]>(() => {
    const saved = localStorage.getItem('admin_blocks');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date().toISOString().split('T')[0], start: '08:00', end: '09:00' } // Example
    ];
  });

  const [appointments, setAppointments] = useState<{id: string, date: string, start: string, service: string, client: string}[]>(() => {
    const saved = localStorage.getItem('admin_appointments');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date().toISOString().split('T')[0], start: '10:00', service: 'Corte + Barba', client: 'Carlos M.' }
    ];
  });

  const [schedule] = useState<ScheduleDay[]>(() => {
    const saved = localStorage.getItem("hairagenda_schedule");
    return saved ? JSON.parse(saved) : [];
  });

  const [services] = useState<Service[]>(() => {
    const saved = localStorage.getItem("hairagenda_services");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Corte Feminino", price: "R$ 120,00", duration: "45 min" },
      { id: 2, name: "Coloração", price: "R$ 200,00", duration: "90 min" },
      { id: 3, name: "Escova", price: "R$ 80,00", duration: "30 min" },
    ];
  });

  // Modal temporary data
  const [newBlock, setNewBlock] = useState({ date: new Date().toISOString().split('T')[0], start: '08:00', end: '09:00' });
  const [newAppt, setNewAppt] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    start: '08:00', 
    service: services.length > 0 ? services[0].name : 'Corte', 
    client: '' 
  });

  // Persistence
  useMemo(() => {
    localStorage.setItem('admin_blocks', JSON.stringify(blocks));
  }, [blocks]);

  useMemo(() => {
    localStorage.setItem('admin_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Helper to get day of week and date for the current week starting from Monday
  const weekDates = useMemo(() => {
    const dates = [];
    const curr = new Date(selectedDate);
    curr.setHours(0, 0, 0, 0);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(curr.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startOfWeek);
      nextDate.setDate(startOfWeek.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  }, [selectedDate]);

  const daysLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleConfirmBlock = () => {
    setBlocks([...blocks, { ...newBlock, id: Date.now().toString() }]);
    setIsBlockModalOpen(false);
  };

  const handleConfirmAppt = () => {
    setAppointments([...appointments, { ...newAppt, id: Date.now().toString() }]);
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

  // Generate dynamic hours based on schedule
  const hours = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      // Fallback range if no schedule is found
      return Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    }

    const activeDays = schedule.filter(day => day.isOpen);
    if (activeDays.length === 0) {
      return Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
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
    
    const length = maxHour - minHour + 1;
    return Array.from({ length }, (_, i) => `${String(i + minHour).padStart(2, '0')}:00`);
  }, [schedule]);

  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-dark/10 text-brand-dark p-4 rounded-2xl">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Agendamentos Hoje</p>
            <p className="text-3xl font-bold text-brand-dark">8</p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:scale-[1.02]">
          <div className="bg-brand-gold/10 text-brand-gold p-4 rounded-2xl">
            <Circle size={32} /> 
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Previsão R$ Hoje</p>
            <p className="text-3xl font-bold text-brand-dark">R$ 1.200</p>
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
                <div className="p-6 text-center text-[11px] font-bold text-slate-400 self-center uppercase tracking-widest bg-slate-50/30">{hour}</div>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  
                  // Check for blocks
                  const block = blocks.find(b => b.date === dateStr && b.start <= hour && b.end > hour);
                  if (block) {
                    return (
                      <div key={dayIndex} className="p-2 border-l border-slate-100 min-h-[120px] bg-slate-50/50 flex items-center justify-center">
                         <div className="border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border-dashed bg-white shadow-sm">
                            Bloqueado
                         </div>
                      </div>
                    );
                  }

                  // Check for appointments
                  const appt = appointments.find(a => a.date === dateStr && a.start === hour);
                  if (appt) {
                    return (
                      <div key={dayIndex} className="p-3 border-l border-slate-100 min-h-[120px] bg-brand-dark/5">
                        <div className="bg-brand-dark text-white p-4 rounded-2xl shadow-md h-full flex flex-col justify-center border border-brand-dark/10">
                          <p className="font-bold text-sm tracking-tight text-brand-gold">{appt.service}</p>
                          <p className="text-[11px] opacity-80 mt-1 uppercase font-medium">{appt.client}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={dayIndex} 
                      className="p-3 border-l border-slate-100 min-h-[120px] hover:bg-slate-50/50 transition-colors cursor-pointer group/cell relative"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                      <Clock size={14} /> Início
                    </label>
                    <input 
                      type="time" 
                      value={newBlock.start}
                      onChange={(e) => setNewBlock({...newBlock, start: e.target.value})}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all"
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
                      className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
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
                    {services.map(service => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({service.duration}) - {service.price}
                      </option>
                    ))}
                    {services.length === 0 && <option value="Corte">Corte (Exemplo)</option>}
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
