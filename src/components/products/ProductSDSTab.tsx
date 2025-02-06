import { Label } from "@/components/ui/label";
import { SDSSearch } from "@/components/sds/SDSSearch";
import type { SDS } from "@/types/sds";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductSDSTabProps {
  sdsId: string | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
}

export function ProductSDSTab({ sdsId, onSDSSelect }: ProductSDSTabProps) {
  const [initialSDS, setInitialSDS] = useState<SDS | null>(null);

  useEffect(() => {
    const fetchInitialSDS = async () => {
      if (!sdsId) return;
      
      console.log('Fetching initial SDS data for ID:', sdsId);
      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!fk_supplier (supplier_name)
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
          sdsSource: 'Customer'
        };
        setInitialSDS(formattedSDS);
      }
    };

    fetchInitialSDS();
  }, [sdsId]);

  return (
    <div className="space-y-4 w-full">
      <Label>Associated SDS</Label>
      <SDSSearch
        selectedSdsId={sdsId}
        initialSDS={initialSDS}
        onSDSSelect={onSDSSelect}
        className="w-full"
      />
    </div>
  );
}