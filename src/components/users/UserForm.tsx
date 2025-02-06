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
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserFormProps {
  onClose: () => void;
  initialData?: any | null;
}

export function UserForm({ onClose, initialData }: UserFormProps) {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    phone_number: initialData?.phone_number || "",
    active: initialData?.active || "active",
    role_id: initialData?.user_roles?.[0]?.role_id || "",
    password: "", // Added password field
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          active: data.active,
          password: data.password, // Include password in creation
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Assign role
      if (data.role_id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: userData.id,
            role_id: data.role_id,
          }]);

        if (roleError) throw roleError;
      }

      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User has been created successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        active: data.active,
      };
      
      // Only include password in update if it was changed
      if (data.password) {
        updateData.password = data.password;
      }

      // Update user
      const { error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', initialData.id);

      if (userError) throw userError;

      // Update role if changed
      if (data.role_id !== initialData?.user_roles?.[0]?.role_id) {
        // Delete existing role
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', initialData.id);

        if (deleteError) throw deleteError;

        // Add new role
        if (data.role_id) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: initialData.id,
              role_id: data.role_id,
            }]);

          if (roleError) throw roleError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User has been updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (initialData?.id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit User" : "New User"}
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
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={initialData ? "Leave blank to keep current password" : "Enter password"}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role_id}
              onValueChange={(value) => setFormData({ ...formData, role_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.active}
              onValueChange={(value) => setFormData({ ...formData, active: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}