
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import type { GHSHazardClassification, GHSHazardFilters } from "@/types/ghs";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { deleteGHSHazardClassification } from "@/services/ghs";

interface GHSHazardListProps {
  data: GHSHazardClassification[];
  filters: GHSHazardFilters;
  onEdit: (hazard: GHSHazardClassification) => void;
  onRefresh: () => void;
}

export function GHSHazardList({
  data,
  filters,
  onEdit,
  onRefresh
}: GHSHazardListProps) {
  const { data: userData } = useUserRole();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userData?.role?.toLowerCase() === 'administrator';

  const filteredData = data.filter((item) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      item.hazard_class.toLowerCase().includes(searchTerm) ||
      item.hazard_category.toLowerCase().includes(searchTerm) ||
      item.ghs_code?.ghs_code.toLowerCase().includes(searchTerm) ||
      item.hazard_statement?.hazard_statement_code.toLowerCase().includes(searchTerm) ||
      item.hazard_statement?.hazard_statement_text.toLowerCase().includes(searchTerm) ||
      item.signal_word.toLowerCase().includes(searchTerm)
    );
  });

  const handleDelete = async (hazard: GHSHazardClassification) => {
    try {
      setIsDeleting(true);
      await deleteGHSHazardClassification(hazard.hazard_classification_id);
      toast({
        title: "Success",
        description: "GHS Hazard Classification deleted successfully"
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting hazard:', error);
      toast({
        title: "Error",
        description: "Failed to delete GHS Hazard Classification",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hazard Class</TableHead>
            <TableHead>Hazard Category</TableHead>
            <TableHead>GHS Code</TableHead>
            <TableHead>Hazard Statement Code</TableHead>
            <TableHead>Hazard Statement Text</TableHead>
            <TableHead>Signal Word</TableHead>
            {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((hazard) => (
            <TableRow key={hazard.hazard_classification_id}>
              <TableCell>{hazard.hazard_class}</TableCell>
              <TableCell>{hazard.hazard_category}</TableCell>
              <TableCell>{hazard.ghs_code?.ghs_code}</TableCell>
              <TableCell>{hazard.hazard_statement?.hazard_statement_code}</TableCell>
              <TableCell>{hazard.hazard_statement?.hazard_statement_text}</TableCell>
              <TableCell>
                <Badge variant={hazard.signal_word === 'Danger' ? 'destructive' : 'default'}>
                  {hazard.signal_word}
                </Badge>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(hazard)}
                      disabled={isDeleting}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(hazard)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
