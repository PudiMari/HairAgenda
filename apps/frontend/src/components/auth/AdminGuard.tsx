import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Hybrid approach for evaluation and production
  const adminEmails = [
    'marianadiasgta.2017@gmail.com',
    ...(import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [])
  ];

  const isAdmin = 
    user?.publicMetadata?.role === 'admin' || 
    (user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress));

  if (!isAdmin) {
    console.warn("Access denied: User is not an admin");
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
