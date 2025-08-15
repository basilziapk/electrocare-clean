import { useState, ReactNode } from "react";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { AuthNotification } from "@/components/auth-notification";
import { PureAuthModal } from "@/components/pure-auth-modal";

interface ProtectedFeatureProps {
  children: ReactNode;
  feature: string;
  title?: string;
  description?: string;
  requireRole?: 'admin' | 'technician' | 'customer';
}

export function ProtectedFeature({ 
  children, 
  feature, 
  title = "Authentication Required",
  description = "Please login or register to access this feature",
  requireRole
}: ProtectedFeatureProps) {
  const { user } = useSimpleAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user is authenticated
  if (!user) {
    return (
      <>
        <AuthNotification
          title={title}
          description={description}
          feature={feature}
          onLogin={() => setShowAuthModal(true)}
          onRegister={() => setShowAuthModal(true)}
        />
        <PureAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          title={title}
        />
      </>
    );
  }

  // Check role requirement if specified
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">This feature requires {requireRole} privileges.</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role, render the protected content
  return <>{children}</>;
}