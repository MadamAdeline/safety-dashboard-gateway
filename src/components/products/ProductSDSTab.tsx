import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SDSSearch } from "@/components/sds/SDSSearch";
import { SDSPreview } from "@/components/sds/SDSPreview";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import type { SDS } from "@/types/sds";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ProductSDSTabProps {
  sdsId: string | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
}

export function ProductSDSTab({ sdsId, onSDSSelect }: ProductSDSTabProps) {
  const [initialSDS, setInitialSDS] = useState<SDS | null>(null);
  const [showNewSDS, setShowNewSDS] = useState(false);

  useEffect(() => {
    const fetchInitialSDS = async () => {
      if (!sdsId) return;
      
      console.log('Fetching initial SDS data for ID:', sdsId);
      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!fk_supplier (supplier_name),
          dg_class:master_data!sds_dg_class_id_fkey (label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (label),
          packing_group:master_data!sds_packing_group_id_fkey (label)
        `)
        .eq('id', sdsId)
        .single();

      if (error) {
        console.error('Error fetching initial SDS:', error);
        return;
      }

      if (data) {
        console.log('Found initial SDS:', data);
        const formattedSDS: SDS = {
          id: data.id,
          productName: data.product_name,
          productId: data.product_id,
          isDG: data.is_dg,
          supplier: data.suppliers?.supplier_name || 'Unknown',
          supplierId: data.supplier_id,
          issueDate: data.issue_date,
          expiryDate: data.expiry_date,
          status: data.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
          sdsSource: 'Customer',
          currentFilePath: data.current_file_path,
          currentFileName: data.current_file_name,
          dgClass: data.dg_class ? {
            id: data.dg_class_id,
            label: data.dg_class.label
          } : undefined,
          dgSubDivision: data.dg_subdivision ? {
            id: data.dg_subdivision_id,
            label: data.dg_subdivision.label
          } : undefined,
          packingGroup: data.packing_group ? {
            id: data.packing_group_id,
            label: data.packing_group.label
          } : undefined
        };
        setInitialSDS(formattedSDS);
      }
    };

    fetchInitialSDS();
  }, [sdsId]);

  const handleNewSDSClose = () => {
    setShowNewSDS(false);
    // Refresh the SDS data after closing the form
    if (sdsId) {
      const fetchInitialSDS = async () => {
        const { data, error } = await supabase
          .from('sds')
          .select(`
            *,
            suppliers!fk_supplier (supplier_name),
            dg_class:master_data!sds_dg_class_id_fkey (label),
            dg_subdivision:master_data!sds_dg_subdivision_id_fkey (label),
            packing_group:master_data!sds_packing_group_id_fkey (label)
          `)
          .eq('id', sdsId)
          .single();

        if (error) {
          console.error('Error refreshing SDS data:', error);
          return;
        }

        if (data) {
          console.log('Refreshed SDS data:', data);
          const formattedSDS: SDS = {
            id: data.id,
            productName: data.product_name,
            productId: data.product_id,
            isDG: data.is_dg,
            supplier: data.suppliers?.supplier_name || 'Unknown',
            supplierId: data.supplier_id,
            issueDate: data.issue_date,
            expiryDate: data.expiry_date,
            status: data.status_id === 1 ? 'ACTIVE' : 'INACTIVE',
            sdsSource: 'Customer',
            currentFilePath: data.current_file_path,
            currentFileName: data.current_file_name,
            dgClass: data.dg_class ? {
              id: data.dg_class_id,
              label: data.dg_class.label
            } : undefined,
            dgSubDivision: data.dg_subdivision ? {
              id: data.dg_subdivision_id,
              label: data.dg_subdivision.label
            } : undefined,
            packingGroup: data.packing_group ? {
              id: data.packing_group_id,
              label: data.packing_group.label
            } : undefined
          };
          setInitialSDS(formattedSDS);
        }
      };

      fetchInitialSDS();
    }
  };

  if (showNewSDS) {
    return <NewSDSForm onClose={handleNewSDSClose} />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <Label>Associated SDS</Label>
        <div className="flex gap-2">
          <SDSSearch
            selectedSdsId={sdsId}
            initialSDS={initialSDS}
            onSDSSelect={onSDSSelect}
            className="w-full"
            activeOnly={true}
          />
          {!sdsId && (
            <Button
              onClick={() => setShowNewSDS(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> New SDS
            </Button>
          )}
        </div>
      </div>

      {initialSDS && (
        <>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <Label>SDS Product Code</Label>
              <div className="p-2 bg-white rounded border">{initialSDS.productId}</div>
            </div>
            
            <div className="space-y-2">
              <Label>SDS Expiry Date</Label>
              <div className="p-2 bg-white rounded border">
                {initialSDS.expiryDate ? format(new Date(initialSDS.expiryDate), 'dd/MM/yyyy') : 'N/A'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <div className="p-2 bg-white rounded border">{initialSDS.supplier}</div>
            </div>
            
            <div className="space-y-2">
              <Label>Is Dangerous Goods</Label>
              <div className="p-2 bg-white rounded border">
                {initialSDS.isDG ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>DG Class</Label>
              <div className="p-2 bg-white rounded border">
                {initialSDS.dgClass?.label || 'N/A'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>DG Sub Division</Label>
              <div className="p-2 bg-white rounded border">
                {initialSDS.dgSubDivision?.label || 'N/A'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Packing Group</Label>
              <div className="p-2 bg-white rounded border">
                {initialSDS.packingGroup?.label || 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>SDS Document</Label>
            <SDSPreview
              initialData={initialSDS}
              selectedFile={null}
              onUploadClick={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
}