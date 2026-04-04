import { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/react";
import { 
  fetchServices, 
  fetchAppointments,
  fetchProfessionalProfile, 
  fetchOpeningHours,
  fetchProfessionalBlocks,
  Service,
  OpeningHour,
  ProfessionalProfile,
  ProfessionalBlock
} from "../../lib/api";

export function ServiceSelectionPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get('u');
  const preSelected = location.state?.preSelectedService;

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [blocks, setBlocks] = useState<ProfessionalBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // State for selections
  const [selectedService, setSelectedService] = useState<{id: string, name: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dateStartIndex, setDateStartIndex] = useState(0);
  const datesToShow = 5;

  useEffect(() => {
    async function loadData() {
      if (!isLoaded && requestedUserId === null) return;
      setLoading(true);
      try {
        const userIdToFetch = requestedUserId || user?.id;
        if (!userIdToFetch) {
          setLoading(false);
          return;
        }

        const profileData = await fetchProfessionalProfile(userIdToFetch);
        if (profileData) {
          setProfile(profileData);
          
          // Register visit if viewing someone else
          if (requestedUserId && requestedUserId !== user?.id) {
             const { registerProfessionalVisit } = await import("../../lib/recentPros");
             registerProfessionalVisit(user?.id, profileData);
          }

          const [servicesData, hoursData, appointmentsData, blocksData] = await Promise.all([
            fetchServices(profileData.id),
            fetchOpeningHours(profileData.id),
            fetchAppointments({ professionalId: profileData.id }),
            fetchProfessionalBlocks(profileData.id)
          ]);
          
          setServices(servicesData);
          setOpeningHours(hoursData);
          setAppointments(appointmentsData);
          setBlocks(blocksData);

          const serviceIdParam = searchParams.get('service');
          if (preSelected) {
             setSelectedService(preSelected);
          } else if (serviceIdParam) {
             const s = servicesData.find((svc: Service) => svc.id.toString() === serviceIdParam);
             if (s) setSelectedService({ id: s.id.toString(), name: s.name });
             else if (servicesData.length > 0) {
               setSelectedService({ id: servicesData[0].id.toString(), name: servicesData[0].name });
             }
          } else if (servicesData.length > 0) {
             setSelectedService({ id: servicesData[0].id.toString(), name: servicesData[0].name });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [preSelected, requestedUserId, user, isLoaded, searchParams]);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dayOfWeekNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    // Gera 45 dias para navegação
    for (let i = 0; i < 45; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const fullDateStr = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      
      const jsDay = d.getDay();
      const apiDay = jsDay === 0 ? 6 : jsDay - 1;
      const dayConfig = openingHours.find(oh => oh.day_of_week === apiDay);
      
      // Se não houver configuração, assume fechado por segurança
      // Ou se estiver configurado como fechado explicitamente
      let isDisabled = true;
      if (dayConfig) {
        isDisabled = !dayConfig.is_open;
      } else if (openingHours.length === 0) {
        // Fallback: se não há registros de horário, assume padrão aberto seg-sáb
        isDisabled = apiDay === 6; // Domingo fechado por padrão
      }

      // Check if date is blocked by ProfessionalBlock
      const dateStr = d.toISOString().split('T')[0];
      const isDateBlocked = blocks.some((b: ProfessionalBlock) => b.date === dateStr);

      result.push({
        id: i.toString(),
        dayOfWeek: i === 0 ? "Hoje" : dayOfWeekNames[d.getDay()],
        day: d.getDate().toString(),
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        dateObj: new Date(d),
        fullDate: fullDateStr,
        disabled: isDisabled || isDateBlocked
      });
    }
    return result;
  }, [openingHours, blocks]);

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

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    const dateObjRec = dates.find(d => d.fullDate === selectedDate);
    if (!dateObjRec) return false;
    
    const jsDay = dateObjRec.dateObj.getDay();
    const apiDay = jsDay === 0 ? 6 : jsDay - 1;
    const dayConfig = openingHours.find(oh => oh.day_of_week === apiDay);
    
    if (!dayConfig || !dayConfig.is_open) return false;

    // Check if time is within work hours and NOT in lunch break
    const [h, m] = time.split(":").map(Number);
    const timeVal = h * 60 + m;

    const [wsH, wsM] = dayConfig.work_start.split(":").map(Number);
    const workStartVal = wsH * 60 + wsM;

    const [weH, weM] = dayConfig.work_end.split(":").map(Number);
    const workEndVal = weH * 60 + weM;

    const [lsH, lsM] = dayConfig.lunch_start.split(":").map(Number);
    const lunchStartVal = lsH * 60 + lsM;

    const [leH, leM] = dayConfig.lunch_end.split(":").map(Number);
    const lunchEndVal = leH * 60 + leM;

    // Must be within work hours
    if (timeVal < workStartVal || timeVal >= workEndVal) return false;

    // Must NOT be within lunch break
    if (timeVal >= lunchStartVal && timeVal < lunchEndVal) return false;

    // Check existing appointments
    const [hours, minutes] = time.split(":").map(n => parseInt(n, 10));
    
    return !appointments.some(app => {
      const appDate = new Date(app.date_time);
      
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
      
      const dateMatch = appYear === dateObjRec.year &&
                        appMonth === monthNames.indexOf(dateObjRec.month) &&
                        appDay === parseInt(dateObjRec.day, 10);
                        
      const timeMatch = appHour === hours && appMinute === minutes;
      
      return dateMatch && timeMatch;
    });
  };

  const handleNext = () => {
    navigate(`/book/confirm${requestedUserId ? `?u=${requestedUserId}` : ""}`, { 
      state: { 
        service: selectedService, 
        date: selectedDate, 
        time: selectedTime 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full pb-20 px-4 animate-pulse pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-20 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-20 w-full bg-slate-100 rounded-xl border-2 border-slate-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-32 px-4 relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Agendamento</h2>
          {profile && (
            <p className="text-sm font-medium text-slate-500">
              Profissional: <span className="text-brand-gold font-bold">{profile.name}</span>
            </p>
          )}
        </div>
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
                <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
                  <p className="font-bold text-brand-dark truncate">{service.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${isSelected ? "text-brand-gold" : "text-slate-500"}`}>
                    R$ {service.price} • {service.duration_minutes} min
                  </p>
                  {service.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                      {service.description}
                    </p>
                  )}
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 sm:p-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4 sm:mt-8">
          <Link 
            to={`/profile${requestedUserId ? `?u=${requestedUserId}` : ""}`}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all bg-white"
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
    </div>
  );
}
