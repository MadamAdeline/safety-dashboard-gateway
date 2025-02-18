
import { supabase } from "@/integrations/supabase/client";
import type { GHSHazardClassification } from "@/types/ghs";

export async function getGHSHazardClassifications() {
  const { data, error } = await supabase
    .from('ghs_hazard_classifications')
    .select(`
      *,
      ghs_code:ghs_codes(ghs_code),
      hazard_statement:hazard_statements(
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .order('hazard_class', { ascending: true });

  if (error) throw error;
  return data as GHSHazardClassification[];
}

export async function createGHSHazardClassification(data: Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>) {
  const { data: created, error } = await supabase
    .from('ghs_hazard_classifications')
    .insert([data])
    .select(`
      *,
      ghs_code:ghs_codes(ghs_code),
      hazard_statement:hazard_statements(
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .single();

  if (error) throw error;
  return created as GHSHazardClassification;
}

export async function updateGHSHazardClassification(
  id: string,
  data: Partial<Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>>
) {
  const { data: updated, error } = await supabase
    .from('ghs_hazard_classifications')
    .update(data)
    .eq('hazard_classification_id', id)
    .select(`
      *,
      ghs_code:ghs_codes(ghs_code),
      hazard_statement:hazard_statements(
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .single();

  if (error) throw error;
  return updated as GHSHazardClassification;
}

export async function deleteGHSHazardClassification(id: string) {
  const { error } = await supabase
    .from('ghs_hazard_classifications')
    .delete()
    .eq('hazard_classification_id', id);

  if (error) throw error;
}

export async function getGHSCodes() {
  const { data, error } = await supabase
    .from('ghs_codes')
    .select('*')
    .order('ghs_code', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getHazardStatements() {
  const { data, error } = await supabase
    .from('hazard_statements')
    .select('*')
    .order('hazard_statement_code', { ascending: true });

  if (error) throw error;
  return data;
}
