
import { createContext, useContext, Dispatch, SetStateAction } from 'react';
import type { SDS } from '@/types/sds';

interface SDSFormContextType {
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
  isDG: boolean;
  setIsDG: Dispatch<SetStateAction<boolean>>;
  status: "ACTIVE" | "INACTIVE" | "REQUESTED";
  setStatus: Dispatch<SetStateAction<"ACTIVE" | "INACTIVE" | "REQUESTED">>;
  supplier: string;
  setSupplier: Dispatch<SetStateAction<string>>;
  dgClassId: string;
  setDgClassId: Dispatch<SetStateAction<string>>;
  subsidiaryDgClassId: string;
  setSubsidiaryDgClassId: Dispatch<SetStateAction<string>>;
  packingGroupId: string;
  setPackingGroupId: Dispatch<SetStateAction<string>>;
  dgSubDivisionId: string;
  setDgSubDivisionId: Dispatch<SetStateAction<string>>;
  initialData?: SDS | null;
  readOnly?: boolean;
}

export const SDSFormContext = createContext<SDSFormContextType | undefined>(undefined);

export const useSDSForm = () => {
  const context = useContext(SDSFormContext);
  if (!context) {
    throw new Error('useSDSForm must be used within a SDSFormProvider');
  }
  return context;
};
