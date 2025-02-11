
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/user";

interface ManagerSearchProps {
  selectedManagerId?: string | null;
  initialManager?: Pick<User, 'id' | 'first_name' | 'last_name'> | null;
  onManagerSelect: (manager: Pick<User, 'id' | 'first_name' | 'last_name'>) => void;
  currentUserId?: string;
  className?: string;
}

export function ManagerSearch({ 
  selectedManagerId, 
  initialManager, 
  onManagerSelect, 
  currentUserId,
  className 
}: ManagerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: managers } = useQuery({
    queryKey: ['users', 'active-managers'],
    queryFn: async () => {
      console.log('Fetching active managers from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('active', 'active');
      
      if (error) {
        console.error('Error fetching managers:', error);
        throw error;
      }

      // Filter out the current user to prevent cyclic references
      return (data || []).filter(user => user.id !== currentUserId);
    },
  });

  useEffect(() => {
    if (initialManager) {
      setSearchTerm(`${initialManager.first_name} ${initialManager.last_name}`);
    }
  }, [initialManager]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
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

  const filteredManagers = managers?.filter(manager => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
    return fullName.includes(searchLower);
  });

  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search managers..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isDropdownOpen && managers && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredManagers?.map(manager => (
              <div
                key={manager.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedManagerId === manager.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onManagerSelect(manager);
                  setIsDropdownOpen(false);
                  setSearchTerm(`${manager.first_name} ${manager.last_name}`);
                }}
              >
                <div className="font-medium">
                  {manager.first_name} {manager.last_name}
                </div>
              </div>
            ))}
            {(!filteredManagers || filteredManagers.length === 0) && (
              <div className="p-2 text-gray-500 text-center">
                No managers found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
