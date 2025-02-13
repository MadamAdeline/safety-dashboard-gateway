
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Table } from "lucide-react";
import { SiteRegisterForm } from "@/components/site-registers/SiteRegisterForm";
import { SiteRegisterList } from "@/components/site-registers/SiteRegisterList";
import { SiteRegisterGrid } from "@/components/site-registers/grid/SiteRegisterGrid";
import { useUserRole } from "@/hooks/use-user-role";

export default function SiteRegisters() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [selectedSiteRegister, setSelectedSiteRegister] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: userData } = useUserRole();

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
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-dgxprt-navy">Site Register</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsGridOpen(true)}
                className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
              >
                <Table className="h-4 w-4 mr-2" />
                Quick Entry
              </Button>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Site Register
              </Button>
            </div>
          </div>
        </div>

        <SiteRegisterList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={handleEdit}
        />

        {isGridOpen && (
          <SiteRegisterGrid
            onClose={() => setIsGridOpen(false)}
            defaultLocationId={userData?.location?.id}
            onSave={() => setSearchTerm(searchTerm)} // Trigger a refresh by updating the search term
          />
        )}
      </div>
    </DashboardLayout>
  );
}
