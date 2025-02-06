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
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<LocationType>((initialData?.master_data?.label as LocationType) ?? "Region");
  const [typeId, setTypeId] = useState<string>(initialData?.type_id ?? "");
  const [parentLocation, setParentLocation] = useState(initialData?.parent_location_id ?? "");
  const [status, setStatus] = useState<LocationStatus>(initialData?.status_id === 1 ? "ACTIVE" : "INACTIVE");
  const [coordinates, setCoordinates] = useState(initialData?.coordinates ?? { lat: -37.8136, lng: 144.9631 });
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  
  const { createLocation, updateLocation } = useLocations();
  const { toast } = useToast();

  // Fetch available locations for parent location dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, master_data!inner(label)')
        .order('name');

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      if (data) {
        setAvailableLocations(data);
      }
    };

    fetchLocations();
  }, []);

  // Fetch the type_id when type changes
  useEffect(() => {
    const fetchTypeId = async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('id')
        .eq('category', 'LOCATION_TYPE')
        .eq('label', type)
        .single();

      if (error) {
        console.error('Error fetching type_id:', error);
        return;
      }

      if (data) {
        setTypeId(data.id);
      }
    };

    fetchTypeId();
  }, [type]);

  const handleSave = async () => {
    try {
      const locationData = {
        name,
        type_id: typeId,
        parent_location_id: parentLocation || null,
        status_id: status === 'ACTIVE' ? 1 : 2,
        coordinates,
      };

      if (initialData?.id) {
        await updateLocation.mutateAsync({
          id: initialData.id,
          ...locationData,
        });
      } else {
        await createLocation.mutateAsync(locationData);
      }

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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Location Type *</Label>
                <Select value={type} onValueChange={(value: LocationType) => setType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Region">Region</SelectItem>
                    <SelectItem value="District">District</SelectItem>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Detailed Location">Detailed Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentLocation">Parent Location</Label>
                <Select value={parentLocation} onValueChange={setParentLocation}>
                  <SelectTrigger id="parentLocation">
                    <SelectValue placeholder="Select parent location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                  value={status} 
                  onValueChange={(value: LocationStatus) => setStatus(value)}
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
          </div>

          <div className="space-y-4">
            <Label>GPS Location *</Label>
            <LocationMap 
              coordinates={coordinates}
              onCoordinatesChange={setCoordinates}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}