import { Outlet, useNavigate } from "react-router-dom";
import { Scissors, LogIn, User } from "lucide-react";
import { useState, useEffect } from "react";

export function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there is a token or some indication of auth
    const token = localStorage.getItem('clerk_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login-url/');
      const data = await response.json();
      if (data.sign_in_url) {
        window.location.href = data.sign_in_url;
      }
    } catch (error) {
      console.error("Error fetching login URL:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-dark text-brand-gold p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Scissors size={24} />
            <h1 className="text-xl font-bold tracking-wider uppercase">HairAgenda</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/portfolio')}
                className="flex items-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-full transition-all border border-brand-gold/30"
              >
                <User size={18} />
                <span>Perfil</span>
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <LogIn size={18} />
                <span>Entrar</span>
              </button>
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
