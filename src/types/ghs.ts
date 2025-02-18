
export interface GHSHazardClassification {
  hazard_classification_id: string;
  hazard_class: string;
  hazard_category: string;
  ghs_code_id: string | null;
  hazard_statement_id: string | null;
  signal_word: string;
  notes: string | null;
  source: string | null;
  updated_at: string;
  updated_by: string | null;
  ghs_code?: {
    ghs_code: string;
    pictogram_url?: string;
  };
  hazard_statement?: {
    hazard_statement_code: string;
    hazard_statement_text: string;
  };
}

export interface GHSHazardFilters {
  search: string;
}

export const HAZARD_CATEGORIES = [
  'Category 1A',
  'Category 1B',
  'Category 1C',
  'Category 2'
] as const;

export const SIGNAL_WORDS = [
  'Danger',
  'Warning',
  'No Signal Word'
] as const;
