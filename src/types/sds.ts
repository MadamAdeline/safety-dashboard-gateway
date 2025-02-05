export interface SDS {
  productName: string;
  productId: string;
  isDG: boolean;
  supplier: string;
  issueDate: string;
  expiryDate: string;
  dgClass?: number;
  status: 'ACTIVE' | 'INACTIVE';
  sdsSource: 'Customer' | 'Global Library';
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