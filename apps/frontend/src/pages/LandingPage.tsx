import { useNavigate } from "react-router-dom";
import { Scissors, LogIn, Calendar, Sparkles, User } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { useEffect } from "react";

export function LandingPage() {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user, isLoaded } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user is an admin
      const adminEmails = [
        ...(import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [])
      ];
      const adminRestrictionEnabled = import.meta.env.VITE_ENABLE_ADMIN_RESTRICTION !== 'false';
      const isAdmin = (
        !adminRestrictionEnabled ||
        user?.publicMetadata?.role === 'admin' ||
        user?.unsafeMetadata?.role === 'admin' ||
        (user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress))
      );

      const hasRole = 
        user?.publicMetadata?.role === 'admin' || 
        user?.publicMetadata?.role === 'client' ||
        user?.unsafeMetadata?.role === 'admin' || 
        user?.unsafeMetadata?.role === 'client';

      if (!hasRole) {
        navigate('/role-selection');
      } else if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
  }, [isLoaded, user, navigate]);

  const handleLogin = () => {
    if (user) {
      navigate('/profile');
      return;
    }
    openSignIn({
      forceRedirectUrl: window.location.origin + '/profile'
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center text-center gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-brand-gold/10 p-4 rounded-3xl border border-brand-gold/20 shadow-2xl shadow-brand-gold/5 mb-2">
            <Scissors className="text-brand-gold" size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-br from-brand-gold via-white to-brand-gold/80">
            HairAgenda
          </h1>
          <p className="text-brand-muted text-lg font-medium leading-relaxed max-w-[300px]">
            Sua agenda de beleza elevada ao nível profissional.
          </p>
        </div>

        <div className="flex flex-col w-full gap-4 mt-4">
          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 bg-brand-gold text-brand-dark h-16 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all shadow-xl shadow-brand-gold/20 active:scale-95 group"
          >
            {user ? <User size={20} className="group-hover:scale-110 transition-transform" /> : <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />}
            {user ? 'Acessar Meu Perfil' : 'Acessar Minha Conta'}
          </button>

          <button 
            onClick={() => navigate('/services')}
            className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white h-16 rounded-2xl text-lg font-bold border border-white/10 transition-all active:scale-95 group"
          >
            <Calendar size={20} className="text-brand-gold group-hover:scale-110 transition-transform" />
            Explorar Serviços
          </button>
        </div>

        <div className="flex items-center gap-2 mt-8 text-brand-muted/60">
          <Sparkles size={16} />
          <span className="text-xs uppercase tracking-widest font-bold">O futuro do seu salão começa aqui</span>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 w-full text-center text-brand-muted/30 text-[10px] uppercase tracking-[0.2em]">
        HairAgenda &copy; {new Date().getFullYear()} &bull; Professional Edition
      </footer>
    </div>
  );
}
