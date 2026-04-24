import { Outlet, useNavigate } from "react-router-dom";
import { Scissors, LogIn } from "lucide-react";
import { UserButton, useClerk, useUser } from "@clerk/react";
import { useEffect } from "react";

export function RootLayout() {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const hasRole = 
        user?.publicMetadata?.role === 'admin' || 
        user?.publicMetadata?.role === 'client' ||
        user?.unsafeMetadata?.role === 'admin' || 
        user?.unsafeMetadata?.role === 'client';

      if (!hasRole) {
        navigate('/role-selection');
      }
    }
  }, [isLoaded, user, navigate]);

  const handleLogin = () => {
    if (!isLoaded || user) return;
    openSignIn({
      forceRedirectUrl: window.location.origin + '/profile'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate(user ? '/profile' : '/')}
          >
            <div className="bg-brand-dark p-2 rounded-xl text-brand-gold transition-transform group-hover:scale-110">
              <Scissors size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-brand-dark uppercase italic">
              HairAgenda
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoaded && user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(user?.unsafeMetadata?.role === 'admin' || user?.publicMetadata?.role === 'admin' ? '/admin' : '/my-bookings')}
                  className="hidden sm:block text-sm font-bold text-slate-600 hover:text-brand-dark transition-colors"
                >
                  {user?.unsafeMetadata?.role === 'admin' || user?.publicMetadata?.role === 'admin' ? 'Dashboard' : 'Meus Agendamentos'}
                </button>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-10 w-10 border-2 border-brand-gold/20 hover:border-brand-gold/50 transition-colors"
                    }
                  }}
                />
              </div>
            ) : isLoaded ? (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-brand-gold/10 hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-wider"
              >
                <LogIn size={18} />
                <span>Entrar</span>
              </button>
            ) : (
              <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-2xl" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-brand-dark p-4 text-center text-brand-muted text-sm mt-auto">
        &copy; {new Date().getFullYear()} HairAgenda. Estilo e Praticidade.
      </footer>
    </div>
  );
}
