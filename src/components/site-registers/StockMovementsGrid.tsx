
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovementsHeader } from "./stock-movements/StockMovementsHeader";
import { StockMovementsTable } from "./stock-movements/StockMovementsTable";

interface StockMovementsGridProps {
  siteRegisterId: string;
  onStockUpdate?: () => void;  // Added optional onStockUpdate prop
}

export function StockMovementsGrid({ siteRegisterId, onStockUpdate }: StockMovementsGridProps) {
  console.log('StockMovementsGrid rendering with siteRegisterId:', siteRegisterId);
  
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch stock movements
  const { data: stockMovements, refetch, isLoading, error } = useQuery({
    queryKey: ['stockMovements', siteRegisterId],
    queryFn: async () => {
      console.log('Fetching stock movements for siteRegisterId:', siteRegisterId);
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          master_data (label),
          users (first_name, last_name)
        `)
        .eq('site_register_id', siteRegisterId)
        .order('movement_date', { ascending: false });

      if (error) {
        console.error('Error fetching stock movements:', error);
        throw error;
      }
      console.log('Fetched stock movements:', data);
      return data;
    },
    enabled: !!siteRegisterId,
  });

  // Fetch stock reasons from master_data
  const { data: stockReasons } = useQuery({
    queryKey: ['stockReasons'],
    queryFn: async () => {
      console.log('Fetching stock reasons');
      const { data, error } = await supabase
        .from('master_data')
        .select('id, label')
        .eq('category', 'STOCK_REASON')
        .eq('status', 'ACTIVE')
        .order('sort_order');

      if (error) {
        console.error('Error fetching stock reasons:', error);
        throw error;
      }
      console.log('Fetched stock reasons:', data);
      return data;
    },
  });

  if (!siteRegisterId) {
    console.log('No siteRegisterId provided, not rendering grid');
    return null;
  }

  if (isLoading) {
    console.log('Stock movements are loading...');
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error in StockMovementsGrid:', error);
    return <div>Error loading stock movements</div>;
  }

  return (
    <div className="space-y-4">
      <StockMovementsHeader onAddClick={() => setIsAddingNew(true)} />

      {stockMovements && stockReasons && (
        <StockMovementsTable 
          movements={stockMovements}
          showAddForm={isAddingNew}
          siteRegisterId={siteRegisterId}
          stockReasons={stockReasons}
          onSuccess={() => {
            setIsAddingNew(false);
            refetch();
            if (onStockUpdate) {
              onStockUpdate();
            }
          }}
        />
      )}
    </div>
  );
}
