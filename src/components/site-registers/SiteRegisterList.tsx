
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LocationSearch } from "@/components/locations/LocationSearch";
import type { Location } from "@/types/location";

interface SiteRegisterListProps {
  searchTerm: string;
  onEdit: (siteRegister: any) => void;
}

export function SiteRegisterList({ searchTerm, onEdit }: SiteRegisterListProps) {
  const { data: siteRegisters, isLoading, refetch } = useQuery({
    queryKey: ['site-registers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_registers')
        .select(`
          *,
          products (
            id,
            product_name,
            uom:master_data!products_uom_id_fkey (
              id,
              label
            )
          ),
          locations (
            id,
            name,
            full_path
          )
        `);

      if (error) {
        console.error('Error fetching site registers:', error);
        throw error;
      }

      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_registers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site register deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting site register:', error);
      toast({
        title: "Error",
        description: "Failed to delete site register",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', location);
    // We'll implement location filtering in a future update
  };

  const filteredRegisters = siteRegisters?.filter(register => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      register.products?.product_name.toLowerCase().includes(searchLower) ||
      register.override_product_name?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-[300px]">
          <LocationSearch
            selectedLocationId={null}
            initialLocation={null}
            onLocationSelect={handleLocationSelect}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Override Product Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Unit of Measure</TableHead>
              <TableHead>Current Stock Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegisters?.map((register) => (
              <TableRow key={register.id}>
                <TableCell>{register.products?.product_name}</TableCell>
                <TableCell>{register.override_product_name}</TableCell>
                <TableCell>{register.locations?.full_path}</TableCell>
                <TableCell>{register.products?.uom?.label}</TableCell>
                <TableCell>{register.current_stock_level}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(register)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(register.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
