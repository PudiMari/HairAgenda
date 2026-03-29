import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { Scissors, User, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

export function RoleSelectionPage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectRole = async (role: 'admin' | 'client') => {
    if (!user) return;
    setLoading(role);
    try {
      // Update unsafeMetadata so the user can be identified as admin or client
      await user.update({
        unsafeMetadata: {
          role: role
        }
      });

      if (role === 'admin') {
        navigate('/admin/setup');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error("Error setting role:", err);
      setLoading(null);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-full border border-brand-gold/20 mb-6">
            <Sparkles size={16} className="text-brand-gold" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-gold">Personalize sua experiência</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase mb-4 leading-none">
            Como você deseja usar o <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-white">HairAgenda</span>?
          </h1>
          <p className="text-brand-muted text-lg max-w-xl mx-auto">
            Escolha uma das opções abaixo para configurarmos seu acesso ideal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <button 
            onClick={() => handleSelectRole('client')}
            disabled={!!loading}
            className="group relative flex flex-col items-start p-10 bg-white/5 border border-white/10 rounded-[2.5rem] text-left hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
              <User size={120} strokeWidth={1} />
            </div>
            
            <div className="bg-white/10 p-5 rounded-3xl mb-8 group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-500">
              <User size={32} />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase mb-3">Sou Cliente</h2>
            <p className="text-brand-muted mb-8 leading-relaxed">
              Quero descobrir os melhores profissionais, agendar serviços com facilidade e gerenciar meus horários.
            </p>
            
            <div className="flex items-center gap-2 text-brand-gold font-bold uppercase tracking-widest text-xs mt-auto">
              <span>Continuar como cliente</span>
              {loading === 'client' ? (
                <div className="h-4 w-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin ml-2"></div>
              ) : (
                <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
              )}
            </div>
          </button>

          {/* Professional Card */}
          <button 
            onClick={() => handleSelectRole('admin')}
            disabled={!!loading}
            className="group relative flex flex-col items-start p-10 bg-brand-gold/5 border border-brand-gold/20 rounded-[2.5rem] text-left hover:bg-brand-gold/10 hover:border-brand-gold/30 hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity text-brand-gold">
              <Scissors size={120} strokeWidth={1} />
            </div>

            <div className="bg-brand-gold/20 p-5 rounded-3xl mb-8 group-hover:bg-brand-gold group-hover:text-brand-dark transition-all duration-500 text-brand-gold">
              <Scissors size={32} />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase mb-3">Sou Profissional</h2>
            <p className="text-brand-muted mb-8 leading-relaxed">
              Quero gerenciar meu salão, configurar meus serviços, horários e atrair mais clientes para o meu negócio.
            </p>
            
            <div className="flex items-center gap-2 text-brand-gold font-bold uppercase tracking-widest text-xs mt-auto">
              <span>Configurar meu salão</span>
              {loading === 'admin' ? (
                <div className="h-4 w-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin ml-2"></div>
              ) : (
                <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
              )}
            </div>
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-brand-muted/40 uppercase tracking-[0.3em] text-[10px] font-bold">
          <p>HairAgenda &bull; Professional Edition</p>
        </div>
      </div>
    </div>
  );
}
