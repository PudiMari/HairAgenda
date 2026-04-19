import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, FileText, Camera, Check, Loader2 } from "lucide-react";
import { 
  createProfessionalProfile, 
  updateProfessionalProfile,
  fetchProfessionalProfile
} from "../../lib/api";
import { useUser } from "@clerk/react";
import { supabase } from "../../lib/supabase";
import { useRef } from "react";

export function SetupProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    description: "",
    photo_url: user?.imageUrl || "",
    location: "",
    whatsapp: "",
    instagram: ""
  });

  const formatPhone = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length > 2) digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 10) digits = `${digits.slice(0, 10)}-${digits.slice(10)}`;
    return digits;
  };

  useEffect(() => {
    async function loadExistingProfile() {
      if (!user) return;
      setFetching(true);
      try {
        const profile = await fetchProfessionalProfile(user.id);
        if (profile) {
          setFormData({
            name: profile.name || user.fullName || "",
            description: profile.description || "",
            photo_url: profile.photo_url || user.imageUrl || "",
            location: profile.location || "",
            whatsapp: profile.whatsapp ? formatPhone(profile.whatsapp) : "",
            instagram: profile.instagram || ""
          });
          setIsEditMode(true);
        }
      } catch (err) {
        // Silently fail if no profile exists yet (new user)
        console.log("No existing profile found to pre-fill.");
      } finally {
        setFetching(false);
      }
    }
    loadExistingProfile();
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, whatsapp: formatPhone(e.target.value)});
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error("Supabase não configurado. Adicione as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.");
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `profile-pics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Erro ao fazer upload da imagem. Verifique sua conexão.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.whatsapp) {
      const rawPhone = formData.whatsapp.replace(/\D/g, "");
      if (rawPhone.length > 0 && rawPhone.length !== 11) {
        setError("Telefone inválido. Informe o DDD (2 dígitos) e o número (9 dígitos). Ex: (11) 99999-9999");
        return;
      }
    }

    setLoading(true);
    setError(null);

    const rawWhatsapp = formData.whatsapp.replace(/\D/g, "");

    try {
      if (isEditMode) {
        await updateProfessionalProfile(user.id, {
          name: formData.name,
          description: formData.description,
          photo_url: formData.photo_url,
          location: formData.location,
          whatsapp: rawWhatsapp,
          instagram: formData.instagram,
          is_setup_completed: true
        });
      } else {
        try {
          await createProfessionalProfile({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            photo_url: formData.photo_url,
            location: formData.location,
            whatsapp: rawWhatsapp,
            instagram: formData.instagram,
            is_setup_completed: true
          });
        } catch (err: any) {
          // Fallback if record somehow exists but isEditMode was false
          await updateProfessionalProfile(user.id, {
            name: formData.name,
            description: formData.description,
            photo_url: formData.photo_url,
            location: formData.location,
            whatsapp: rawWhatsapp,
            instagram: formData.instagram,
            is_setup_completed: true
          });
        }
      }

      // Redirect back to dashboard
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-brand-dark p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h1 className="text-3xl font-black tracking-tight mb-2 relative z-10">
            {isEditMode ? "Editar Perfil 👋" : "Bem-vindo(a) ao HairAgenda! 👋"}
          </h1>
          <p className="text-brand-gold font-bold uppercase tracking-widest text-xs relative z-10">
            {isEditMode ? "Atualize suas informações profissionais" : "Configuração do seu perfil profissional"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium rounded-r-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="relative group cursor-pointer" 
                onClick={handleFileClick}
              >
                <div className={`w-32 h-32 rounded-full border-4 ${uploading ? 'border-brand-gold animate-pulse' : 'border-brand-gold/20'} p-1 overflow-hidden transition-all shadow-lg`}>
                  {uploading ? (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-full">
                      <Loader2 size={24} className="text-brand-gold animate-spin" />
                    </div>
                  ) : (
                    <img 
                      src={formData.photo_url || "https://via.placeholder.com/150"} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Foto do Perfil</p>
              {uploading && <p className="text-[10px] text-brand-gold font-bold animate-pulse">Enviando...</p>}
            </div>

            {/* Fields Section */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={14} className="text-brand-gold" /> Nome Profissional / Salão
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Ana Silva - Colorista"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-brand-dark font-medium focus:border-brand-gold focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-brand-gold" /> Localização
                </label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-brand-dark font-medium focus:border-brand-gold focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    WhatsApp
                  </label>
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    placeholder="11 99999-9999"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-brand-dark font-medium focus:border-brand-gold focus:bg-white outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Instagram
                  </label>
                  <input 
                    type="text" 
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    placeholder="@seu.perfil"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-brand-dark font-medium focus:border-brand-gold focus:bg-white outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <FileText size={14} className="text-brand-gold" /> Bio / Descrição Curta
            </label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Conte um pouco sobre sua experiência e especialidades..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-brand-dark font-medium focus:border-brand-gold focus:bg-white outline-none transition-all resize-none"
              required
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-2 italic">* Esta descrição aparecerá para seus clientes no seu perfil público.</p>
          </div>

          <button 
            type="submit"
            disabled={loading || fetching}
            className="w-full bg-brand-gold text-white rounded-2xl h-16 text-lg font-black tracking-tight shadow-xl shadow-brand-gold/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Check size={24} />
                {isEditMode ? "Salvar Alterações" : "Concluir Configuração"}
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Você tem certeza que deseja mudar seu perfil para Cliente? Suas informações profissionais continuarão salvas, mas você acessará o painel de cliente.")) {
                  await user?.update({ unsafeMetadata: { role: 'client' } });
                  navigate("/profile");
                }
              }}
              className="text-slate-400 hover:text-brand-dark text-sm font-bold uppercase tracking-widest transition-colors"
            >
              Mudar para perfil de Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
