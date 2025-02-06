import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Location, LocationType, LocationStatus } from "@/types/location";
import { LocationMap } from "./LocationMap";
import { useLocations } from "@/hooks/use-locations";
import { supabase } from "@/integrations/supabase/client";

interface LocationFormProps {
  onClose: () => void;
  initialData?: Location | null;
}

export function LocationForm({ onClose, initialData }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    type: (initialData?.master_data?.label as LocationType) ?? "Region",
    typeId: initialData?.type_id ?? "",
    parentLocationId: initialData?.parent_location_id ?? null,
    status: initialData?.status_id === 1 ? "ACTIVE" as LocationStatus : "INACTIVE" as LocationStatus,
    coordinates: initialData?.coordinates ?? { lat: -37.8136, lng: 144.9631 }
  });

  const [availableLocations, setAvailableLocations] = useState<Array<{
    id: string;
    name: string;
    master_data: { label: string };
  }>>([]);

  const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);

  const { createLocation, updateLocation } = useLocations();
  const { toast } = useToast();

  // Fetch location types from master_data
  useEffect(() => {
    const fetchLocationTypes = async () => {
      console.log('Fetching location types from master_data...');
      const { data, error } = await supabase
        .from('master_data')
        .select('label')
        .eq('category', 'LOCATION_TYPE')
        .eq('status', 'ACTIVE');

      if (error) {
        console.error('Error fetching location types:', error);
        return;
      }

      const types = data.map(item => item.label as LocationType);
      console.log('Location types fetched:', types);
      setLocationTypes(types);
    };

    fetchLocationTypes();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      console.log('Fetching available locations...');
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, master_data!inner(label)')
        .order('name');

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      console.log('Available locations fetched:', data);
      setAvailableLocations(data || []);
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchTypeId = async () => {
      console.log('Fetching type ID for:', formData.type);
      const { data, error } = await supabase
        .from('master_data')
        .select('id')
        .eq('category', 'LOCATION_TYPE')
        .eq('label', formData.type)
        .single();

      if (error) {
        console.error('Error fetching type_id:', error);
        return;
      }

      console.log('Type ID fetched:', data);
      if (data) {
        setFormData(prev => ({ ...prev, typeId: data.id }));
      }
    };

    fetchTypeId();
  }, [formData.type]);

  const handleSave = async () => {
    console.log('Saving location with data:', formData);
    try {
      const locationData = {
        name: formData.name,
        type_id: formData.typeId,
        parent_location_id: formData.parentLocationId === "none" ? null : formData.parentLocationId,
        status_id: formData.status === 'ACTIVE' ? 1 : 2,
        coordinates: formData.coordinates,
      };

      if (initialData?.id) {
        console.log('Updating existing location:', initialData.id);
        await updateLocation.mutateAsync({
          id: initialData.id,
          ...locationData,
        });
      } else {
        console.log('Creating new location');
        await createLocation.mutateAsync(locationData);
      }

      toast({
        title: "Success",
        description: `Location ${initialData ? 'updated' : 'created'} successfully`,
      });
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Location" : "New Location"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
              onClick={handleSave}
            >
              Save
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter location name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Location Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: LocationType) => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentLocation">Parent Location</Label>
                <Select 
                  value={formData.parentLocationId ?? "none"}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, parentLocationId: value === "none" ? null : value }))
                  }
                >
                  <SelectTrigger id="parentLocation">
                    <SelectValue placeholder="Select parent location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.master_data.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value: LocationStatus) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>GPS Location *</Label>
              <LocationMap 
                coordinates={formData.coordinates}
                onCoordinatesChange={(coords) => 
                  setFormData(prev => ({ ...prev, coordinates: coords }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}