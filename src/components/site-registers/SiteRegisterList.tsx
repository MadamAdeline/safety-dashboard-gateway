
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Location } from "@/types/location";
import { useUserRole } from "@/hooks/use-user-role";
import { SiteRegisterSearch } from "./list/SiteRegisterSearch";
import { SiteRegisterTable } from "./list/SiteRegisterTable";
import { SiteRegisterPagination } from "./list/SiteRegisterPagination";
import { exportSiteRegistersToExcel } from "@/utils/exportUtils";

interface SiteRegisterListProps {
  searchTerm: string;
  onEdit: (siteRegister: any) => void;
  setSearchTerm: (term: string) => void;
}

export function SiteRegisterList({ searchTerm, onEdit, setSearchTerm }: SiteRegisterListProps) {
  const { data: userData } = useUserRole();
  const { toast } = useToast();
  const isRestrictedRole = userData?.role && ["standard", "manager"].includes(userData.role.toLowerCase());
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(
    userData?.location ? {
      id: userData.location.id,
      name: userData.location.full_path.split(' > ').pop() || '',
      full_path: userData.location.full_path,
    } as Location : null
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: locationHierarchy, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locationHierarchy', selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return [];

      const { data, error } = await supabase.rpc('get_location_hierarchy', {
        selected_location_id: selectedLocation.id
      });

      if (error) {
        console.error("Error fetching child locations:", error);
        return [];
      }

      return data;
    },
    enabled: !!selectedLocation
  });

  const { data: siteRegisters, isLoading: isLoadingRegisters, refetch } = useQuery({
    queryKey: ['site-registers', locationHierarchy],
    queryFn: async () => {
      const query = supabase
        .from('site_registers')
        .select(`
          id,
          location_id,
          product_id,
          override_product_name,
          current_stock_level,
          total_qty,
          exact_location,
          storage_conditions,
          max_stock_level,
          uom_id,
          status_id,
          products (
            id,
            product_name,
            unit_size,
            sds_id,
            sds!fk_product_sds (
              dg_class_id,
              dg_class:master_data!sds_dg_class_id_fkey (
                id,
                label
              )
            ),
            uom:master_data!products_uom_id_fkey (
              id,
              label
            )
          ),
          locations (
            id,
            name,
            full_path
          ),
          status:status_lookup (
            id,
            status_name
          )
        `);

      if (locationHierarchy && locationHierarchy.length > 0) {
        const locationIds = locationHierarchy.map(loc => loc.id);
        query.in('location_id', locationIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching site registers:', error);
        throw error;
      }

      console.log('Site registers data:', data); // Debug log
      return data;
    },
    enabled: !isLoadingLocations
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_registers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site register deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting site register:', error);
      toast({
        title: "Error",
        description: "Failed to delete site register",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = (location: Location | null) => {
    console.log('Selected location:', location);
    setSelectedLocation(location);
  };

  const handleExport = () => {
    if (filteredRegisters && filteredRegisters.length > 0) {
      exportSiteRegistersToExcel(filteredRegisters);
      toast({
        title: "Success",
        description: "Site registers exported successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const filteredRegisters = siteRegisters?.filter(register => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (register.products?.product_name?.toLowerCase().includes(searchLower)) ||
      (register.override_product_name?.toLowerCase().includes(searchLower))
    );
  });

  const totalItems = filteredRegisters?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRegisters = filteredRegisters?.slice(startIndex, startIndex + itemsPerPage);

  if (isLoadingLocations || isLoadingRegisters) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <SiteRegisterSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        isRestrictedRole={isRestrictedRole}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />

      <SiteRegisterTable
        registers={paginatedRegisters || []}
        onEdit={onEdit}
        onDelete={handleDelete}
      />

      <SiteRegisterPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
