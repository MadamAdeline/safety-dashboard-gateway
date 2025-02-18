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
    status?: string;
    currentFilePath?: string;
    currentFileName?: string;
    currentFileSize?: number;
    currentContentType?: string;
    expiryDate?: string;
    issueDate?: string;
    revisionDate?: string;
    dgClass?: {
      id: string;
      label: string;
    };
    subsidiaryDgClass?: {
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
    dgSubDivision?: {
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

export interface HazardAndControl {
  hazard_control_id: string;
  product_id: string;
  hazard_type: string;
  hazard: string;
  control: string;
  source?: string;
  created_at?: string;
  updated_by?: string;
  hazardType?: {
    id: string;
    label: string;
  };
}
