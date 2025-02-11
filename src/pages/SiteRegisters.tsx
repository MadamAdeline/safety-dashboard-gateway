
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SiteRegisterForm } from "@/components/site-registers/SiteRegisterForm";
import { SiteRegisterList } from "@/components/site-registers/SiteRegisterList";

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
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search site registers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Site Register
          </Button>
        </div>

        <SiteRegisterList
          searchTerm={searchTerm}
          onEdit={handleEdit}
        />
      </div>
    </DashboardLayout>
  );
}
