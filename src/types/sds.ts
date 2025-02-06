
export interface SDS {
  id: string;
  productName: string;
  productId: string;
  isDG: boolean;
  supplier: string;
  supplierId: string;
  issueDate: string;
  expiryDate: string;
  dgClassId: string | null;
  dgClass: {
    id: string;
    label: string;
  } | null;
  subsidiaryDgClassId: string | null;
  subsidiaryDgClass: {
    id: string;
    label: string;
  } | null;
  packingGroupId: string | null;
  packingGroup: {
    id: string;
    label: string;
  } | null;
  dgSubDivisionId: string | null;
  dgSubDivision: {
    id: string;
    label: string;
  } | null;
  status: 'ACTIVE' | 'INACTIVE' | 'REQUESTED';
  sdsSource: string | null;
  source: string | null;
  currentFilePath: string | null;
  currentFileName: string | null;
  currentFileSize: number | null;
  currentContentType: string | null;
  unNumber: string | null;
  unProperShippingName: string | null;
  hazchemCode: string | null;
  otherNames: string | null;
  emergencyPhone: string | null;
  revisionDate: string | null;
  requestSupplierName: string | null;
  requestSupplierDetails: string | null;
  requestInformation: string | null;
  requestDate: string | null;
  requestedBy: string | null;
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
