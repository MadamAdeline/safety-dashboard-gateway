import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SupplierList } from "@/components/suppliers/SupplierList";
import { SupplierFilters } from "@/components/suppliers/SupplierFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SupplierSearch } from "@/components/suppliers/SupplierSearch";
import { SupplierActions } from "@/components/suppliers/SupplierActions";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import type { Supplier, SupplierFilters as SupplierFiltersType } from "@/types/supplier";

const sampleData: Supplier[] = [
  {
    id: "1",
    name: "AUSTRALIAN CHEMICAL REAGENTS",
    contactPerson: "John Smith",
    email: "john.smith@auschem.com",
    phone: "+61 3 9123 4567",
    address: "123 Chemical Lane, Melbourne VIC 3000",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "SIGMA ALDRICH",
    contactPerson: "Jane Doe",
    email: "jane.doe@sigmaaldrich.com",
    phone: "+61 2 8765 4321",
    address: "456 Science Street, Sydney NSW 2000",
    status: "ACTIVE",
  },
];

export default function Suppliers() {
  const [filters, setFilters] = useState<SupplierFiltersType>({
    search: "",
    status: [],
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your supplier data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Updating the suppliers list..."
    });
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedSupplier(null);
  };

  if (showForm) {
    return <SupplierForm onClose={handleClose} initialData={selectedSupplier} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" /> New Supplier
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <SupplierSearch 
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
            />
            <SupplierActions 
              onToggleFilters={() => setShowFilters(!showFilters)}
              onExport={handleExport}
              onRefresh={handleRefresh}
            />
          </div>
          
          {showFilters && (
            <SupplierFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
        
        <SupplierList 
          data={sampleData} 
          filters={filters} 
          onEdit={handleEdit}
        />
      </div>
    </DashboardLayout>
  );
}