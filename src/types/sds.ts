
export interface SDS {
  id: string;
  productName: string;
  productId: string;
  isDG: boolean;
  supplier: string;
  supplierId: string;
  issueDate: string;
  expiryDate: string;
  dgClassId: string;
  dgClass: {
    id: string;
    label: string;
  };
  subsidiaryDgClassId: string;
  subsidiaryDgClass: {
    id: string;
    label: string;
  };
  packingGroupId: string;
  packingGroup: {
    id: string;
    label: string;
  };
  dgSubDivisionId: string;
  dgSubDivision: {
    id: string;
    label: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'REQUESTED';
  sdsSource: string;
  source: string;
  currentFilePath: string;
  currentFileName: string;
  currentFileSize: number;
  currentContentType: string;
  unNumber: string;
  unProperShippingName: string;
  hazchemCode: string;
  otherNames: string;
  emergencyPhone: string;
  revisionDate: string;
  requestSupplierName: string;
  requestSupplierDetails: string;
  requestInformation: string;
  requestDate: string;
  requestedBy: string;
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
