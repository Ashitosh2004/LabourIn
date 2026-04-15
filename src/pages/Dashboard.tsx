import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import WorkerDashboard from "@/components/dashboard/WorkerDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/auth" />;

  return profile.role === "worker" ? <WorkerDashboard /> : <EmployerDashboard />;
};

export default Dashboard;
