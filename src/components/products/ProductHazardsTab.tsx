
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { HazardAndControl } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

interface ProductHazardsTabProps {
  productId: string;
  readOnly?: boolean;
}

export function ProductHazardsTab({ productId, readOnly }: ProductHazardsTabProps) {
  const [hazardTypes, setHazardTypes] = useState<{ id: string; label: string; }[]>([]);
  const [hazards, setHazards] = useState<HazardAndControl[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHazardTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('master_data')
          .select('id, label')
          .eq('category', 'HAZARD_TYPE')
          .eq('status', 'ACTIVE')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setHazardTypes(data || []);
      } catch (error) {
        console.error('Error fetching hazard types:', error);
        toast({
          title: "Error",
          description: "Failed to load hazard types",
          variant: "destructive",
        });
      }
    };

    const fetchHazards = async () => {
      try {
        const { data, error } = await supabase
          .from('hazards_and_controls')
          .select(`
            *,
            hazardType:master_data!hazards_and_controls_hazard_type_fkey (
              id,
              label
            )
          `)
          .eq('product_id', productId);

        if (error) throw error;
        setHazards(data || []);
      } catch (error) {
        console.error('Error fetching hazards:', error);
        toast({
          title: "Error",
          description: "Failed to load hazards and controls",
          variant: "destructive",
        });
      }
    };

    fetchHazardTypes();
    if (productId) {
      fetchHazards();
    }
  }, [productId, toast]);

  const handleAdd = async () => {
    try {
      const newHazard: Partial<HazardAndControl> = {
        product_id: productId,
        hazard_type: hazardTypes[0]?.id,
        hazard: "",
        control: "",
        source: ""
      };

      const { data, error } = await supabase
        .from('hazards_and_controls')
        .insert([newHazard])
        .select(`
          *,
          hazardType:master_data!hazards_and_controls_hazard_type_fkey (
            id,
            label
          )
        `)
        .single();

      if (error) throw error;

      setHazards([...hazards, data]);
    } catch (error) {
      console.error('Error adding hazard:', error);
      toast({
        title: "Error",
        description: "Failed to add hazard and control",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('hazards_and_controls')
        .update({ [field]: value })
        .eq('hazard_control_id', id);

      if (error) throw error;

      setHazards(hazards.map(h => 
        h.hazard_control_id === id ? { ...h, [field]: value } : h
      ));
    } catch (error) {
      console.error('Error updating hazard:', error);
      toast({
        title: "Error",
        description: "Failed to update hazard and control",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hazards_and_controls')
        .delete()
        .eq('hazard_control_id', id);

      if (error) throw error;

      setHazards(hazards.filter(h => h.hazard_control_id !== id));
      toast({
        title: "Success",
        description: "Hazard and control deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting hazard:', error);
      toast({
        title: "Error",
        description: "Failed to delete hazard and control",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <Button 
          onClick={handleAdd}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hazard & Control
        </Button>
      )}

      <div className="space-y-6">
        {hazards.map((hazard) => (
          <div
            key={hazard.hazard_control_id}
            className="grid gap-4 p-4 border rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hazard Type</Label>
                {readOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {hazard.hazardType?.label || '-'}
                  </div>
                ) : (
                  <Select
                    value={hazard.hazard_type}
                    onValueChange={(value) => handleUpdate(hazard.hazard_control_id, 'hazard_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hazard type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hazardTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                {readOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {hazard.source || '-'}
                  </div>
                ) : (
                  <Input
                    value={hazard.source || ''}
                    onChange={(e) => handleUpdate(hazard.hazard_control_id, 'source', e.target.value)}
                    placeholder="Enter source"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hazard</Label>
              {readOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {hazard.hazard}
                </div>
              ) : (
                <Textarea
                  value={hazard.hazard}
                  onChange={(e) => handleUpdate(hazard.hazard_control_id, 'hazard', e.target.value)}
                  placeholder="Enter hazard description"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Control</Label>
              {readOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {hazard.control}
                </div>
              ) : (
                <Textarea
                  value={hazard.control}
                  onChange={(e) => handleUpdate(hazard.hazard_control_id, 'control', e.target.value)}
                  placeholder="Enter control measures"
                />
              )}
            </div>

            {!readOnly && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(hazard.hazard_control_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {hazards.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No hazards and controls added yet.
          </div>
        )}
      </div>
    </div>
  );
}
