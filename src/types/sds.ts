export interface SDS {
  id: string;
  productName: string;
  productId: string;
  isDG: boolean;
  supplier: string;
  supplierId: string;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REQUESTED';
  sdsSource: 'Customer' | 'Global Library';
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  hazchemCode?: string;
  dgClassId?: string;
  subsidiaryDgClassId?: string;
  packingGroupId?: string;
  dgSubDivisionId?: string;
  otherNames?: string;
  emergencyPhone?: string;
  revisionDate?: string;
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