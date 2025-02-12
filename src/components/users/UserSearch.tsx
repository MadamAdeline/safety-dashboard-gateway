
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Use setTimeout to allow click events on dropdown items to fire before closing
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  return (
    <div className="flex-1 w-1/2 relative">
      <Input
        placeholder="Search Users by Name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}
