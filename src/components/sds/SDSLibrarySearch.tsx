
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SDSActions } from "./SDSActions";
import { SDSFilters } from "./SDSFilters";
import type { SDSFilters as SDSFiltersType, SDS } from "@/types/sds";

interface SDSLibrarySearchProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: SDSFiltersType;
  onFiltersChange: (filters: SDSFiltersType) => void;
  isAdmin: boolean;
  data: SDS[];
}

export function SDSLibrarySearch({
  showFilters,
  setShowFilters,
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  isAdmin,
  data
}: SDSLibrarySearchProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="relative w-1/2">
          <Input
            type="text"
            placeholder="Search SDS by Product Name, Product Code, Supplier or Source..."
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
          data={data}
          allowDelete={isAdmin}
        />
      </div>
      
      {showFilters && (
        <SDSFilters filters={filters} onFiltersChange={onFiltersChange} />
      )}
    </div>
  );
}
