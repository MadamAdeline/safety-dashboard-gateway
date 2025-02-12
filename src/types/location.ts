
export type LocationType = "Region" | "District" | "School" | "Detailed Location";
export type LocationStatus = "ACTIVE" | "INACTIVE";

export interface Location {
  id: string;
  name: string;
  type_id: string;
  parent_location_id: string | null;
  status_id: number;
  full_path: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  is_storage_location: boolean;
  storage_type_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  master_data?: {
    id: string;
    label: string;
  };
  storage_type?: {
    id: string;
    label: string;
  };
  status_lookup?: {
    id: number;
    status_name: string;
  };
  isNew?: boolean;
}

export interface LocationFilters {
  search: string;
  status: LocationStatus[];
  type: LocationType[];
  parentLocation: string | null;
}
