import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Info, CheckCircle2, Loader2 } from "lucide-react";
import { fetchServices, Service } from "../../lib/api";

export function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchServices();
        setServices(data.map(s => ({
          ...s,
          price: s.price.replace(".", ",") // UI template adds R$
        })));
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleBookService = (service: Service) => {
    navigate("/book/services", {
      state: {
        preSelectedService: {
          id: service.id.toString(),
          name: service.name
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 bg-background-light">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
        <p className="text-slate-500 mt-4 font-bold">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-20 px-4 bg-background-light">
      {/* Header */}
      <div className="pt-8 pb-6 border-b border-primary/10 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/profile" className="text-brand-gold hover:opacity-80 transition-opacity">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">Nossos Serviços</h1>
        </div>
        <p className="text-slate-500 font-medium">Conheça todos os procedimentos e tratamentos disponíveis.</p>
      </div>

      {/* Services List */}
      <div className="grid gap-6">
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Info size={32} />
            </div>
            <p className="text-slate-500 font-bold">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:border-brand-gold/50 hover:shadow-xl hover:shadow-brand-gold/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{service.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-brand-gold font-black text-lg">
                      <span className="text-sm font-bold opacity-70">R$</span>
                      <span>{service.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm font-bold">
                      <Clock size={14} />
                      <span>{service.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Procedimento realizado com os melhores produtos do mercado, garantindo um resultado impecável e duradouro.
                {/* Note: In a real app, service.description would go here if available */}
              </p>

              <button
                onClick={() => handleBookService(service)}
                className="w-full h-12 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 group/btn"
              >
                Agendar este serviço
                <ArrowLeft className="rotate-180 group-hover/btn:translate-x-1 transition-transform" size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer / Contact */}
      <div className="mt-12 p-6 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex flex-col items-center text-center">
        <p className="text-brand-dark font-bold mb-1">Dúvida sobre algum serviço?</p>
        <p className="text-slate-500 text-sm mb-4">Entre em contato diretamente comigo pelo WhatsApp.</p>
        <button className="text-brand-gold font-black uppercase text-xs tracking-widest hover:underline">
          Conversar no WhatsApp
        </button>
      </div>
    </div>
  );
}
