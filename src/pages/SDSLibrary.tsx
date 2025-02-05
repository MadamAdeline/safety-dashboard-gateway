import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SDSList } from "@/components/sds/SDSList";
import { SDSFilters } from "@/components/sds/SDSFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import type { SDS, SDSFilters as SDSFiltersType } from "@/types/sds";

// Sample data for demonstration
const sampleData: SDS[] = [
  {
    productName: "Acetone (AUSCHEM)",
    productId: "ACE20L",
    isDG: true,
    supplier: "AUSTRALIAN CHEMICAL REAGENTS",
    issueDate: "2023-12-01",
    expiryDate: "2028-12-01",
    dgClass: 3,
    status: "ACTIVE" as const
  },
  {
    productName: "Methanol",
    productId: "MET10L",
    isDG: true,
    supplier: "SIGMA ALDRICH",
    issueDate: "2023-11-15",
    expiryDate: "2028-11-15",
    dgClass: 3,
    status: "ACTIVE" as const
  }
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
  
  const [showFilters, setShowFilters] = useState(false);
  const [showNewSDS, setShowNewSDS] = useState(false);
  const [selectedSDS, setSelectedSDS] = useState<SDS | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your SDS data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Updating the SDS list..."
    });
  };

  const handleEdit = (sds: SDS) => {
    setSelectedSDS(sds);
    setShowNewSDS(true);
  };

  const handleClose = () => {
    setShowNewSDS(false);
    setSelectedSDS(null);
  };

  if (showNewSDS) {
    return <NewSDSForm onClose={handleClose} initialData={selectedSDS} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Global SDS Library</h1>
          <Button 
            onClick={() => setShowNewSDS(true)}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" /> New SDS
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex-1 max-w-md relative">
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <SDSFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
        
        <SDSList 
          data={sampleData} 
          filters={filters} 
          onEdit={handleEdit}
        />
      </div>
    </DashboardLayout>
  );
}