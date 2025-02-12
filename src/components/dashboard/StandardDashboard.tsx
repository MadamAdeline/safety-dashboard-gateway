
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InfoCard } from "./InfoCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StandardDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Query to fetch location hierarchy for the user's location
  const { data: locationHierarchy = [] } = useQuery({
    queryKey: ['locationHierarchy', userData?.locations?.id],
    queryFn: async () => {
      if (!userData?.locations?.id) return [];

      const { data, error } = await supabase.rpc('get_location_hierarchy', {
        selected_location_id: userData.locations.id
      });

      if (error) {
        console.error("Error fetching child locations:", error);
        return [];
      }

      // Extract just the IDs from the location hierarchy objects and include the user's location
      const locationIds = data.map(item => item.id);
      if (userData.locations.id) {
        locationIds.push(userData.locations.id);
      }
      return locationIds;
    },
    enabled: !!userData?.locations?.id
  });

  // Query for searching site registers
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['siteRegisterSearch', searchTerm, locationHierarchy],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) {
        return [];
      }

      // Validate locationHierarchy
      if (!Array.isArray(locationHierarchy) || locationHierarchy.length === 0) {
        console.log('No location hierarchy available for search');
        return [];
      }

      // Ensure all location IDs are valid UUIDs
      const validLocationIds = locationHierarchy.filter(id => id && typeof id === 'string');
      if (validLocationIds.length === 0) {
        console.log('No valid location IDs available for search');
        return [];
      }

      try {
        // Search for override_product_name
        const { data: overrideResults, error: overrideError } = await supabase
          .from('site_registers')
          .select(`
            id,
            location_id,
            product_id,
            override_product_name,
            products (
              product_name
            ),
            locations (
              name,
              full_path
            )
          `)
          .in('location_id', validLocationIds)
          .ilike('override_product_name', `%${searchTerm}%`);

        if (overrideError) throw overrideError;

        // Search in products table
        const { data: productResults, error: productError } = await supabase
          .from('site_registers')
          .select(`
            id,
            location_id,
            product_id,
            override_product_name,
            products!inner (
              product_name
            ),
            locations (
              name,
              full_path
            )
          `)
          .in('location_id', validLocationIds)
          .ilike('products.product_name', `%${searchTerm}%`);

        if (productError) throw productError;

        // Combine and deduplicate results
        const combinedResults = [...(overrideResults || []), ...(productResults || [])];
        const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());

        return uniqueResults;
      } catch (error) {
        console.error('Error searching site registers:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2
  });

  const handleSearchClick = (siteRegisterId: string) => {
    navigate(`/site-registers`, { state: { editId: siteRegisterId } });
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

      <div className="mt-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search site registers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {searchTerm.length > 2 && (
            <div className="mt-6 space-y-6">
              {isSearching ? (
                <p className="text-gray-600">Searching...</p>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                    onClick={() => handleSearchClick(result.id)}
                  >
                    <h3 className="text-lg font-medium text-dgxprt-navy mb-1">
                      {result.override_product_name || result.products?.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Location: {result.locations?.full_path}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No results found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
