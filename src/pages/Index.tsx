import { StandardDashboard } from "@/components/dashboard/StandardDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";

const MetricCard = ({ 
  title, 
  value, 
  action, 
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  isLoading
}: { 
  title: string; 
  value: string; 
  action: () => void; 
  actionLabel: string;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  isLoading?: boolean;
}) => {
  console.log(`Rendering MetricCard for ${title}`);
  
  return (
    <Card className="p-6">
      <div className="bg-[#00005B] rounded-t-md -mx-6 -mt-6 p-4 mb-4">
        <h3 className="text-lg font-bold text-white text-center">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-dgxprt-navy mb-4 text-center">
        {isLoading ? "..." : value}
      </p>
      <button
        onClick={action}
        className="w-full py-2 text-center rounded-md bg-dgxprt-purple text-white hover:bg-opacity-90 mb-2"
      >
        {actionLabel}
      </button>
      {secondaryAction && secondaryActionLabel && (
        <button
          onClick={secondaryAction}
          className="w-full py-2 text-center rounded-md bg-[#00005B] text-white font-bold hover:bg-opacity-90"
        >
          {secondaryActionLabel}
        </button>
      )}
    </Card>
  );
};

const InfoCard = ({ title, image, link }: { title: string; image: string; link: string }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="block"
  >
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-dgxprt-navy">{title}</h3>
      </div>
    </Card>
  </a>
);

const Index = () => {
  const { data: userData, isLoading } = useUserRole();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isStandardUser = userData?.role?.toLowerCase() === 'standard';
  
  return isStandardUser ? <StandardDashboard /> : <AdminManagerDashboard />;
};

const AdminManagerDashboard = () => {
  const navigate = useNavigate();
  
  const { data: userLocation, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return null;

      const { data, error } = await supabase
        .from('users')
        .select(`
          location_id,
          locations (
            id,
            full_path
          )
        `)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user location:', error);
        return null;
      }

      return data?.locations?.full_path || null;
    }
  });

  const { data: productsCount, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: sdsCount, isLoading: isLoadingSDS } = useQuery({
    queryKey: ['sdsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sds')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: expiredSDSCount, isLoading: isLoadingExpiredSDS } = useQuery({
    queryKey: ['expiredSDSCount'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('sds')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', today);
      
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dgxprt-navy">Dashboard Overview</h1>
        {!isLoadingLocation && userLocation && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Your location is set to:</p>
            <p className="text-md font-medium text-dgxprt-navy">{userLocation}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard
          title="Products"
          value={String(productsCount || 0)}
          action={() => navigate("/products", { state: { showForm: true } })}
          actionLabel="+ Add New Product"
          secondaryAction={() => navigate("/products")}
          secondaryActionLabel="View All Products"
          isLoading={isLoadingProducts}
        />
        <MetricCard
          title="Safety Data Sheets"
          value={String(sdsCount || 0)}
          action={() => navigate("/sds-library/new")}
          actionLabel="+ Add New SDS"
          secondaryAction={() => navigate("/sds-library")}
          secondaryActionLabel="View All SDS's"
          isLoading={isLoadingSDS}
        />
        <MetricCard
          title="Expired SDS"
          value={String(expiredSDSCount || 0)}
          action={() => navigate("/sds-library?filter=expired")}
          actionLabel="View Expired SDS's"
          isLoading={isLoadingExpiredSDS}
        />
      </div>

      <h2 className="text-xl font-semibold text-dgxprt-navy mb-6">General Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Training Resources: Understanding Safety Data Sheets"
          image="/lovable-uploads/42ffeef5-3205-4f73-a4c5-91997cf05956.png"
          link="https://www.safeworkaustralia.gov.au/sites/default/files/2021-11/understanding_sds_fact_sheet.pdf"
        />
        <InfoCard
          title="Training Resources: Essential Knowledge for DG Compliance"
          image="/lovable-uploads/41619ac3-41d9-492c-b5e8-2bfcafdce8da.png"
          link="https://dgtrainer.com.au/2023/12/05/what-every-business-needs-to-know-about-managing-dangerous-goods-2/"
        />
        <InfoCard
          title="Chemical Management Policy and Procedures"
          image="/lovable-uploads/f225c5bc-284e-4810-baf5-47efe7e77623.png"
          link="https://www2.education.vic.gov.au/pal/chemical-management/policy"
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
