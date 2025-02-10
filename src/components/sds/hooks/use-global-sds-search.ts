
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
  source: string;
}

export function useGlobalSDSSearch(onSDSSelect: (selectedSDS: SDS[]) => void, onOpenChange: (open: boolean) => void) {
  const [chatInput, setChatInput] = useState("");
  const [searchFields, setSearchFields] = useState<SearchFields>({
    productName: "",
    productCode: "",
    supplier: "",
    unNumber: "",
    source: ""
  });
  const [searchResults, setSearchResults] = useState<SDS[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching with fields:", searchFields);
    
    try {
      let query = supabase
        .from('sds')
        .select(`
          *,
          suppliers!inner(supplier_name)
        `);

      // Build search conditions
      const conditions = [];
      
      if (searchFields.productName) {
        conditions.push(`product_name.ilike.%${searchFields.productName}%`);
      }
      if (searchFields.productCode) {
        conditions.push(`product_id.ilike.%${searchFields.productCode}%`);
      }
      if (searchFields.supplier) {
        conditions.push(`suppliers.supplier_name.ilike.%${searchFields.supplier}%`);
      }
      if (searchFields.unNumber) {
        conditions.push(`un_number.ilike.%${searchFields.unNumber}%`);
      }
      if (searchFields.source) {
        conditions.push(`source.ilike.%${searchFields.source}%`);
      }

      // Only add OR conditions if there are any search terms
      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedResults: SDS[] = data.map(item => ({
        id: item.id,
        productName: item.product_name,
        productId: item.product_id,
        supplier: item.suppliers?.supplier_name || "",
        supplierId: item.supplier_id,
        expiryDate: item.expiry_date,
        isDG: item.is_dg,
        issueDate: item.issue_date,
        status: "ACTIVE",
        sdsSource: item.source,
        source: item.source,
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        currentFileSize: item.current_file_size,
        currentContentType: item.current_content_type,
        dgClassId: item.dg_class_id,
        dgClass: null,
        subsidiaryDgClassId: item.subsidiary_dg_class_id,
        subsidiaryDgClass: null,
        packingGroupId: item.packing_group_id,
        packingGroup: null,
        dgSubDivisionId: item.dg_subdivision_id,
        dgSubDivision: null,
        unNumber: item.un_number,
        unProperShippingName: item.un_proper_shipping_name,
        hazchemCode: item.hazchem_code,
        otherNames: item.other_names,
        emergencyPhone: item.emergency_phone,
        revisionDate: item.revision_date,
        requestSupplierName: item.request_supplier_name,
        requestSupplierDetails: item.request_supplier_details,
        requestInformation: item.request_information,
        requestDate: item.request_date,
        requestedBy: item.requested_by
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching SDS:', error);
      toast({
        title: "Error",
        description: "Failed to search SDS. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddToLibrary = async () => {
    console.log("Adding selected items to library");
    const selectedSDS = searchResults.filter(sds => 
      selectedItems.includes(sds.productId)
    );
    
    try {
      for (const sds of selectedSDS) {
        console.log("Inserting SDS with source:", sds.source);
        const { error } = await supabase
          .from('sds')
          .insert({
            product_name: sds.productName,
            product_id: sds.productId,
            supplier_id: sds.supplierId,
            is_dg: sds.isDG,
            issue_date: sds.issueDate,
            expiry_date: sds.expiryDate,
            status_id: 3,
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
