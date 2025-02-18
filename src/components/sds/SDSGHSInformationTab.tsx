
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GHSHazardClassification } from "@/types/ghs";
import type { SDS } from "@/types/sds";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SDSGHSInformationTabProps {
  sds: SDS;
  readOnly?: boolean;
}

interface SDSGHSClassification {
  sds_ghs_id: string;
  sds_id: string;
  hazard_classification_id: string;
  hazard_classification: GHSHazardClassification & {
    ghs_code: { ghs_code: string; pictogram_url: string | null } | null;
    hazard_statement: { hazard_statement_code: string; hazard_statement_text: string } | null;
  };
}

export function SDSGHSInformationTab({ sds, readOnly }: SDSGHSInformationTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing GHS classifications for this SDS
  const { data: sdsGHSClassifications = [] } = useQuery({
    queryKey: ['sds-ghs-classifications', sds.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sds_ghs_classifications')
        .select(`
          sds_ghs_id,
          sds_id,
          hazard_classification_id,
          hazard_classification:ghs_hazard_classifications (
            hazard_classification_id,
            hazard_class,
            hazard_category,
            signal_word,
            ghs_code_id,
            hazard_statement_id,
            updated_at,
            updated_by,
            ghs_code:ghs_codes (
              ghs_code,
              pictogram_url
            ),
            hazard_statement:hazard_statements (
              hazard_statement_code,
              hazard_statement_text
            )
          )
        `)
        .eq('sds_id', sds.id);

      if (error) throw error;
      return data as SDSGHSClassification[];
    }
  });

  // Fetch available GHS classifications for search
  const { data: searchResults = [] } = useQuery({
    queryKey: ['ghs-hazards-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const query = supabase
        .from('ghs_hazard_classifications')
        .select(`
          *,
          ghs_code:ghs_codes (
            ghs_code,
            pictogram_url
          ),
          hazard_statement:hazard_statements (
            hazard_statement_code,
            hazard_statement_text
          )
        `)
        .order('hazard_class');

      // Add OR conditions one by one
      query
        .or(`hazard_class.ilike.%${searchTerm}%`)
        .or(`hazard_category.ilike.%${searchTerm}%`)
        .or(`signal_word.ilike.%${searchTerm}%`);

      const { data, error } = await query;

      if (error) throw error;
      return data as GHSHazardClassification[];
    },
    enabled: searchTerm.length > 0
  });

  const addGHSClassification = useMutation({
    mutationFn: async (hazardClassificationId: string) => {
      const { error } = await supabase
        .from('sds_ghs_classifications')
        .insert([{
          sds_id: sds.id,
          hazard_classification_id: hazardClassificationId
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sds-ghs-classifications', sds.id] });
      toast({
        title: "Success",
        description: "GHS Classification added successfully"
      });
      setShowSearchResults(false);
      setSearchTerm("");
    },
    onError: (error) => {
      console.error('Error adding GHS classification:', error);
      toast({
        title: "Error",
        description: "Failed to add GHS Classification",
        variant: "destructive"
      });
    }
  });

  const removeGHSClassification = useMutation({
    mutationFn: async (sdsGhsId: string) => {
      const { error } = await supabase
        .from('sds_ghs_classifications')
        .delete()
        .eq('sds_ghs_id', sdsGhsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sds-ghs-classifications', sds.id] });
      toast({
        title: "Success",
        description: "GHS Classification removed successfully"
      });
    },
    onError: (error) => {
      console.error('Error removing GHS classification:', error);
      toast({
        title: "Error",
        description: "Failed to remove GHS Classification",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowSearchResults(true);
  };

  const filteredSearchResults = searchResults?.filter(
    result => !sdsGHSClassifications?.some(
      existing => existing.hazard_classification_id === result.hazard_classification_id
    )
  ) ?? [];

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="relative">
          <Input
            placeholder="Search GHS Classifications..."
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
                    <TableHead>Hazard Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>GHS Code</TableHead>
                    <TableHead>Hazard Statement</TableHead>
                    <TableHead>Signal Word</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSearchResults.map((result) => (
                    <TableRow key={result.hazard_classification_id}>
                      <TableCell>{result.hazard_class}</TableCell>
                      <TableCell>{result.hazard_category}</TableCell>
                      <TableCell>{result.ghs_code?.ghs_code}</TableCell>
                      <TableCell>{result.hazard_statement?.hazard_statement_code}</TableCell>
                      <TableCell>
                        <Badge variant={result.signal_word === 'Danger' ? 'destructive' : 'default'}>
                          {result.signal_word}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addGHSClassification.mutate(result.hazard_classification_id)}
                          disabled={addGHSClassification.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSearchResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No matching GHS Classifications found
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
              <TableHead>Hazard Class</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>GHS Code</TableHead>
              <TableHead>Hazard Statement</TableHead>
              <TableHead>Signal Word</TableHead>
              <TableHead>Pictogram</TableHead>
              {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sdsGHSClassifications.map((item) => (
              <TableRow key={item.sds_ghs_id}>
                <TableCell>{item.hazard_classification.hazard_class}</TableCell>
                <TableCell>{item.hazard_classification.hazard_category}</TableCell>
                <TableCell>{item.hazard_classification.ghs_code?.ghs_code}</TableCell>
                <TableCell>{item.hazard_classification.hazard_statement?.hazard_statement_code}</TableCell>
                <TableCell>
                  <Badge variant={item.hazard_classification.signal_word === 'Danger' ? 'destructive' : 'default'}>
                    {item.hazard_classification.signal_word}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.hazard_classification.ghs_code?.pictogram_url && (
                    <img
                      src={item.hazard_classification.ghs_code.pictogram_url}
                      alt={`GHS Code ${item.hazard_classification.ghs_code.ghs_code} pictogram`}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGHSClassification.mutate(item.sds_ghs_id)}
                      disabled={removeGHSClassification.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {sdsGHSClassifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={!readOnly ? 7 : 6} className="text-center py-4">
                  No GHS Classifications added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
