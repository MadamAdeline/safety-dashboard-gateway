
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserFormFields } from "./UserFormFields";
import { UserFormActions } from "./UserFormActions";
import { useUserMutations } from "@/hooks/use-user-mutations";

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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
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
