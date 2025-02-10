import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SDSList } from "@/components/sds/SDSList";
import { SDSFilters } from "@/components/sds/SDSFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import { GlobalSDSSearchDialog } from "@/components/sds/GlobalSDSSearchDialog";
import { SDSActions } from "@/components/sds/SDSActions";
import type { SDS, SDSFilters as SDSFiltersType } from "@/types/sds";
import { SDSRequestDialog } from "@/components/sds/SDSRequestDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/use-user-role";
import { AccessDeniedDialog } from "@/components/auth/AccessDeniedDialog";

export default function SDSLibrary() {
  const location = useLocation();
  const showExpiredFilter = location.search === "?filter=expired";
  const { data: userRole, isLoading: isLoadingRole } = useUserRole();
  console.log('Current user role:', userRole); // Debug log
  const isAdmin = userRole === 'administrator';
  console.log('Is admin:', isAdmin); // Debug log

  const [filters, setFilters] = useState<SDSFiltersType>({
    search: "",
    dateField: showExpiredFilter ? "expiryDate" : null,
    dateType: showExpiredFilter ? "before" : null,
    dateFrom: showExpiredFilter ? new Date().toISOString().split('T')[0] : "",
    dateTo: "",
    status: [],
    dgClass: [],
    isDG: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showNewSDS, setShowNewSDS] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedSDS, setSelectedSDS] = useState<SDS | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sdsData = [], isLoading } = useQuery({
    queryKey: ['sds'],
    queryFn: async () => {
      console.log('Fetching SDS data from Supabase');
      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!sds_supplier_id_fkey(supplier_name),
          status:status_lookup!inner(status_name),
          dg_class:master_data!sds_dg_class_id_fkey(id, label),
          subsidiary_dg_class:master_data!sds_subsidiary_dg_class_id_fkey(id, label),
          packing_group:master_data!sds_packing_group_id_fkey(id, label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey(id, label)
        `);

      if (error) {
        console.error('Error fetching SDS:', error);
        throw error;
      }

      console.log('Retrieved SDS data:', data);

      return data.map(item => ({
        id: item.id,
        productName: item.product_name,
        productId: item.product_id,
        isDG: item.is_dg,
        supplier: item.suppliers?.supplier_name || 'Unknown',
        supplierId: item.supplier_id,
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        dgClassId: item.dg_class_id,
        dgClass: item.dg_class,
        subsidiaryDgClassId: item.subsidiary_dg_class_id,
        subsidiaryDgClass: item.subsidiary_dg_class,
        packingGroupId: item.packing_group_id,
        packingGroup: item.packing_group,
        dgSubDivisionId: item.dg_subdivision_id,
        dgSubDivision: item.dg_subdivision,
        status: item.status.status_name as 'ACTIVE' | 'INACTIVE' | 'REQUESTED',
        sdsSource: item.source,
        source: item.source,
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        currentFileSize: item.current_file_size,
        currentContentType: item.current_content_type,
        unNumber: item.un_number,
        unProperShippingName: item.un_proper_shipping_name,
        hazchemCode: item.hazchem_code,
        otherNames: item.other_names,
        emergencyPhone: item.emergency_phone,
        revisionDate: item.revision_date,
        requestSupplierName: item.request_supplier_name,
        requestSupplierDetails: item.request_supplier_details,
        requestInformation: item.request_information,
        requestDate: item.request_date,
        requestedBy: item.requested_by
      }));
    }
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your SDS data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sds'] });
    toast({
      title: "Refreshing Data",
      description: "Updating the SDS list..."
    });
  };

  const handleEdit = (sds: SDS) => {
    console.log("Editing SDS with data:", sds);
    setSelectedSDS(sds);
    setShowNewSDS(true);
  };

  const handleClose = () => {
    setShowNewSDS(false);
    setSelectedSDS(null);
    queryClient.invalidateQueries({ queryKey: ['sds'] });
  };

  const handleSDSSelect = (sdsInput: SDS | SDS[]) => {
    console.log("Handling SDS selection:", sdsInput);
    
    if (Array.isArray(sdsInput)) {
      toast({
        title: "Success",
        description: `${sdsInput.length} SDS(s) have been added to your library.`,
      });
    } else {
      setSelectedSDS(sdsInput);
      setSearchTerm(sdsInput.productName);
    }
  };

  if (isLoadingRole) {
    return <div>Loading...</div>;
  }

  if (showNewSDS) {
    return (
      <NewSDSForm 
        onClose={handleClose} 
        initialData={selectedSDS} 
        readOnly={!isAdmin} 
      />
    );
  }

  // Filter the data based on all criteria including expiry date
  const filteredData = sdsData.filter((item) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Apply expiry date filter if coming from dashboard
    if (showExpiredFilter && item.expiryDate) {
      if (item.expiryDate > today) {
        return false;
      }
    }

    // Apply search filter across all text fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.productName?.toLowerCase().includes(searchLower) ?? false) ||
        (item.productId?.toLowerCase().includes(searchLower) ?? false) ||
        (item.supplier?.toLowerCase().includes(searchLower) ?? false) ||
        (item.status?.toLowerCase().includes(searchLower) ?? false) ||
        (item.unNumber?.toLowerCase().includes(searchLower) ?? false) ||
        (item.unProperShippingName?.toLowerCase().includes(searchLower) ?? false) ||
        (item.hazchemCode?.toLowerCase().includes(searchLower) ?? false) ||
        (item.otherNames?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">SDS Library</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button 
                  onClick={() => setShowGlobalSearch(true)}
                  className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> SDS From Global Library
                </Button>
                <Button 
                  onClick={() => setShowNewSDS(true)}
                  className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> New SDS
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search SDS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <SDSActions 
              onToggleFilters={() => setShowFilters(!showFilters)}
              onExport={handleExport}
              onRefresh={handleRefresh}
              data={filteredData}
              allowDelete={isAdmin}
            />
          </div>
          
          {showFilters && (
            <SDSFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
        
        <SDSList 
          data={filteredData} 
          filters={filters} 
          onEdit={handleEdit}
          allowDelete={isAdmin}
        />

        <GlobalSDSSearchDialog 
          open={showGlobalSearch} 
          onOpenChange={setShowGlobalSearch}
          onSDSSelect={handleSDSSelect}
        />
        
        <SDSRequestDialog 
          open={showRequestDialog} 
          onOpenChange={setShowRequestDialog}
        />
      </div>
    </DashboardLayout>
  );
}
