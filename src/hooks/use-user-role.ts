
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  location_id: string | null;
  user_roles: {
    role_id: string;
    roles: {
      role_name: string;
    };
  }[];
}

export function useUserRole() {
  return useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) return { role: null, locationId: null };

      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          id,
          location_id,
          user_roles (
            role_id,
            roles (
              role_name
            )
          )
        `)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role and location:', error);
        return { role: null, locationId: null };
      }

      console.log('Fetched user data:', userData);

      return {
        role: userData?.user_roles?.[0]?.roles?.role_name || null,
        locationId: userData?.location_id || null
      };
    }
  });
}
