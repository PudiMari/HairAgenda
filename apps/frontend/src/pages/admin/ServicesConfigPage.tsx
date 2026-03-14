import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";

interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
}

export function ServicesConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initial services
  const defaultServices: Service[] = [
    { id: 1, name: "Corte Feminino", price: "R$ 120,00", duration: "45 min" },
    { id: 2, name: "Coloração", price: "R$ 200,00", duration: "90 min" },
    { id: 3, name: "Escova", price: "R$ 80,00", duration: "30 min" },
  ];

  // States for services - initialized from localStorage if available
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem("hairagenda_services");
    return saved ? JSON.parse(saved) : defaultServices;
  });

  // Persist services to localStorage
  useEffect(() => {
    localStorage.setItem("hairagenda_services", JSON.stringify(services));
  }, [services]);

  // States for new service form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("45");
  const [description, setDescription] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDuration("45");
    setDescription("");
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    // Remove R$ for easier editing if user wants to just type numbers
    setPrice(service.price.replace("R$ ", ""));
    // Extract number from "45 min"
    setDuration(service.duration.split(" ")[0]);
    setIsModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price) return;

    // Basic formatting for price if user didn't type R$
    const formattedPrice = price.startsWith("R$") ? price : `R$ ${price}`;
    
    if (editingService) {
      // Update existing service
      setServices(services.map((s: Service) => 
        s.id === editingService.id 
          ? { ...s, name, price: formattedPrice, duration: `${duration} min` }
          : s
      ));
    } else {
      // Add new service
      const newService: Service = {
        id: Math.max(0, ...services.map((s: Service) => s.id)) + 1,
        name,
        price: formattedPrice,
        duration: `${duration} min`
      };
      setServices([...services, newService]);
    }
    
    resetForm();
  };

  const handleDeleteService = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      setServices(services.filter((s: Service) => s.id !== id));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Configuração de Serviços</h1>
          <p className="text-slate-500 mt-1 font-medium">Gerencie o catálogo de procedimentos oferecidos pelo seu salão</p>
        </div>
        
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="flex-1 sm:hidden">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-brand-dark focus:ring-0 outline-none" 
              />
             </div>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-gold hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-brand-gold/20"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Novo Serviço</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Serviço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Preço (R$)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tempo (min)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-brand-dark">{service.name}</td>
                  <td className="px-6 py-5 text-slate-600 font-medium">{service.price}</td>
                  <td className="px-6 py-5 text-slate-600 font-medium">{service.duration}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(service)}
                        className="p-2 text-slate-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all" 
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-brand-dark">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSaveService}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="service-name">Nome do Serviço</label>
                <input 
                  id="service-name" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte Degradê"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm focus:ring-0 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="service-price">Preço (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                    <input 
                      id="service-price" 
                      type="text" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 px-3 rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 text-sm focus:ring-0 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="service-duration">Duração</label>
                  <select 
                    id="service-duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm focus:ring-0 outline-none transition-all"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="service-desc">Descrição (Opcional)</label>
                <textarea 
                  id="service-desc" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Breve descrição do procedimento..."
                  className="w-full rounded-lg border-2 border-slate-200 bg-white text-brand-dark focus:border-brand-gold py-2.5 px-3 text-sm focus:ring-0 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-brand-gold hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-brand-gold/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
