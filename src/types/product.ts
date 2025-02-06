export interface Product {
  id: string;
  name: string;
  code: string;
  brandName?: string;
  unit?: string;
  unitSize?: number;
  description?: string;
  productSet?: boolean;
  aerosol?: boolean;
  cryogenicFluid?: boolean;
  otherNames?: string;
  uses?: string;
  isDG: boolean;
  dgClass?: number;
  packGroup?: string;
  unNumber?: string;
  supplier: string;
  status: 'ACTIVE' | 'INACTIVE';
  approvalStatusId?: number;
  productStatusId?: number;
  sdsId?: string | null;
}

export interface ProductFilters {
  search: string;
  supplier: string[];
  status: string[];
  dgClass: number[];
  isDG: boolean | null;
}