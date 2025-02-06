import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSDSList } from "@/hooks/use-sds-list";
import { useActiveSdsList } from "@/hooks/use-active-sds-list";
import type { SDS } from "@/types/sds";

interface SDSSearchProps {
  selectedSdsId?: string | null;
  initialSDS?: SDS | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
  className?: string;
  activeOnly?: boolean;
}

export function SDSSearch({ selectedSdsId, initialSDS, onSDSSelect, className, activeOnly = false }: SDSSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: allSdsList } = useSDSList();
  const { data: activeSdsList } = useActiveSdsList();

  const sdsList = activeOnly ? activeSdsList : allSdsList;

  useEffect(() => {
    if (initialSDS) {
      console.log('Setting initial search term from SDS:', initialSDS.productName);
      setSearchTerm(initialSDS.productName);
    }
  }, [initialSDS]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    console.log("Searching for:", value);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const filteredSdsList = sdsList?.filter(sds => 
    sds.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sds.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sds.productId && sds.productId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search SDS Library..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isDropdownOpen && sdsList && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSdsList?.map(sds => (
              <div
                key={sds.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedSdsId === sds.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onSDSSelect(sds);
                  setIsDropdownOpen(false);
                  setSearchTerm(sds.productName);
                }}
              >
                <div className="font-medium">{sds.productName}</div>
                <div className="text-sm text-gray-500">
                  {sds.productId && <span className="mr-2">ID: {sds.productId}</span>}
                  <span>{sds.supplier}</span>
                </div>
              </div>
            ))}
            {filteredSdsList?.length === 0 && (
              <div className="p-2 text-gray-500 text-center">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}