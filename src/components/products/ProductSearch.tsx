
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  selectedProductId?: string;
  onProductSelect?: (product: Product) => void;
  className?: string;
}

export function ProductSearch({ 
  value, 
  onChange, 
  selectedProductId, 
  onProductSelect, 
  className 
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products', 'search'],
    queryFn: async () => {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          product_code,
          brand_name,
          unit,
          unit_size,
          description,
          product_set,
          aerosol,
          cryogenic_fluid,
          other_names,
          uses,
          product_status_id,
          approval_status_id,
          sds_id,
          uom_id,
          uom:master_data!products_uom_id_fkey (
            id,
            label
          ),
          sds:sds!products_sds_id_fkey (
            id,
            is_dg,
            dg_class:master_data!sds_dg_class_id_fkey (
              id,
              label
            ),
            supplier:suppliers!sds_supplier_id_fkey (
              id,
              supplier_name
            ),
            packing_group:master_data!sds_packing_group_id_fkey (
              id,
              label
            )
          )
        `);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Fetched products:', data);
      return data.map(item => ({
        id: item.id,
        name: item.product_name,
        code: item.product_code,
        brandName: item.brand_name,
        unit: item.unit,
        uomId: item.uom_id,
        uom: item.uom ? {
          id: item.uom.id,
          label: item.uom.label
        } : undefined,
        unitSize: item.unit_size,
        description: item.description,
        productSet: item.product_set,
        aerosol: item.aerosol,
        cryogenicFluid: item.cryogenic_fluid,
        otherNames: item.other_names,
        uses: item.uses,
        status: (item.product_status_id === 16 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
        approvalStatusId: item.approval_status_id,
        productStatusId: item.product_status_id,
        sdsId: item.sds_id,
        sds: item.sds ? {
          id: item.sds.id,
          isDG: item.sds.is_dg,
          dgClass: item.sds.dg_class ? {
            id: item.sds.dg_class.id,
            label: item.sds.dg_class.label
          } : undefined,
          supplier: item.sds.supplier ? {
            id: item.sds.supplier.id,
            supplier_name: item.sds.supplier.supplier_name
          } : undefined,
          packingGroup: item.sds.packing_group ? {
            id: item.sds.packing_group.id,
            label: item.sds.packing_group.label
          } : undefined
        } : undefined
      })) as Product[];
    }
  });

  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    onChange?.(value);
    console.log("Searching for:", value);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Use setTimeout to allow click events on dropdown items to fire before closing
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const filteredProducts = products?.filter(product => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const codeMatch = product.code.toLowerCase().includes(searchLower);
    
    return nameMatch || codeMatch;
  });

  console.log('ProductSearch rendering with:', {
    searchTerm,
    productsCount: products?.length,
    filteredCount: filteredProducts?.length,
    selectedProductId
  });

  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isDropdownOpen && products && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredProducts?.map(product => (
              <div
                key={product.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedProductId === product.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  console.log('Selected product:', product);
                  onProductSelect?.(product);
                  setIsDropdownOpen(false);
                  setSearchTerm(product.name);
                }}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.code}
                </div>
              </div>
            ))}
            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="p-2 text-gray-500 text-center">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
