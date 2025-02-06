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
import { useQuery } from "@tanstack/react-query";
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

  const { data: sdsData = [], isLoading } = useQuery({
    queryKey: ['sds'],
    queryFn: async () => {
      console.log('Fetching SDS data from Supabase');
      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!sds_supplier_id_fkey (supplier_name),
          status:status_lookup!sds_status_id_fkey (status_name)
        `);

      if (error) {
        console.error('Error fetching SDS:', error);
        throw error;
      }

      return data.map(item => ({
        productName: item.product_name,
        productId: item.product_id,
        isDG: item.is_dg,
        supplier: item.suppliers?.supplier_name || 'Unknown',
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        dgClass: item.dg_class,
        status: item.status?.status_name as 'ACTIVE' | 'INACTIVE' | 'REQUESTED',
        sdsSource: 'Customer' as const
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