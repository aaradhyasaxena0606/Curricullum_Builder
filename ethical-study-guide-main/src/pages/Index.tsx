import { useAuth } from "@/contexts/AuthContext";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary" />
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users, landing for guests
  return user ? <Dashboard /> : <Landing />;
};

export default Index;
