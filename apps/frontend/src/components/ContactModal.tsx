import { X, Phone, Mail, Instagram, MessageSquare } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  const contactOptions = [
    {
      icon: <Phone size={24} />,
      label: "Ligar",
      value: "(11) 99999-9999",
      action: () => window.open("tel:+5511999999999"),
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <Mail size={24} />,
      label: "E-mail",
      value: "contato@anarocha.com",
      action: () => window.open("mailto:contato@anarocha.com"),
      color: "bg-red-50 text-red-600"
    },
    {
      icon: <Instagram size={24} />,
      label: "Instagram",
      value: "@anarocha_hair",
      action: () => window.open("https://instagram.com/anarocha_hair"),
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: <MessageSquare size={24} />,
      label: "Chat (Em Breve)",
      value: "Suporte interno",
      action: () => {},
      disabled: true,
      color: "bg-slate-50 text-slate-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-brand-dark">Fale Conosco</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 grid gap-4">
          {contactOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={option.action}
              disabled={option.disabled}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent transition-all ${
                option.disabled 
                  ? "opacity-60 cursor-not-allowed bg-slate-50" 
                  : "hover:border-brand-gold/20 hover:bg-slate-50 active:scale-[0.98]"
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${option.color}`}>
                {option.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{option.label}</span>
                <span className="text-brand-dark font-bold">{option.value}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 text-center">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-tight">
            Horário de Atendimento: Ter-Sáb, 09h às 19h
          </p>
        </div>
      </div>
    </div>
  );
}
