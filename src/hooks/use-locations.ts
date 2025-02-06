import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Location } from "@/types/location";

export const useLocations = () => {
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      console.log('Fetching locations from Supabase...');
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          type_id,
          parent_location_id,
          status_id,
          coordinates,
          master_data (id, label),
          status_lookup (id, status_name)
        `);

      if (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: "Error",
          description: "Failed to load locations",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Locations fetched:', data);
      return data || [];
    },
  });

  const createLocation = useMutation({
    mutationFn: async (newLocation: Omit<Location, 'id'>) => {
      console.log('Creating new location:', newLocation);
      const { data, error } = await supabase
        .from('locations')
        .insert([newLocation])
        .select()
        .single();

      if (error) {
        console.error('Error creating location:', error);
        toast({
          title: "Error",
          description: "Failed to create location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
    },
  });

  const updateLocation = useMutation({
    mutationFn: async (location: Location) => {
      console.log('Updating location:', location);
      const { data, error } = await supabase
        .from('locations')
        .update(location)
        .eq('id', location.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        toast({
          title: "Error",
          description: "Failed to update location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting location:', id);
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        toast({
          title: "Error",
          description: "Failed to delete location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
  });

  return {
    locations,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
  };
};