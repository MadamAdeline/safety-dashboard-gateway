
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SDSLibraryHeader } from "@/components/sds/SDSLibraryHeader";
import { SDSLibrarySearch } from "@/components/sds/SDSLibrarySearch";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import { GlobalSDSSearchDialog } from "@/components/sds/GlobalSDSSearchDialog";
import { SDSRequestDialog } from "@/components/sds/SDSRequestDialog";
import { SDSFilteredList } from "@/components/sds/SDSFilteredList";
import { SDSReadOnlyView } from "@/components/sds/SDSReadOnlyView";
import type { SDS, SDSFilters } from "@/types/sds";

export function SDSLibraryContent() {
  const location = useLocation();
  const showExpiredFilter = location.search === "?filter=expired";
  const { data: userRole, isLoading: isLoadingRole } = useUserRole();
  const isAdmin = userRole?.toLowerCase() === 'administrator';
  const isManager = userRole?.toLowerCase() === 'manager';

  const [filters, setFilters] = useState<SDSFilters>({
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
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'view' | 'new'>('list');
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

  const handleClose = () => {
    setShowNewSDS(false);
    setSelectedSDS(null);
    setViewMode('list');
    queryClient.invalidateQueries({ queryKey: ['sds'] });
  };

  const handleSDSSelect = (sdsInput: SDS | SDS[]) => {
    if (Array.isArray(sdsInput)) {
      toast({
        title: "Success",
        description: `${sdsInput.length} SDS(s) have been added to your library.`,
      });
    } else {
      setSelectedSDS(sdsInput);
      setViewMode('view');
    }
  };

  if (isLoadingRole) {
    return <div>Loading...</div>;
  }

  if (showNewSDS || viewMode === 'edit') {
    return <NewSDSForm onClose={handleClose} initialData={selectedSDS} />;
  }

  if (viewMode === 'view' && selectedSDS) {
    return <SDSReadOnlyView initialData={selectedSDS} onClose={handleClose} />;
  }

  return (
    <div className="space-y-4 max-w-full">
      <SDSLibraryHeader 
        isAdmin={isAdmin}
        onNewSDS={() => {
          setShowNewSDS(true);
          setViewMode('new');
        }}
        onGlobalSearch={() => setShowGlobalSearch(true)}
      />

      <SDSLibrarySearch
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        isAdmin={isAdmin}
        data={sdsData}
      />

      <SDSFilteredList
        sdsData={sdsData}
        filters={filters}
        searchTerm={searchTerm}
        onEdit={(sds: SDS) => {
          setSelectedSDS(sds);
          setViewMode('edit');
        }}
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
  );
}
