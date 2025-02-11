
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SiteRegisterForm } from "@/components/site-registers/SiteRegisterForm";
import { SiteRegisterList } from "@/components/site-registers/SiteRegisterList";
import { SiteRegisterActions } from "@/components/site-registers/SiteRegisterActions";
import { exportSiteRegistersToExcel } from "@/utils/exportUtils";

export default function SiteRegisters() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSiteRegister, setSelectedSiteRegister] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (siteRegister: any) => {
    setSelectedSiteRegister(siteRegister);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSiteRegister(null);
  };

  const handleExport = () => {
    // This will be implemented when we have the data structure
    console.log("Export functionality to be implemented");
  };

  const handleRefresh = () => {
    // Implement refresh logic here
    window.location.reload();
  };

  if (isFormOpen) {
    return (
      <DashboardLayout>
        <SiteRegisterForm
          onClose={handleFormClose}
          initialData={selectedSiteRegister}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-dgxprt-navy">Site Register</h1>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Site Register
            </Button>
          </div>
        </div>

        <SiteRegisterList
          searchTerm={searchTerm}
          onEdit={handleEdit}
        />
      </div>
    </DashboardLayout>
  );
}
