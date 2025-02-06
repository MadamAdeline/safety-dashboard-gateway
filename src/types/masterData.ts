export type MasterData = {
  id: string;
  category: string;
  label: string;
  status: "ACTIVE" | "INACTIVE";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type MasterDataFilters = {
  search: string;
  category: string[];
  status: ("ACTIVE" | "INACTIVE")[];
};