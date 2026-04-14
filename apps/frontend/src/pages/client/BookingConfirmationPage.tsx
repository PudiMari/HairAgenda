import { useState, useEffect } from "react";

import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { X, CheckCircle, Calendar, Clock, User, Phone, ArrowRight, Lock, Info, AlertCircle } from "lucide-react";
import { createAppointment } from "../../lib/api";
import { useUser, useClerk } from "@clerk/react";

export function BookingConfirmationPage() {
   const { user, isLoaded } = useUser();
   const { redirectToSignIn } = useClerk();
   const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get('u');
  
  const service = location.state?.service || { id: "1", name: "Corte Feminino" };
  const date = location.state?.date || "24 Mai";
  const time = location.state?.time || "10:00";

  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user data
  useEffect(() => {
    if (isLoaded && !user) {
      redirectToSignIn({
        signInFallbackRedirectUrl: window.location.href,
        signUpFallbackRedirectUrl: window.location.href,
      });
      return;
    }

    async function preFillData() {
      if (user) {
        if (!clientName) setClientName(user.fullName || "");
        
        let phone = "";
        
        // 1. Try primary phone number
        if (user.primaryPhoneNumber) {
          phone = user.primaryPhoneNumber.phoneNumber || "";
        }
        
        // 2. Try any phone number
        if (!phone && user.phoneNumbers?.length > 0) {
          phone = user.phoneNumbers[0].phoneNumber || "";
        }

        // 3. Fallback to Professional Profile if available
        if (!phone) {
          try {
            const { fetchProfessionalProfile } = await import("../../lib/api");
            const profile = await fetchProfessionalProfile(user.id);
            if (profile?.whatsapp) {
              phone = profile.whatsapp;
            }
          } catch (e) {
            // No profile or error, silently fail
          }
        }

        if (!clientWhatsapp && phone) {
          setClientWhatsapp(phone);
        }
      }
    }
    preFillData();
  }, [user]);



  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    if (val.length > 10) {
      val = `${val.slice(0, 10)}-${val.slice(10)}`;
    }
    setClientWhatsapp(val);
  };

  const handleConfirm = async () => {
    if (!clientName.trim() || !clientWhatsapp.trim()) {
       setError("Por favor, preencha seu nome e WhatsApp.");
       return;
    }

    const rawPhone = clientWhatsapp.replace(/\D/g, "");
    if (rawPhone.length !== 11) {
      setError("Telefone inválido. Informe o DDD (2 dígitos) e o número (9 dígitos). Ex: (11) 99999-9999");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const currentYear = new Date().getFullYear();
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04', 'Mai': '05', 'Jun': '06',
        'Jul': '07', 'Ago': '08', 'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12'
      };
      
      const [dayToken, monthToken] = date.split(" ");
      const monthNum = monthMap[monthToken] || "01";
      const dayNum = dayToken.padStart(2, '0');
      
      const dateTimeIso = `${currentYear}-${monthNum}-${dayNum}T${time}:00-03:00`;
      
      // We pass the professional ID directly from the service object
      // or from the search param if available
      const professionalId = service.professional || (requestedUserId ? parseInt(requestedUserId, 10) : undefined);

      await createAppointment({
        professional: professionalId,
        client_user_id: user?.id,
        client_name: clientName,
        client_whatsapp: rawPhone,
        service: parseInt(service.id, 10),
        date_time: dateTimeIso,
      });

      alert("Agendamento confirmado com sucesso!");
      navigate(`/profile${requestedUserId ? `?u=${requestedUserId}` : ""}`);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar o agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-[520px] mx-auto w-full pb-20">
      
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-brand-dark">HairAgenda</h2>
        <button 
          onClick={() => navigate(`/profile${requestedUserId ? `?u=${requestedUserId}` : ""}`)}
          className="flex items-center justify-center rounded-full h-10 w-10 transition-colors hover:bg-brand-gold/20 bg-brand-gold/10 text-brand-gold"
        >
          <X size={20} />
        </button>
      </header>

      {/* Success Indicator / Headline */}
      <div className="flex flex-col items-center text-center px-4 mb-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-brand-gold bg-brand-gold/15">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Quase lá!</h1>
        <p className="text-slate-600 text-sm mt-2">Confirme os detalhes do seu agendamento abaixo.</p>
      </div>

      {/* Summary Box: Selected service details */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 rounded-xl p-5 shadow-sm border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-brand-gold text-xs font-bold uppercase tracking-wider">Serviço Selecionado</p>
              <p className="text-brand-dark text-lg font-bold leading-tight">{service.name}</p>
              <p className="text-slate-500 text-sm font-medium">Serviço Selecionado</p>
            </div>
            <div 
              className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 border border-slate-200"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=150&h=150")' }}
            />
          </div>
          
          <div className="h-px bg-slate-200 w-full"></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold uppercase">Data</p>
                <p className="text-brand-dark text-sm font-bold">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold uppercase">Horário</p>
                <p className="text-brand-dark text-sm font-bold">{time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-simple Form */}
      <div className="flex flex-col gap-5">
        
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-sm font-bold px-1" htmlFor="name">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              id="name" 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Como quer ser chamado?"
              className="flex w-full rounded-xl text-brand-dark border-2 border-slate-200 bg-white h-14 pl-12 pr-4 focus:border-brand-gold focus:ring-0 transition-all placeholder:text-slate-400 outline-none" 
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-700 text-sm font-bold px-1" htmlFor="phone">Celular</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              id="phone" 
              type="tel" 
              value={clientWhatsapp}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="flex w-full rounded-xl text-brand-dark border-2 border-slate-200 bg-white h-14 pl-12 pr-4 focus:border-brand-gold focus:ring-0 transition-all placeholder:text-slate-400 outline-none" 
            />
          </div>
          <p className="text-slate-500 text-[11px] px-1 flex items-center gap-1 mt-1 font-bold">
            <Info size={12} />
            Enviaremos o lembrete por SMS ou Celular.
          </p>
        </div>
      </div>

      {/* Final CTA */}
      <div className="mt-10 pb-10">
        <button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] bg-brand-gold text-white shadow-brand-gold/20 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
        
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={14} />
            <span className="text-[11px] font-bold uppercase tracking-tight">Ambiente Seguro & Privado</span>
          </div>
          <p className="text-slate-400 text-[10px] text-center max-w-[300px] font-medium">
            Ao confirmar, você concorda com nossos termos de serviço e política de cancelamento.
          </p>
        </div>
      </div>

    </div>
  );
}
