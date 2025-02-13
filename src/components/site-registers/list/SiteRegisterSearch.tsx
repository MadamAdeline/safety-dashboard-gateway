
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/locations/LocationSearch";
import type { Location } from "@/types/location";

interface SiteRegisterSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  isRestrictedRole: boolean;
}

export function SiteRegisterSearch({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  onLocationSelect,
  isRestrictedRole,
}: SiteRegisterSearchProps) {
  const handleClearLocation = () => {
    onLocationSelect(null);
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <Label>Location</Label>
        <div className="flex items-center gap-4">
          <div className="w-1/2 relative">
            {isRestrictedRole ? (
              <Input
                value={selectedLocation?.name || ''}
                readOnly
                className="bg-gray-100 text-gray-600"
              />
            ) : (
              <>
                <LocationSearch
                  selectedLocationId={selectedLocation?.id || null}
                  initialLocation={selectedLocation}
                  onLocationSelect={onLocationSelect}
                  className="w-full"
                />
                {selectedLocation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleClearLocation}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </>
            )}
          </div>
          {selectedLocation?.full_path && (
            <Input
              value={selectedLocation.full_path}
              readOnly
              className="bg-gray-50 text-gray-600 flex-1"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="w-1/2 relative">
          <Input
            type="text"
            placeholder="Search Site Register by Product Name or Override Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
