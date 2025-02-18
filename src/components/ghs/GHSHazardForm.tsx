
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGHSHazardClassification,
  updateGHSHazardClassification,
  getGHSCodes,
  getHazardStatements
} from "@/services/ghs";
import type { GHSHazardClassification } from "@/types/ghs";
import { SIGNAL_WORDS } from "@/types/ghs";

interface GHSHazardFormProps {
  onClose: () => void;
  initialData?: GHSHazardClassification | null;
}

export function GHSHazardForm({ onClose, initialData }: GHSHazardFormProps) {
  const [formData, setFormData] = useState<Partial<GHSHazardClassification>>(
    initialData || {
      hazard_class: "",
      hazard_category: "",
      ghs_code_id: null,
      hazard_statement_id: null,
      signal_word: "",
    }
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch GHS Codes
  const { data: ghsCodes = [] } = useQuery({
    queryKey: ['ghs-codes'],
    queryFn: getGHSCodes
  });

  // Fetch Hazard Statements
  const { data: hazardStatements = [] } = useQuery({
    queryKey: ['hazard-statements'],
    queryFn: getHazardStatements
  });

  const createMutation = useMutation({
    mutationFn: createGHSHazardClassification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghs-hazards'] });
      toast({
        title: "Success",
        description: "GHS Hazard Classification created successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating GHS Hazard:', error);
      toast({
        title: "Error",
        description: "Failed to create GHS Hazard Classification",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GHSHazardClassification> }) =>
      updateGHSHazardClassification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghs-hazards'] });
      toast({
        title: "Success",
        description: "GHS Hazard Classification updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating GHS Hazard:', error);
      toast({
        title: "Error",
        description: "Failed to update GHS Hazard Classification",
        variant: "destructive"
      });
    }
  });

  const validateForm = () => {
    const requiredFields = ['hazard_class', 'hazard_category', 'ghs_code_id', 'hazard_statement_id', 'signal_word'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof GHSHazardClassification]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (initialData?.hazard_classification_id) {
      updateMutation.mutate({
        id: initialData.hazard_classification_id,
        data: formData
      });
    } else {
      createMutation.mutate(formData as Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {initialData ? "Edit GHS Hazard Classification" : "New GHS Hazard Classification"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hazard_class" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Hazard Class
          </Label>
          <Input
            id="hazard_class"
            value={formData.hazard_class}
            onChange={(e) => setFormData({ ...formData, hazard_class: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hazard_category" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Hazard Category
          </Label>
          <Input
            id="hazard_category"
            value={formData.hazard_category}
            onChange={(e) => setFormData({ ...formData, hazard_category: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ghs_code" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            GHS Code
          </Label>
          <Select
            value={formData.ghs_code_id || ""}
            onValueChange={(value) => setFormData({ ...formData, ghs_code_id: value })}
          >
            <SelectTrigger id="ghs_code">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="hazard_statement" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Hazard Statement
          </Label>
          <Select
            value={formData.hazard_statement_id || ""}
            onValueChange={(value) => setFormData({ ...formData, hazard_statement_id: value })}
          >
            <SelectTrigger id="hazard_statement">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="signal_word" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            Signal Word
          </Label>
          <Select
            value={formData.signal_word}
            onValueChange={(value) => setFormData({ ...formData, signal_word: value })}
          >
            <SelectTrigger id="signal_word">
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
        </div>
      </div>
    </div>
  );
}
