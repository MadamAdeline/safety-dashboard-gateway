
import { SDSList } from "./SDSList";
import type { SDS, SDSFilters } from "@/types/sds";

interface SDSFilteredListProps {
  sdsData: SDS[];
  filters: SDSFilters;
  searchTerm: string;
  onEdit: (sds: SDS) => void;
  allowDelete: boolean;
}

export function SDSFilteredList({
  sdsData,
  filters,
  searchTerm,
  onEdit,
  allowDelete
}: SDSFilteredListProps) {
  const filteredData = sdsData.filter((item) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (filters.dateField === "expiryDate" && filters.dateType === "before" && item.expiryDate) {
      if (item.expiryDate > today) {
        return false;
      }
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.productName?.toLowerCase().includes(searchLower) ?? false) ||
        (item.productId?.toLowerCase().includes(searchLower) ?? false) ||
        (item.supplier?.toLowerCase().includes(searchLower) ?? false) ||
        (item.status?.toLowerCase().includes(searchLower) ?? false) ||
        (item.unNumber?.toLowerCase().includes(searchLower) ?? false) ||
        (item.unProperShippingName?.toLowerCase().includes(searchLower) ?? false) ||
        (item.hazchemCode?.toLowerCase().includes(searchLower) ?? false) ||
        (item.otherNames?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    return true;
  });

  return (
    <SDSList 
      data={filteredData}
      filters={filters}
      onEdit={onEdit}
      allowDelete={allowDelete}
    />
  );
}
