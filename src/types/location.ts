export type LocationType = "Region" | "District" | "School" | "Detailed Location";
export type LocationStatus = "ACTIVE" | "INACTIVE";

export interface Location {
  id: string;
  name: string;
  type_id: string;
  parent_location_id: string | null;
  status_id: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  master_data?: {
    id: string;
    label: string;
  };
  status_lookup?: {
    id: number;
    status_name: string;
  };
}

export interface LocationDisplay {
  id: string;
  name: string;
  type: LocationType;
  parentLocation: string;
  status: LocationStatus;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface LocationFilters {
  search: string;
  status: LocationStatus[];
  type: LocationType[];
  parentLocation: string | null;
}