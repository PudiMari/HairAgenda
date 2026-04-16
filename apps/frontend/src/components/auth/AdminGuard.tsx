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
      if (isLoaded && user && checkProfile) {
        console.log("[AdminGuard] Initial load: Checking profile for user:", user.id);
        setProfileLoading(true);
        try {
          const data = await fetchProfessionalProfile(user.id);
          console.log("[AdminGuard] Profile fetch successful:", data);
          setProfile(data);
          setError(null);
        } catch (err: any) {
          // Check if it's a 404 handled by the API (which returns null) or a real error
          console.error("[AdminGuard] Final catch block:", err);
          setError(err.message || "Erro de conexão com o servidor");
        } finally {
          console.log("[AdminGuard] Initial load complete. profileLoading -> false");
          setProfileLoading(false);
        }
      } else {
        if (isLoaded && !user) {
          console.log("[AdminGuard] No user found, profileLoading -> false");
        }
        setProfileLoading(false);
      }
    }

    checkExistingProfile();
  }, [isLoaded, user, checkProfile]);

  if (!isLoaded || (profileLoading && checkProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error && checkProfile && !profile && location.pathname !== "/admin/setup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center space-y-4 border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Erro de Conexão</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Não conseguimos carregar seu perfil. O servidor pode estar em manutenção.</p>
          <pre className="text-[10px] bg-slate-50 p-3 rounded-lg text-red-400 overflow-x-auto text-left">{error}</pre>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-brand-dark text-white rounded-xl py-4 font-bold hover:bg-black transition-colors"
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
  const isProfileComplete = profile && profile.is_setup_completed;
  if (checkProfile && !isProfileComplete && location.pathname !== "/admin/setup") {
    console.log("[AdminGuard] Profile incomplete or missing, redirecting to /admin/setup. profile:", profile);
    return <Navigate to="/admin/setup" replace />;
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading: profileLoading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

