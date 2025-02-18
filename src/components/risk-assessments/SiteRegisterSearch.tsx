
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteRegisterSearchProps {
  onSelect: (siteRegister: any) => void;
  className?: string;
}

export function SiteRegisterSearch({ onSelect, className }: SiteRegisterSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: siteRegisters, isLoading } = useQuery({
    queryKey: ['site-registers', 'search', searchTerm],
    queryFn: async () => {
      console.log('Fetching site registers...');
      const { data, error } = await supabase
        .from('site_registers')
        .select(`
          id,
          location:locations (id, name, full_path),
          product:products (id, product_name, product_code)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching site registers:', error);
        throw error;
      }
      
      console.log('Fetched site registers:', data);
      return data;
    }
  });

  const filteredSiteRegisters = siteRegisters?.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const locationMatch = record.location?.full_path?.toLowerCase().includes(searchLower);
    const productMatch = record.product?.product_name?.toLowerCase().includes(searchLower);
    const productCodeMatch = record.product?.product_code?.toLowerCase().includes(searchLower);
    
    return locationMatch || productMatch || productCodeMatch;
  });

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search by location or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isDropdownOpen && !isLoading && filteredSiteRegisters && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSiteRegisters.length > 0 ? (
              filteredSiteRegisters.map(record => (
                <div
                  key={record.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSelect(record);
                    setIsDropdownOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="font-medium">{record.product?.product_name}</div>
                  <div className="text-sm text-gray-500">
                    Location: {record.location?.full_path}
                  </div>
                  {record.product?.product_code && (
                    <div className="text-sm text-gray-500">
                      Product Code: {record.product?.product_code}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-center">
                No site registers found
              </div>
            )}
          </div>
        )}
        {isLoading && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 p-2 text-center">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
