
export interface Product {
  id: string;
  name: string;
  code: string;
  isDG: boolean;
  dgClass?: number;
  packGroup?: string;
  unNumber?: string;
  supplier: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductFilters {
  search: string;
  supplier: string[];
  status: string[];
  dgClass: number[];
  isDG: boolean | null;
}
