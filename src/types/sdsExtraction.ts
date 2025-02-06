export interface ExtractedSDSData {
  productName: string;
  productId: string;
  dgClass: number | null;
  unNumber: string;
  unProperShippingName: string;
  packingGroup: string;
  hazchemCode: string;
  subsidiaryDgClass: string;
}

export interface SDSExtractionResponse {
  success: boolean;
  data?: ExtractedSDSData;
  error?: string;
}