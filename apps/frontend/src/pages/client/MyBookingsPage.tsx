import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Scissors, ChevronRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { fetchAppointments } from "../../lib/api";

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await fetchAppointments({ clientId: user.id });
        setBookings(data);
      } catch (err) {
        setError("Não foi possível carregar seus agendamentos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [user, isLoaded]);

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
        {loading ? (
          <div className="space-y-4 animate-pulse pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3 w-24 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
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
                      <h3 className="font-bold text-slate-900">{booking.service_name || `Serviço #${booking.service}`}</h3>
                      <p className="text-sm text-slate-500">{booking.professional_name || "HairAgenda Profissional"}</p>

                      
                      <div className="flex flex-col gap-1 mt-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Calendar size={14} className="text-brand-gold" />
                          <span>{new Date(booking.date_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Clock size={14} className="text-brand-gold" />
                          <span>{new Date(booking.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status === 'PENDING' ? 'Pendente' : 'Confirmado'}
                    </span>
                    <span className="text-sm font-bold text-brand-dark">R$ {booking.service_price || '0,00'}</span>
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
            
            {(() => {
              const recentKey = `recent_pros_${user?.id || 'guest'}`;
              const recentPros = JSON.parse(localStorage.getItem(recentKey) || '[]');
              const lastVisitedUserId = recentPros.length > 0 ? recentPros[0].id : null;

              if (lastVisitedUserId) {
                return (
                  <Link 
                    to={`/book/services?u=${lastVisitedUserId}`}
                    className="group flex items-center justify-center gap-2 bg-brand-gold text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span>Agendar Agora</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              }
              
              return (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium leading-relaxed max-w-sm">
                  Para realizar seu primeiro agendamento, <br />
                  <strong className="text-amber-900 font-bold block mt-1">acesse o link do seu profissional!</strong>
                </div>
              );
            })()}
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
