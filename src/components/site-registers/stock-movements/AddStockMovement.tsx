
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddStockMovementProps {
  siteRegisterId: string;
  stockReasons: Array<{ id: string; label: string }>;
  onSuccess: () => void;
}

export function AddStockMovement({ siteRegisterId, stockReasons, onSuccess }: AddStockMovementProps) {
  const { toast } = useToast();
  const [newMovement, setNewMovement] = useState({
    movement_date: new Date().toISOString().split('T')[0],
    action: '',
    reason_id: '',
    quantity: '',
    comments: '',
  });

  const handleAddNew = async () => {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
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
        updated_by: user.id, // Set the updated_by field to the current user's ID
      });

    if (error) {
      console.error('Error adding stock movement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add stock movement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Stock movement added successfully",
    });

    setNewMovement({
      movement_date: new Date().toISOString().split('T')[0],
      action: '',
      reason_id: '',
      quantity: '',
      comments: '',
    });
    onSuccess();
  };

  return (
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
      </div>
    </div>
  );
}

