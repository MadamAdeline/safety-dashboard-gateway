
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SDSActions } from "./SDSActions";
import { SDSFilters } from "./SDSFilters";
import type { SDSFilters as SDSFiltersType } from "@/types/sds";

interface SDSLibrarySearchProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: SDSFiltersType;
  onFiltersChange: (filters: SDSFiltersType) => void;
  isAdmin: boolean;
}

export function SDSLibrarySearch({
  showFilters,
  setShowFilters,
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  isAdmin
}: SDSLibrarySearchProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search SDS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <SDSActions 
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={() => {}}
          onRefresh={() => {}}
          data={[]}
          allowDelete={isAdmin}
        />
      </div>
      
      {showFilters && (
        <SDSFilters filters={filters} onFiltersChange={onFiltersChange} />
      )}
    </div>
  );
}
