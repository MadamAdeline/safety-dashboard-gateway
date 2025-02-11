
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProductSearchProps {
  selectedProductId?: string;
  onProductSelect: (product: Product) => void;
  className?: string;
}

export function ProductSearch({ selectedProductId, onProductSelect, className }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: products, isLoading } = useProducts();

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  // Handle undefined products
  const filteredProducts = products?.filter(product => {
    if (!searchValue) return true;
    return (
      product.product_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchValue.toLowerCase())
    );
  }) || [];

  console.log('ProductSearch - Products:', products);
  console.log('ProductSearch - Filtered Products:', filteredProducts);
  console.log('ProductSearch - Selected Product:', selectedProduct);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Input
            value={selectedProduct ? selectedProduct.product_name : searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <Command>
          <CommandInput 
            placeholder="Search products..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Loading products...
            </div>
          ) : (
            <>
              <CommandEmpty>No products found.</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => {
                      onProductSelect(product);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{product.product_name}</span>
                      <span className="text-sm text-gray-500">{product.product_code}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
