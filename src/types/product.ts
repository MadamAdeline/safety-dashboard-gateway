
export interface Product {
  id: string;
  name: string;
  code: string;
  brandName?: string;
  unit?: string;
  uomId?: string;
  uom?: {
    id: string;
    label: string;
  };
  unitSize?: number;
  description?: string;
  productSet?: boolean;
  aerosol?: boolean;
  cryogenicFluid?: boolean;
  otherNames?: string;
  uses?: string;
  status: 'ACTIVE' | 'INACTIVE';
  approvalStatusId?: number;
  productStatusId?: number;
  sdsId?: string | null;
  sds?: {
    id: string;
    isDG: boolean;
    dgClass?: {
      id: string;
      label: string;
    };
    supplier?: {
      id: string;
      supplier_name: string;
    };
    packingGroup?: {
      id: string;
      label: string;
    };
  };
}

export interface ProductFilters {
  search: string;
  supplier: string[];
  status: string[];
  dgClass: string[];
  isDG: boolean | null;
}
