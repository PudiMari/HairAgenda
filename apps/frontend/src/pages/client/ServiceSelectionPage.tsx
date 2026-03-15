import { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchServices, fetchAppointments, Service } from "../../lib/api";

export function ServiceSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = location.state?.preSelectedService;

  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for selections
  const [selectedService, setSelectedService] = useState<{id: string, name: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dateStartIndex, setDateStartIndex] = useState(0);
  const datesToShow = 5;

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, appointmentsData] = await Promise.all([
          fetchServices(),
          fetchAppointments()
        ]);
        setServices(servicesData);
        setAppointments(appointmentsData);
        
        if (preSelected) {
           setSelectedService(preSelected);
        } else if (servicesData.length > 0) {
           setSelectedService({ id: servicesData[0].id.toString(), name: servicesData[0].name });
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [preSelected]);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dayOfWeekNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    // Gera 30 dias para navegação
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const fullDateStr = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      result.push({
        id: i.toString(),
        dayOfWeek: i === 0 ? "Hoje" : dayOfWeekNames[d.getDay()],
        day: d.getDate().toString(),
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        fullDate: fullDateStr,
        disabled: d.getDay() === 0 // Exemplo: Domingo fechado
      });
    }
    return result;
  }, []);

  const visibleDates = dates.slice(dateStartIndex, dateStartIndex + datesToShow);

  const handleNextDates = () => {
    if (dateStartIndex + datesToShow < dates.length) {
      setDateStartIndex(prev => prev + 1);
    }
  };

  const handlePrevDates = () => {
    if (dateStartIndex > 0) {
      setDateStartIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
       const firstAvailable = dates.find(d => !d.disabled);
       if (firstAvailable) setSelectedDate(firstAvailable.fullDate);
    }
  }, [dates, selectedDate]);

  const timeSlots = ["09:00", "10:00", "11:30", "13:00", "14:30", "15:00", "16:30", "18:00"];

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    const dateObj = dates.find(d => d.fullDate === selectedDate);
    if (!dateObj) return false;
    
    const [hours, minutes] = time.split(":").map(n => parseInt(n, 10));
    
    return !appointments.some(app => {
      const appDate = new Date(app.date_time);
      
      // Use Intl.DateTimeFormat to get components in Sao Paulo time
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(appDate);
      const appYear = parseInt(parts.find(p => p.type === 'year')!.value, 10);
      const appMonth = parseInt(parts.find(p => p.type === 'month')!.value, 10) - 1; // 0-indexed
      const appDay = parseInt(parts.find(p => p.type === 'day')!.value, 10);
      const appHour = parseInt(parts.find(p => p.type === 'hour')!.value, 10);
      const appMinute = parseInt(parts.find(p => p.type === 'minute')!.value, 10);
      
      const dateMatch = appYear === dateObj.year &&
                        appMonth === monthNames.indexOf(dateObj.month) &&
                        appDay === parseInt(dateObj.day, 10);
                        
      const timeMatch = appHour === hours && appMinute === minutes;
      
      return dateMatch && timeMatch;
    });
  };

  const handleNext = () => {
    navigate("/book/confirm", { 
      state: { 
        service: selectedService, 
        date: selectedDate, 
        time: selectedTime 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
        <p className="text-slate-500 mt-4 font-bold">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-20 px-4">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-brand-dark">Agendamento</h2>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Passo 1 de 2</span>
      </div>

      {/* Section A: Service Selection */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-brand-dark">O Quê (Serviço)</h3>
          <span className="text-brand-gold text-sm font-bold">Obrigatório</span>
        </div>
        
        <div className="grid gap-3">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id.toString();
            return (
              <button
                key={service.id}
                onClick={() => setSelectedService({ id: service.id.toString(), name: service.name })}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? "border-brand-gold bg-brand-gold/5" 
                    : "border-slate-200 bg-white hover:border-brand-gold/50"
                }`}
              >
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-bold text-brand-dark">{service.name}</p>
                  <p className={`text-sm font-bold uppercase tracking-tighter ${isSelected ? "text-brand-gold" : "text-slate-500"}`}>
                    R$ {service.price} • {service.duration_minutes} min
                  </p>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="text-brand-gold" size={24} />
                ) : (
                  <Circle className="text-slate-300" size={24} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-slate-200 my-8" />

      {/* Section B: Date and Time */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-brand-dark">Quando (Data e Hora)</h3>
        </div>

        {/* Horizontal Datepicker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-500">Próximos dias</p>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevDates}
                disabled={dateStartIndex === 0}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-20 transition-all border border-slate-200"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextDates}
                disabled={dateStartIndex + datesToShow >= dates.length}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-20 transition-all border border-slate-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            {visibleDates.map((date) => {
              const isSelected = selectedDate === date.fullDate;
              
              if (date.disabled) {
                return (
                  <div key={date.id} className="flex-1 flex flex-col items-center justify-center h-20 rounded-xl bg-slate-50 border border-slate-100 opacity-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{date.dayOfWeek}</span>
                    <span className="text-xl font-bold text-slate-400">{date.day}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{date.month}</span>
                  </div>
                );
              }

              return (
                <button
                  key={date.id}
                  onClick={() => {
                    setSelectedDate(date.fullDate);
                    setSelectedTime(null);
                  }}
                  className={`flex-1 flex flex-col items-center justify-center h-20 rounded-xl transition-all ${
                    isSelected 
                      ? "bg-brand-dark text-brand-gold shadow-lg shadow-brand-dark/20" 
                      : "bg-white border text-brand-dark border-slate-200 hover:border-brand-gold/50 hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? "opacity-80" : "text-slate-500"}`}>{date.dayOfWeek}</span>
                  <span className="text-xl font-bold">{date.day}</span>
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? "opacity-80" : "text-slate-500"}`}>{date.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grid */}
        <div>
          <p className="text-sm font-bold mb-3 text-slate-500">Horários disponíveis</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map((time, idx) => {
              const isSelected = selectedTime === time;
              const available = isTimeSlotAvailable(time);
              
              if (!available) {
                return (
                  <button key={idx} disabled className="py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 font-bold text-sm opacity-50 cursor-not-allowed">
                    {time}
                  </button>
                );
              }

              return (
                <button 
                  key={idx}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-lg border font-bold text-sm transition-all ${
                    isSelected 
                      ? "border-brand-gold bg-brand-gold text-white" 
                      : "border-slate-200 bg-white text-brand-dark hover:border-brand-gold/50 hover:bg-brand-gold/5"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 mt-8">
        <Link 
          to="/profile"
          className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <button 
          onClick={handleNext}
          disabled={!selectedService || !selectedDate || !selectedTime}
          className="flex-[2_2_0px] flex items-center justify-center gap-2 h-14 rounded-xl bg-brand-gold text-white font-bold shadow-lg shadow-brand-gold/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Avançar
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
