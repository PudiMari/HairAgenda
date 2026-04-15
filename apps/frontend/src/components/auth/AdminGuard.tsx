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

  const refreshProfile = async () => {
    if (user && checkProfile) {
      try {
        const data = await fetchProfessionalProfile(user.id);
        setProfile(data);
      } catch (err: any) {
        console.error("Error refreshing profile:", err);
      }
    }
  };

  useEffect(() => {
    async function checkExistingProfile() {
      if (isLoaded && user && checkProfile) {
        setProfileLoading(true);
        try {
          const data = await fetchProfessionalProfile(user.id);
          setProfile(data);
        } catch (err: any) {
          // Network/server error: treat as no profile found — redirect to setup
          console.warn("Could not fetch profile, treating as not set up:", err);
          setProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
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

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading: profileLoading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

