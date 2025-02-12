
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFilters } from "@/types/product";

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      ...filters,
      status: [],
      isDG: null,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Filters</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearFilters}
        >
          Clear
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            value={filters.status[0] || ""}
            onValueChange={(value) =>
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

        <div>
          <Label>DG Status</Label>
          <Select
            value={filters.isDG === null ? "" : filters.isDG.toString()}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                isDG: value === "" ? null : value === "true",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select DG status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">DG</SelectItem>
              <SelectItem value="false">Non-DG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
