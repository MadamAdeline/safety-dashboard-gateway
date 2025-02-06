import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSDSList } from "@/hooks/use-sds-list";

interface SDSSearchProps {
  selectedSdsId?: string | null;
  onSDSSelect: (sds: any) => void;
}

export function SDSSearch({ selectedSdsId, onSDSSelect }: SDSSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: sdsList } = useSDSList();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Here you could implement search logic or filtering
    console.log("Searching for:", value);
  };

  return (
    <div className="flex-1 max-w-md relative">
      <Input
        placeholder="Search SDS Library..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      
      {/* Display search results */}
      {searchTerm && sdsList && (
        <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {sdsList
            .filter(sds => 
              sds.productName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(sds => (
              <div
                key={sds.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedSdsId === sds.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => onSDSSelect(sds)}
              >
                <div className="font-medium">{sds.productName}</div>
                <div className="text-sm text-gray-500">{sds.supplier}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}