
import { SDSList } from "./SDSList";
import type { SDS, SDSFilters } from "@/types/sds";

interface SDSFilteredListProps {
  sdsData: SDS[];
  filters: SDSFilters;
  searchTerm: string;
  onView: (sds: SDS) => void;
  onEdit: (sds: SDS) => void;
  allowDelete: boolean;
  showViewButton: boolean;
  showEditButton: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function SDSFilteredList({
  sdsData,
  filters,
  searchTerm,
  onView,
  onEdit,
  allowDelete,
  showViewButton,
  showEditButton,
  currentPage,
  onPageChange
}: SDSFilteredListProps) {
  const filteredData = sdsData.filter((item) => {
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }

    // Date filtering
    if (filters.dateField && filters.dateType && filters.dateFrom) {
      const itemDate = item[filters.dateField];
      // Exclude records with no dates when date filter is active
      if (!itemDate) {
        return false;
      }

      const filterDate = new Date(filters.dateFrom);
      const date = new Date(itemDate);
      
      // Reset times to midnight for accurate date comparison
      filterDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      switch (filters.dateType) {
        case "on":
          if (date.getTime() !== filterDate.getTime()) {
            return false;
          }
          break;
        case "before":
          if (date.getTime() >= filterDate.getTime()) {
            return false;
          }
          break;
        case "after":
          if (date.getTime() <= filterDate.getTime()) {
            return false;
          }
          break;
        case "between":
          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(0, 0, 0, 0);
            if (date.getTime() < filterDate.getTime() || date.getTime() > toDate.getTime()) {
              return false;
            }
          }
          break;
      }
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.productName?.toLowerCase().includes(searchLower) ?? false) ||
        (item.productId?.toLowerCase().includes(searchLower) ?? false) ||
        (item.supplier?.toLowerCase().includes(searchLower) ?? false) ||
        (item.source?.toLowerCase().includes(searchLower) ?? false) ||
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
      onView={onView}
      onEdit={onEdit}
      allowDelete={allowDelete}
      showViewButton={showViewButton}
      showEditButton={showEditButton}
      currentPage={currentPage}
      onPageChange={onPageChange}
    />
  );
}
