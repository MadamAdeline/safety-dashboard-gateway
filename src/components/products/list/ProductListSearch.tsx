
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductListSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProductListSearch({ value, onChange, className }: ProductListSearchProps) {
  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search products by name, code, brand or supplier..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

