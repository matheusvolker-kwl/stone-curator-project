import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function RequireAuth({
  children,
  adminOnly = false,
  approvedOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  approvedOnly?: boolean;
}) {
  const { loading, session, isAdmin, isApproved } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-western-gold" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/parceiro/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/minha-conta" replace />;
  }
  if (approvedOnly && !isApproved) {
    return <Navigate to="/minha-conta?aviso=pendente" replace />;
  }
  return <>{children}</>;
}
