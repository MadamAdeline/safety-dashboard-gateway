
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlobalSDSSearchDialog } from "@/components/sds/GlobalSDSSearchDialog";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import type { SDS } from "@/types/sds";

interface SDSSearchStepProps {
  supplier: Supplier | null;
  onSDSSelect: (sds: SDS) => void;
  selectedSDS: SDS | null;
}

export function SDSSearchStep({ supplier, onSDSSelect, selectedSDS }: SDSSearchStepProps) {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [search, setSearch] = useState("");

  const { data: sdsList = [] } = useQuery({
    queryKey: ['sds', search],
    queryFn: async () => {
      let query = supabase
        .from('sds')
        .select(`
          *,
          suppliers!inner(supplier_name),
          dg_class:master_data!sds_dg_class_id_fkey (id, label),
          subsidiary_dg_class:master_data!sds_subsidiary_dg_class_id_fkey (id, label),
          packing_group:master_data!sds_packing_group_id_fkey (id, label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (id, label)
        `)
        .eq('status_id', 1);

      if (search) {
        query = query
          .or(`product_name.ilike.%${search}%`)
          .or(`product_id.ilike.%${search}%`)
          .or(`suppliers.supplier_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        productName: item.product_name,
        productId: item.product_id,
        supplier: item.suppliers?.supplier_name || "",
        supplierId: item.supplier_id,
        isDG: item.is_dg,
        status: "ACTIVE" as const,
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        currentFileSize: item.current_file_size,
        currentContentType: item.current_content_type,
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        revisionDate: item.revision_date,
        dgClassId: item.dg_class_id,
        dgClass: item.dg_class,
        subsidiaryDgClassId: item.subsidiary_dg_class_id,
        subsidiaryDgClass: item.subsidiary_dg_class,
        packingGroupId: item.packing_group_id,
        packingGroup: item.packing_group,
        dgSubDivisionId: item.dg_subdivision_id,
        dgSubDivision: item.dg_subdivision,
        sdsSource: item.source,
        source: item.source,
        unNumber: item.un_number,
        unProperShippingName: item.un_proper_shipping_name,
        hazchemCode: item.hazchem_code,
        otherNames: item.other_names,
        emergencyPhone: item.emergency_phone,
        requestSupplierName: item.request_supplier_name,
        requestSupplierDetails: item.request_supplier_details,
        requestInformation: item.request_information,
        requestDate: item.request_date,
        requestedBy: item.requested_by
      }));
    }
  });

  if (!supplier) return null;

  if (showNewForm) {
    return (
      <NewSDSForm 
        onClose={() => setShowNewForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Step 2: Find or Create SDS</h3>
        <p className="text-gray-600">
          Search for an existing SDS in our global library or create a new one.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search SDS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New SDS
        </Button>
        <Button
          onClick={() => setShowGlobalSearch(true)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> Add from Global Library
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
          <div className="font-semibold">Product Name</div>
          <div className="font-semibold">Product Code</div>
          <div className="font-semibold">Supplier</div>
          <div className="font-semibold">Expiry Date</div>
        </div>
        <div className="divide-y">
          {sdsList.map((sds) => (
            <div 
              key={sds.id}
              className={`grid grid-cols-4 gap-4 p-4 cursor-pointer hover:bg-gray-50 ${
                selectedSDS?.id === sds.id ? 'bg-dgxprt-purple/10' : ''
              }`}
              onClick={() => onSDSSelect(sds)}
            >
              <div>{sds.productName}</div>
              <div>{sds.productId}</div>
              <div>{sds.supplier}</div>
              <div>{sds.expiryDate}</div>
            </div>
          ))}
        </div>
      </div>

      <GlobalSDSSearchDialog
        open={showGlobalSearch}
        onOpenChange={setShowGlobalSearch}
        onSDSSelect={(sds) => {
          if (Array.isArray(sds)) {
            onSDSSelect(sds[0]);
          } else {
            onSDSSelect(sds);
          }
          setShowGlobalSearch(false);
        }}
      />
    </div>
  );
}
