import { useState, useEffect, useRef } from "react";
import { CalendarDays, ClipboardList, MessageCircle, MapPin, Share2, MoreHorizontal, Check, ShieldAlert, FileText, Info, X, User, Clock, ChevronRight, History } from "lucide-react";
import { useUser } from "@clerk/react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ContactModal } from "../../components/ContactModal";
import { fetchProfessionalProfile, fetchServices, fetchAppointments, ProfessionalProfile, Service as APIService } from "../../lib/api";
import { registerProfessionalVisit } from "../../lib/recentPros";

interface WorkItem {
  id: number;
  url: string;
  title: string;
}

const RECENT_WORKS: WorkItem[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300",
    title: "Loiro Perolado"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=300",
    title: "Corte Moderno"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=300",
    title: "Tratamento Capilar"
  }
];

export function ProfilePage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [services, setServices] = useState<APIService[]>([]);
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile ID logic: 1. From URL (?u=...), 2. Fallback to current user if admin
  const requestedUserId = searchParams.get('u');

  useEffect(() => {
    async function loadData() {
      if (!isLoaded) return;
      setLoading(true);
      try {
        const userIdToFetch = requestedUserId || user?.id;
        
        // Parallel fetch for profile/services and client appointments if logged in
        const promises: Promise<any>[] = [];
        
        if (userIdToFetch) {
          promises.push(fetchProfessionalProfile(userIdToFetch).catch(() => null));
          promises.push(fetchServices(userIdToFetch).catch(() => []));
        } else {
          promises.push(Promise.resolve(null));
          promises.push(Promise.resolve([]));
        }
        
        if (user?.id) {
          promises.push(fetchAppointments({ clientId: user.id }).catch(() => []));
        } else {
          promises.push(Promise.resolve([]));
        }

        const [profileData, servicesData, appointmentsData] = await Promise.all(promises);
        
        setProfile(profileData);
        setServices(servicesData);
        setClientAppointments(appointmentsData);

        // Save to Recent Professionals if we're viewing someone else's profile
        if (profileData && requestedUserId && requestedUserId !== user?.id) {
          registerProfessionalVisit(user?.id, profileData);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestedUserId, user, isLoaded]);

  // Admin check (Hybrid: Metadata + Env/Hardcoded fallback for evaluation)
  const adminEmails = [
    ...(import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [])
  ];
  const adminRestrictionEnabled = import.meta.env.VITE_ENABLE_ADMIN_RESTRICTION !== 'false';
  const userRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
  const isEmailAdmin = user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress);


  const isAdmin = isLoaded && (
    !adminRestrictionEnabled ||
    userRole === 'admin' ||
    (isEmailAdmin && !userRole)
  );


  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{id: number, url: string, title: string} | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if current user is the owner of this profile
  const isOwner = !!(user?.id && (!requestedUserId || requestedUserId === user.id || profile?.user_id === user.id));

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async () => {
    const profileName = profile?.name || "Profissional";
    const shareData = {
      title: `${profileName} - HairAgenda`,
      text: `Confira o perfil de ${profileName} no HairAgenda!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      console.warn("Native share failed, falling back to clipboard:", err);
    }

    // Fallback to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }

    // Always show feedback to indicate the action was attempted
    setShowCopiedFeedback(true);
    setTimeout(() => setShowCopiedFeedback(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !loading && requestedUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <ShieldAlert size={48} className="text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-brand-dark">Perfil não encontrado</h1>
        <p className="text-slate-500 mt-2">O profissional que você procura não está disponível ou o link está incorreto.</p>
        <Link to="/" className="mt-6 text-brand-gold font-bold hover:underline">Voltar para a página inicial</Link>
      </div>
    );
  }

  // Check if we should show the Client Dashboard
  const isClientDashboard = !requestedUserId && (userRole === 'client' || (!profile && !loading && !isAdmin));


  if (isClientDashboard) {
    const recentKey = `recent_pros_${user?.id || 'guest'}`;
    const recentPros = JSON.parse(localStorage.getItem(recentKey) || '[]');

    return (
      <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 shadow-sm rounded-lg overflow-hidden pb-10">
        <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                className="w-16 h-16 rounded-full border-2 border-brand-gold/20 object-cover"
                alt={user.fullName || "Perfil"}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold border-2 border-brand-gold/20">
                <User size={32} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-brand-dark">Olá, {user?.firstName || 'visitante'}! 👋</h1>
              <p className="text-slate-500 text-sm">Bem-vindo ao seu painel.</p>
            </div>
          </div>
          
          {/* Redundant card removed as per user request */}

        </div>

        {/* My Appointments Section */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-dark text-lg font-bold">Próximos Agendamentos</h3>
            <Link to="/my-bookings" className="text-brand-gold text-sm font-bold hover:underline">Ver todos</Link>
          </div>
          
          {clientAppointments.length > 0 ? (
            <div className="space-y-3">
              {clientAppointments.slice(0, 3).map((app: any) => (
                <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-gold">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark text-sm">{new Date(app.date_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(app.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-slate-500 italic">{app.service_name || `Serviço #${app.service}`}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-brand-gold/10 text-brand-gold'
                  }`}>
                    {app.status === 'PENDING' ? 'Pendente' : 'Confirmado'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center">
              <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Você não tem agendamentos próximos.</p>
              {(() => {
                const recentKey = `recent_pros_${user?.id || 'guest'}`;
                const recentPros = JSON.parse(localStorage.getItem(recentKey) || '[]');
                const lastVisitedUserId = recentPros.length > 0 ? recentPros[0].id : null;

                if (lastVisitedUserId) {
                  return <Link to={`/book/services?u=${lastVisitedUserId}`} className="inline-block mt-4 text-brand-gold font-bold text-sm hover:underline">Agendar agora →</Link>
                }
                
                return <p className="text-xs text-amber-600 font-medium mt-4 bg-amber-50 rounded-lg p-3 inline-block">Para agendar seu 1º horário, acesse o <strong>link de convite</strong> enviado pelo seu profissional parceiro.</p>
              })()}
            </div>
          )}
        </div>

        {/* Recent Professionals Section */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-dark text-lg font-bold">Profissionais Recentes</h3>
            <div className="h-0.5 flex-1 bg-slate-100 mx-4 opacity-50"></div>
          </div>

          {recentPros.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recentPros.map((pro: any) => (
                <Link 
                  key={pro.id} 
                  to={`/profile?u=${pro.id}`}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-brand-gold/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-slate-100"
                      style={{ backgroundImage: `url("${pro.photo || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150'}")` }}
                    />
                    <div>
                      <p className="font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{pro.name}</p>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <MapPin size={10} />
                        <span>{pro.location}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-gold transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
              <History size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-slate-400 text-xs italic">Você ainda não visitou profissionais.</p>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 px-6 pb-6 space-y-4">
          <p className="text-slate-400 text-[10px] text-center uppercase tracking-[0.2em] font-bold">HairAgenda • Sua Agenda Inteligente</p>
          
          <div className="pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Você deseja mudar seu perfil para Profissional? Você poderá configurar sua agenda, serviços e receber agendamentos.")) {
                  await user?.update({ unsafeMetadata: { role: 'admin' } });
                  navigate("/admin/setup");
                }
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-500 hover:text-brand-dark hover:bg-slate-200 text-xs font-bold uppercase tracking-widest transition-all"
            >
              Quero ser um Profissional
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to empty if no profile found (this case should ideally not happen if handled above)
  const displayName = profile?.name || user?.fullName || "Seu Nome";
  const displayDescription = profile?.description || "Sua descrição profissional aparecerá aqui após a configuração.";
  const displayLocation = profile?.location || "Sua Localização";
  const displayPhoto = profile?.photo_url || user?.imageUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200&h=200";
  const displayWhatsApp = profile?.whatsapp || "";
  const displayInstagram = profile?.instagram || "";

  // Get top 3 services
  const popularServices = services.slice(0, 3);

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-white shadow-sm rounded-lg overflow-hidden">

      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        {isAdmin && isOwner ? (
          <Link
            to="/admin"
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-50 text-slate-700 transition-all hover:bg-brand-gold/10 hover:text-brand-gold active:scale-95"
            title="Acesso do Profissional"
          >
            <User size={20} />
          </Link>
        ) : <div className="w-10 h-10" />}

        <div className="flex gap-2 relative">
          <button
            onClick={handleShare}
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-50 text-slate-700 transition-all hover:bg-brand-gold/10 hover:text-brand-gold active:scale-95 relative"
          >
            {showCopiedFeedback ? <Check size={20} className="text-green-600 animate-in zoom-in duration-300" /> : <Share2 size={20} />}
            {showCopiedFeedback && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                Link copiado!
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex items-center justify-center rounded-lg h-10 w-10 transition-all active:scale-95 ${isMoreMenuOpen ? 'bg-brand-gold/10 text-brand-gold' : 'bg-slate-50 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold'
                }`}
            >
              <MoreHorizontal size={20} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex w-full items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ShieldAlert size={16} className="mr-3 text-slate-400" />
                  Reportar Problema
                </button>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex w-full items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Info size={16} className="mr-3 text-slate-400" />
                  Sobre o HairAgenda
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex w-full items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText size={16} className="mr-3 text-slate-400" />
                  Termos & Privacidade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-6 py-10 gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-brand-gold/20 p-1">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover rounded-full shadow-lg"
              style={{ backgroundImage: `url("${displayPhoto}")` }}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
        </div>

        {isAdmin && isOwner && !profile && (
          <div className="w-full bg-brand-gold/10 border-2 border-brand-gold/20 rounded-2xl p-6 text-center animate-pulse">
            <h3 className="text-brand-dark font-bold mb-1">Seu perfil está vazio! 📢</h3>
            <p className="text-slate-600 text-sm mb-4">Complete sua configuração para que seus clientes vejam suas informações reais.</p>
            <Link 
              to="/admin/setup"
              className="inline-flex items-center justify-center bg-brand-gold text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md"
            >
              Configurar Agora
            </Link>
          </div>
        )}

        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">{displayName}</h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-sm">
            {displayDescription}
          </p>
          <div className="flex items-center gap-1 mt-1 text-brand-gold">
            <MapPin size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{displayLocation}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {profile && (
          <div className="flex flex-col w-full gap-3 mt-4">
            <Link
              to={`/book/services${requestedUserId ? `?u=${requestedUserId}` : ""}`}
              className="flex w-full items-center justify-center rounded-2xl h-14 px-6 bg-brand-gold text-white text-lg font-bold shadow-lg shadow-brand-gold/20 hover:opacity-90 transition-opacity"
            >
              <CalendarDays className="mr-2" size={24} />
              Agendar Horário
            </Link>

            <div className="flex gap-3 w-full">
              <Link
                to={`/services${requestedUserId ? `?u=${requestedUserId}` : ""}`}
                className="flex flex-1 items-center justify-center rounded-2xl h-12 px-4 border-2 border-brand-gold/30 bg-transparent text-brand-gold text-sm font-bold hover:bg-brand-gold/5 transition-colors"
              >
                <ClipboardList className="mr-2" size={18} />
                Ver Serviços
              </Link>
              <div className="flex flex-1 gap-2">
                {displayWhatsApp && (
                  <a
                    href={`https://wa.me/${displayWhatsApp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center rounded-2xl h-12 px-2 border-2 border-[#25D366]/30 bg-transparent text-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle size={20} />
                  </a>
                )}
                {displayInstagram && (
                  <a
                    href={`https://instagram.com/${displayInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center rounded-2xl h-12 px-2 border-2 border-[#E1306C]/30 bg-transparent text-[#E1306C] hover:bg-[#E1306C]/5 transition-colors"
                    title="Instagram"
                  >
                    <Share2 size={20} />
                  </a>
                )}
                {!displayWhatsApp && !displayInstagram && (
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="flex flex-1 items-center justify-center rounded-2xl h-12 px-4 border-2 border-slate-200 bg-transparent text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle className="mr-2" size={18} />
                    Contato
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular Services Highlight */}
      {profile && popularServices.length > 0 && (
        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-dark text-lg font-bold">Serviços Populares</h3>
            <Link to={`/services${requestedUserId ? `?u=${requestedUserId}` : ""}`} className="text-brand-gold text-sm font-bold hover:underline">Ver Tabela</Link>
          </div>
          <div className="space-y-3">
            {popularServices.map((service) => (
              <Link 
                key={service.id}
                to={`/book/services?service=${service.id}${requestedUserId ? `&u=${requestedUserId}` : ""}`}

                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group"
              >
                <div>
                  <p className="font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{service.name}</p>
                  <p className="text-xs text-slate-500">{service.duration_minutes} min</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-dark">R$ {service.price}</p>
                  <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-0.5">Agendar</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Works Grid */}
      {profile && (
        <div className="px-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-dark text-lg font-bold">Trabalhos Recentes</h3>
            <Link to="/portfolio" className="text-brand-gold text-sm font-bold hover:underline">Ver todos</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RECENT_WORKS.map((work) => (
              <button
                key={work.id}
                onClick={() => setSelectedImage(work)}
                className="aspect-square rounded-lg bg-slate-100 overflow-hidden group relative"
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundImage: `url("${work.url}")` }}
                ></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Info size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200 p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X size={32} />
          </button>

          <div className="relative max-w-full max-h-[80vh] flex flex-col items-center">
            <img
              src={selectedImage.url.replace('w=300', 'w=1200')}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
            <div className="mt-6 text-center">
              <h4 className="text-white text-xl font-bold">{selectedImage.title}</h4>
              <p className="text-white/60 text-sm mt-1">{displayName}</p>
            </div>
          </div>
        </div>
      )}

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
