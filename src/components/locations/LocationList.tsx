import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import type { Location, LocationFilters, LocationType, LocationStatus } from "@/types/location";
import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { useToast } from "@/components/ui/use-toast";

interface LocationListProps {
  filters: LocationFilters;
  onEdit: (location: Location) => void;
}

interface EditableLocation extends Partial<Location> {
  isNew?: boolean;
}

export function LocationList({ filters, onEdit }: LocationListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLocation, setEditingLocation] = useState<EditableLocation | null>(null);
  const itemsPerPage = 10;

  const { locations, isLoading, deleteLocation, createLocation, updateLocation } = useLocations();
  const { toast } = useToast();

  const getLocationTypeLabel = (location: Location): string => {
    return location.master_data?.label || "Unknown";
  };

  const getLocationStatus = (location: Location): "ACTIVE" | "INACTIVE" => {
    return location.status_id === 1 ? "ACTIVE" : "INACTIVE";
  };

  const getParentLocationName = (location: Location): string => {
    if (!location.parent_location_id) return "-";
    const parentLocation = locations.find(loc => loc.id === location.parent_location_id);
    return parentLocation ? parentLocation.name : "-";
  };

  const searchInLocation = (location: Location, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fieldsToSearch = [
      location.name,
      getLocationTypeLabel(location),
      getParentLocationName(location),
      location.status_lookup?.status_name || getLocationStatus(location),
      location.coordinates ? JSON.stringify(location.coordinates) : '',
    ];

    return fieldsToSearch.some(field => 
      field.toLowerCase().includes(searchLower)
    );
  };

  const handleSave = async (location: EditableLocation) => {
    try {
      if (location.isNew) {
        await createLocation.mutateAsync({
          name: location.name || '',
          type_id: location.type_id || '',
          parent_location_id: location.parent_location_id || null,
          status_id: location.status_id || 1,
          coordinates: location.coordinates || { lat: -37.8136, lng: 144.9631 }
        });
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      } else if (location.id) {
        await updateLocation.mutateAsync({
          id: location.id,
          name: location.name || '',
          type_id: location.type_id || '',
          parent_location_id: location.parent_location_id || null,
          status_id: location.status_id || 1,
          coordinates: location.coordinates || { lat: -37.8136, lng: 144.9631 }
        });
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      }
      setEditingLocation(null);
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
    }
  };

  const startNewLocation = () => {
    setEditingLocation({
      isNew: true,
      name: '',
      type_id: '',
      parent_location_id: null,
      status_id: 1,
      coordinates: { lat: -37.8136, lng: 144.9631 }
    });
  };

  const filteredData = locations.map(item => ({
    ...item,
    coordinates: typeof item.coordinates === 'string' 
      ? JSON.parse(item.coordinates)
      : item.coordinates
  })).filter((item) => {
    if (!searchInLocation(item, filters.search)) {
      return false;
    }
    if (filters.type.length > 0 && !filters.type.includes(getLocationTypeLabel(item) as any)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(getLocationStatus(item))) {
      return false;
    }
    if (filters.parentLocation && item.parent_location_id !== filters.parentLocation) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderEditableRow = (location: EditableLocation) => (
    <TableRow key={location.id || 'new'}>
      <TableCell>
        <Checkbox
          checked={location.id ? selectedItems.includes(location.id) : false}
          onCheckedChange={() => location.id && toggleSelectItem(location.id)}
        />
      </TableCell>
      <TableCell>
        <Input
          value={location.name || ''}
          onChange={(e) => setEditingLocation({ ...location, name: e.target.value })}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Select
          value={location.type_id}
          onValueChange={(value) => setEditingLocation({ ...location, type_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {locations
              .map(loc => loc.master_data)
              .filter((md, index, self) => 
                md && self.findIndex(t => t?.id === md.id) === index
              )
              .map(type => type && (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={location.parent_location_id || 'none'}
          onValueChange={(value) => setEditingLocation({ 
            ...location, 
            parent_location_id: value === 'none' ? null : value 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={String(location.status_id || 1)}
          onValueChange={(value) => setEditingLocation({ ...location, status_id: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="2">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-green-100 text-green-600"
            onClick={() => handleSave(location)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-red-100 text-red-600"
            onClick={() => setEditingLocation(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedData.length > 0 &&
                    selectedItems.length === paginatedData.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Location Name</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Type</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Parent Location</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
              <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              editingLocation?.id === item.id ? (
                renderEditableRow(editingLocation)
              ) : (
                <TableRow 
                  key={item.id}
                  className="hover:bg-[#F1F0FB] transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-dgxprt-navy">{item.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      {item.master_data?.label || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-dgxprt-navy">{getParentLocationName(item)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.status_id === 1 ? "default" : "destructive"}
                      className={
                        item.status_id === 1
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {item.status_lookup?.status_name || (item.status_id === 1 ? "Active" : "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-dgxprt-hover text-dgxprt-navy"
                        onClick={() => setEditingLocation(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-dgxprt-hover text-dgxprt-navy"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            ))}
            {editingLocation?.isNew && renderEditableRow(editingLocation)}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={startNewLocation}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Location
        </Button>
        
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                    className={
                      currentPage === page 
                        ? "bg-dgxprt-selected text-white hover:bg-dgxprt-selected/90" 
                        : "hover:bg-dgxprt-hover"
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}