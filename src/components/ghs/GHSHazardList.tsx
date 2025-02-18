
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
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import type { GHSHazardClassification, GHSHazardFilters } from "@/types/ghs";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { deleteGHSHazardClassification, createGHSHazardClassification } from "@/services/ghs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SIGNAL_WORDS } from "@/types/ghs";
import { useQuery } from "@tanstack/react-query";
import { getGHSCodes, getHazardStatements } from "@/services/ghs";

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
  const [newHazard, setNewHazard] = useState<Partial<GHSHazardClassification> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: ghsCodes = [] } = useQuery({
    queryKey: ['ghs-codes'],
    queryFn: getGHSCodes
  });

  const { data: hazardStatements = [] } = useQuery({
    queryKey: ['hazard-statements'],
    queryFn: getHazardStatements
  });

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

  const handleSaveNewHazard = async () => {
    if (!newHazard?.hazard_class || !newHazard.hazard_category || !newHazard.ghs_code_id || 
        !newHazard.hazard_statement_id || !newHazard.signal_word) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createGHSHazardClassification(newHazard as Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>);
      toast({
        title: "Success",
        description: "GHS Hazard Classification created successfully"
      });
      setNewHazard(null);
      onRefresh();
    } catch (error) {
      console.error('Error creating hazard:', error);
      toast({
        title: "Error",
        description: "Failed to create GHS Hazard Classification",
        variant: "destructive"
      });
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="space-y-4">
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
            {paginatedData.map((hazard) => (
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
            {newHazard && (
              <TableRow>
                <TableCell>
                  <Input
                    value={newHazard.hazard_class || ''}
                    onChange={(e) => setNewHazard(prev => ({ ...prev, hazard_class: e.target.value }))}
                    placeholder="Enter hazard class"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newHazard.hazard_category || ''}
                    onChange={(e) => setNewHazard(prev => ({ ...prev, hazard_category: e.target.value }))}
                    placeholder="Enter hazard category"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newHazard.ghs_code_id || ''}
                    onValueChange={(value) => setNewHazard(prev => ({ ...prev, ghs_code_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GHS code" />
                    </SelectTrigger>
                    <SelectContent>
                      {ghsCodes.map((code) => (
                        <SelectItem key={code.ghs_code_id} value={code.ghs_code_id}>
                          {code.ghs_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell colSpan={2}>
                  <Select
                    value={newHazard.hazard_statement_id || ''}
                    onValueChange={(value) => setNewHazard(prev => ({ ...prev, hazard_statement_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hazard statement" />
                    </SelectTrigger>
                    <SelectContent>
                      {hazardStatements.map((statement) => (
                        <SelectItem key={statement.hazard_statement_id} value={statement.hazard_statement_id}>
                          {statement.hazard_statement_code} - {statement.hazard_statement_text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={newHazard.signal_word || ''}
                    onValueChange={(value) => setNewHazard(prev => ({ ...prev, signal_word: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select signal word" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNAL_WORDS.map((word) => (
                        <SelectItem key={word} value={word}>
                          {word}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveNewHazard}
                      className="hover:bg-green-100 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewHazard(null)}
                      className="hover:bg-red-100 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setNewHazard({})}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
              disabled={!!newHazard}
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <nav>
            <ul className="flex items-center gap-1">
              <li>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  Previous
                </Button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page}>
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </li>
              ))}
              <li>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
