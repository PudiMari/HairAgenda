import { useUser } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { fetchProfessionalProfile, ProfessionalProfile } from "../../lib/api";

interface AdminGuardProps {
  children: ReactNode;
  checkProfile?: boolean;
}

export function AdminGuard({ children, checkProfile = true }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(checkProfile);

  useEffect(() => {
    async function checkExistingProfile() {
      if (isLoaded && user && checkProfile) {
        setProfileLoading(true);
        try {
          const data = await fetchProfessionalProfile(user.id);
          setProfile(data);
        } catch (err: any) {
          console.error("Error checking profile:", err);
          setError(err.message || "Erro ao buscar perfil.");
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    }

    checkExistingProfile();
  }, [isLoaded, user, checkProfile]);

  if (!isLoaded || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error && checkProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md border border-slate-100">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro de Perfil</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-brand-dark text-white px-6 py-3 rounded-2xl font-bold transition-all"
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
    return <Navigate to="/admin/setup" replace />;
  }

  return <>{children}</>;
}
