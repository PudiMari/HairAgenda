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
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(checkProfile);

  useEffect(() => {
    async function checkExistingProfile() {
      if (isLoaded && user && checkProfile) {
        try {
          const data = await fetchProfessionalProfile(user.id);
          setProfile(data);
        } catch (err) {
          console.log("No profile found for this admin yet.");
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

  // Hybrid approach for evaluation and production
  const adminEmails = [
    ...(import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [])
  ];

  const adminRestrictionEnabled = import.meta.env.VITE_ENABLE_ADMIN_RESTRICTION !== 'false';

  const isAdmin =
    !adminRestrictionEnabled ||
    user?.publicMetadata?.role === 'admin' ||
    (user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress));

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
