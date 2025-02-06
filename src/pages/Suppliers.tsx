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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSuppliers } from "@/services/suppliers";

export default function Suppliers() {
  const [filters, setFilters] = useState<SupplierFiltersType>({
    search: "",
    status: [],
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your supplier data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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
          data={suppliers} 
          filters={filters} 
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}