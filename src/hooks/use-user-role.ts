
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  return useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) return null;

      const { data: roleData, error } = await supabase
        .from('users')
        .select(`
          id,
          user_roles (
            role_id,
            roles (
              role_name
            )
          )
        `)
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return roleData?.user_roles?.[0]?.roles?.role_name || null;
    }
  });
}
