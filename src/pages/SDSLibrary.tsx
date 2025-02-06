import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SDSList } from "@/components/sds/SDSList";
import { SDSFilters } from "@/components/sds/SDSFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import { GlobalSDSSearchDialog } from "@/components/sds/GlobalSDSSearchDialog";
import { SDSSearch } from "@/components/sds/SDSSearch";
import { SDSActions } from "@/components/sds/SDSActions";
import type { SDS, SDSFilters as SDSFiltersType } from "@/types/sds";
import { SDSRequestDialog } from "@/components/sds/SDSRequestDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function SDSLibrary() {
  const [filters, setFilters] = useState<SDSFiltersType>({
    search: "",
    dateField: null,
    dateType: null,
    dateFrom: "",
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
          suppliers!fk_supplier (supplier_name),
          status:status_lookup!fk_status (status_name),
          dg_class:master_data!sds_dg_class_id_fkey (label),
          subsidiary_dg_class:master_data!sds_subsidiary_dg_class_id_fkey (label),
          packing_group:master_data!sds_packing_group_id_fkey (label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (label)
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
        supplierId: item.supplier_id, // Add this line to include supplier_id
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        dgClassId: item.dg_class_id,
        subsidiaryDgClassId: item.subsidiary_dg_class_id,
        packingGroupId: item.packing_group_id,
        dgSubDivisionId: item.dg_subdivision_id,
        status: item.status?.status_name as 'ACTIVE' | 'INACTIVE' | 'REQUESTED',
        sdsSource: 'Customer' as const,
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        currentFileSize: item.current_file_size,
        currentContentType: item.current_content_type,
        unNumber: item.un_number,
        unProperShippingName: item.un_proper_shipping_name,
        hazchemCode: item.hazchem_code,
        otherNames: item.other_names,
        emergencyPhone: item.emergency_phone,
        revisionDate: item.revision_date
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
    setSelectedSDS(sds);
    setShowNewSDS(true);
  };

  const handleClose = () => {
    setShowNewSDS(false);
    setSelectedSDS(null);
    queryClient.invalidateQueries({ queryKey: ['sds'] });
  };

  const handleSDSSelect = (selectedSDS: SDS[]) => {
    console.log("Selected SDS:", selectedSDS);
    toast({
      title: "Success",
      description: `${selectedSDS.length} SDS(s) have been added to your library.`,
    });
  };

  if (showNewSDS) {
    return <NewSDSForm onClose={handleClose} initialData={selectedSDS} />;
  }

  // Filter the data based on search criteria
  const filteredData = sdsData.filter((item) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        item.productName.toLowerCase().includes(searchTerm) ||
        item.productId.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm)
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
            <Button 
              onClick={() => setShowGlobalSearch(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> SDS From Global Library
            </Button>
            <Button 
              onClick={() => setShowNewSDS(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            >
              <Plus className="mr-2 h-4 w-4" /> New SDS
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <SDSSearch 
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
            />
            <SDSActions 
              onToggleFilters={() => setShowFilters(!showFilters)}
              onExport={handleExport}
              onRefresh={handleRefresh}
              data={filteredData}
            />
          </div>
          
          {showFilters && (
            <SDSFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
        
        <SDSList 
          data={sdsData} 
          filters={filters} 
          onEdit={handleEdit}
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