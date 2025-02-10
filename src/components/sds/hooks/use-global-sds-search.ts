
import { useState } from "react";
import type { SDS } from "@/types/sds";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SearchFields {
  productName: string;
  productCode: string;
  supplier: string;
  unNumber: string;
}

export function useGlobalSDSSearch(onSDSSelect: (selectedSDS: SDS[]) => void, onOpenChange: (open: boolean) => void) {
  const [chatInput, setChatInput] = useState("");
  const [searchFields, setSearchFields] = useState<SearchFields>({
    productName: "",
    productCode: "",
    supplier: "",
    unNumber: "",
  });
  const [searchResults, setSearchResults] = useState<SDS[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching...");
    // Sample data for demonstration
    setSearchResults([
      {
        id: "1234-5678-9012-3456",
        productName: "Sample Product 1",
        productId: "SP001",
        supplier: "Supplier A",
        supplierId: "c3a03764-6c11-4858-9fbe-93332fbdbc1c",
        expiryDate: "2025-12-31",
        isDG: true,
        issueDate: "2023-01-01",
        status: "ACTIVE",
        sdsSource: "Global Library",
        source: "Global Library",
        currentFilePath: null,
        currentFileName: null,
        currentFileSize: null,
        currentContentType: null,
        dgClassId: null,
        dgClass: null,
        subsidiaryDgClassId: null,
        subsidiaryDgClass: null,
        packingGroupId: null,
        packingGroup: null,
        dgSubDivisionId: null,
        dgSubDivision: null,
        unNumber: null,
        unProperShippingName: null,
        hazchemCode: null,
        otherNames: null,
        emergencyPhone: null,
        revisionDate: null,
        requestSupplierName: null,
        requestSupplierDetails: null,
        requestInformation: null,
        requestDate: null,
        requestedBy: null
      },
      {
        id: "2345-6789-0123-4567",
        productName: "BP Butane",
        productId: "0000002705",
        supplier: "BP Australia Pty Ltd",
        supplierId: "c3a03764-6c11-4858-9fbe-93332fbdbc1c",
        expiryDate: "2026-04-21",
        isDG: true,
        issueDate: "2021-04-21",
        status: "ACTIVE",
        sdsSource: "External",
        source: "External",
        currentFilePath: null,
        currentFileName: null,
        currentFileSize: null,
        currentContentType: null,
        dgClassId: null,
        dgClass: null,
        subsidiaryDgClassId: null,
        subsidiaryDgClass: null,
        packingGroupId: null,
        packingGroup: null,
        dgSubDivisionId: null,
        dgSubDivision: null,
        unNumber: null,
        unProperShippingName: null,
        hazchemCode: null,
        otherNames: null,
        emergencyPhone: null,
        revisionDate: null,
        requestSupplierName: null,
        requestSupplierDetails: null,
        requestInformation: null,
        requestDate: null,
        requestedBy: null
      }
    ]);
  };

  const handleAddToLibrary = async () => {
    console.log("Adding selected items to library");
    const selectedSDS = searchResults.filter(sds => 
      selectedItems.includes(sds.productId)
    );
    
    try {
      // Insert selected SDS records into the database
      for (const sds of selectedSDS) {
        const { error } = await supabase
          .from('sds')
          .insert({
            product_name: sds.productName,
            product_id: sds.productId,
            supplier_id: sds.supplierId,
            is_dg: sds.isDG,
            issue_date: sds.issueDate,
            expiry_date: sds.expiryDate,
            status_id: 3, // Active status
            source: sds.source,
            dg_class_id: sds.dgClassId,
            subsidiary_dg_class_id: sds.subsidiaryDgClassId,
            packing_group_id: sds.packingGroupId,
            dg_subdivision_id: sds.dgSubDivisionId,
            current_file_path: sds.currentFilePath,
            current_file_name: sds.currentFileName,
            current_file_size: sds.currentFileSize,
            current_content_type: sds.currentContentType,
            un_number: sds.unNumber,
            un_proper_shipping_name: sds.unProperShippingName,
            hazchem_code: sds.hazchemCode,
            other_names: sds.otherNames,
            emergency_phone: sds.emergencyPhone
          });

        if (error) {
          console.error('Error inserting SDS:', error);
          throw error;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['sds'] });

      toast({
        title: "Success",
        description: `${selectedItems.length} SDS(s) have been added to your library.`,
      });
      
      onSDSSelect(selectedSDS);
      onOpenChange(false);
      setSelectedItems([]);
      
    } catch (error) {
      console.error('Error adding SDS to library:', error);
      toast({
        title: "Error",
        description: "Failed to add SDS to library. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return {
    chatInput,
    setChatInput,
    searchFields,
    setSearchFields,
    searchResults,
    selectedItems,
    handleSearch,
    handleAddToLibrary,
    toggleSelectItem
  };
}
