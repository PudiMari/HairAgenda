import { ArrowLeft, Calendar, Clock, Scissors, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Mock data for bookings - in a real app this would come from an API
const MOCK_BOOKINGS: any[] = [];

export function MyBookingsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Meus Agendamentos</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide border-l-2 border-brand-gold pl-2">HISTÓRICO E PRÓXIMOS EVENTOS</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {MOCK_BOOKINGS.length > 0 ? (
          <div className="space-y-4">
            {MOCK_BOOKINGS.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                      <Scissors size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{booking.serviceName}</h3>
                      <p className="text-sm text-slate-500">{booking.professionalName}</p>
                      
                      <div className="flex flex-col gap-1 mt-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Calendar size={14} className="text-brand-gold" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Clock size={14} className="text-brand-gold" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                    <span className="text-sm font-bold text-brand-dark">R$ {booking.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 border-4 border-white shadow-inner">
              <Calendar size={48} strokeWidth={1} />
            </div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">Sem agendamentos no momento</h2>
            <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-10">
              Você ainda não possui nenhum horário marcado. Que tal garantir seu próximo visual hoje?
            </p>
            
            <Link 
              to="/book/services"
              className="group flex items-center justify-center gap-2 bg-brand-gold text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Agendar Agora</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="p-6 bg-white/50 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Dúvidas sobre seu agendamento? <br/>
          <button className="text-brand-gold hover:underline mt-1">Entre em contato pelo WhatsApp</button>
        </p>
      </div>
    </div>
  );
}
