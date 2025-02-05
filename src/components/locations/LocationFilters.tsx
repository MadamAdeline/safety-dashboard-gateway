
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LocationFilters as LocationFiltersType, LocationType, LocationStatus } from "@/types/location";

interface LocationFiltersProps {
  filters: LocationFiltersType;
  onFiltersChange: (filters: LocationFiltersType) => void;
}

export function LocationFilters({ filters, onFiltersChange }: LocationFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Location Type</Label>
          <Select
            value={filters.type[0] || ""}
            onValueChange={(value: LocationType) =>
              onFiltersChange({
                ...filters,
                type: value ? [value] : [],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
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
          <Label>Status</Label>
          <Select
            value={filters.status[0] || ""}
            onValueChange={(value: LocationStatus) =>
              onFiltersChange({
                ...filters,
                status: value ? [value] : [],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Parent Location</Label>
          <Select
            value={filters.parentLocation || ""}
            onValueChange={(value: string) =>
              onFiltersChange({
                ...filters,
                parentLocation: value || null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="Victoria">Victoria</SelectItem>
              <SelectItem value="Northern District">Northern District</SelectItem>
              <SelectItem value="Melbourne High School">Melbourne High School</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
