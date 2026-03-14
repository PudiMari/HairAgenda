import { useState, useEffect, useRef } from "react";
import { CalendarDays, ClipboardList, MessageCircle, MapPin, Share2, MoreHorizontal, Check, ShieldAlert, FileText, Info, X, User } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactModal } from "../../components/ContactModal";

const RECENT_WORKS = [
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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState<typeof RECENT_WORKS[0] | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    const shareData = {
      title: 'Ana Silva - Colorista & Hair',
      text: 'Confira o perfil de Ana Silva no HairAgenda!',
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

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-white shadow-sm rounded-lg overflow-hidden">
      
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <Link 
          to="/admin"
          className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-50 text-slate-700 transition-all hover:bg-brand-gold/10 hover:text-brand-gold active:scale-95"
          title="Acesso do Profissional"
        >
          <User size={20} />
        </Link>

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
              className={`flex items-center justify-center rounded-lg h-10 w-10 transition-all active:scale-95 ${
                isMoreMenuOpen ? 'bg-brand-gold/10 text-brand-gold' : 'bg-slate-50 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold'
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
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200")' }}
            />
          </div>
          <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Ana Silva - Colorista & Hair</h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-sm">
             Especialista em loiros e mechas há 10 anos. Localizada no Jardins.
          </p>
          <div className="flex items-center gap-1 mt-1 text-brand-gold">
            <MapPin size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">São Paulo, SP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3 mt-4">
          <Link 
            to="/book/services" 
            className="flex w-full items-center justify-center rounded-2xl h-14 px-6 bg-brand-gold text-white text-lg font-bold shadow-lg shadow-brand-gold/20 hover:opacity-90 transition-opacity"
          >
            <CalendarDays className="mr-2" size={24} />
            Agendar Horário
          </Link>
          
          <div className="flex gap-3 w-full">
            <Link 
              to="/services"
              className="flex flex-1 items-center justify-center rounded-2xl h-12 px-4 border-2 border-brand-gold/30 bg-transparent text-brand-gold text-sm font-bold hover:bg-brand-gold/5 transition-colors"
            >
              <ClipboardList className="mr-2" size={18} />
              Ver Serviços
            </Link>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="flex flex-1 items-center justify-center rounded-2xl h-12 px-4 border-2 border-slate-200 bg-transparent text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <MessageCircle className="mr-2" size={18} />
              Contato
            </button>
          </div>
        </div>
      </div>

      {/* Recent Works Grid */}
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
              <p className="text-white/60 text-sm mt-1">Ana Silva - Colorista & Hair</p>
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
