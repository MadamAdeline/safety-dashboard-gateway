import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SDS } from "@/types/sds";

export const useSDSDelete = (onDelete?: (sds: SDS) => void) => {
  const { toast } = useToast();

  const handleDelete = async (item: SDS) => {
    try {
      console.log('Deleting SDS:', item);

      if (item.currentFilePath) {
        console.log('Deleting file from storage:', item.currentFilePath);
        const { error: storageError } = await supabase.storage
          .from('sds_documents')
          .remove([item.currentFilePath]);

        if (storageError) {
          console.error('Error deleting file:', storageError);
          throw storageError;
        }
      }

      console.log('Deleting version records for SDS:', item.id);
      const { error: versionsError } = await supabase
        .from('sds_versions')
        .delete()
        .eq('sds_id', item.id);

      if (versionsError) {
        console.error('Error deleting versions:', versionsError);
        throw versionsError;
      }

      console.log('Deleting SDS record:', item.id);
      const { error: sdsError } = await supabase
        .from('sds')
        .delete()
        .eq('id', item.id);

      if (sdsError) {
        console.error('Error deleting SDS:', sdsError);
        throw sdsError;
      }

      toast({
        title: "SDS Deleted",
        description: `${item.productName} has been successfully deleted.`
      });

      if (onDelete) {
        onDelete(item);
      }

    } catch (error) {
      console.error('Delete operation failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete SDS. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleDelete };
};