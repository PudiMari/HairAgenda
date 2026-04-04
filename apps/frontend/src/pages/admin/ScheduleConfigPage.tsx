import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  Clock, 
  Utensils, 
  Info, 
  Loader2, 
  Calendar as CalendarIcon, 
  Trash2, 
  Plus 
} from "lucide-react";
import { useUser } from "@clerk/react";
import { 
  fetchProfessionalProfile, 
  fetchOpeningHours, 
  updateOpeningHour, 
  createOpeningHour,
  fetchProfessionalBlocks,
  createProfessionalBlock,
  deleteProfessionalBlock,
  ProfessionalProfile,
  ProfessionalBlock,
  OpeningHour
} from "../../lib/api";

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

interface ScheduleDay {
  dbId?: number;
  id: string;
  dayName: string;
  dayOfWeek: number;
  isOpen: boolean;
  workStart: string;
  workEnd: string;
  lunchStart: string;
  lunchEnd: string;
}

const DEFAULT_SCHEDULE: Omit<ScheduleDay, 'dbId'>[] = [
  { id: "monday", dayName: "Segunda-feira", dayOfWeek: 0, isOpen: true, workStart: "08:00", workEnd: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { id: "tuesday", dayName: "Terça-feira", dayOfWeek: 1, isOpen: true, workStart: "08:00", workEnd: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { id: "wednesday", dayName: "Quarta-feira", dayOfWeek: 2, isOpen: true, workStart: "08:00", workEnd: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { id: "thursday", dayName: "Quinta-feira", dayOfWeek: 3, isOpen: true, workStart: "08:00", workEnd: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { id: "friday", dayName: "Sexta-feira", dayOfWeek: 4, isOpen: true, workStart: "08:00", workEnd: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { id: "saturday", dayName: "Sábado", dayOfWeek: 5, isOpen: true, workStart: "09:00", workEnd: "14:00", lunchStart: "12:00", lunchEnd: "12:30" },
  { id: "sunday", dayName: "Domingo", dayOfWeek: 6, isOpen: false, workStart: "00:00", workEnd: "00:00", lunchStart: "00:00", lunchEnd: "00:00" },
];

export function ScheduleConfigPage() {
  const { user } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE as ScheduleDay[]);
  const [blocks, setBlocks] = useState<ProfessionalBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'blocks'>('schedule');
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const profProfile = await fetchProfessionalProfile(user.id);
        if (profProfile) {
          setProfile(profProfile);
          const [hoursData, blocksData] = await Promise.all([
            fetchOpeningHours(profProfile.id),
            fetchProfessionalBlocks(profProfile.id)
          ]);
          
          setBlocks(blocksData);
          
          if (hoursData.length > 0) {
            const mapped = DEFAULT_SCHEDULE.map(day => {
              const apiDay = hoursData.find((oh: OpeningHour) => oh.day_of_week === day.dayOfWeek);
              if (apiDay) {
                return {
                  ...day as any,
                  dbId: apiDay.id,
                  isOpen: apiDay.is_open,
                  workStart: apiDay.work_start.substring(0, 5),
                  workEnd: apiDay.work_end.substring(0, 5),
                  lunchStart: apiDay.lunch_start.substring(0, 5),
                  lunchEnd: apiDay.lunch_end.substring(0, 5),
                };
              }
              return day;
            });
            setSchedule(mapped as ScheduleDay[]);
          } else {
            setSchedule(DEFAULT_SCHEDULE as ScheduleDay[]);
          }
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

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

  const handleRemoveBlock = async (id: number) => {
    try {
      await deleteProfessionalBlock(id);
      setBlocks(blocks.filter(b => b.id !== id));
    } catch (error) {
      console.error("Erro ao remover bloqueio:", error);
      alert("Erro ao remover bloqueio.");
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !blockDate) return;

    try {
      const newBlock = await createProfessionalBlock({
        professional: profile.id,
        date: blockDate,
        reason: blockReason
      });
      setBlocks([...blocks, newBlock]);
      setBlockDate("");
      setBlockReason("");
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);
      alert("Este dia já está bloqueado ou ocorreu um erro.");
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const promises = schedule.map(day => {
        const data = {
          professional: profile.id,
          day_of_week: day.dayOfWeek,
          is_open: day.isOpen,
          work_start: day.workStart + ":00",
          work_end: day.workEnd + ":00",
          lunch_start: day.lunchStart + ":00",
          lunch_end: day.lunchEnd + ":00",
        };

        if (day.dbId) {
          return updateOpeningHour(day.dbId, data);
        } else {
          return createOpeningHour(data);
        }
      });

      const results = await Promise.all(promises);
      
      setSchedule(schedule.map((day, index) => ({
        ...day,
        dbId: results[index].id
      })));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Erro ao salvar horários.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro Section */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Configurações de Agenda</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Gerencie seus horários de atendimento padrão e bloqueie datas específicas.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'schedule' 
                ? "bg-white text-brand-dark shadow-sm" 
                : "text-slate-500 hover:text-brand-dark"
            }`}
          >
            Horário Semanal
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'blocks' 
                ? "bg-white text-brand-dark shadow-sm" 
                : "text-slate-500 hover:text-brand-dark"
            }`}
          >
            Datas Bloqueadas
          </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="space-y-8">
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

          <div className="sticky bottom-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-bold text-base shadow-xl transition-all active:scale-95 ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isSaved 
                  ? "bg-green-500 text-white shadow-green-200" 
                  : "bg-brand-gold text-white shadow-brand-gold/30 hover:opacity-90 -translate-y-1"
              }`}
            >
              {isSaving ? "Salvando..." : isSaved ? "Ajustes Salvos!" : "Salvar Configurações"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* New Block Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2 mb-4">
              <Plus className="text-brand-gold" size={20} /> Bloquear Nova Data
            </h3>
            <form onSubmit={handleCreateBlock} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Data</label>
                <input 
                  type="date" 
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm font-medium focus:border-brand-gold focus:ring-0 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Motivo (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Feriado, Férias"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm font-medium focus:border-brand-gold focus:ring-0 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-brand-dark text-white rounded-xl py-2.5 px-6 font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Bloquear Dia
              </button>
            </form>
          </div>

          {/* Blocked Dates List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-brand-dark">Datas BloqueadasAtualmente</h3>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full uppercase">
                {blocks.length} {blocks.length === 1 ? 'Dia' : 'Dias'}
              </span>
            </div>
            
            {blocks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-slate-100 p-4 rounded-full">
                    <CalendarIcon className="text-slate-300" size={32} />
                  </div>
                </div>
                <h4 className="text-slate-400 font-bold">Nenhuma data bloqueada</h4>
                <p className="text-slate-400 text-sm mt-1">Use o formulário acima para bloquear dias específicos.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {blocks.map((block) => (
                  <div key={block.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <span className="text-brand-dark font-bold">
                          {new Date(block.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        {block.reason && (
                          <span className="ml-3 text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {block.reason}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveBlock(block.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2"
                      title="Remover bloqueio"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info helper */}
      <div className="flex items-center gap-3 text-slate-500 text-sm bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
        <Info size={18} className="text-brand-gold flex-shrink-0" />
        <span className="font-medium">
          Dica: Datas bloqueadas impedem que qualquer cliente reserve horários naquele dia específico, independente da sua escala semanal.
        </span>
      </div>
    </div>
  );
}
