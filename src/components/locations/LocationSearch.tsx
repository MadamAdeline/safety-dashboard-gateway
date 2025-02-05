
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  return (
    <div className="flex-1 max-w-md relative">
      <Input
        placeholder="Search locations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}
