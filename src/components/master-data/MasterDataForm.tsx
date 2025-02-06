import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MasterData } from "@/types/masterData";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMasterData, updateMasterData } from "@/services/masterData";

interface MasterDataFormProps {
  onClose: () => void;
  initialData?: MasterData | null;
}

export function MasterDataForm({ onClose, initialData }: MasterDataFormProps) {
  const [formData, setFormData] = useState<Partial<MasterData>>(
    initialData || {
      category: "",
      label: "",
      status: "ACTIVE",
      sort_order: 0,
    }
  );
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createMasterData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterData'] });
      toast({
        title: "Success",
        description: "Master data has been created successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating master data:', error);
      toast({
        title: "Error",
        description: "Failed to create master data",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MasterData> }) => 
      updateMasterData(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterData'] });
      toast({
        title: "Success",
        description: "Master data has been updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating master data:', error);
      toast({
        title: "Error",
        description: "Failed to update master data",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: formData });
    } else {
      createMutation.mutate(formData as Omit<MasterData, 'id' | 'created_at' | 'updated_at'>);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Master Data" : "New Master Data"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "ACTIVE" | "INACTIVE" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}