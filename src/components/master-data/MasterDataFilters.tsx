import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { MasterDataFilters } from "@/types/masterData";

interface MasterDataFiltersProps {
  filters: MasterDataFilters;
  onFiltersChange: (filters: MasterDataFilters) => void;
}

export function MasterDataFilters({
  filters,
  onFiltersChange,
}: MasterDataFiltersProps) {
  const handleStatusToggle = (status: "ACTIVE" | "INACTIVE") => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    onFiltersChange({ ...filters, category: newCategories });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: [],
      status: [],
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filters.status.includes("ACTIVE")
                  ? "bg-green-100 text-green-800"
                  : ""
              }`}
              onClick={() => handleStatusToggle("ACTIVE")}
            >
              Active
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filters.status.includes("INACTIVE")
                  ? "bg-red-100 text-red-800"
                  : ""
              }`}
              onClick={() => handleStatusToggle("INACTIVE")}
            >
              Inactive
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Categories</label>
          <div className="flex gap-2 flex-wrap">
            {["DG_CLASS", "PACKING_GROUP"].map((category) => (
              <Badge
                key={category}
                variant="outline"
                className={`cursor-pointer ${
                  filters.category.includes(category)
                    ? "bg-dgxprt-selected text-white"
                    : ""
                }`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}