
import { supabase } from "@/integrations/supabase/client";
import type { GHSHazardClassification } from "@/types/ghs";

export async function getGHSHazardClassifications() {
  const { data, error } = await supabase
    .from('ghs_hazard_classifications')
    .select(`
      hazard_classification_id,
      hazard_class,
      hazard_category,
      signal_word,
      ghs_code_id,
      hazard_statement_id,
      updated_at,
      updated_by,
      ghs_codes (
        ghs_code,
        pictogram_url
      ),
      hazard_statements (
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .order('hazard_class', { ascending: true });

  if (error) throw error;
  
  // Transform the response to match our type
  const transformedData = data.map(item => ({
    ...item,
    ghs_code: item.ghs_codes,
    hazard_statement: item.hazard_statements
  }));
  
  return transformedData as GHSHazardClassification[];
}

export async function createGHSHazardClassification(data: Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>) {
  const { data: created, error } = await supabase
    .from('ghs_hazard_classifications')
    .insert([data])
    .select(`
      hazard_classification_id,
      hazard_class,
      hazard_category,
      signal_word,
      ghs_code_id,
      hazard_statement_id,
      updated_at,
      updated_by,
      ghs_codes (
        ghs_code,
        pictogram_url
      ),
      hazard_statements (
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .single();

  if (error) throw error;
  
  // Transform the response to match our type
  const transformedData = {
    ...created,
    ghs_code: created.ghs_codes,
    hazard_statement: created.hazard_statements
  };
  
  return transformedData as GHSHazardClassification;
}

export async function updateGHSHazardClassification(
  id: string,
  data: Partial<Omit<GHSHazardClassification, 'hazard_classification_id' | 'updated_at'>>
) {
  console.log('Updating GHS classification:', id, data);
  
  const { data: updated, error } = await supabase
    .from('ghs_hazard_classifications')
    .update(data)
    .eq('hazard_classification_id', id)
    .select(`
      hazard_classification_id,
      hazard_class,
      hazard_category,
      signal_word,
      ghs_code_id,
      hazard_statement_id,
      updated_at,
      updated_by,
      ghs_codes (
        ghs_code,
        pictogram_url
      ),
      hazard_statements (
        hazard_statement_code,
        hazard_statement_text
      )
    `)
    .single();

  if (error) {
    console.error('Error updating GHS classification:', error);
    throw error;
  }
  
  console.log('Updated GHS classification:', updated);
  
  // Transform the response to match our type
  const transformedData = {
    ...updated,
    ghs_code: updated.ghs_codes,
    hazard_statement: updated.hazard_statements
  };
  
  return transformedData as GHSHazardClassification;
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
