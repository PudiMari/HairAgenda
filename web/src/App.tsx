import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Scissors, Clock, CheckCircle } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    // Busca os serviços do seu Backend Django
    axios.get('http://127.0.0.1:8000/api/services/')
      .then(response => setServices(response.data))
      .catch(error => console.error("Erro ao carregar serviços:", error));
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-serif text-beauty-terracotta">HairAgenda</h1>
        <p className="text-gray-500 italic">Sua beleza, seu horário.</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scissors size={20} /> Selecione o Serviço
        </h2>

        <div className="space-y-4">
          {services.map(service => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`p-4 border rounded-2xl cursor-pointer transition-all ${selectedService?.id === service.id
                  ? 'border-beauty-gold bg-white shadow-lg'
                  : 'bg-white border-gray-100'
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{service.name}</span>
                <span className="text-beauty-terracotta font-bold">R$ {service.price}</span>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                <Clock size={14} /> {service.duration_minutes} min
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedService && (
        <button className="w-full mt-8 bg-black text-white py-4 rounded-full font-bold hover:bg-beauty-terracotta transition-colors">
          Próximo: Escolher Horário
        </button>
      )}
    </div>
  );
}

export default App;