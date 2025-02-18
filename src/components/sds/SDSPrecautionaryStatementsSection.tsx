
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface PrecautionaryStatement {
  precautionary_statement_id: string;
  type: string;
  code: string;
  statement: string;
}

interface SDSPrecautionaryStatement {
  sds_precautionary_statement_id: string;
  sds_id: string;
  precautionary_statement_id: string;
  precautionary_statement: PrecautionaryStatement;
}

interface SDSPrecautionaryStatementsSectionProps {
  sds: SDS;
  readOnly?: boolean;
}

export function SDSPrecautionaryStatementsSection({ sds, readOnly }: SDSPrecautionaryStatementsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing precautionary statements for this SDS
  const { data: sdsPrecautionaryStatements = [] } = useQuery({
    queryKey: ['sds-precautionary-statements', sds.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sds_precautionary_statements')
        .select(`
          sds_precautionary_statement_id,
          sds_id,
          precautionary_statement_id,
          precautionary_statement:precautionary_statements(
            precautionary_statement_id,
            type,
            code,
            statement
          )
        `)
        .eq('sds_id', sds.id)
        .order('precautionary_statement(type)', { ascending: true })
        .order('precautionary_statement(code)', { ascending: true });

      if (error) throw error;
      return data as SDSPrecautionaryStatement[];
    }
  });

  // Fetch available precautionary statements for search
  const { data: searchResults = [] } = useQuery({
    queryKey: ['precautionary-statements-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const { data, error } = await supabase
        .from('precautionary_statements')
        .select('*')
        .or(`type.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,statement.ilike.%${searchTerm}%`)
        .order('type')
        .order('code');

      if (error) throw error;
      return data as PrecautionaryStatement[];
    },
    enabled: searchTerm.length > 0
  });

  const addPrecautionaryStatement = useMutation({
    mutationFn: async (precautionaryStatementId: string) => {
      const { error } = await supabase
        .from('sds_precautionary_statements')
        .insert([{
          sds_id: sds.id,
          precautionary_statement_id: precautionaryStatementId
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sds-precautionary-statements', sds.id] });
      toast({
        title: "Success",
        description: "Precautionary Statement added successfully"
      });
      setShowSearchResults(false);
      setSearchTerm("");
    },
    onError: (error) => {
      console.error('Error adding precautionary statement:', error);
      toast({
        title: "Error",
        description: "Failed to add Precautionary Statement",
        variant: "destructive"
      });
    }
  });

  const removePrecautionaryStatement = useMutation({
    mutationFn: async (sdsPrecautionaryStatementId: string) => {
      const { error } = await supabase
        .from('sds_precautionary_statements')
        .delete()
        .eq('sds_precautionary_statement_id', sdsPrecautionaryStatementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sds-precautionary-statements', sds.id] });
      toast({
        title: "Success",
        description: "Precautionary Statement removed successfully"
      });
    },
    onError: (error) => {
      console.error('Error removing precautionary statement:', error);
      toast({
        title: "Error",
        description: "Failed to remove Precautionary Statement",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowSearchResults(true);
  };

  const filteredSearchResults = searchResults?.filter(
    result => !sdsPrecautionaryStatements?.some(
      existing => existing.precautionary_statement_id === result.precautionary_statement_id
    )
  ) ?? [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Precautionary Statements</h3>
      
      {!readOnly && (
        <div className="relative">
          <Input
            placeholder="Search Precautionary Statements..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {showSearchResults && searchTerm && (
            <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Statement</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSearchResults.map((result) => (
                    <TableRow key={result.precautionary_statement_id}>
                      <TableCell>{result.type}</TableCell>
                      <TableCell>{result.code}</TableCell>
                      <TableCell>{result.statement}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addPrecautionaryStatement.mutate(result.precautionary_statement_id)}
                          disabled={addPrecautionaryStatement.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSearchResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No matching Precautionary Statements found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Statement</TableHead>
              {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sdsPrecautionaryStatements.map((item) => (
              <TableRow key={item.sds_precautionary_statement_id}>
                <TableCell>{item.precautionary_statement.type}</TableCell>
                <TableCell>{item.precautionary_statement.code}</TableCell>
                <TableCell>{item.precautionary_statement.statement}</TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePrecautionaryStatement.mutate(item.sds_precautionary_statement_id)}
                      disabled={removePrecautionaryStatement.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sdsPrecautionaryStatements.length === 0 && (
              <TableRow>
                <TableCell colSpan={!readOnly ? 4 : 3} className="text-center py-4">
                  No Precautionary Statements added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
