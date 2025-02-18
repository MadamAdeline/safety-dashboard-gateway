
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, RefreshCw, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGHSHazardClassifications } from "@/services/ghs";
import type { GHSHazardClassification } from "@/types/ghs";
import { GHSHazardList } from "@/components/ghs/GHSHazardList";
import { GHSHazardForm } from "@/components/ghs/GHSHazardForm";
import { GHSCodeForm } from "@/components/ghs/GHSCodeForm";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function GHSHazards() {
  const [search, setSearch] = useState("");
  const [selectedHazard, setSelectedHazard] = useState<GHSHazardClassification | null>(null);
  const [showHazardForm, setShowHazardForm] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const { toast } = useToast();

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['ghs-hazards'],
    queryFn: getGHSHazardClassifications
  });

  const handleExport = () => {
    const exportData = data.map(hazard => ({
      'Hazard Class': hazard.hazard_class,
      'Hazard Category': hazard.hazard_category,
      'GHS Code': hazard.ghs_code?.ghs_code || '',
      'Hazard Statement Code': hazard.hazard_statement?.hazard_statement_code || '',
      'Hazard Statement Text': hazard.hazard_statement?.hazard_statement_text || '',
      'Signal Word': hazard.signal_word
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GHS Hazards");
    XLSX.writeFile(wb, `ghs_hazards_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "GHS Hazard Classifications have been exported to Excel"
    });
  };

  const handleEdit = (hazard: GHSHazardClassification) => {
    setSelectedHazard(hazard);
    setShowHazardForm(true);
  };

  const handleCloseForm = () => {
    setSelectedHazard(null);
    setShowHazardForm(false);
    setShowCodeForm(false);
  };

  if (showHazardForm) {
    return (
      <DashboardLayout>
        <GHSHazardForm
          onClose={handleCloseForm}
          initialData={selectedHazard}
        />
      </DashboardLayout>
    );
  }

  if (showCodeForm) {
    return (
      <DashboardLayout>
        <GHSCodeForm onClose={handleCloseForm} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">GHS Hazard Classifications</h1>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search GHS Hazard Classifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCodeForm(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add GHS Codes
            </Button>
            <Button
              onClick={() => setShowHazardForm(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add GHS Classification
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <GHSHazardList
            data={data}
            filters={{ search }}
            onEdit={handleEdit}
            onRefresh={() => refetch()}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
