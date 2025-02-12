
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

export function StandardDashboard() {
  const navigate = useNavigate();

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['standardUserData'],
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

  const handleSiteRegisterClick = () => {
    navigate('/site-registers');
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dgxprt-navy">
          {!isLoadingUser && userData?.first_name && `Welcome - ${userData.first_name}`}
        </h1>
        {!isLoadingUser && userData?.locations?.full_path && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Your location is set to:</p>
            <p className="text-md font-medium text-dgxprt-navy">{userData.locations.full_path}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleSiteRegisterClick}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          Search Site Register
        </Button>
      </div>

      <div className="mt-12">
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
      </div>
    </DashboardLayout>
  );
}
