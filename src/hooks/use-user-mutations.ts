
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { UserStatus } from "@/types/user";

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  active: UserStatus;
  password?: string;
  role_id?: string;
  manager_id?: string | null;
  location_id?: string | null;
}

export function useUserMutations(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (data: UserData) => {
      console.log('Creating user with data:', data);
      
      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          active: data.active,
          password: data.password,
          manager_id: data.manager_id || null,
          location_id: data.location_id || null
        })
        .select()
        .single();

      if (userError) throw userError;

      // Assign role if provided
      if (data.role_id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userData.id,
            role_id: data.role_id,
          });

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
      onSuccess();
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

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserData }) => {
      console.log('Updating user with data:', data);
      
      const updateData: Partial<UserData> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        active: data.active,
        manager_id: data.manager_id || null,
        location_id: data.location_id || null
      };
      
      if (data.password) {
        updateData.password = data.password;
      }

      console.log('Final update data:', updateData);

      // Update user
      const { error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (userError) throw userError;

      // Update role if provided
      if (data.role_id) {
        // Delete existing role
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        if (deleteError) throw deleteError;

        // Add new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: id,
            role_id: data.role_id,
          });

        if (roleError) throw roleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User has been updated successfully"
      });
      onSuccess();
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

  return {
    createUser,
    updateUser,
  };
}
