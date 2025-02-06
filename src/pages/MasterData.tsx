import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MasterDataSearch } from "@/components/master-data/MasterDataSearch";
import { MasterDataActions } from "@/components/master-data/MasterDataActions";
import { MasterDataFilters } from "@/components/master-data/MasterDataFilters";
import { MasterDataForm } from "@/components/master-data/MasterDataForm";
import type { MasterData, MasterDataFilters as MasterDataFiltersType } from "@/types/masterData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMasterData } from "@/services/masterData";
import { MasterDataList } from "@/components/master-data/MasterDataList";

export default function MasterDataPage() {
  const [filters, setFilters] = useState<MasterDataFiltersType>({
    search: "",
    category: [],
    status: [],
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMasterData, setSelectedMasterData] = useState<MasterData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: masterData = [], isLoading } = useQuery({
    queryKey: ['masterData'],
    queryFn: getMasterData,
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your master data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['masterData'] });
    toast({
      title: "Refreshing Data",
      description: "Updating the master data list..."
    });
  };

  const handleEdit = (data: MasterData) => {
    setSelectedMasterData(data);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedMasterData(null);
  };

  if (showForm) {
    return <MasterDataForm onClose={handleClose} initialData={selectedMasterData} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Master Data</h1>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <MasterDataSearch 
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
            />
            <MasterDataActions 
              onToggleFilters={() => setShowFilters(!showFilters)}
              onExport={handleExport}
              onRefresh={handleRefresh}
            />
          </div>
          
          {showFilters && (
            <MasterDataFilters filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
        
        <MasterDataList 
          data={masterData} 
          filters={filters} 
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}