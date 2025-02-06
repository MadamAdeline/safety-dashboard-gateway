import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/types/user";

interface UserFormFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    active: string;
    role_id: string;
    password: string;
  };
  roles?: Role[];
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export function UserFormFields({ formData, roles, isEditing, onChange }: UserFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => onChange("first_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => onChange("last_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={formData.role_id}
          onValueChange={(value) => onChange("role_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={formData.active}
          onValueChange={(value) => onChange("active", value)}
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