
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SupplierSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SupplierSearch({ value, onChange }: SupplierSearchProps) {
  return (
    <div className="relative w-1/2">
      <Input
        placeholder="Search Suppliers by Supplier Name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}
