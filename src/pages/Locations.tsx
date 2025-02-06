import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LocationList } from "@/components/locations/LocationList";
import { LocationFilters } from "@/components/locations/LocationFilters";
import { Button } from "@/components/ui/button";
import { Plus, Network } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LocationForm } from "@/components/locations/LocationForm";
import { LocationHierarchy } from "@/components/locations/LocationHierarchy";
import type { Location, LocationFilters as LocationFiltersType } from "@/types/location";

export default function Locations() {
  const [filters, setFilters] = useState<LocationFiltersType>({
    search: "",
    status: [],
    type: [],
    parentLocation: null
  });
  
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedLocation(null);
  };

  if (showForm) {
    return <LocationForm onClose={handleClose} initialData={selectedLocation} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Locations</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'list' ? 'hierarchy' : 'list')}
              className="bg-white"
            >
              <Network className="mr-2 h-4 w-4" />
              View as {viewMode === 'list' ? 'Hierarchy' : 'List'}
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            >
              <Plus className="mr-2 h-4 w-4" /> New Location
            </Button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <LocationList 
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEdit}
          />
        ) : (
          <LocationHierarchy
            onEdit={handleEdit}
          />
        )}
      </div>
    </DashboardLayout>
  );
}