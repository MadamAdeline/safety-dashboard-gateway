
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovementsHeader } from "./stock-movements/StockMovementsHeader";
import { AddStockMovement } from "./stock-movements/AddStockMovement";
import { StockMovementsTable } from "./stock-movements/StockMovementsTable";

interface StockMovementsGridProps {
  siteRegisterId: string;
}

export function StockMovementsGrid({ siteRegisterId }: StockMovementsGridProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch stock movements
  const { data: stockMovements, refetch } = useQuery({
    queryKey: ['stockMovements', siteRegisterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          master_data (label),
          users (first_name, last_name)
        `)
        .eq('site_register_id', siteRegisterId)
        .order('movement_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!siteRegisterId,
  });

  // Fetch stock reasons from master_data
  const { data: stockReasons } = useQuery({
    queryKey: ['stockReasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('id, label')
        .eq('category', 'STOCK_REASON')
        .eq('status', 'ACTIVE')
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });

  if (!siteRegisterId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <StockMovementsHeader onAddClick={() => setIsAddingNew(true)} />

      {isAddingNew && stockReasons && (
        <AddStockMovement
          siteRegisterId={siteRegisterId}
          stockReasons={stockReasons}
          onSuccess={() => {
            setIsAddingNew(false);
            refetch();
          }}
        />
      )}

      {stockMovements && <StockMovementsTable movements={stockMovements} />}
    </div>
  );
}
