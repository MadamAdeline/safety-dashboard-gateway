import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { Card } from "@/components/ui/card";
import { useUserRole } from "@/hooks/use-user-role";

const InfoCard = ({ title, image, link }: { title: string; image: string; link: string }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="block h-full transition-all duration-300 hover:transform hover:scale-[1.02]"
  >
    <Card className="overflow-hidden h-full border-none shadow-lg hover:shadow-xl">
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-dgxprt-navy leading-tight">{title}</h3>
      </div>
    </Card>
  </a>
);

export function AdminManagerDashboard() {
  const navigate = useNavigate();
  const { data: roleData } = useUserRole();
  const isManager = roleData?.role?.toLowerCase() === 'manager';
  
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['adminUserData'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return null;

      const { data, error } = await supabase
        .from('users')
        .select(`
          first_name,
          locations (
            id,
            full_path
          )
        `)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      return data;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-dgxprt-navy to-dgxprt-purple rounded-2xl p-8 mb-12 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {!isLoadingUser && userData?.first_name 
                  ? `Welcome back, ${userData.first_name}` 
                  : 'Admin Dashboard'}
              </h1>
              {!isLoadingUser && userData?.locations?.full_path && (
                <p className="text-white/80">
                  Location: {userData.locations.full_path}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dgxprt-navy mb-8 flex items-center">
            <span className="bg-dgxprt-purple/10 px-4 py-2 rounded-lg">Key Metrics</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Products"
              value={String(productsCount || 0)}
              action={isManager ? () => navigate("/products") : () => navigate("/products", { state: { showForm: true } })}
              actionLabel={isManager ? "View All Products" : "+ Add New Product"}
              secondaryAction={isManager ? undefined : () => navigate("/products")}
              secondaryActionLabel={isManager ? undefined : "View All Products"}
              isLoading={isLoadingProducts}
            />
            <MetricCard
              title="Safety Data Sheets"
              value={String(sdsCount || 0)}
              action={isManager ? () => navigate("/sds-library") : () => navigate("/sds-library/new")}
              actionLabel={isManager ? "View All SDS's" : "+ Add New SDS"}
              secondaryAction={isManager ? undefined : () => navigate("/sds-library")}
              secondaryActionLabel={isManager ? undefined : "View All SDS's"}
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
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dgxprt-navy mb-8 flex items-center">
            <span className="bg-dgxprt-purple/10 px-4 py-2 rounded-lg">Resources & Training</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
