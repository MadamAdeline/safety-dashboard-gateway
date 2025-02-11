
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  id: string;
  full_path: string;
}

interface UserRoleResponse {
  role: string | null;
  location: Location | null;
}

export function useUserRole() {
  return useQuery<UserRoleResponse>({
    queryKey: ['userRole'],
    queryFn: async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return { role: null, location: null };

      // Fetch user role and assigned location
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          id,
          user_roles (
            role_id,
            roles (
              role_name
            )
          ),
          locations (
            id,
            full_path
          )
        `)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role and location:', error);
        return { role: null, location: null };
      }

      // Extract role
      const role = userData?.user_roles?.[0]?.roles?.role_name || null;
      const location = userData?.locations || null;

      // Only return location for "manager" and "standard" roles
      if (role && !["manager", "standard"].includes(role.toLowerCase())) {
        return { role, location: null };
      }

      return { role, location };
    }
  });
}
