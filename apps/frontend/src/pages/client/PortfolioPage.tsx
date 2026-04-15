import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, X, Image } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPortfolioItems, PortfolioItem } from "../../lib/api";

export function PortfolioPage() {
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get("u");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (!requestedUserId) {
      setLoading(false);
      return;
    }
    fetchPortfolioItems(requestedUserId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [requestedUserId]);

  const backTo = requestedUserId ? `/profile?u=${requestedUserId}` : "/profile";

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <Link
          to={backTo}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Portfólio</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide border-l-2 border-brand-gold pl-2">
            CONFIRA NOSSOS TRABALHOS
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-4 grid grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100">
              <div className="aspect-[4/5] bg-slate-200" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center p-6">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Image size={36} className="text-slate-300" />
          </div>
          <h2 className="text-lg font-bold text-brand-dark mb-2">
            Nenhum trabalho ainda
          </h2>
          <p className="text-slate-400 text-sm">
            Este profissional ainda não adicionou fotos ao portfólio.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="p-4 grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x500/f1f5f9/94a3b8?text=Foto";
                  }}
                />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                  {item.category_display || item.category}
                </span>
                <h4 className="text-sm font-bold text-brand-dark mt-1">
                  {item.title}
                </h4>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSelected(item)}
                  className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm"
                >
                  <ExternalLink size={14} className="text-brand-gold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-8 text-center">
        <p className="text-slate-400 text-sm italic">
          Mais fotos e inspirações em nosso Instagram
        </p>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X size={32} />
          </button>
          <div
            className="relative max-w-full max-h-[80vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.image_url}
              alt={selected.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
            <div className="mt-6 text-center">
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">
                {selected.category_display}
              </span>
              <h4 className="text-white text-xl font-bold mt-1">
                {selected.title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
