import { format } from "date-fns";
import { Check } from "lucide-react";
import { AddStockMovement } from "./AddStockMovement";

interface StockMovement {
  id: string;
  movement_date: string;
  action: string;
  quantity: number;
  comments: string;
  master_data: {
    label: string;
  };
  users: {
    first_name: string;
    last_name: string;
  };
}

interface StockMovementsTableProps {
  movements: StockMovement[];
  showAddForm?: boolean;
  siteRegisterId: string;
  stockReasons: Array<{ id: string; label: string }>;
  onSuccess?: () => void;
}

export function StockMovementsTable({ 
  movements, 
  showAddForm,
  siteRegisterId,
  stockReasons,
  onSuccess 
}: StockMovementsTableProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 px-4 py-2 font-semibold border-b bg-gray-100">
        <div className="w-full">Date</div>
        <div className="w-full">Action</div>
        <div className="w-full">Reason</div>
        <div className="w-full">Quantity</div>
        <div className="w-full">Comments</div>
        <div className="w-full">Updated By</div>
      </div>

      {movements?.map((movement) => (
        <div key={movement.id} className="grid grid-cols-6 gap-4 px-4 py-2 border-b">
          <div>{format(new Date(movement.movement_date), 'dd/MM/yyyy')}</div>
          <div>{movement.action}</div>
          <div>{movement.master_data.label}</div>
          <div>{movement.quantity}</div>
          <div>{movement.comments}</div>
          <div>{`${movement.users.first_name} ${movement.users.last_name}`}</div>
        </div>
      ))}

      {showAddForm && (
        <AddStockMovement
          siteRegisterId={siteRegisterId}
          stockReasons={stockReasons}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
