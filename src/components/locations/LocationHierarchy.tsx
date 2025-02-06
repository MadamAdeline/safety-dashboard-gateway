import { ChevronDown, ChevronRight, Edit2, Building2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Location } from "@/types/location";
import { useLocations } from "@/hooks/use-locations";

interface LocationNodeProps {
  location: Location;
  level: number;
  onEdit: (location: Location) => void;
  data: Location[];
}

const LocationNode = ({ location, level, onEdit, data }: LocationNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = data.filter(l => l.parent_location_id === location.id);
  
  const getIcon = (type: string) => {
    switch (type) {
      case "Parent":
        return <Building2 className="h-4 w-4 mr-2 text-gray-500" />;
      case "Region":
        return <Navigation className="h-4 w-4 mr-2 text-blue-500" />;
      case "District":
        return <Building2 className="h-4 w-4 mr-2 text-purple-500" />;
      case "School":
        return <Building2 className="h-4 w-4 mr-2 text-green-500" />;
      default:
        return <MapPin className="h-4 w-4 mr-2 text-orange-500" />;
    }
  };

  return (
    <div className="ml-4">
      <div className={cn(
        "flex items-center py-2 hover:bg-gray-50 rounded-lg group",
        level === 0 && "ml-0"
      )}>
        <div className="flex items-center flex-1">
          {children.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          {getIcon(location.master_data?.label ?? "")}
          <span className="text-sm font-medium">{location.name}</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 text-xs",
              location.master_data?.label === "Parent" && "bg-gray-100 text-gray-800",
              location.master_data?.label === "Region" && "bg-blue-100 text-blue-800",
              location.master_data?.label === "District" && "bg-purple-100 text-purple-800",
              location.master_data?.label === "School" && "bg-green-100 text-green-800",
              location.master_data?.label === "Detailed Location" && "bg-orange-100 text-orange-800"
            )}
          >
            {location.master_data?.label?.toLowerCase() ?? "unknown"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-8 w-8"
          onClick={() => onEdit(location)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="border-l-2 border-gray-100 ml-3">
          {children.map(child => (
            <LocationNode 
              key={child.id} 
              location={child} 
              level={level + 1} 
              onEdit={onEdit}
              data={data}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface LocationHierarchyProps {
  onEdit: (location: Location) => void;
}

export function LocationHierarchy({ onEdit }: LocationHierarchyProps) {
  const { locations = [], isLoading } = useLocations();
  console.log('Locations for hierarchy:', locations);

  // Find the parent location (type "Parent")
  const parentLocation = locations.find(
    location => location.master_data?.label === "Parent"
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!parentLocation) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500">No parent location found. Please create a location with type "Parent" first.</p>
      </div>
    );
  }

  const locationsWithPath = locations.map(location => ({
    ...location,
    full_path: location.full_path || null
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Location Hierarchy</h2>
      <LocationNode 
        key={parentLocation.id} 
        location={{ ...parentLocation, full_path: parentLocation.full_path || null }}
        level={0}
        onEdit={onEdit}
        data={locationsWithPath}
      />
    </div>
  );
}
