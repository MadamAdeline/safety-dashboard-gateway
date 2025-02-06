import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { SDS } from "@/types/sds";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SDSTableRowProps {
  item: SDS;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (sds: SDS) => void;
  onDelete?: (sds: SDS) => void;
}

export function SDSTableRow({ item, isSelected, onToggleSelect, onEdit, onDelete }: SDSTableRowProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      console.log('Deleting SDS:', item);

      // First, delete the file from storage if it exists
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

      // Delete all version records
      console.log('Deleting version records for SDS:', item.id);
      const { error: versionsError } = await supabase
        .from('sds_versions')
        .delete()
        .eq('sds_id', item.id);

      if (versionsError) {
        console.error('Error deleting versions:', versionsError);
        throw versionsError;
      }

      // Finally, delete the SDS record
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

  return (
    <TableRow className="hover:bg-[#F1F0FB] transition-colors">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(item.productId)}
        />
      </TableCell>
      <TableCell className="font-medium text-dgxprt-navy">{item.productName}</TableCell>
      <TableCell className="text-dgxprt-navy">{item.productId}</TableCell>
      <TableCell>
        <Badge 
          variant={item.isDG ? "default" : "secondary"}
          className={item.isDG ? "bg-dgxprt-purple text-white" : "bg-gray-100 text-gray-600"}
        >
          {item.isDG ? "Yes" : "No"}
        </Badge>
      </TableCell>
      <TableCell className="text-dgxprt-navy">{item.supplier}</TableCell>
      <TableCell className="text-dgxprt-navy">{item.issueDate}</TableCell>
      <TableCell className="text-dgxprt-navy">{item.expiryDate}</TableCell>
      <TableCell className="text-dgxprt-navy">{item.dgClass}</TableCell>
      <TableCell>
        <Badge 
          variant={item.status === "ACTIVE" ? "default" : "destructive"}
          className={
            item.status === "ACTIVE" 
              ? "bg-green-100 text-green-800" 
              : item.status === "REQUESTED"
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }
        >
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge 
          variant="secondary"
          className={
            item.sdsSource === "Global Library" 
              ? "bg-blue-100 text-blue-800" 
              : "bg-gray-100 text-gray-800"
          }
        >
          {item.sdsSource}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-dgxprt-hover text-dgxprt-navy"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-red-100 text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}