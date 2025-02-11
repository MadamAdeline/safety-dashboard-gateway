
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationSearch } from "@/components/locations/LocationSearch";
import type { Location } from "@/types/location";
import { useLocationDetails } from "@/hooks/use-location-details";

interface LocationSelectionProps {
  locationId: string;
  onLocationSelect: (location: Location) => void;
}

export function LocationSelection({ locationId, onLocationSelect }: LocationSelectionProps) {
  const { data: currentLocation } = useLocationDetails(locationId);

  return (
    <div className="space-y-2">
      <Label>Location</Label>
      <LocationSearch
        selectedLocationId={locationId}
        initialLocation={currentLocation}
        onLocationSelect={onLocationSelect}
        className="w-full"
      />
      {currentLocation?.full_path && (
        <Input
          value={currentLocation.full_path}
          readOnly
          className="mt-2 bg-gray-50 text-gray-600"
        />
      )}
    </div>
  );
}
