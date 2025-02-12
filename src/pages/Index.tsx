
import { StandardDashboard } from "@/components/dashboard/StandardDashboard";
import { AdminManagerDashboard } from "@/components/dashboard/AdminManagerDashboard";
import { useUserRole } from "@/hooks/use-user-role";

const Index = () => {
  const { data: userData, isLoading } = useUserRole();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isStandardUser = userData?.role?.toLowerCase() === 'standard';
  
  return isStandardUser ? <StandardDashboard /> : <AdminManagerDashboard />;
};

export default Index;
