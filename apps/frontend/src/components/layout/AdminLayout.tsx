import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Scissors, LayoutDashboard, Settings, Menu, Copy, X, LogOut } from "lucide-react";
import { useUser } from "@clerk/react";
import { fetchProfessionalProfile, ProfessionalProfile } from "../../lib/api";


export function AdminLayout() {
  const { user } = useUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const data = await fetchProfessionalProfile(user.id);
          setProfile(data);
        } catch (err) {
          console.error("Error loading profile:", err);
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleCopyLink = () => {
    const profileId = profile?.user_id || "ana-silva";
    const profileUrl = `${window.location.origin}/profile?u=${profileId}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const navLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Visão Geral" },
    { to: "/admin/services", icon: Scissors, label: "Serviços" },
    { to: "/admin/schedule", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Shared logic for Desktop and Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-brand-dark/10 p-2 rounded-2xl text-brand-dark">
                <Scissors size={28} />
              </div>
              <div>
                <h1 className="text-brand-dark font-bold text-lg tracking-tight leading-tight">HairAgenda</h1>
                <p className="text-brand-gold text-[9px] font-bold uppercase tracking-[0.2em]">Visão Profissional</p>
              </div>
            </div>
            <button 
              className="md:hidden text-slate-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2 mb-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.to;
              return (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all ${
                    isActive 
                      ? "bg-brand-dark text-brand-gold shadow-lg shadow-brand-dark/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-brand-dark"
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <img 
                alt="Profile photo" 
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold/20" 
                src={profile?.photo_url || user?.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"}
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-brand-dark uppercase tracking-wide truncate">{profile?.name || user?.fullName || "Profissional"}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase">Plano Premium</p>
              </div>

              <Link 
                to="/" 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Sair da visão profissional"
              >
                <LogOut size={20} />
              </Link>
            </div>
          </div>
          
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 transition-all flex flex-col min-h-screen w-full">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 py-6 md:px-12 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              className="md:hidden text-brand-dark bg-slate-50 p-2 rounded-xl border border-slate-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-brand-dark tracking-tight truncate max-w-[200px] md:max-w-md">
                Olá, {profile?.name?.split(' ')[0] || user?.firstName || "Profissional"}! 👋
              </h2>
              <p className="text-sm text-slate-500 hidden sm:block font-medium">Bom dia! Veja sua agenda para hoje.</p>
            </div>

          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleCopyLink}
              className={`${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border-brand-gold/20'} px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border shadow-sm`}
            >
              <Copy size={18} />
              <span className="hidden sm:inline">
                {copied ? "Copiado!" : "Copiar Link"}
              </span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
