
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/types/product";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProductSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  selectedProductId?: string;
  onProductSelect?: (product: Product) => void;
  className?: string;
}

export function ProductSearch({ value, onChange, selectedProductId, onProductSelect, className }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value || "");
  const { data: products, isLoading } = useProducts();

  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  const selectedProduct = selectedProductId && products 
    ? products.find(p => p.id === selectedProductId)
    : null;

  const filteredProducts = products && Array.isArray(products) 
    ? (!searchValue 
      ? products 
      : products.filter(product => 
          product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.code.toLowerCase().includes(searchValue.toLowerCase())
        ))
    : [];

  const handleSearchChange = (newValue: string) => {
    setSearchValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Input
            value={selectedProduct ? selectedProduct.name : searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            onValueChange={handleSearchChange}
          />
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Loading products...
            </div>
          ) : !products || filteredProducts.length === 0 ? (
            <CommandEmpty>No products found.</CommandEmpty>
          ) : (
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => {
                    onProductSelect?.(product);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-sm text-gray-500">{product.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
