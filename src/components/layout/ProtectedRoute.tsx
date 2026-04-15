import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen pb-20 bg-background">
      {children}
      <BottomNav />
    </div>
  );
};

export default ProtectedRoute;
