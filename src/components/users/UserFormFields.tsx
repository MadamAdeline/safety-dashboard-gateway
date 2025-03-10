
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role, UserStatus } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { ManagerSearch } from "@/components/users/ManagerSearch";
import type { Location } from "@/types/location";

interface UserFormFieldsProps {
  formData: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    active: UserStatus;
    role_id: string;
    password: string;
    manager_id?: string;
    location_id?: string;
  };
  roles?: Role[];
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function UserFormFields({ formData, roles, isEditing, onChange }: UserFormFieldsProps) {
  const selectedRole = roles?.find(role => role.id === formData.role_id);
  const isAdministrator = selectedRole?.role_name.toLowerCase() === 'administrator';
  const isPowerUser = selectedRole?.role_name.toLowerCase() === 'poweruser';
  const requiresLocation = !isAdministrator && !isPowerUser;

  // Fetch current manager if manager_id exists
  const { data: currentManager } = useQuery({
    queryKey: ['user', 'manager', formData.manager_id],
    queryFn: async () => {
      if (!formData.manager_id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('id', formData.manager_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.manager_id
  });

  // Fetch current location if location_id exists
  const { data: currentLocation } = useQuery({
    queryKey: ['location', formData.location_id],
    queryFn: async () => {
      if (!formData.location_id) return null;
      
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          type_id,
          parent_location_id,
          status_id,
          coordinates,
          full_path,
          is_storage_location,
          storage_type_id,
          master_data!type_id (id, label),
          storage_type:master_data!storage_type_id (id, label),
          status_lookup (id, status_name)
        `)
        .eq('id', formData.location_id)
        .single();
      
      if (error) throw error;
      
      return data ? {
        ...data,
        coordinates: data.coordinates || null,
        parent_location_id: data.parent_location_id || null,
        is_storage_location: data.is_storage_location || false,
        storage_type_id: data.storage_type_id || null,
      } as Location : null;
    },
    enabled: !!formData.location_id
  });

  const handleLocationSelect = (location: Location) => {
    onChange("location_id", location.id);
  };

  const handleManagerSelect = (manager: { id: string; first_name: string; last_name: string }) => {
    onChange("manager_id", manager.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="first_name" className="flex items-center">
          First Name <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => onChange("first_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name" className="flex items-center">
          Last Name <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => onChange("last_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center">
          Email <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => onChange("phone_number", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center">
          Password {!isEditing && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role_id || "unassigned"}
          onValueChange={(value) => onChange("role_id", value === "unassigned" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Manager</Label>
        <ManagerSearch
          selectedManagerId={formData.manager_id}
          initialManager={currentManager}
          onManagerSelect={handleManagerSelect}
          currentUserId={formData.id}
          className="w-full"
        />
      </div>

      {!isAdministrator && (
        <div className="space-y-2">
          <Label className="flex items-center">
            Location {requiresLocation && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <LocationSearch
            selectedLocationId={formData.location_id}
            initialLocation={currentLocation}
            onLocationSelect={handleLocationSelect}
            className="w-full"
          />
          {currentLocation?.full_path && (
            <Input
              value={currentLocation.full_path}
              readOnly
              className="mt-2 bg-gray-50 text-gray-600"
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={formData.active}
          onValueChange={(value: UserStatus) => onChange("active", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
