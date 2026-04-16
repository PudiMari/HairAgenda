import { useUser } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { fetchProfessionalProfile, ProfessionalProfile } from "../../lib/api";

interface ProfileContextType {
  profile: ProfessionalProfile | null;
  setProfile: (profile: ProfessionalProfile | null) => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfessionalProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfessionalProfile must be used within an AdminGuard");
  }
  return context;
}

interface AdminGuardProps {
  children: ReactNode;
  checkProfile?: boolean;
}

export function AdminGuard({ children, checkProfile = true }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(checkProfile);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (user && checkProfile) {
      console.log("[AdminGuard] Refreshing profile for user:", user.id);
      try {
        const data = await fetchProfessionalProfile(user.id);
        console.log("[AdminGuard] Profile refreshed:", data);
        setProfile(data);
      } catch (err: any) {
        console.error("[AdminGuard] Error refreshing profile:", err);
      }
    }
  };

  useEffect(() => {
    async function checkExistingProfile() {
      if (!isLoaded || !user || !checkProfile) {
        if (isLoaded && !user && checkProfile) {
          console.log("[AdminGuard] No user found, stopped loading.");
          setProfileLoading(false);
        }
        return;
      }

      console.log("[AdminGuard] Initial load: Checking profile for user:", user.id);
      setProfileLoading(true);
      setError(null);

      try {
        const data = await fetchProfessionalProfile(user.id);
        if (data) {
          console.log("[AdminGuard] Profile fetch successful:", data.name);
          setProfile(data);
        } else {
          console.log("[AdminGuard] Profile not found (404), needs setup.");
          setProfile(null);
        }
      } catch (err: any) {
        console.error("[AdminGuard] Fetch error:", err);
        // Distinguish between handled 404 and real failure
        setError(err.message || "Erro de conexão com o servidor");
      } finally {
        console.log("[AdminGuard] Loading complete.");
        setProfileLoading(false);
      }
    }

    checkExistingProfile();
  }, [isLoaded, user?.id, checkProfile]);

  if (!isLoaded || (profileLoading && checkProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && checkProfile && !profile && location.pathname !== "/admin/setup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2 transform rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Opa! Algo deu errado</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Não conseguimos conectar ao servidor. Verifique sua internet ou tente novamente em instantes.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Detalhes do Erro</p>
            <p className="text-xs font-mono text-red-400 break-all">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Hybrid approach for evaluation and production
  const adminEmails = [
    ...(import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [])
  ];

  const adminRestrictionEnabled = import.meta.env.VITE_ENABLE_ADMIN_RESTRICTION !== 'false';
  const userRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
  const isEmailAdmin = user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress);

  const isAdmin =
    !adminRestrictionEnabled ||
    userRole === 'admin' ||
    (isEmailAdmin && !userRole);

  const hasRole = 
    user?.publicMetadata?.role === 'admin' || 
    user?.publicMetadata?.role === 'client' ||
    user?.unsafeMetadata?.role === 'admin' || 
    user?.unsafeMetadata?.role === 'client';

  if (isLoaded && user && !hasRole && location.pathname !== "/role-selection") {
    return <Navigate to="/role-selection" replace />;
  }

  if (!isAdmin) {
    console.warn("Access denied: User is not an admin");
    return <Navigate to="/profile" replace />;
  }

  // Redirect to setup if profile is missing OR incomplete, and we are not already on setup
  // CRITICAL: Only redirect if NO ERROR occurred. If error occurred, handled above.
  const isProfileComplete = profile && profile.is_setup_completed;
  if (checkProfile && !isProfileComplete && !error && location.pathname !== "/admin/setup") {
    console.log("[AdminGuard] Profile incomplete or missing, redirecting to /admin/setup. profile:", profile);
    return <Navigate to="/admin/setup" replace />;
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading: profileLoading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

