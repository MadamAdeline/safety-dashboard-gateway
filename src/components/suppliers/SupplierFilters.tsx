
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupplierFilters } from "@/types/supplier";

interface SupplierFiltersProps {
  filters: SupplierFilters;
  onFiltersChange: (filters: SupplierFilters) => void;
}

export function SupplierFilters({ filters, onFiltersChange }: SupplierFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      ...filters,
      status: [],
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
          <FilterX className="h-4 w-4 mr-2" />
          Clear Filter
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
                status: value ? [value as "ACTIVE" | "INACTIVE"] : [],
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
      </div>
    </div>
  );
}
