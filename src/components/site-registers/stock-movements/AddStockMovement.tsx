
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch user ID based on email in localStorage
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No user email found');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    }
  });

  const handleAddNew = async () => {
    try {
      if (!userData?.id) {
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
    } catch (error) {
      console.error('Error adding stock movement:', error);
      toast({
        title: "Error",
        description: "Failed to add stock movement. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-2">
      <div className="flex items-center">
        <Input
          type="date"
          value={newMovement.movement_date}
          onChange={(e) => setNewMovement({ ...newMovement, movement_date: e.target.value })}
          className="w-full"
        />
      </div>
      <div className="flex items-center">
        <Select
          value={newMovement.action}
          onValueChange={(value) => setNewMovement({ ...newMovement, action: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCREASE">Increase</SelectItem>
            <SelectItem value="DECREASE">Decrease</SelectItem>
            <SelectItem value="OVERRIDE">Override</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center">
        <Select
          value={newMovement.reason_id}
          onValueChange={(value) => setNewMovement({ ...newMovement, reason_id: value })}
        >
          <SelectTrigger className="w-full">
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
      </div>
      <div className="flex items-center">
        <Input
          type="number"
          placeholder="Quantity"
          value={newMovement.quantity}
          onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
          className="w-full"
        />
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Comments"
          value={newMovement.comments}
          onChange={(e) => setNewMovement({ ...newMovement, comments: e.target.value })}
          className="w-full"
        />
      </div>
      <div className="flex items-center">
        <Button onClick={handleAddNew} className="w-full">Save</Button>
      </div>
    </div>
  );
}
