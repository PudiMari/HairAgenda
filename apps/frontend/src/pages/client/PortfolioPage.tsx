import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const PORTFOLIO_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    title: "Loiro Perolado",
    category: "Coloração"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
    title: "Corte Moderno",
    category: "Corte"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=800",
    title: "Tratamento Capilar",
    category: "Tratamento"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=800",
    title: "Mechas Criativas",
    category: "Coloração"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800",
    title: "Penteado Noiva",
    category: "Penteados"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800",
    title: "Manicure Designer",
    category: "Unhas"
  }
];

export function PortfolioPage() {
  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Portfólio</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide border-l-2 border-brand-gold pl-2">CONFIRA NOSSOS TRABALHOS</p>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {PORTFOLIO_IMAGES.map((image) => (
          <div 
            key={image.id} 
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-3">
              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{image.category}</span>
              <h4 className="text-sm font-bold text-brand-dark mt-1">{image.title}</h4>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm">
                <ExternalLink size={14} className="text-brand-gold" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 text-center">
        <p className="text-slate-400 text-sm italic">
          Mais fotos e inspirações em nosso Instagram
        </p>
      </div>
    </div>
  );
}
