
export type LocationType = "Region" | "District" | "School" | "Detailed Location";
export type LocationStatus = "ACTIVE" | "INACTIVE";

export interface Location {
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
