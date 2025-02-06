import { extractSDSDataFromFile } from "@/services/sdsExtraction";
import type { ExtractedSDSData } from "@/types/sdsExtraction";

export async function extractSDSData(file: File, showToast: (message: string) => void): Promise<ExtractedSDSData | null> {
  console.log('SDSDataExtractor: Starting extraction process');
  
  const response = await extractSDSDataFromFile(file);
  
  if (!response.success) {
    console.error('SDSDataExtractor: Extraction failed:', response.error);
    showToast(response.error || "Could not extract data from PDF. Please fill in the fields manually.");
    return null;
  }

  console.log('SDSDataExtractor: Extraction completed successfully:', response.data);
  return response.data;
}