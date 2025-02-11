
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StockMovementsGridProps {
  siteRegisterId: string;
}

export function StockMovementsGrid({ siteRegisterId }: StockMovementsGridProps) {
  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMovement, setNewMovement] = useState({
    movement_date: new Date().toISOString().split('T')[0],
    action: '',
    reason_id: '',
    quantity: '',
    comments: '',
  });

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

  const handleAddNew = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    // Get user ID from email
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!userData) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('stock_movements')
      .insert({
        site_register_id: siteRegisterId,
        movement_date: new Date(newMovement.movement_date).toISOString(),
        action: newMovement.action as any,
        reason_id: newMovement.reason_id,
        quantity: parseFloat(newMovement.quantity),
        comments: newMovement.comments,
        updated_by: userData.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add stock movement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Stock movement added successfully",
    });

    setIsAddingNew(false);
    setNewMovement({
      movement_date: new Date().toISOString().split('T')[0],
      action: '',
      reason_id: '',
      quantity: '',
      comments: '',
    });
    refetch();
  };

  if (!siteRegisterId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stock Movements</h3>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Movement
        </Button>
      </div>

      {isAddingNew && (
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
          <Input
            type="date"
            value={newMovement.movement_date}
            onChange={(e) => setNewMovement({ ...newMovement, movement_date: e.target.value })}
          />
          <Select
            value={newMovement.action}
            onValueChange={(value) => setNewMovement({ ...newMovement, action: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCREASE">Increase</SelectItem>
              <SelectItem value="DECREASE">Decrease</SelectItem>
              <SelectItem value="OVERRIDE">Override</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={newMovement.reason_id}
            onValueChange={(value) => setNewMovement({ ...newMovement, reason_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              {stockReasons?.map((reason) => (
                <SelectItem key={reason.id} value={reason.id}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Quantity"
            value={newMovement.quantity}
            onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
          />
          <Input
            placeholder="Comments"
            value={newMovement.comments}
            onChange={(e) => setNewMovement({ ...newMovement, comments: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddNew}>Save</Button>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Updated By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockMovements?.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{format(new Date(movement.movement_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{movement.action}</TableCell>
              <TableCell>{movement.master_data.label}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>{movement.comments}</TableCell>
              <TableCell>{`${movement.users.first_name} ${movement.users.last_name}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
