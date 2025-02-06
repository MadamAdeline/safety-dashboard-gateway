export interface SDS {
  id: string;
  productName: string;
  productId: string;
  isDG: boolean;
  supplier: string;
  issueDate: string;
  expiryDate: string;
  dgClass?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'REQUESTED';
  sdsSource: 'Customer' | 'Global Library';
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  packingGroup?: string;
  hazchemCode?: string;
  subsidiaryDgClass?: string;
}

export interface SDSFilters {
  search: string;
  dateField: 'issueDate' | 'expiryDate' | null;
  dateType: 'on' | 'after' | 'before' | 'between' | null;
  dateFrom: string;
  dateTo: string;
  status: string[];
  dgClass: number[];
  isDG: boolean | null;
}