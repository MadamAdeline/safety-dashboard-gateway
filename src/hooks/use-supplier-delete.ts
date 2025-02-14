
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@/types/supplier";

export const useSupplierDelete = (onDelete?: (supplier: Supplier) => void) => {
  const { toast } = useToast();

  const handleDelete = async (supplier: Supplier) => {
    try {
      console.log('Checking for related SDS before deleting supplier:', supplier);

      // First check if there are any related SDS records
      const { data: relatedSDS, error: checkError } = await supabase
        .from('sds')
        .select('id')
        .eq('supplier_id', supplier.id);

      if (checkError) {
        console.error('Error checking related SDS:', checkError);
        throw checkError;
      }

      if (relatedSDS && relatedSDS.length > 0) {
        console.log('Found related SDS records:', relatedSDS);
        toast({
          title: "Cannot Delete Supplier",
          description: "Cannot delete the supplier as it has related SDS records",
          variant: "destructive"
        });
        return;
      }

      console.log('No related SDS found, proceeding with deletion');

      const { error: deleteError } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplier.id);

      if (deleteError) {
        console.error('Error deleting supplier:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Supplier Deleted",
        description: `${supplier.supplier_name} has been successfully deleted.`
      });

      if (onDelete) {
        onDelete(supplier);
      }

    } catch (error) {
      console.error('Delete operation failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleDelete };
};
