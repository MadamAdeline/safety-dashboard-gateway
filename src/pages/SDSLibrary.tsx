import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SDSList } from "@/components/sds/SDSList";
import { SDSFilters } from "@/components/sds/SDSFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { SDS, SDSFilters as SDSFiltersType } from "@/types/sds";

// Sample data based on the image
const sampleData: SDS[] = [
  {
    productName: "Acetone (AUSCHEM)",
    productId: "ACE20L",
    isDG: true,
    supplier: "AUSTRALIAN CHEMICAL REAGENTS",
    issueDate: "2023-12-01",
    expiryDate: "2028-12-01",
    dgClass: 3,
    status: "ACTIVE"
  },
  // ... Add more sample data from the image
];

export default function SDSLibrary() {
  const [filters, setFilters] = useState<SDSFiltersType>({
    search: "",
    dateField: null,
    dateType: null,
    dateFrom: "",
    dateTo: "",
    status: [],
    dgClass: [],
    isDG: null
  });
  
  const { toast } = useToast();

  const handleExport = () => {
    // TODO: Implement Excel export
    toast({
      title: "Export Started",
      description: "Your SDS data is being exported to Excel..."
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">SDS Library</h1>
          <div className="space-x-2">
            <Button onClick={handleExport} variant="outline">
              Export to Excel
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New SDS
            </Button>
          </div>
        </div>
        
        <SDSFilters filters={filters} onFiltersChange={setFilters} />
        <SDSList data={sampleData} filters={filters} />
      </div>
    </DashboardLayout>
  );
}