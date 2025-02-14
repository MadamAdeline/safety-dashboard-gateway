
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
import type { Supplier } from "@/types/supplier";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupplier, updateSupplier } from "@/services/suppliers";

interface SupplierFormProps {
  onClose: () => void;
  initialData?: Supplier | null;
}

export function SupplierForm({ onClose, initialData }: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    initialData || {
      supplier_name: "",
      contact_person: "",
      email: "",
      phone_number: "",
      address: "",
      status: "ACTIVE",
    }
  );
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateForm = () => {
    const requiredFields = ['supplier_name', 'contact_person', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof Supplier]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields: Supplier Name, Contact Person, and Email Address",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Success",
        description: "Supplier has been created successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) => 
      updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Success",
        description: "Supplier has been updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!validateForm()) return;

    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: formData });
    } else {
      createMutation.mutate(formData as Omit<Supplier, 'id'>);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Supplier" : "New Supplier"}
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
              <Label htmlFor="supplier_name" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Supplier Name
              </Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Contact Person
              </Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
