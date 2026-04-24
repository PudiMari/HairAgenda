import { useState, useEffect } from "react";
import { Plus, Trash2, Image, Loader2, ArrowLeft, X, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfessionalProfile } from "../../components/auth/AdminGuard";
import {
  fetchPortfolioItems,
  createPortfolioItem,
  deletePortfolioItem,
  PortfolioItem,
  PORTFOLIO_CATEGORIES,
} from "../../lib/api";
import { uploadImage } from "../../lib/storage";
import { Upload } from "lucide-react";

export function PortfolioConfigPage() {
  const { profile } = useProfessionalProfile();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    image_url: "",
    title: "",
    category: "outro",
  });
  const [urlError, setUrlError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!profile) return;
    fetchPortfolioItems(profile.id)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile]);

  const handleAdd = async () => {
    if (!profile) return;
    if (!form.image_url.startsWith("http")) {
      setUrlError("Insira uma URL válida começando com http:// ou https://");
      return;
    }
    if (!form.title.trim()) return;

    setSaving(true);
    setUrlError("");
    try {
      const newItem = await createPortfolioItem({
        professional: profile.id,
        image_url: form.image_url.trim(),
        title: form.title.trim(),
        category: form.category,
        order: items.length,
      });
      setItems((prev) => [...prev, newItem]);
      setForm({ image_url: "", title: "", category: "outro" });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    setUrlError("");
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao fazer upload. Verifique se o bucket 'portfolio' existe no Supabase e está público.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover esta foto do portfólio?")) return;
    try {
      await deletePortfolioItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao remover.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <Link
          to="/admin/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-dark">Portfólio</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide border-l-2 border-brand-gold pl-2">
            GERENCIE SUAS FOTOS DE TRABALHO
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-gold text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Image size={36} className="text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark mb-2">
              Nenhuma foto ainda
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Adicione fotos dos seus trabalhos para que os clientes possam
              conocer seu estilo.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-gold transition-colors"
            >
              <Plus size={18} />
              Adicionar primeira foto
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-gold" />
          </div>
        )}

        {/* Grid */}
        {!loading && items.length > 0 && (
          <>
            <p className="text-slate-500 text-xs font-medium mb-4">
              {items.length} foto{items.length !== 1 ? "s" : ""} no portfólio
            </p>
            <div className="grid grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${brokenImageIds.has(item.id) ? 'opacity-30 grayscale' : ''}`}
                      onError={() => {
                        setBrokenImageIds(prev => new Set(prev).add(item.id));
                      }}
                    />
                    {brokenImageIds.has(item.id) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-red-50/50">
                        <AlertCircle className="text-red-500 mb-2" size={24} />
                        <p className="text-[10px] font-bold text-red-600 uppercase leading-tight">Link expirado ou inválido</p>
                        <p className="text-[8px] text-red-500 mt-1">Recomendamos remover e adicionar novamente com o link direto.</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                      {item.category_display || item.category}
                    </span>
                    <h4 className="text-sm font-bold text-brand-dark mt-0.5 truncate">
                      {item.title}
                    </h4>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                      title="Ver em tela cheia"
                    >
                      <ExternalLink size={14} className="text-brand-gold" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-brand-dark">
                Nova foto do portfólio
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setUrlError("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* URL Preview */}
              {form.image_url && !urlError && (
                <div className="rounded-2xl overflow-hidden h-40 bg-slate-100">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() =>
                      setUrlError(
                        "Link inválido. Certifique-se de que é o link DIRETO da imagem."
                      )
                    }
                    onLoad={() => setUrlError("")}
                  />
                </div>
              )}

              {/* Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Imagem do Trabalho
                </label>
                
                {!form.image_url ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100/50 hover:border-brand-gold/30 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-3" />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-brand-gold" />
                        </div>
                      )}
                      <p className="mb-1 text-sm text-slate-700 font-bold">
                        {uploading ? "Enviando arquivo..." : "Clique para selecionar"}
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG ou WEBP (Max. 5MB)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden group shadow-lg border border-slate-100">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="bg-white text-brand-dark px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-gold hover:text-white transition-colors">
                        Trocar Foto
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                        className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Ex: Loiro Perolado"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all"
                >
                  {PORTFOLIO_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setUrlError("");
                }}
                className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.image_url || !form.title}
                className="flex-1 h-12 rounded-2xl bg-brand-gold text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {saving ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Lightbox */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X size={32} />
          </button>
          <div className="flex flex-col items-center max-w-lg w-full">
            <img
              src={previewItem.image_url}
              alt={previewItem.title}
              className="max-h-[70vh] w-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center">
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">
                {previewItem.category_display}
              </span>
              <h4 className="text-white text-xl font-bold mt-1">
                {previewItem.title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
