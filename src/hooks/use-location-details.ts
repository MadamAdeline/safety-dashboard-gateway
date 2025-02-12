
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/types/location";

export function useLocationDetails(locationId: string) {
  return useQuery({
    queryKey: ['location', locationId],
    queryFn: async () => {
      if (!locationId) return null;
      
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          type_id,
          parent_location_id,
          status_id,
          coordinates,
          full_path,
          is_storage_location,
          storage_type_id,
          master_data!type_id (id, label),
          storage_type:master_data!storage_type_id (id, label),
          status_lookup (id, status_name)
        `)
        .eq('id', locationId)
        .single();
      
      if (error) throw error;

      return data ? {
        ...data,
        coordinates: data.coordinates || null,
        parent_location_id: data.parent_location_id || null,
        is_storage_location: data.is_storage_location || false,
        storage_type_id: data.storage_type_id || null,
      } as Location : null;
    },
    enabled: !!locationId
  });
}
