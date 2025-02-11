
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StockMovementsHeaderProps {
  onAddClick: () => void;
}

export function StockMovementsHeader({ onAddClick }: StockMovementsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Stock Movements</h3>
      <Button
        onClick={onAddClick}
        className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Movement
      </Button>
    </div>
  );
}
