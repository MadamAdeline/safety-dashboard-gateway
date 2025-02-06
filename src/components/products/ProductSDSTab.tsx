import { useEffect, useState } from "react";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import type { SDS } from "@/types/sds";
import { supabase } from "@/integrations/supabase/client";
import { SDSSearchSection } from "./sds/SDSSearchSection";
import { SDSDetailsDisplay } from "./sds/SDSDetailsDisplay";

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
    if (sdsId) {
      fetchInitialSDS();
    }
  };

  const fetchInitialSDS = async () => {
    if (!sdsId) return;
    
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

  if (showNewSDS) {
    return (
      <div className="w-full -mx-6">
        <NewSDSForm onClose={handleNewSDSClose} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <SDSSearchSection
        sdsId={sdsId}
        initialSDS={initialSDS}
        onSDSSelect={onSDSSelect}
        onNewSDSClick={() => setShowNewSDS(true)}
      />

      {initialSDS && <SDSDetailsDisplay sds={initialSDS} />}
    </div>
  );
}