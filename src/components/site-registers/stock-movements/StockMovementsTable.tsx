
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="w-full table-fixed">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Date</TableHead>
            <TableHead className="w-full">Action</TableHead>
            <TableHead className="w-full">Reason</TableHead>
            <TableHead className="w-full">Quantity</TableHead>
            <TableHead className="w-full">Comments</TableHead>
            <TableHead className="w-full">Updated By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements?.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{format(new Date(movement.movement_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{movement.action}</TableCell>
              <TableCell>{movement.master_data.label}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>{movement.comments}</TableCell>
              <TableCell>{`${movement.users.first_name} ${movement.users.last_name}`}</TableCell>
            </TableRow>
          ))}
          {showAddForm && (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <AddStockMovement
                  siteRegisterId={siteRegisterId}
                  stockReasons={stockReasons}
                  onSuccess={onSuccess}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
