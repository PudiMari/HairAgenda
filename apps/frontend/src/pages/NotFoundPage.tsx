import { Link } from 'react-router-dom';
import { ArrowLeft, Scissors } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
        <Scissors size={40} className="text-brand-gold -rotate-45" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Ops! Cadeira Vazia</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Pelo visto, a página que você está procurando não existe ou o endereço foi digitado incorretamente.
      </p>
      
      <Link 
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
      >
        <ArrowLeft size={20} />
        Voltar à página inicial
      </Link>
    </div>
  );
}
