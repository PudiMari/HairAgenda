import { useState } from "react";
import { CalendarDays, Clock, Utensils, Info } from "lucide-react";

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

interface ScheduleDay {
  id: string;
  dayName: string;
  isOpen: boolean;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

export function ScheduleConfigPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(() => {
    const saved = localStorage.getItem("hairagenda_schedule");
    return saved ? JSON.parse(saved) : [
      {
        id: "monday",
        dayName: "Segunda-feira",
        isOpen: true,
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      },
      {
        id: "tuesday",
        dayName: "Terça-feira",
        isOpen: true,
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      },
      {
        id: "wednesday",
        dayName: "Quarta-feira",
        isOpen: true,
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      },
      {
        id: "thursday",
        dayName: "Quinta-feira",
        isOpen: true,
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      },
      {
        id: "friday",
        dayName: "Sexta-feira",
        isOpen: true,
        workStart: "08:00",
        workEnd: "18:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
      },
      {
        id: "saturday",
        dayName: "Sábado",
        isOpen: true,
        workStart: "09:00",
        workEnd: "14:00",
        lunchStart: "12:00",
        lunchEnd: "12:30",
      },
      {
        id: "sunday",
        dayName: "Domingo",
        isOpen: false,
        workStart: "00:00",
        workEnd: "00:00",
        lunchStart: "00:00",
        lunchEnd: "00:00",
      },
    ];
  });

  const toggleDay = (id: string) => {
    setSchedule(schedule.map(day => 
      day.id === id ? { ...day, isOpen: !day.isOpen } : day
    ));
  };

  const handleTimeChange = (id: string, field: string, value: string) => {
    setSchedule(schedule.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = () => {
    localStorage.setItem("hairagenda_schedule", JSON.stringify(schedule));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro Section */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Horários de Atendimento</h1>
            <p className="text-slate-500 mt-1 font-medium max-w-2xl">
              Defina os períodos em que você estará disponível para agendamentos e seus intervalos de descanso obrigatórios.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className={`hidden sm:flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
              isSaved 
                ? "bg-green-500 text-white shadow-green-200" 
                : "bg-brand-gold text-white shadow-brand-gold/20 hover:opacity-90"
            }`}
          >
            {isSaved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="grid gap-6">
        {schedule.map((day) => (
          <div 
            key={day.id} 
            className={`rounded-xl border p-5 transition-all ${
              day.isOpen 
                ? "bg-white border-slate-200 shadow-sm hover:border-brand-gold/50" 
                : "bg-slate-50 border-dashed border-slate-300 opacity-60"
            }`}
          >
            <div className={`flex items-center justify-between ${day.isOpen ? 'mb-6' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  day.isOpen ? "bg-brand-gold/10 text-brand-gold" : "bg-slate-200 text-slate-500"
                }`}>
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-dark">{day.dayName}</h3>
                  <p className={`text-sm font-medium ${day.isOpen ? "text-green-600" : "text-slate-500"}`}>
                    {day.isOpen ? "Aberto para agendamentos" : "Fechado para agendamentos"}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button 
                onClick={() => toggleDay(day.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 ${
                  day.isOpen ? 'bg-brand-gold' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle {day.dayName}</span>
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    day.isOpen ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>

            {day.isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Expediente */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Clock size={16} /> Expediente
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-brand-dark focus:border-brand-gold focus:ring-0 outline-none appearance-none"
                        value={day.workStart}
                        onChange={(e) => handleTimeChange(day.id, 'workStart', e.target.value)}
                      >
                        {ALL_HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Início</span>
                    </div>
                    <span className="text-slate-400 text-sm font-medium">às</span>
                    <div className="relative flex-1">
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-brand-dark focus:border-brand-gold focus:ring-0 outline-none appearance-none"
                        value={day.workEnd}
                        onChange={(e) => handleTimeChange(day.id, 'workEnd', e.target.value)}
                      >
                        {ALL_HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                        <option value="00:00">00:00</option>
                      </select>
                      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Fim</span>
                    </div>
                  </div>
                </div>

                {/* Almoço */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Utensils size={16} /> Intervalo de Almoço
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-brand-dark focus:border-brand-gold focus:ring-0 outline-none appearance-none"
                        value={day.lunchStart}
                        onChange={(e) => handleTimeChange(day.id, 'lunchStart', e.target.value)}
                      >
                        {HALF_HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Início</span>
                    </div>
                    <span className="text-slate-400 text-sm font-medium">às</span>
                    <div className="relative flex-1">
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-brand-dark focus:border-brand-gold focus:ring-0 outline-none appearance-none"
                        value={day.lunchEnd}
                        onChange={(e) => handleTimeChange(day.id, 'lunchEnd', e.target.value)}
                      >
                        {HALF_HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-slate-400">Fim</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Settings / Actions */}
      <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-500 text-sm bg-slate-50 py-2 px-4 rounded-lg w-full md:w-auto">
          <Info size={18} className="text-brand-gold" />
          <span className="font-medium">As alterações afetarão a disponibilidade a partir de amanhã.</span>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            Descartar
          </button>
          <button 
            onClick={handleSave}
            className={`flex-1 md:flex-initial px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
              isSaved 
                ? "bg-green-500 text-white shadow-green-200" 
                : "bg-brand-gold text-white shadow-brand-gold/20 hover:opacity-90"
            }`}
          >
            {isSaved ? "Ajustes Salvos!" : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
