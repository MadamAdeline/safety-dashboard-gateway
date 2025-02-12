
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormFields } from "./UserFormFields";
import { UserFormActions } from "./UserFormActions";
import { useUserMutations } from "@/hooks/use-user-mutations";
import { useToast } from "@/components/ui/use-toast";

interface UserFormProps {
  onClose: () => void;
  initialData?: any | null;
}

export function UserForm({ onClose, initialData }: UserFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    phone_number: initialData?.phone_number || "",
    active: initialData?.active || "active",
    role_id: initialData?.user_roles?.[0]?.role_id || "",
    password: "",
    manager_id: initialData?.manager_id || "",
    location_id: initialData?.location_id || "",
  });

  // Fetch roles
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

  const { createUser, updateUser } = useUserMutations(onClose);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => {
      // If changing to administrator role, clear location_id
      if (field === 'role_id') {
        const selectedRole = roles?.find(role => role.id === value);
        if (selectedRole?.role_name.toLowerCase() === 'administrator') {
          return { ...prev, [field]: value, location_id: '' };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Check required fields
    if (!formData.first_name.trim()) errors.push("First Name");
    if (!formData.last_name.trim()) errors.push("Last Name");
    if (!formData.email.trim()) errors.push("Email");
    if (!initialData && !formData.password.trim()) errors.push("Password");

    // Check if selected role is administrator
    const selectedRole = roles?.find(role => role.id === formData.role_id);
    const isAdmin = selectedRole?.role_name.toLowerCase() === 'administrator';

    // If not admin and location is required
    if (!isAdmin && !formData.location_id) {
      errors.push("Location");
    }

    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in the following required fields: ${errors.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (initialData?.id) {
      updateUser.mutate({ id: initialData.id, data: formData });
    } else {
      createUser.mutate(formData);
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit User" : "New User"}
        </h1>
        <UserFormActions 
          onClose={onClose}
          onSave={handleSave}
          isLoading={createUser.isPending || updateUser.isPending}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserFormFields
          formData={formData}
          roles={roles}
          isEditing={!!initialData}
          onChange={handleFieldChange}
        />
      </div>
    </div>
  );
}
